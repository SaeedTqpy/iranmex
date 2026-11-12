import {cp, mkdir, readFile, readdir, rm, symlink, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve, join, relative} from 'node:path';

const root=process.cwd();
const staging=resolve(root,'.pages-build');
const output=resolve(root,'pages-out');
const base=process.env.PAGES_BASE_PATH || '';
if (base && !/^\/[A-Za-z0-9._-]+$/.test(base)) throw new Error('PAGES_BASE_PATH must be empty or a single /repository-name segment');
await rm(staging,{recursive:true,force:true});
await mkdir(staging,{recursive:true});
try {
  for(const dir of ['app','lib','content','public']) await cp(join(root,dir),join(staging,dir),{recursive:true});
  for(const file of ['package.json','package-lock.json']) await cp(join(root,file),join(staging,file));
  await symlink(join(root,'node_modules'),join(staging,'node_modules'),'dir');
  for(const path of ['app/api','app/admin','app/news/media']) await rm(join(staging,path),{recursive:true,force:true});
  await writeFile(join(staging,'next.config.mjs'),`export default {output:'export',trailingSlash:true,basePath:${JSON.stringify(base)},images:{unoptimized:true}};\n`);
  const modify=async (path,fn)=>{const file=join(staging,path);await writeFile(file,fn(await readFile(file,'utf8')));};
  // Static previews contain the file-managed directory only; the admin database is server-only.
  for(const path of ['app/page.js','app/en/page.js','app/ar/page.js','app/exhibition/page.js','app/en/exhibition/page.js','app/ar/exhibition/page.js']){
    await modify(path,s=>s.replace(/import \{listCompanies\} from '[^']+';\nexport const dynamic='force-dynamic';/,"import {companies as previewCompanies} from '"+(path.startsWith('app/en/')||path.startsWith('app/ar/')?(path.endsWith('/exhibition/page.js')?'../../exhibition/companies':'../exhibition/companies'):(path==='app/page.js'?'./exhibition/companies':'./companies'))+"';\nconst listCompanies=()=>previewCompanies;"));
  }
  for(const path of ['app/page.js','app/en/page.js','app/ar/page.js'])await modify(path,s=>s.replace(/import \{getSponsors\} from '[^']+';/,`import {defaultSponsors} from '${path==='app/page.js'?'./sponsors.mjs':'../sponsors.mjs'}';\nconst getSponsors=()=>({items:defaultSponsors});`));
  await modify('app/page.js',s=>s.replace("import {getMountainTalks} from '../lib/server/mountain-talk-store.mjs';","import {defaultTalks} from './mountain-talk.mjs';\nconst getMountainTalks=()=>({items:defaultTalks});"));
  await modify('app/exhibition/[company]/page.js',s=>s.replace("import {getCompany} from '../../../lib/server/company-store.mjs';\nexport const dynamic='force-dynamic';","import {companies} from '../companies';\nconst getCompany=slug=>companies.find(company=>company.slug===slug);\nexport function generateStaticParams(){return companies.map(({slug})=>({company:slug}));}"));
  await modify('app/layout.js',s=>s.replace("import PageviewTracker from './pageview-tracker';\n",'').replace('<Suspense fallback={null}><PageviewTracker/></Suspense>','').replace("import {Suspense} from 'react';\n",''));
  await modify('lib/news.mjs',s=>s.replace("import {readManagedNews} from './server/news-store.mjs';",'').replace('...articles,...readManagedNews()','...articles'));
  await modify('app/news/page.js',s=>s.replace("export const dynamic='force-dynamic';",''));
  await modify('app/en/news/page.js',s=>s.replace("export const dynamic='force-dynamic';",''));
  await modify('app/ar/news/page.js',s=>s.replace("export const dynamic='force-dynamic';",''));
  await modify('app/news/[slug]/page.js',s=>s.replace("export const dynamic='force-dynamic';",'export function generateStaticParams(){return publishedNews().map(({slug})=>({slug}));}'));
  const {default: articles}=await import('../content/news.mjs');
  const {publishedNews}=await import('../lib/news-validation.mjs');
  if(!publishedNews(articles,Date.now()).length) await rm(join(staging,'app/news/[slug]'),{recursive:true,force:true});
  await modify('app/[slug]/page.js',s=>s.replace("if(slug==='journal')permanentRedirect('/news');", "if(slug==='journal')return <><Header/><main className=\"section\"><h1>اخبار و اطلاعیه‌ها</h1><Link href=\"/news\">مشاهده اخبار</Link></main><Footer/></>;"));
  await modify('app/registration/registration-form.js',s=>s.replace('event.preventDefault();\n    if(inFlight.current)return;',"event.preventDefault();\n    setMessage(t?.preview||'این نسخه صرفاً پیش‌نمایش است و ثبت اطلاعات در آن فعال نیست.');focusSummary();return;\n    if(inFlight.current)return;").replace('<div className={styles.formHeading}>',`<div role="note" className={styles.errorSummary}>{t?.preview||'این نسخه پیش‌نمایش است؛ اطلاعات این فرم ارسال یا ذخیره نمی‌شود.'}</div><div className={styles.formHeading}>`));
  // Prefix public assets in the temporary sources; Next handles Link paths through basePath.
  if(base){
    async function files(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]))).flat();}
    const assets=(await files(join(staging,'public'))).map(p=>'/'+relative(join(staging,'public'),p).replaceAll('\\','/')).sort((a,b)=>b.length-a.length);
    for(const file of await files(join(staging,'app'))){if(!/\.(js|mjs|css)$/.test(file))continue;let text=await readFile(file,'utf8');for(const asset of assets)text=text.replaceAll(asset,base+asset);await writeFile(file,text);}
  }
  const result=spawnSync(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:staging,stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
  if(result.status!==0)throw new Error(`Static build failed (${result.status})`);
  await rm(output,{recursive:true,force:true});
  await cp(join(staging,'out'),output,{recursive:true});
  await writeFile(join(output,'.nojekyll'),'');
  console.log(`Static preview written to ${output}`);
} finally {await rm(staging,{recursive:true,force:true});}
