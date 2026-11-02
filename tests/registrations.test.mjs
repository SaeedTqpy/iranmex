import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import Database from 'better-sqlite3';
import {validateRegistration} from '../lib/registration-validation.mjs';
import {openRegistrationStore} from '../lib/server/registration-store.mjs';

const visitor={type:'visitor',firstName:'آزمایش',lastName:'سامانه',mobile:'۰۹۰۰۰۰۰۰۰۰۰',jobTitle:'',city:'تهران',email:'',experience:'under-one',referral:'website'};
function fixture(t){const directory=mkdtempSync(join(tmpdir(),'iranmex-store-'));const path=join(directory,'test.sqlite');t.after(()=>rmSync(directory,{recursive:true,force:true}));return path;}

test('normalizes Iranian mobile formats and keeps only permitted fields',()=>{
  for(const mobile of ['۰۹۰۰۰۰۰۰۰۰۰','٠٩٠٠٠٠٠٠٠٠٠','+98 900-000-0000','00989000000000']) {
    const result=validateRegistration({...visitor,mobile,untrusted:'discard',email:' User@Example.com '});
    assert.deepEqual(result.errors,{});assert.equal(result.data.mobile,'09000000000');assert.equal(result.data.email,'user@example.com');assert.equal(result.data.untrusted,undefined);
  }
});

test('validates required fields, enum choices, size limits and malformed values',()=>{
  const {errors}=validateRegistration({...visitor,firstName:'',mobile:'not-a-number',email:'invalid',experience:'unknown',referral:'unknown',city:['invalid'],lastName:'a'.repeat(81)});
  for(const name of ['firstName','mobile','email','experience','referral','city','lastName'])assert.ok(errors[name]);
  assert.ok(validateRegistration(null).errors.form);
  assert.ok(validateRegistration({...visitor,type:'admin'}).errors.form);
});

test('booth requires company activity and rejects unsafe URLs or invalid area',()=>{
  const {errors}=validateRegistration({...visitor,type:'booth',website:'javascript:alert(1)',requestedArea:'-4'});
  for(const name of ['companyName','activity','website','requestedArea'])assert.ok(errors[name]);
  const valid=validateRegistration({...visitor,type:'booth',companyName:'مجموعه آزمایشی',activity:'تجهیزات کوهنوردی',website:'https://example.com',requestedArea:'۱۲'});
  assert.deepEqual(valid.errors,{});assert.equal(valid.data.requestedArea,'12');assert.equal(valid.data.experience,undefined);
});

test('persists records across connections, replays retries and separates booth from visitor',t=>{
  const path=fixture(t);const data=validateRegistration(visitor).data;const requestId=randomUUID();
  let store=openRegistrationStore(path);const saved=store.save(data,requestId);store.close();
  assert.match(saved.reference,/^IMX-V-[0-9A-F]{16}$/);
  store=openRegistrationStore(path);
  assert.deepEqual(store.save(data,requestId),{reference:saved.reference,replayed:true});
  assert.throws(()=>store.save({...data,city:'شیراز'},requestId),{code:'IDEMPOTENCY_CONFLICT'});
  assert.throws(()=>store.save(data,randomUUID()),{code:'DUPLICATE'});
  const booth=validateRegistration({...visitor,type:'booth',companyName:'تست',activity:'تجهیزات'}).data;
  assert.match(store.save(booth,randomUUID()).reference,/^IMX-B-/);store.close();
  const db=new Database(path,{readonly:true});assert.equal(db.prepare('SELECT count(*) AS n FROM registrations').get().n,2);db.close();
  assert.equal(statSync(path).mode&0o777,0o600);
});

test('duplicate attempts are rate limited without committing new records',t=>{
  const path=fixture(t);const store=openRegistrationStore(path);t.after(()=>store.close());
  const data=validateRegistration(visitor).data;const now=Date.now();
  store.save(data,randomUUID(),now);
  for(let i=0;i<4;i++)assert.throws(()=>store.save(data,randomUUID(),now+1),{code:'DUPLICATE'});
  assert.throws(()=>store.save(data,randomUUID(),now+2),{code:'RATE_LIMIT'});
  assert.throws(()=>store.save(data,randomUUID(),now+601_000),{code:'DUPLICATE'});
});
