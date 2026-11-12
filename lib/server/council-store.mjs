import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {defaultCouncils} from '../../app/councils.mjs';
import {openAdminStore} from './admin-store.mjs';

export function getCouncils(){
  const filename=resolve(/* turbopackIgnore: true */ process.env.REGISTRATION_DB_PATH||'.data/registrations.sqlite');
  if(!existsSync(/* turbopackIgnore: true */ filename))return {items:defaultCouncils,updatedAt:0};
  const db=new Database(filename,{readonly:true,fileMustExist:true,timeout:5000});
  try{if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_councils'").get())return {items:defaultCouncils,updatedAt:0};const row=db.prepare('SELECT document,updated_at FROM admin_councils WHERE id=1').get();return row?{items:JSON.parse(row.document),updatedAt:row.updated_at}:{items:defaultCouncils,updatedAt:0};}finally{db.close();}
}

export function saveCouncils(input,username){
  if(!input||!Number.isSafeInteger(input.updatedAt)||input.updatedAt<0||!Array.isArray(input.items)||input.items.length!==2)return {error:'اطلاعات شوراها معتبر نیست.'};
  const clean=value=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim():'';
  const localize=value=>({fa:clean(value?.fa),en:clean(value?.en),ar:clean(value?.ar)});
  const validText=(value,max)=>value.fa&&Object.values(value).every(text=>text.length<=max);
  const seen=new Set(),items=[];
  for(const [index,group] of input.items.entries()){
    if(!group||group.id!==['policy','executive'][index]||!Array.isArray(group.members)||group.members.length>60)return {error:'فهرست شوراها معتبر نیست.'};
    const title=localize(group.title),members=[];if(!validText(title,160))return {error:'عنوان فارسی هر شورا لازم است و عنوان‌ها حداکثر ۱۶۰ نویسه هستند.'};
    for(const member of group.members){
      if(!member||typeof member!=='object'||Array.isArray(member))return {error:'اطلاعات عضو معتبر نیست.'};
      const id=clean(member.id),name=localize(member.name),role=localize(member.role),photo=clean(member.photo);
      if(!/^[a-z0-9-]{1,64}$/.test(id)||seen.has(id)||!validText(name,160)||!validText(role,160))return {error:'نام و سمت فارسی هر عضو لازم است و هر کدام حداکثر ۱۶۰ نویسه هستند.'};
      if(photo&&!/^\/news\/media\/[0-9a-f]{32}$/.test(photo)&&!defaultCouncils.some(g=>g.members.some(m=>m.id===id&&m.photo===photo)))return {error:'عکس انتخاب‌شده معتبر نیست.'};
      seen.add(id);members.push({id,name,role,photo});
    }
    items.push({id:group.id,title,members});
  }
  const store=openAdminStore();try{return store.db.transaction(()=>{
    const row=store.db.prepare('SELECT updated_at FROM admin_councils WHERE id=1').get();
    if((row?.updated_at||0)!==input.updatedAt)return {error:'اطلاعات شوراها تغییر کرده است. صفحه را تازه‌سازی کنید.'};
    const hasMedia=store.db.prepare('SELECT 1 FROM admin_media WHERE id=?');
    if(items.some(group=>group.members.some(member=>member.photo.startsWith('/news/media/')&&!hasMedia.get(member.photo.split('/').pop()))))return {error:'عکس یکی از اعضا پیدا نشد. آن را دوباره بارگذاری کنید.'};
    const version=Math.max(Date.now(),(row?.updated_at||0)+1);
    store.db.prepare('INSERT INTO admin_councils(id,document,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(JSON.stringify(items),version);
    store.audit(username,'councils_updated','about');return {updatedAt:version};
  }).immediate();}finally{store.close();}
}
