import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {defaultHeroImages,validateHeroImages} from '../../app/hero-images.mjs';
import {openAdminStore} from './admin-store.mjs';

export function getHeroImages(){
  const filename=resolve(/* turbopackIgnore: true */ process.env.REGISTRATION_DB_PATH||'.data/registrations.sqlite');
  if(!existsSync(/* turbopackIgnore: true */ filename))return {images:defaultHeroImages,updatedAt:0};
  const db=new Database(filename,{readonly:true,fileMustExist:true,timeout:5000});
  try{
    if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_hero_images'").get())return {images:defaultHeroImages,updatedAt:0};
    const row=db.prepare('SELECT document,updated_at FROM admin_hero_images WHERE id=1').get();
    return row?{images:JSON.parse(row.document),updatedAt:row.updated_at}:{images:defaultHeroImages,updatedAt:0};
  }finally{db.close();}
}

export function saveHeroImages(input,username){
  const images=validateHeroImages(input);if(!images)return {error:'اطلاعات تصاویر هدر معتبر نیست.'};
  const store=openAdminStore();try{return store.db.transaction(()=>{
    const row=store.db.prepare('SELECT updated_at FROM admin_hero_images WHERE id=1').get();
    if((row?.updated_at||0)!==input.updatedAt)return {error:'تصاویر هدر تغییر کرده‌اند. صفحه را تازه‌سازی کنید.'};
    const hasMedia=store.db.prepare('SELECT 1 FROM admin_media WHERE id=?');
    if(Object.values(images).some(image=>image.src.startsWith('/news/media/')&&!hasMedia.get(image.src.split('/').pop())))return {error:'تصویر انتخاب‌شده پیدا نشد. آن را دوباره بارگذاری کنید.'};
    const version=Math.max(Date.now(),(row?.updated_at||0)+1);
    store.db.prepare('INSERT INTO admin_hero_images(id,document,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(JSON.stringify(images),version);
    store.audit(username,'hero_images_updated','homepage');return {updatedAt:version};
  }).immediate();}finally{store.close();}
}
