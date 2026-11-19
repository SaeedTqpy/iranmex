import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openAdminStore} from '../lib/server/admin-store.mjs';

test('public site images are accessible without an admin session, unrelated images remain private',async t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-media-')),previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');
 t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const store=openAdminStore(),ids=Array.from({length:6},(_,i)=>String(i+1).repeat(32));
 for(const id of ids)store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES(?,?,?,?,?)').run(id,Buffer.from('image'),1,1,Date.now());
 const src=id=>'/news/media/'+id;
 for(const [table,doc] of [['admin_mountain_talks',[{image:src(ids[0])}]],['admin_sponsors',[{logo:src(ids[1])}]],['admin_hero_images',{berc:{src:src(ids[2])}}],['admin_councils',[{members:[{photo:src(ids[3])}]}]],['admin_intro_video',{poster:src(ids[4])}]])store.db.prepare(`INSERT INTO ${table}(id,document,updated_at) VALUES(1,?,1)`).run(JSON.stringify(doc));
 store.close();
 const helper='data:text/javascript;base64,'+Buffer.from('export async function readAdminSession(){return null;}').toString('base64');
 const code=readFileSync(new URL('../app/news/media/[id]/route.js',import.meta.url),'utf8').replace("'../../../../lib/server/admin-request'",JSON.stringify(helper)).replace("'../../../../lib/server/admin-store.mjs'",JSON.stringify(new URL('../lib/server/admin-store.mjs',import.meta.url).href));
 const {GET}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 for(const id of ids.slice(0,5))assert.equal((await GET(new Request('https://example.org/news/media/'+id),{params:Promise.resolve({id})})).status,200);
 assert.equal((await GET(new Request('https://example.org/news/media/'+ids[5]),{params:Promise.resolve({id:ids[5]})})).status,404);
});
