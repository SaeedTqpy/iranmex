import Database from 'better-sqlite3';
import {mkdirSync,chmodSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';

export class RegistrationError extends Error {
  constructor(code){super(code);this.code=code;}
}

export function openRegistrationStore(filename=process.env.REGISTRATION_DB_PATH||resolve('.data/registrations.sqlite')) {
  // Runtime data lives on the persistent volume, not in the deployment bundle.
  const path=resolve(/* turbopackIgnore: true */ filename);
  mkdirSync(dirname(path),{recursive:true,mode:0o700});
  const db=new Database(path,{timeout:5000});
  try {
    chmodSync(path,0o600);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = FULL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        event TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('visitor','booth')),
        mobile TEXT NOT NULL,
        payload TEXT NOT NULL,
        request_id TEXT NOT NULL UNIQUE,
        payload_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'received',
        created_at INTEGER NOT NULL,
        UNIQUE(event,type,mobile)
      );
      CREATE TABLE IF NOT EXISTS registration_attempts (mobile_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS attempts_time ON registration_attempts(created_at);
      CREATE INDEX IF NOT EXISTS attempts_mobile ON registration_attempts(mobile_hash,created_at);
    `);
  } catch(error){db.close();throw error;}

  const save=db.transaction((data,requestId,now)=>{
    const payload=JSON.stringify(data);
    const hash=createHash('sha256').update(payload).digest('hex');
    const existing=db.prepare('SELECT id,payload_hash FROM registrations WHERE request_id=?').get(requestId);
    if(existing)return existing.payload_hash===hash ? {reference:existing.id,replayed:true} : {error:'IDEMPOTENCY_CONFLICT'};
    const mobileHash=createHash('sha256').update(data.mobile).digest('hex');
    db.prepare('DELETE FROM registration_attempts WHERE created_at < ?').run(now-600_000);
    const globalCount=db.prepare('SELECT count(*) AS count FROM registration_attempts WHERE created_at >= ?').get(now-60_000).count;
    const mobileCount=db.prepare('SELECT count(*) AS count FROM registration_attempts WHERE mobile_hash=?').get(mobileHash).count;
    if(globalCount>=120||mobileCount>=5)return {error:'RATE_LIMIT'};
    db.prepare('INSERT INTO registration_attempts(mobile_hash,created_at) VALUES (?,?)').run(mobileHash,now);
    if(db.prepare('SELECT 1 FROM registrations WHERE event=? AND type=? AND mobile=?').get('iranmex-1405',data.type,data.mobile))return {error:'DUPLICATE'};
    const reference=`IMX-${data.type==='visitor'?'V':'B'}-${randomBytes(8).toString('hex').toUpperCase()}`;
    db.prepare('INSERT INTO registrations(id,event,type,mobile,payload,request_id,payload_hash,created_at) VALUES (?,?,?,?,?,?,?,?)').run(reference,'iranmex-1405',data.type,data.mobile,payload,requestId,hash,now);
    return {reference,replayed:false};
  });
  return {
    save(data,requestId,now=Date.now()) {
      const result=save.immediate(data,requestId,now);
      if(result.error)throw new RegistrationError(result.error);
      return result;
    },
    close(){db.close();},
  };
}
