import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {openAdminStore} from './admin-store.mjs';
import {publishedNews} from '../news-validation.mjs';
import legacyArticles from '../../content/news.mjs';

export function readManagedNews(filename=process.env.REGISTRATION_DB_PATH||resolve('.data/registrations.sqlite')) {
  const path=resolve(/* turbopackIgnore: true */ filename);
  if(!existsSync(/* turbopackIgnore: true */ path))return [];
  const db=new Database(path,{readonly:true,fileMustExist:true,timeout:5000});
  try {if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_news'").get())return [];
    return db.prepare('SELECT document FROM admin_news').all().map(row=>JSON.parse(row.document));
  } finally {db.close();}
}

export function listManagedNews(){const store=openAdminStore();try{return store.db.prepare('SELECT slug,document,updated_at FROM admin_news ORDER BY updated_at DESC').all().map(row=>({...JSON.parse(row.document),updatedAt:row.updated_at}));}finally{store.close();}}
export function getManagedNews(slug){const store=openAdminStore();try{const row=store.db.prepare('SELECT document,updated_at FROM admin_news WHERE slug=?').get(slug);return row?{...JSON.parse(row.document),updatedAt:row.updated_at}:null;}finally{store.close();}}

export function saveManagedNews(input,username) {
  const clean=value=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim():'';
  const slug=clean(input.slug),title=clean(input.title),excerpt=clean(input.excerpt),author=clean(input.author),body=clean(input.body),category=clean(input.category),status=clean(input.status),sourceUrl=clean(input.sourceUrl),sourceLabel=clean(input.sourceLabel),imageId=clean(input.imageId),imageAlt=clean(input.imageAlt);
  if(!['draft','published'].includes(status)||!slug||!title||!excerpt||!body||title.length>180||excerpt.length>350||body.length>12000||author.length>120||sourceUrl.length>1000||sourceLabel.length>150)return {error:'اطلاعات خبر را کامل و در محدوده مجاز وارد کنید.'};
  if(Boolean(sourceUrl)!==Boolean(sourceLabel))return {error:'برای منبع، نشانی و عنوان را با هم وارد کنید.'};
  if(['new','media'].includes(slug))return {error:'این شناسه برای بخش مدیریت رزرو شده است.'};
  if(input.originalSlug&&input.originalSlug!==slug)return {error:'شناسه خبر پس از ایجاد قابل تغییر نیست.'};
  if(imageId&&(!/^[0-9a-f]{32}$/.test(imageId)||!imageAlt||imageAlt.length>250))return {error:'برای تصویر خبر، توضیح کوتاه وارد کنید.'};
  if(!input.originalSlug&&legacyArticles.some(article=>article.slug===slug))return {error:'این شناسه قبلاً برای خبر دیگری استفاده شده است.'};
  const store=openAdminStore();
  try {
    const transaction=store.db.transaction(()=>{
      const current=store.db.prepare('SELECT document,updated_at FROM admin_news WHERE slug=?').get(slug);
      if(input.originalSlug&&(!current||Number(input.updatedAt)!==current.updated_at))return {error:'این خبر تغییر کرده است. صفحه را تازه‌سازی کنید.'};
      if(!input.originalSlug&&current)return {error:'این شناسه قبلاً برای خبر دیگری استفاده شده است.'};
      const existing=current?JSON.parse(current.document):null;
      const now=Date.now();const updatedAt=Math.max(now,(current?.updated_at||0)+1);
      const oldBody=existing?.content?.map(block=>block.type==='list'?block.items.join('\n'):block.text).join('\n\n');
      const content=existing&&body===oldBody?existing.content:body.split(/\n\s*\n/).map(text=>({type:'paragraph',text:text.trim()})).filter(block=>block.text);
      const article={slug,title,excerpt,category,status,publishedAt:status==='published'&&existing?.status==='published'?existing.publishedAt:new Date(now).toISOString(),content};
      if(author)article.author=author;
      if(sourceUrl)article.source={url:sourceUrl,label:sourceLabel};
      if(imageId){const image=store.db.prepare('SELECT width,height FROM admin_media WHERE id=?').get(imageId);if(!image)return {error:'تصویر بارگذاری‌شده پیدا نشد. دوباره تلاش کنید.'};article.image={src:`/news/media/${imageId}`,alt:imageAlt,width:image.width,height:image.height};}
      try {publishedNews([{...article,status:'published'}],Infinity);}catch{return {error:'شناسه، دسته‌بندی یا نشانی منبع معتبر نیست.'};}
      store.db.prepare('INSERT INTO admin_news(slug,document,updated_at) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(slug,JSON.stringify(article),updatedAt);
      store.audit(username,current?'news_updated':'news_created',slug,now);return {slug};
    });
    return transaction.immediate();
  } finally {store.close();}
}

export function deleteDraftNews(slug,updatedAt,username){
  const store=openAdminStore();try{const transaction=store.db.transaction(()=>{const row=store.db.prepare('SELECT document,updated_at FROM admin_news WHERE slug=?').get(slug);if(!row||row.updated_at!==Number(updatedAt))return {error:'خبر تغییر کرده یا حذف شده است. صفحه را تازه‌سازی کنید.'};if(JSON.parse(row.document).status!=='draft')return {error:'فقط پیش‌نویس را می‌توان حذف کرد.'};store.db.prepare('DELETE FROM admin_news WHERE slug=?').run(slug);store.audit(username,'draft_deleted',slug);return {ok:true};});return transaction.immediate();}finally{store.close();}}
