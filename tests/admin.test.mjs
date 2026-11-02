import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID,scryptSync} from 'node:crypto';
import Database from 'better-sqlite3';
import {createAdministrator,loginAdministrator,getAdminSession,logoutAdministrator,openAdminStore} from '../lib/server/admin-store.mjs';
import {normalizeClientAddress,resolveLoginClient} from '../lib/server/login-source.mjs';
import {openRegistrationStore} from '../lib/server/registration-store.mjs';
import {saveManagedNews,listManagedNews,getManagedNews,deleteDraftNews} from '../lib/server/news-store.mjs';
import {publishedNews} from '../lib/news.mjs';
import {listRegistrations,updateBoothStatus} from '../lib/server/registrations-admin.mjs';

function fixture(t){const directory=mkdtempSync(join(tmpdir(),'iranmex-admin-'));const path=join(directory,'private.sqlite');const original=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=path;t.after(()=>{if(original===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=original;rmSync(directory,{recursive:true,force:true});});return path;}
const password='test-only-long-password-123';

test('administrator credentials are hashed; sessions expire, revoke and reset safely',async t=>{
  const path=fixture(t);await assert.rejects(createAdministrator('a','short',{filename:path}));
  await createAdministrator('Admin',password,{filename:path});
  await assert.rejects(createAdministrator('admin',password,{filename:path}),/already exists/);
  const wrong=await loginAdministrator('admin','wrong',{filename:path,clientAddress:'192.0.2.1'});assert.equal(wrong.error,'INVALID');
  const now=Date.now();const login=await loginAdministrator('admin',password,{filename:path,now,clientAddress:'192.0.2.1'});assert.ok(login.token);assert.equal(getAdminSession(login.token,{filename:path,now}).username,'admin');
  const store=openAdminStore(path);const user=store.db.prepare('SELECT password_salt,password_hash FROM admin_users WHERE username=?').get('admin');const session=store.db.prepare('SELECT token_hash FROM admin_sessions').get();store.close();
  assert.notEqual(user.password_hash,password);assert.notEqual(session.token_hash,login.token);assert.equal(getAdminSession(login.token,{filename:path,now:login.expiresAt}),null);
  await createAdministrator('admin','different-test-password-123',{filename:path,reset:true});assert.equal(getAdminSession(login.token,{filename:path,now}),null);
  const next=await loginAdministrator('admin','different-test-password-123',{filename:path,clientAddress:'192.0.2.1'});assert.ok(next.token);logoutAdministrator(next.token,{filename:path});assert.equal(getAdminSession(next.token,{filename:path}),null);
});

test('rate limits each client without locking other clients out of the account',async t=>{
  const path=fixture(t);await createAdministrator('admin',password,{filename:path});const now=Date.now();const attacker='192.0.2.10',admin='192.0.2.11';
  for(let i=0;i<5;i++)assert.equal((await loginAdministrator('admin','wrong',{filename:path,now,clientAddress:attacker})).error,'INVALID');
  assert.equal((await loginAdministrator('admin',password,{filename:path,now,clientAddress:attacker})).error,'RATE_LIMIT');
  assert.equal((await loginAdministrator('other','wrong',{filename:path,now,clientAddress:attacker})).error,'RATE_LIMIT');
  assert.ok((await loginAdministrator('admin',password,{filename:path,now,clientAddress:admin})).token);
  assert.equal((await loginAdministrator('admin','wrong',{filename:path,now:now+15*60*1000,clientAddress:attacker})).error,'INVALID');
  await createAdministrator('admin','another-test-password-123',{filename:path,reset:true});
  assert.ok((await loginAdministrator('admin','another-test-password-123',{filename:path,now:now+15*60*1000,clientAddress:attacker})).token);
});

test('concurrent login attempts are reserved atomically per client',async t=>{
  const path=fixture(t);await createAdministrator('admin',password,{filename:path});const now=Date.now();
  const attempts=await Promise.all(Array.from({length:8},()=>loginAdministrator('admin','wrong',{filename:path,now,clientAddress:'192.0.2.20'})));
  assert.equal(attempts.filter(x=>x.error==='INVALID').length,5);assert.equal(attempts.filter(x=>x.error==='RATE_LIMIT').length,3);
});

test('client addresses require a configured proxy in production and normalize aliases',()=>{
  const request=headers=>({headers:new Headers(headers)});
  assert.equal(resolveLoginClient(request({'x-real-ip':'192.0.2.1'}),{production:true}),null);
  assert.equal(resolveLoginClient(request({}),{production:true,trustProxy:'1'}),null);
  for(const value of ['192.0.2.1, 192.0.2.2','garbage','fe80::1%en0'])assert.equal(resolveLoginClient(request({'x-real-ip':value}),{production:true,trustProxy:'1'}),null);
  assert.equal(resolveLoginClient(request({'x-real-ip':'192.0.2.1'}),{production:false}),'127.0.0.1');
  assert.equal(resolveLoginClient(request({'x-real-ip':'192.0.2.1'}),{production:true,trustProxy:'1'}),'192.0.2.1');
  assert.equal(normalizeClientAddress('::ffff:192.0.2.1'),'192.0.2.1');
  assert.equal(normalizeClientAddress('2001:0db8:0:0::1'),'2001:db8::1');
});

test('news drafts stay private, publish immediately, and use optimistic editing',t=>{
  fixture(t);const input={slug:'test-news',title:'خبر آزمایشی',excerpt:'خلاصه آزمایشی',body:'پاراگراف اول\n\nپاراگراف دوم',category:'news',status:'draft'};
  assert.deepEqual(saveManagedNews(input,'admin'),{slug:'test-news'});assert.equal(publishedNews().length,0);
  const draft=getManagedNews('test-news');assert.equal(listManagedNews().length,1);assert.equal(draft.content.length,2);
  assert.ok(saveManagedNews({...input,originalSlug:'test-news',updatedAt:draft.updatedAt-1,status:'published'},'admin').error);
  assert.deepEqual(saveManagedNews({...input,originalSlug:'test-news',updatedAt:draft.updatedAt,status:'published'},'admin'),{slug:'test-news'});
  const published=getManagedNews('test-news');assert.equal(publishedNews()[0].slug,'test-news');assert.ok(deleteDraftNews('test-news',published.updatedAt,'admin').error);
  assert.deepEqual(saveManagedNews({...input,originalSlug:'test-news',updatedAt:published.updatedAt,status:'draft'},'admin'),{slug:'test-news'});
  const unpublished=getManagedNews('test-news');assert.equal(publishedNews().length,0);assert.deepEqual(deleteDraftNews('test-news',unpublished.updatedAt,'admin'),{ok:true});
  assert.ok(saveManagedNews({...input,slug:'new'},'admin').error);
  assert.ok(saveManagedNews({...input,sourceUrl:'javascript:alert(1)',sourceLabel:'منبع'},'admin').error);
});

test('only booth requests accept status changes and changes are audited',t=>{
  const path=fixture(t);const store=openRegistrationStore(path);
  const visitor=store.save({type:'visitor',mobile:'09000000000',firstName:'آزمون',lastName:'کاربر'},randomUUID()).reference;
  const booth=store.save({type:'booth',mobile:'09000000000',firstName:'آزمون',lastName:'کاربر',companyName:'تست'},randomUUID()).reference;store.close();
  assert.equal(updateBoothStatus(visitor,'confirmed','admin'),false);assert.equal(updateBoothStatus(booth,'unknown','admin'),false);assert.equal(updateBoothStatus(booth,'contacted','admin'),true);
  assert.equal(listRegistrations('booth').rows[0].status,'contacted');const admin=openAdminStore();assert.equal(admin.db.prepare("SELECT count(*) AS n FROM admin_audit WHERE action='booth_status_changed'").get().n,1);admin.close();
});

test('existing administrator passwords remain valid after removing the authenticator',async t=>{
  const path=fixture(t);const db=new Database(path);const salt=Buffer.alloc(16,7);
  const hash=scryptSync(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024}).subarray(0,32).toString('hex');
  db.exec("CREATE TABLE admin_users(username TEXT PRIMARY KEY,password_salt TEXT NOT NULL,password_hash TEXT NOT NULL,totp_secret TEXT,totp_last_step INTEGER NOT NULL DEFAULT -1,created_at INTEGER NOT NULL)");
  db.prepare('INSERT INTO admin_users(username,password_salt,password_hash,totp_secret,created_at) VALUES (?,?,?,?,?)').run('existing',salt.toString('hex'),hash,'previous-encrypted-secret',Date.now());db.close();
  const result=await loginAdministrator('existing',password,{filename:path,clientAddress:'192.0.2.1'});assert.ok(result.token);
  const store=openAdminStore(path);assert.equal(store.db.prepare('SELECT totp_secret FROM admin_users WHERE username=?').get('existing').totp_secret,'previous-encrypted-secret');store.close();
});
