import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {getSponsors,saveSponsors} from '../lib/server/sponsor-store.mjs';
import {openAdminStore} from '../lib/server/admin-store.mjs';

test('sponsors preserve defaults, validate uploads, support ordering, deletion and concurrent edits',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-sponsors-')),previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const original=getSponsors();assert.equal(original.items.length,4);assert.equal(original.updatedAt,0);
 const id='a'.repeat(32),store=openAdminStore();store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(id,Buffer.from('image'),1,1,Date.now());store.close();
 const added={id:'new-sponsor',name:'حامی جدید',nameEn:'New sponsor',nameAr:'',logo:`/news/media/${id}`};
 assert.ok(saveSponsors({updatedAt:0,items:[{...added,logo:'/news/media/'+ 'b'.repeat(32)}]},'admin').error);
 assert.ok(saveSponsors({updatedAt:0,items:[{...added,name:''}]},'admin').error);
 assert.ok(saveSponsors({updatedAt:0,items:[added,added]},'admin').error);
 assert.ok(saveSponsors({updatedAt:0,items:[{...added,logo:'https://example.com/logo.png'}]},'admin').error);
 const first=saveSponsors({updatedAt:0,items:[added,original.items[0]]},'admin');assert.ok(first.updatedAt>0);assert.deepEqual(getSponsors().items.map(item=>item.id),['new-sponsor','federation']);
 assert.ok(saveSponsors({updatedAt:0,items:[]},'admin').error);
 const second=saveSponsors({updatedAt:first.updatedAt,items:[]},'admin');assert.ok(second.updatedAt>first.updatedAt);assert.deepEqual(getSponsors().items,[]);
 const audit=openAdminStore();assert.equal(audit.db.prepare("SELECT count(*) AS n FROM admin_audit WHERE action='sponsors_updated'").get().n,2);audit.close();
});
