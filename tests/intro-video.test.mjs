import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync,readdirSync,statSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {getIntroVideo,uploadIntroVideo,deleteIntroVideo,introVideoPath} from '../lib/server/intro-video-store.mjs';
import {MAX_VIDEO_BYTES,parseVideoRange} from '../lib/video-validation.mjs';
import {GET,HEAD} from '../app/intro-video/[id]/route.js';

function setup(t){
 const dir=mkdtempSync(join(tmpdir(),'iranmex-video-')),previous=process.env.REGISTRATION_DB_PATH;
 process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');
 t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 return dir;
}
function box(type,payload){const header=Buffer.alloc(8);header.writeUInt32BE(payload.length+8);header.write(type,4);return Buffer.concat([header,payload]);}
const clip=()=>Buffer.concat([box('ftyp',Buffer.from('isom0000iso2')),box('moov',Buffer.from([1])),box('mdat',Buffer.from([1,2,3,4]))]);
const stream=bytes=>new ReadableStream({start(controller){controller.enqueue(bytes);controller.close();}});

test('clip uploads replace atomically, persist, clean old files and reject stale writes',async t=>{
 setup(t);assert.deepEqual(getIntroVideo(),{video:null,updatedAt:0});
 const first=await uploadIntroVideo(stream(clip()),0,'admin');
 assert.equal(first.video.size,clip().length);assert.equal(getIntroVideo().video.id,first.video.id);
 assert.deepEqual(readFileSync(introVideoPath(first.video.id)),clip());
 assert.equal(statSync(introVideoPath(first.video.id)).mode&0o777,0o600);
 await assert.rejects(uploadIntroVideo(stream(clip()),0,'admin'),error=>error.status===409);
 await assert.rejects(uploadIntroVideo(stream(Buffer.from('invalid MP4')),first.updatedAt,'admin'));
 assert.equal(getIntroVideo().video.id,first.video.id);
 const next=await uploadIntroVideo(stream(clip()),first.updatedAt,'admin');
 assert.ok(next.updatedAt>first.updatedAt);assert.equal(existsSync(introVideoPath(first.video.id)),false);
 assert.equal(readdirSync(dirname(introVideoPath(next.video.id))).length,1);
 await assert.rejects(deleteIntroVideo(first.updatedAt,'admin'),error=>error.status===409);
 const deleted=await deleteIntroVideo(next.updatedAt,'admin');
 assert.equal(deleted.video,null);assert.equal(getIntroVideo().video,null);assert.ok(deleted.updatedAt>next.updatedAt);
 assert.equal(existsSync(introVideoPath(next.video.id)),false);
 await assert.rejects(uploadIntroVideo(stream(clip()),next.updatedAt,'admin'),error=>error.status===409);
 const restored=await uploadIntroVideo(stream(clip()),deleted.updatedAt,'admin');assert.ok(restored.video);
});

test('invalid, truncated, interrupted and oversized streams leave no published file',async t=>{
 const dir=setup(t);
 for(const bytes of [Buffer.alloc(0),clip().subarray(0,clip().length-1),Buffer.alloc(40),box('ftyp',Buffer.from('isom0000iso2'))]){
   await assert.rejects(uploadIntroVideo(stream(bytes),0,'admin'));
   assert.deepEqual(getIntroVideo(),{video:null,updatedAt:0});
 }
 let reads=0,cancelled=false;const chunk=Buffer.alloc(1024*1024);
 const large=new ReadableStream({pull(controller){reads++;controller.enqueue(chunk);},cancel(){cancelled=true;}});
 await assert.rejects(uploadIntroVideo(large,0,'admin'),error=>error.status===413);
 assert.equal(cancelled,true);assert.ok(reads<=MAX_VIDEO_BYTES/chunk.length+2);
 const broken=new ReadableStream({pull(controller){controller.error(new Error('connection lost'));}});
 await assert.rejects(uploadIntroVideo(broken,0,'admin'));
 assert.deepEqual(readdirSync(join(dir,'intro-videos')),[]);
 assert.deepEqual(getIntroVideo(),{video:null,updatedAt:0});
});

test('video ranges handle full, suffix, clipped and unsatisfiable requests',()=>{
 assert.deepEqual(parseVideoRange(null,100),{start:0,end:99,partial:false});
 assert.deepEqual(parseVideoRange('bytes=10-20',100),{start:10,end:20,partial:true});
 assert.deepEqual(parseVideoRange('bytes=90-',100),{start:90,end:99,partial:true});
 assert.deepEqual(parseVideoRange('bytes=-20',100),{start:80,end:99,partial:true});
 assert.deepEqual(parseVideoRange('bytes=90-999',100),{start:90,end:99,partial:true});
 for(const header of ['bytes=100-','bytes=20-10','bytes=-0','bytes=-','bytes=0-1,5-6','bytes=a-b','items=0-1','bytes=99999999999999999999-'])assert.equal(parseVideoRange(header,100),null);
});

