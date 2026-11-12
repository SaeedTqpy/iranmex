import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {defaultSponsors} from '../../app/sponsors.mjs';
import {openAdminStore} from './admin-store.mjs';

export function getSponsors(){
  const filename=resolve(/* turbopackIgnore: true */ process.env.REGISTRATION_DB_PATH||'.data/registrations.sqlite');
  if(!existsSync(/* turbopackIgnore: true */ filename))return {items:defaultSponsors,updatedAt:0};
  const db=new Database(filename,{readonly:true,fileMustExist:true,timeout:5000});
  try{if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_sponsors'").get())return {items:defaultSponsors,updatedAt:0};const row=db.prepare('SELECT document,updated_at FROM admin_sponsors WHERE id=1').get();return row?{items:JSON.parse(row.document),updatedAt:row.updated_at}:{items:defaultSponsors,updatedAt:0};}finally{db.close();}
}

export function saveSponsors(input,username){
  if(!input||!Number.isSafeInteger(input.updatedAt)||input.updatedAt<0||!Array.isArray(input.items)||input.items.length>60)return {error:'اطلاعات حامیان معتبر نیست.'};
  const clean=value=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim():'';
  const seen=new Set(),items=[];
  for(const item of input.items){
    if(!item||typeof item!=='object'||Array.isArray(item))return {error:'اطلاعات حامی معتبر نیست.'};
    const id=clean(item.id),name=clean(item.name),nameEn=clean(item.nameEn),nameAr=clean(item.nameAr),logo=clean(item.logo);
    if(!/^[a-z0-9-]{1,64}$/.test(id)||seen.has(id)||!name||name.length>160||nameEn.length>160||nameAr.length>160)return {error:'نام هر حامی را وارد کنید؛ هر نام حداکثر ۱۶۰ نویسه است.'};
    if(!/^\/news\/media\/[0-9a-f]{32}$/.test(logo)&&!defaultSponsors.some(s=>s.id===id&&s.logo===logo))return {error:'برای هر حامی یک نشان معتبر انتخاب کنید.'};
    seen.add(id);items.push({id,name,nameEn,nameAr,logo,...(item.small&&defaultSponsors.some(s=>s.id===id&&s.logo===logo&&s.small)?{small:true}:{})});
  }
  const store=openAdminStore();try{return store.db.transaction(()=>{
    const row=store.db.prepare('SELECT updated_at FROM admin_sponsors WHERE id=1').get();
    if((row?.updated_at||0)!==input.updatedAt)return {error:'فهرست حامیان تغییر کرده است. صفحه را تازه‌سازی کنید.'};
    const hasMedia=store.db.prepare('SELECT 1 FROM admin_media WHERE id=?');
    if(items.some(item=>item.logo.startsWith('/news/media/')&&!hasMedia.get(item.logo.split('/').pop())))return {error:'نشان یکی از حامیان پیدا نشد. آن را دوباره بارگذاری کنید.'};
    const version=Math.max(Date.now(),(row?.updated_at||0)+1);
    store.db.prepare('INSERT INTO admin_sponsors(id,document,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(JSON.stringify(items),version);
    store.audit(username,'sponsors_updated','homepage');return {updatedAt:version};
  }).immediate();}finally{store.close();}
}
