import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import Database from 'better-sqlite3';
import {POST} from '../app/api/registrations/route.js';

const origin='http://localhost:3101';
const visitor={type:'visitor',firstName:'آزمایش',lastName:'سامانه',mobile:'09000000000',city:'تهران',experience:'one-to-three',referral:'website'};
const send=(input,headers={})=>POST(new Request(origin+'/api/registrations',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(input)}));

test('API validates before saving and returns committed references only',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'iranmex-api-'));
  const previous={path:process.env.REGISTRATION_DB_PATH,origin:process.env.APP_ORIGIN};
  process.env.REGISTRATION_DB_PATH=join(directory,'registrations.sqlite');process.env.APP_ORIGIN=origin;
  t.after(()=>{for(const [key,value] of [['REGISTRATION_DB_PATH',previous.path],['APP_ORIGIN',previous.origin]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}rmSync(directory,{recursive:true,force:true});});
  assert.equal((await send(visitor,{Origin:'https://untrusted.example'})).status,403);
  assert.equal((await send(visitor,{'Content-Type':'text/plain'})).status,415);
  assert.equal((await send(visitor)).status,400);
  assert.equal((await send({...visitor,requestId:randomUUID(),mobile:'invalid'})).status,422);
  assert.equal((await send({...visitor,requestId:randomUUID(),companyFax:'bot'})).status,400);
  assert.equal((await send({...visitor,requestId:randomUUID(),notes:'x'.repeat(17000)})).status,413);
  const input={...visitor,requestId:randomUUID()};
  const response=await send(input);assert.equal(response.status,201);assert.equal(response.headers.get('cache-control'),'no-store');
  const saved=await response.json();assert.match(saved.reference,/^IMX-V-/);assert.equal(saved.mobile,undefined);
  const replay=await send(input);assert.equal(replay.status,200);assert.equal((await replay.json()).reference,saved.reference);
  const duplicate=await send({...input,requestId:randomUUID()});assert.equal(duplicate.status,409);assert.equal((await duplicate.json()).reference,undefined);
  const booth=await send({...visitor,type:'booth',requestId:randomUUID(),companyName:'تست',activity:'تجهیزات کوهنوردی'});
  assert.equal(booth.status,201);assert.match((await booth.json()).reference,/^IMX-B-/);
  const db=new Database(process.env.REGISTRATION_DB_PATH,{readonly:true});assert.equal(db.prepare('SELECT count(*) AS n FROM registrations').get().n,2);db.close();
});
