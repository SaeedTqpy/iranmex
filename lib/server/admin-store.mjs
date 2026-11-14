import Database from 'better-sqlite3';
import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {normalizeClientAddress} from './login-source.mjs';
import {resolve} from 'node:path';
import {openRegistrationStore} from './registration-store.mjs';

const scrypt=promisify(scryptCallback);
const params={N:32768,r:8,p:3,maxmem:64*1024*1024};
const duration=8*60*60*1000;
const hashToken=token=>createHash('sha256').update(token).digest('hex');
export const normalizeUsername=value=>typeof value==='string'?value.trim().toLowerCase():'';

export function openAdminStore(filename=process.env.REGISTRATION_DB_PATH||resolve('.data/registrations.sqlite')) {
  const path=resolve(/* turbopackIgnore: true */ filename);
  // Create the shared registrations schema and its private directory if needed.
  openRegistrationStore(path).close();
  const db=new Database(path,{timeout:5000});
  try {
    db.pragma('foreign_keys = ON');
    db.exec(`CREATE TABLE IF NOT EXISTS admin_users(username TEXT PRIMARY KEY,password_salt TEXT NOT NULL,password_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_sessions(token_hash TEXT PRIMARY KEY,username TEXT NOT NULL REFERENCES admin_users(username) ON DELETE CASCADE,created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS admin_session_expiry ON admin_sessions(expires_at);
      CREATE TABLE IF NOT EXISTS admin_login_attempts(username_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS admin_attempt_time ON admin_login_attempts(created_at);
      CREATE INDEX IF NOT EXISTS admin_attempt_username ON admin_login_attempts(username_hash,created_at);
      CREATE TABLE IF NOT EXISTS admin_login_client_attempts(id INTEGER PRIMARY KEY,client_hash TEXT NOT NULL,username_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS admin_client_attempts ON admin_login_client_attempts(client_hash,created_at);
      CREATE INDEX IF NOT EXISTS admin_client_attempt_time ON admin_login_client_attempts(created_at);
      CREATE INDEX IF NOT EXISTS admin_client_attempt_username ON admin_login_client_attempts(username_hash);
      CREATE TABLE IF NOT EXISTS admin_news(slug TEXT PRIMARY KEY,document TEXT NOT NULL,updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_company_order(id INTEGER PRIMARY KEY CHECK(id=1),document TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_companies(slug TEXT PRIMARY KEY,document TEXT NOT NULL,updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_sponsors(id INTEGER PRIMARY KEY CHECK(id=1),document TEXT NOT NULL,updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_mountain_talks(id INTEGER PRIMARY KEY CHECK(id=1),document TEXT NOT NULL,updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_councils(id INTEGER PRIMARY KEY CHECK(id=1),document TEXT NOT NULL,updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS pageview_days(day TEXT PRIMARY KEY,views INTEGER NOT NULL CHECK(views >= 0));
      CREATE TABLE IF NOT EXISTS pageview_meta(id INTEGER PRIMARY KEY CHECK(id = 1),started_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS pageview_utm_meta(id INTEGER PRIMARY KEY CHECK(id = 1),started_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS pageview_utm_days(day TEXT NOT NULL,source TEXT NOT NULL,medium TEXT NOT NULL,campaign TEXT NOT NULL,term TEXT NOT NULL,content TEXT NOT NULL,views INTEGER NOT NULL CHECK(views >= 0),PRIMARY KEY(day,source,medium,campaign,term,content));
      CREATE TABLE IF NOT EXISTS admin_media(id TEXT PRIMARY KEY,data BLOB NOT NULL,width INTEGER NOT NULL,height INTEGER NOT NULL,created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY,username TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,created_at INTEGER NOT NULL);`);
  } catch(error){db.close();throw error;}
  const audit=(username,action,target,now=Date.now())=>db.prepare('INSERT INTO admin_audit(username,action,target,created_at) VALUES (?,?,?,?)').run(username,action,target,now);
  return {db,audit,close(){db.close();}};
}

