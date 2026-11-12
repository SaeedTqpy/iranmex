import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {getCouncils,saveCouncils} from '../lib/server/council-store.mjs';
import {openAdminStore} from '../lib/server/admin-store.mjs';

test('councils retain defaults, validate translations and photos, save order, and reject stale edits',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-councils-')),previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const original=getCouncils();assert.deepEqual(original.items.map(group=>group.members.length),[4,3]);assert.equal(original.updatedAt,0);
 const media='c'.repeat(32),store=openAdminStore();store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(media,Buffer.from('image'),1,1,Date.now());store.close();
 const added={id:'new-member',name:{fa:'عضو جدید',en:'New member',ar:''},role:{fa:'دبیر',en:'Secretary',ar:''},photo:`/news/media/${media}`};
 const groups=structuredClone(original.items);groups[0].title.fa='شورای جدید';groups[0].members=[added,groups[0].members[3]];groups[1].members=[];
 assert.ok(saveCouncils({updatedAt:0,items:[groups[1],groups[0]]},'admin').error);
 const duplicate=structuredClone(groups);duplicate[0].members.push(added);assert.ok(saveCouncils({updatedAt:0,items:duplicate},'admin').error);
 const missing=structuredClone(groups);missing[0].members[0].photo=`/news/media/${'d'.repeat(32)}`;assert.ok(saveCouncils({updatedAt:0,items:missing},'admin').error);
 const unsafe=structuredClone(groups);unsafe[0].members[0].photo='https://example.com/image.png';assert.ok(saveCouncils({updatedAt:0,items:unsafe},'admin').error);
 const bad=structuredClone(groups);bad[0].members[0].role.fa='';assert.ok(saveCouncils({updatedAt:0,items:bad},'admin').error);
 const first=saveCouncils({updatedAt:0,items:groups},'admin');assert.ok(first.updatedAt>0);const saved=getCouncils();assert.equal(saved.items[0].title.fa,'شورای جدید');assert.deepEqual(saved.items[0].members.map(m=>m.id),['new-member','policy-arbab']);assert.equal(saved.items[0].members[0].name.en,'New member');assert.deepEqual(saved.items[1].members,[]);
 assert.ok(saveCouncils({updatedAt:0,items:groups},'admin').error);
 const audit=openAdminStore();assert.equal(audit.db.prepare("SELECT count(*) AS n FROM admin_audit WHERE action='councils_updated'").get().n,1);audit.close();
});