test('public video streams full and partial bytes; deleted and unknown IDs are unavailable',async t=>{
 setup(t);const data=clip(),saved=await uploadIntroVideo(stream(data),0,'admin');
 const context={params:Promise.resolve({id:saved.video.id})},url='https://example.org'+saved.video.src;
 const full=await GET(new Request(url),context);assert.equal(full.status,200);assert.equal(full.headers.get('Accept-Ranges'),'bytes');assert.deepEqual(Buffer.from(await full.arrayBuffer()),data);
 const partial=await GET(new Request(url,{headers:{Range:'bytes=4-11'}}),context);assert.equal(partial.status,206);assert.equal(partial.headers.get('Content-Range'),'bytes 4-11/'+data.length);assert.deepEqual(Buffer.from(await partial.arrayBuffer()),data.subarray(4,12));
 const suffix=await GET(new Request(url,{headers:{Range:'bytes=-4'}}),context);assert.equal(suffix.status,206);assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),data.subarray(-4));
 const invalid=await GET(new Request(url,{headers:{Range:'bytes=999-'}}),context);assert.equal(invalid.status,416);
 const head=await HEAD(new Request(url,{method:'HEAD'}),context);assert.equal(head.status,200);assert.equal(head.headers.get('Content-Length'),String(data.length));assert.equal((await head.arrayBuffer()).byteLength,0);
 await deleteIntroVideo(saved.updatedAt,'admin');assert.equal((await GET(new Request(url),context)).status,404);
 assert.equal((await GET(new Request(url),{params:Promise.resolve({id:'../private'})})).status,404);
});

test('concurrent uploads keep exactly one published clip and clean the losing file',async t=>{
 const dir=setup(t);
 const results=await Promise.allSettled([uploadIntroVideo(stream(clip()),0,'first-admin'),uploadIntroVideo(stream(clip()),0,'second-admin')]);
 assert.equal(results.filter(item=>item.status==='fulfilled').length,1);
 assert.equal(results.find(item=>item.status==='rejected').reason.status,409);
 assert.equal(readdirSync(join(dir,'intro-videos')).length,1);
 assert.ok(existsSync(introVideoPath(getIntroVideo().video.id)));
});

test('upload API enforces Origin, session, MIME, size and version before publication',async t=>{
 setup(t);
 const previousOrigin=process.env.APP_ORIGIN,previousMode=process.env.NODE_ENV;
 process.env.APP_ORIGIN='https://example.org';process.env.NODE_ENV='production';
 t.after(()=>{if(previousOrigin===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=previousOrigin;if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;});
 const helperSource=readFileSync(new URL('../lib/server/admin-request.js',import.meta.url),'utf8');
 const origin=helperSource.slice(helperSource.indexOf('export function checkAdminOrigin'),helperSource.indexOf('export async function readAdminSession'));
 const readers=helperSource.slice(helperSource.indexOf('export function response'));
 const helper='data:text/javascript;base64,'+Buffer.from(origin+readers+'\nlet session=null;export function setSession(value){session=value;}export async function readAdminSession(){return session;}').toString('base64');
 const sessions=await import(helper);
 const routeSource=readFileSync(new URL('../app/api/admin/intro-video/route.js',import.meta.url),'utf8')
   .replace("'../../../../lib/server/admin-request'",JSON.stringify(helper))
   .replace("'../../../../lib/server/intro-video-store.mjs'",JSON.stringify(new URL('../lib/server/intro-video-store.mjs',import.meta.url).href))
   .replace("'../../../../lib/video-validation.mjs'",JSON.stringify(new URL('../lib/video-validation.mjs',import.meta.url).href));
 const api=await import('data:text/javascript;base64,'+Buffer.from(routeSource).toString('base64'));
 const request=(headers={},body=clip(),method='POST')=>new Request('https://example.org/api/admin/intro-video',{method,headers:{Origin:'https://example.org','Content-Type':'video/mp4','X-Video-Version':'0',...headers},body});
 assert.equal((await api.POST(request({Origin:'https://attacker.example'}))).status,403);
 assert.equal((await api.POST(request())).status,401);
 sessions.setSession({username:'admin'});
 assert.equal((await api.POST(request({'Content-Type':'text/plain'}))).status,415);
 assert.equal((await api.POST(request({'Content-Length':String(MAX_VIDEO_BYTES+1)}))).status,413);
 assert.equal((await api.POST(request({'X-Video-Version':'invalid'}))).status,400);
 const uploaded=await api.POST(request());assert.equal(uploaded.status,201);
 const result=await uploaded.json();assert.ok(result.video);
 const stale=await api.DELETE(request({'Content-Type':'application/json'},JSON.stringify({updatedAt:0}),'DELETE'));assert.equal(stale.status,409);
 const removed=await api.DELETE(request({'Content-Type':'application/json'},JSON.stringify({updatedAt:result.updatedAt}),'DELETE'));assert.equal(removed.status,200);
 assert.equal(getIntroVideo().video,null);
});