export async function createAdministrator(username,password,{reset=false,filename}={}) {
  username=normalizeUsername(username);
  if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username))throw new Error('Username must be 3–40 lowercase Latin letters, digits, dots, hyphens or underscores.');
  if(typeof password!=='string'||password.trim().length<16||Buffer.byteLength(password,'utf8')>256)throw new Error('Password must have at least 16 non-padding characters and at most 256 bytes.');
  // Keep the same scrypt output format so existing administrator passwords work.
  const salt=randomBytes(16);const derived=await scrypt(password,salt,64,params);const digest=derived.subarray(0,32);const store=openAdminStore(filename);
  try {
    const transaction=store.db.transaction(()=>{
      const exists=store.db.prepare('SELECT 1 FROM admin_users WHERE username=?').get(username);
      if(exists&&!reset)throw new Error('Administrator already exists; use the password reset command.');
      if(!exists&&reset)throw new Error('Administrator does not exist.');
      if(exists){store.db.prepare('UPDATE admin_users SET password_salt=?,password_hash=? WHERE username=?').run(salt.toString('hex'),digest.toString('hex'),username);store.db.prepare('DELETE FROM admin_sessions WHERE username=?').run(username);}
      else store.db.prepare('INSERT INTO admin_users(username,password_salt,password_hash,created_at) VALUES (?,?,?,?)').run(username,salt.toString('hex'),digest.toString('hex'),Date.now());
      store.db.prepare('DELETE FROM admin_login_attempts WHERE username_hash=?').run(hashToken(username));
      store.db.prepare('DELETE FROM admin_login_client_attempts WHERE username_hash=?').run(hashToken(username));
      store.audit(username,exists?'password_reset':'admin_created',username);
    });
    transaction.immediate();
  } finally {store.close();}
}

export async function loginAdministrator(username,password,{filename,now=Date.now(),clientAddress}={}) {
  username=normalizeUsername(username);
  if(!username||username.length>40||typeof password!=='string'||Buffer.byteLength(password,'utf8')>256)return {error:'INVALID'};
  const address=normalizeClientAddress(clientAddress);
  if(!address)return {error:'CLIENT_UNAVAILABLE'};
  const store=openAdminStore(filename);
  try {
    const usernameHash=hashToken(username);
    const clientHash=hashToken(address);
    const reserve=store.db.transaction(()=>{
      store.db.prepare('DELETE FROM admin_login_client_attempts WHERE created_at <= ?').run(now-15*60*1000);
      const recent=store.db.prepare('SELECT count(*) AS n FROM admin_login_client_attempts WHERE client_hash=? AND created_at > ?').get(clientHash,now-15*60*1000).n;
      if(recent>=5)return null;
      return store.db.prepare('INSERT INTO admin_login_client_attempts(client_hash,username_hash,created_at) VALUES (?,?,?)').run(clientHash,usernameHash,now).lastInsertRowid;
    });
    const attemptId=reserve.immediate();if(attemptId===null)return {error:'RATE_LIMIT'};
    const user=store.db.prepare('SELECT username,password_salt,password_hash FROM admin_users WHERE username=?').get(username);
    const salt=user?Buffer.from(user.password_salt,'hex'):Buffer.alloc(16);
    const expected=user?Buffer.from(user.password_hash,'hex'):Buffer.alloc(32);
    const derived=await scrypt(password,salt,64,params);
    const matches=expected.length===32&&timingSafeEqual(expected,derived.subarray(0,32));
    if(!user||!matches)return {error:'INVALID'};
    const token=randomBytes(32).toString('base64url');
    const commit=store.db.transaction(()=>{
      // Recheck that a concurrent password reset did not invalidate the credentials.
      const current=store.db.prepare('SELECT password_salt,password_hash FROM admin_users WHERE username=?').get(username);
      if(!current||current.password_hash!==user.password_hash||current.password_salt!==user.password_salt)return false;
      store.db.prepare('DELETE FROM admin_login_client_attempts WHERE id=?').run(attemptId);
      store.db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now);
      store.db.prepare('INSERT INTO admin_sessions(token_hash,username,created_at,expires_at) VALUES (?,?,?,?)').run(hashToken(token),username,now,now+duration);
      store.audit(username,'login','session',now);return true;
    });
    if(!commit.immediate())return {error:'INVALID'};
    return {token,expiresAt:now+duration};
  } finally {store.close();}
}

export function getAdminSession(token,{filename,now=Date.now()}={}) {
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
  const store=openAdminStore(filename);
  try {return store.db.prepare('SELECT s.username,s.expires_at FROM admin_sessions s JOIN admin_users u ON u.username=s.username WHERE s.token_hash=? AND s.expires_at>?').get(hashToken(token),now)||null;}
  finally {store.close();}
}

export function logoutAdministrator(token,{filename,now=Date.now()}={}) {
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return;
  const store=openAdminStore(filename);
  try {const transaction=store.db.transaction(()=>{const session=store.db.prepare('SELECT username FROM admin_sessions WHERE token_hash=?').get(hashToken(token));store.db.prepare('DELETE FROM admin_sessions WHERE token_hash=?').run(hashToken(token));if(session)store.audit(session.username,'logout','session',now);});transaction.immediate();}
  finally {store.close();}
}
