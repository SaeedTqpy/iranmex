import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {getMountainTalks,saveMountainTalks} from '../lib/server/mountain-talk-store.mjs';
import {openAdminStore} from '../lib/server/admin-store.mjs';

test('Mountain Talk posters preserve defaults, validate media, save order and reject stale edits',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-talk-')),previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const original=getMountainTalks();assert.equal(original.items.length,3);assert.equal(original.updatedAt,0);
 const id='a'.repeat(32),store=openAdminStore();store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(id,Buffer.from('image'),1,1,Date.now());store.close();
 const added={id:'new-speaker',name:'سخنران جدید',alt:'سخنرانی ساعت ۱۵',image:`/news/media/${id}`};
 assert.ok(saveMountainTalks({updatedAt:0,items:[{...added,image:'/news/media/'+ 'b'.repeat(32)}]},'admin').error);
 assert.ok(saveMountainTalks({updatedAt:0,items:[{...added,name:''}]},'admin').error);
 assert.ok(saveMountainTalks({updatedAt:0,items:[added,added]},'admin').error);
 assert.ok(saveMountainTalks({updatedAt:0,items:[{...added,image:'https://example.com/image.png'}]},'admin').error);
 const first=saveMountainTalks({updatedAt:0,items:[added,original.items[0]]},'admin');assert.ok(first.updatedAt>0);assert.deepEqual(getMountainTalks().items.map(item=>item.id),['new-speaker','hamid-mosaedyan']);
 assert.ok(saveMountainTalks({updatedAt:0,items:[]},'admin').error);
 const second=saveMountainTalks({updatedAt:first.updatedAt,items:[]},'admin');assert.ok(second.updatedAt>first.updatedAt);assert.deepEqual(getMountainTalks().items,[]);
 const audit=openAdminStore();assert.equal(audit.db.prepare("SELECT count(*) AS n FROM admin_audit WHERE action='mountain_talks_updated'").get().n,2);audit.close();
});
