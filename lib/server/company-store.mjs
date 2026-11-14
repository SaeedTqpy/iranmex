import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {companies as legacy} from '../../app/exhibition/companies.js';
import {openAdminStore} from './admin-store.mjs';

function records(){
  const filename=process.env.REGISTRATION_DB_PATH||resolve('.data/registrations.sqlite');
  const path=resolve(/* turbopackIgnore: true */ filename);
  if(!existsSync(/* turbopackIgnore: true */ path))return [];
  const db=new Database(path,{readonly:true,fileMustExist:true,timeout:5000});
  try {if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_companies'").get())return [];return db.prepare('SELECT document,updated_at FROM admin_companies ORDER BY updated_at,slug').all().map(row=>({...JSON.parse(row.document),updatedAt:row.updated_at}));}finally{db.close();}
}
export function listCompanies({admin=false}={}){
  const managed=records();const bySlug=new Map(managed.map(item=>[item.slug,item]));
  const all=[...legacy.map(item=>bySlug.has(item.slug)?{...bySlug.get(item.slug),legacy:true}:{...item,status:'published',updatedAt:0,legacy:true}),...managed.filter(item=>!legacy.some(old=>old.slug===item.slug))];
  const order=readCompanyOrder();
  const positions=new Map(order.map((slug,index)=>[slug,index]));
  return all.filter(item=>item.status!=='deleted'&&(admin||item.status==='published'))
    .sort((a,b)=>(positions.get(a.slug)??Infinity)-(positions.get(b.slug)??Infinity));

}
export function getCompany(slug,options){return listCompanies(options).find(item=>item.slug===slug)||null;}
export function saveCompany(input,username){
  const clean=value=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim():'';
  const slug=clean(input.slug), name=clean(input.name), slogan=clean(input.slogan), city=clean(input.city), description=clean(input.description), website=clean(input.website), phone=clean(input.phone), email=clean(input.email), productText=clean(input.products), status=clean(input.status), logoId=clean(input.logoId);
  if(slogan.length>160||/[\r\n]/.test(slogan))return {error:'شعار مجموعه باید در یک سطر و حداکثر ۱۶۰ نویسه باشد.'};
  if(city.length>100||/[\r\n]/.test(city))return {error:'شهر محل فعالیت باید در یک سطر و حداکثر ۱۰۰ نویسه باشد.'};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>100||['new','media'].includes(slug)||name.length<2||name.length>160||description.length>5000||productText.length>5000||website.length>1000||phone.length>40||email.length>254||!['draft','published'].includes(status))return {error:'اطلاعات شرکت را کامل و در محدوده مجاز وارد کنید.'};
  if(input.originalSlug&&input.originalSlug!==slug)return {error:'شناسه شرکت قابل تغییر نیست.'};
  if(website){try{const url=new URL(website);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch{return {error:'نشانی وب‌سایت باید با https:// شروع شود.'};}}
  if(phone&&!/^\+?[0-9۰-۹٠-٩ ()-]{5,40}$/.test(phone))return {error:'شماره تماس معتبر نیست.'};
  if(email&&!/^[A-Za-z0-9.!#$%&'*+\/=_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email))return {error:'ایمیل معتبر نیست.'};
  if(logoId&&!/^[0-9a-f]{32}$/.test(logoId))return {error:'تصویر معتبر نیست.'};
  const galleryIds=input.galleryIds;
  if(galleryIds!==undefined&&(!Array.isArray(galleryIds)||galleryIds.length>4||galleryIds.some(id=>typeof id!=='string'||!/^[0-9a-f]{32}$/.test(id))||new Set(galleryIds).size!==galleryIds.length))return {error:'حداکثر ۴ تصویر معتبر و متفاوت انتخاب کنید.'};
  const products=productText?productText.split('\n').map(x=>x.trim()).filter(Boolean).map(name=>({name,description:''})):[];
  if(products.length>100||products.some(p=>p.name.length>160))return {error:'هر محصول باید حداکثر ۱۶۰ نویسه باشد.'};
  const store=openAdminStore();try{return store.db.transaction(()=>{
    const row=store.db.prepare('SELECT document,updated_at FROM admin_companies WHERE slug=?').get(slug);const old=legacy.find(item=>item.slug===slug);
    if(input.originalSlug){if((row&&JSON.parse(row.document).status==='deleted')||(row?row.updated_at:old?0:null)!==Number(input.updatedAt))return {error:'اطلاعات شرکت تغییر کرده است. صفحه را تازه‌سازی کنید.'};}
    else if(row||old)return {error:'این شناسه قبلاً استفاده شده است.'};
    let logo=null;if(logoId){if(!store.db.prepare('SELECT 1 FROM admin_media WHERE id=?').get(logoId))return {error:'تصویر پیدا نشد.'};logo=`/news/media/${logoId}`;}else if(input.keepLegacyLogo&&old)logo=old.logo;
    const gallery=galleryIds===undefined?(row?JSON.parse(row.document).gallery||[]:[]):galleryIds.map(id=>`/news/media/${id}`);
    if(galleryIds?.some(id=>!store.db.prepare('SELECT 1 FROM admin_media WHERE id=?').get(id)))return {error:'تصویر محصولات پیدا نشد. دوباره بارگذاری کنید.'};
    if(status==='published'&&!logo)return {error:'برای انتشار، نشان شرکت را بارگذاری کنید.'};
    const savedCity=input.city===undefined&&row?JSON.parse(row.document).city||null:city||null;
    const document={slug,name,slogan:slogan||null,city:savedCity,description:description||null,products,website:website||null,phone:phone||null,email:email||null,status,logo,gallery};
    const updatedAt=Math.max(Date.now(),(row?.updated_at||0)+1);
    store.db.prepare('INSERT INTO admin_companies(slug,document,updated_at) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(slug,JSON.stringify(document),updatedAt);
    store.audit(username,row||old?'company_updated':'company_created',slug);return {slug};
  }).immediate();}finally{store.close();}
}
export function deleteCompany(slug,updatedAt,username){
  if(!Number.isSafeInteger(updatedAt)||updatedAt<0)return {error:'اطلاعات شرکت معتبر نیست. صفحه را تازه‌سازی کنید.'};
  const store=openAdminStore();try{return store.db.transaction(()=>{
    const row=store.db.prepare('SELECT document,updated_at FROM admin_companies WHERE slug=?').get(slug);const old=legacy.find(item=>item.slug===slug);
    if((row?row.updated_at:old?0:null)!==updatedAt||(row&&JSON.parse(row.document).status==='deleted'))return {error:'اطلاعات شرکت تغییر کرده یا حذف شده است. صفحه را تازه‌سازی کنید.'};
    const version=Math.max(Date.now(),(row?.updated_at||0)+1);store.db.prepare('INSERT INTO admin_companies(slug,document,updated_at) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(slug,JSON.stringify({slug,status:'deleted'}),version);
    store.audit(username,'company_deleted',slug);return {ok:true};
  }).immediate();}finally{store.close();}
}

function readCompanyOrder(){
  const path=resolve(/* turbopackIgnore: true */ (process.env.REGISTRATION_DB_PATH||resolve('.data/registrations.sqlite')));
  if(!existsSync(/* turbopackIgnore: true */ path))return [];
  const db=new Database(path,{readonly:true,fileMustExist:true,timeout:5000});
  try{
    if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_company_order'").get())return [];
    const row=db.prepare('SELECT document FROM admin_company_order WHERE id=1').get();
    return row?JSON.parse(row.document):[];
  }finally{db.close();}
}

export function moveCompany({slug,direction,expectedOrder}={},username){
  if(typeof slug!=='string'||!['up','down','first','last'].includes(direction)||
    !Array.isArray(expectedOrder)||expectedOrder.some(item=>typeof item!=='string'||item.length>100))
    return {error:'درخواست تغییر ترتیب معتبر نیست.'};
  const store=openAdminStore();
  try{return store.db.transaction(()=>{
    const current=listCompanies({admin:true}).map(item=>item.slug);
    if(current.length!==expectedOrder.length||current.some((item,index)=>item!==expectedOrder[index]))
      return {error:'فهرست شرکت‌ها تغییر کرده است. صفحه را تازه‌سازی کنید.',conflict:true};
    const index=current.indexOf(slug);
    if(index<0)return {error:'شرکت پیدا نشد.'};
    const target=direction==='first'?0:direction==='last'?current.length-1:Math.max(0,Math.min(current.length-1,index+(direction==='up'?-1:1)));
    if(index!==target){
      current.splice(index,1);current.splice(target,0,slug);
      store.db.prepare('INSERT INTO admin_company_order(id,document) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(JSON.stringify(current));
      store.audit(username,'company_reordered',slug);
    }
    return {order:current};
  }).immediate();}finally{store.close();}
}
