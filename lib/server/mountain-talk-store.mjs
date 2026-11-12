import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {defaultTalks} from '../../app/mountain-talk.mjs';
import {openAdminStore} from './admin-store.mjs';

export function getMountainTalks(){
  const filename=resolve(/* turbopackIgnore: true */ process.env.REGISTRATION_DB_PATH||'.data/registrations.sqlite');
  if(!existsSync(/* turbopackIgnore: true */ filename))return {items:defaultTalks,updatedAt:0};
  const db=new Database(filename,{readonly:true,fileMustExist:true,timeout:5000});
  try{if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_mountain_talks'").get())return {items:defaultTalks,updatedAt:0};const row=db.prepare('SELECT document,updated_at FROM admin_mountain_talks WHERE id=1').get();return row?{items:JSON.parse(row.document),updatedAt:row.updated_at}:{items:defaultTalks,updatedAt:0};}finally{db.close();}
}

export function saveMountainTalks(input,username){
  if(!input||!Number.isSafeInteger(input.updatedAt)||input.updatedAt<0||!Array.isArray(input.items)||input.items.length>60)return {error:'اطلاعات سخنرانان معتبر نیست.'};
  const clean=value=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim():'';
  const seen=new Set(),items=[];
  for(const item of input.items){
    if(!item||typeof item!=='object'||Array.isArray(item))return {error:'اطلاعات سخنران معتبر نیست.'};
    const id=clean(item.id),name=clean(item.name),alt=clean(item.alt),image=clean(item.image);
    if(!/^[a-z0-9-]{1,64}$/.test(id)||seen.has(id)||!name||name.length>160||alt.length>300)return {error:'نام سخنران و توضیح تصویر را در محدوده مجاز وارد کنید.'};
    if(!/^\/news\/media\/[0-9a-f]{32}$/.test(image)&&!defaultTalks.some(t=>t.id===id&&t.image===image))return {error:'برای هر سخنران یک پوستر معتبر انتخاب کنید.'};
    seen.add(id);items.push({id,name,alt,image});
  }
  const store=openAdminStore();try{return store.db.transaction(()=>{
    const row=store.db.prepare('SELECT updated_at FROM admin_mountain_talks WHERE id=1').get();
    if((row?.updated_at||0)!==input.updatedAt)return {error:'فهرست سخنرانان تغییر کرده است. صفحه را تازه‌سازی کنید.'};
    const hasMedia=store.db.prepare('SELECT 1 FROM admin_media WHERE id=?');
    if(items.some(item=>item.image.startsWith('/news/media/')&&!hasMedia.get(item.image.split('/').pop())))return {error:'پوستر یکی از سخنرانان پیدا نشد. آن را دوباره بارگذاری کنید.'};
    const version=Math.max(Date.now(),(row?.updated_at||0)+1);
    store.db.prepare('INSERT INTO admin_mountain_talks(id,document,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(JSON.stringify(items),version);
    store.audit(username,'mountain_talks_updated','homepage');return {updatedAt:version};
  }).immediate();}finally{store.close();}
}
