import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {listCompanies,getCompany,saveCompany,deleteCompany} from '../lib/server/company-store.mjs';
import {openAdminStore} from '../lib/server/admin-store.mjs';

test('company publication, legacy overrides, validation and concurrent edits',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-company-'));const previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const input={slug:'test-company',name:'مجموعه آزمایشی',status:'draft',description:'معرفی',products:'محصول اول\nخدمت دوم',website:'https://example.org',phone:'09123456789',email:'info@example.org'};
 assert.deepEqual(saveCompany(input,'admin'),{slug:input.slug});assert.equal(getCompany(input.slug),null);let draft=getCompany(input.slug,{admin:true});assert.equal(draft.products.length,2);
 assert.ok(saveCompany({...input,originalSlug:input.slug,updatedAt:draft.updatedAt-1},'admin').error);
 assert.ok(saveCompany({...input,originalSlug:input.slug,updatedAt:draft.updatedAt,status:'published'},'admin').error);
 assert.ok(saveCompany({...input,slug:'invalid-url',website:'javascript:alert(1)'},'admin').error);
 const store=openAdminStore();const id='a'.repeat(32);store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(id,Buffer.from('image'),1,1,Date.now());store.close();
 assert.deepEqual(saveCompany({...input,originalSlug:input.slug,updatedAt:draft.updatedAt,status:'published',logoId:id},'admin'),{slug:input.slug});let published=getCompany(input.slug);assert.equal(published.logo,`/news/media/${id}`);assert.ok(deleteCompany(input.slug,published.updatedAt-1,'admin').error);
 assert.deepEqual(saveCompany({...input,originalSlug:input.slug,updatedAt:published.updatedAt},'admin'),{slug:input.slug});draft=getCompany(input.slug,{admin:true});assert.equal(getCompany(input.slug),null);assert.deepEqual(deleteCompany(input.slug,draft.updatedAt,'admin'),{ok:true});
 const legacy=getCompany('gaya',{admin:true});assert.equal(legacy.updatedAt,0);assert.deepEqual(saveCompany({slug:legacy.slug,name:legacy.name,status:'draft',originalSlug:legacy.slug,updatedAt:0,keepLegacyLogo:true},'admin'),{slug:legacy.slug});assert.equal(getCompany('gaya'),null);assert.equal(listCompanies({admin:true}).filter(item=>item.slug==='gaya').length,1);assert.deepEqual(deleteCompany('gaya',getCompany('gaya',{admin:true}).updatedAt,'admin'),{ok:true});assert.equal(getCompany('gaya',{admin:true}),null);assert.equal(getCompany('gaya'),null);assert.ok(saveCompany({slug:'gaya',name:'GAYA',status:'draft'},'admin').error);
});


test('published and original companies can be deleted without stale edits restoring them',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-company-delete-'));const previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const original=getCompany('haft-kooh',{admin:true});assert.equal(original.updatedAt,0);assert.ok(deleteCompany(original.slug,null,'admin').error);assert.deepEqual(deleteCompany(original.slug,0,'admin'),{ok:true});assert.equal(getCompany(original.slug),null);assert.equal(getCompany(original.slug,{admin:true}),null);assert.ok(deleteCompany(original.slug,0,'admin').error);assert.ok(saveCompany({slug:original.slug,name:original.name,status:'draft',originalSlug:original.slug,updatedAt:0},'admin').error);
 const store=openAdminStore();const id='b'.repeat(32);store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(id,Buffer.from('image'),1,1,Date.now());store.close();
 const input={slug:'published-company',name:'شرکت آزمایشی',status:'published',logoId:id};assert.deepEqual(saveCompany(input,'admin'),{slug:input.slug});const current=getCompany(input.slug);assert.ok(deleteCompany(input.slug,current.updatedAt-1,'admin').error);assert.deepEqual(deleteCompany(input.slug,current.updatedAt,'admin'),{ok:true});assert.equal(getCompany(input.slug),null);assert.equal(getCompany(input.slug,{admin:true}),null);assert.ok(saveCompany({...input,originalSlug:input.slug,updatedAt:current.updatedAt},'admin').error);
 const audit=openAdminStore();assert.equal(audit.db.prepare("SELECT count(*) AS n FROM admin_audit WHERE action='company_deleted'").get().n,2);audit.close();
});

test('company galleries enforce four existing images and preserve order across edits',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-gallery-'));const previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const ids=['a','b','c','d','e'].map(char=>char.repeat(32));const store=openAdminStore();for(const id of ids)store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(id,Buffer.from('image'),1,1,Date.now());store.close();
 const input={slug:'gallery-company',name:'شرکت آزمایشی',status:'published',logoId:ids[0],galleryIds:ids.slice(0,4)};
 assert.ok(saveCompany({...input,galleryIds:ids},'admin').error);assert.ok(saveCompany({...input,galleryIds:[ids[0],ids[0]]},'admin').error);assert.ok(saveCompany({...input,galleryIds:['f'.repeat(32)]},'admin').error);
 assert.deepEqual(saveCompany(input,'admin'),{slug:input.slug});let company=getCompany(input.slug);assert.deepEqual(company.gallery,ids.slice(0,4).map(id=>`/news/media/${id}`));
 const edit={...input,originalSlug:input.slug,updatedAt:company.updatedAt,galleryIds:[ids[3],ids[1]]};assert.deepEqual(saveCompany(edit,'admin'),{slug:input.slug});company=getCompany(input.slug);assert.deepEqual(company.gallery,[ids[3],ids[1]].map(id=>`/news/media/${id}`));
 const {galleryIds,...legacyEdit}=edit;assert.deepEqual(saveCompany({...legacyEdit,updatedAt:company.updatedAt},'admin'),{slug:input.slug});assert.deepEqual(getCompany(input.slug).gallery,company.gallery);
});

test('company slogan is optional, validated, saved and removable',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-slogan-'));const previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const input={slug:'slogan-company',name:'شرکت آزمایشی',status:'draft',slogan:'  همراه مسیر شما  '};
 assert.ok(saveCompany({...input,slogan:'الف'.repeat(161)},'admin').error);assert.ok(saveCompany({...input,slogan:'خط اول\nخط دوم'},'admin').error);
 assert.deepEqual(saveCompany(input,'admin'),{slug:input.slug});let company=getCompany(input.slug,{admin:true});assert.equal(company.slogan,'همراه مسیر شما');
 assert.deepEqual(saveCompany({...input,originalSlug:input.slug,updatedAt:company.updatedAt,slogan:''},'admin'),{slug:input.slug});company=getCompany(input.slug,{admin:true});assert.equal(company.slogan,null);
});
