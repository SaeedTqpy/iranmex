import {readAdminSession} from '../../../../lib/server/admin-request';
import {openAdminStore} from '../../../../lib/server/admin-store.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request,{params}){
  const {id}=await params;if(!/^[0-9a-f]{32}$/.test(id))return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});
  const store=openAdminStore();try{
    const image=store.db.prepare('SELECT data FROM admin_media WHERE id=?').get(id);if(!image)return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});
    const source=`/news/media/${id}`;
    const matches=store.db.prepare("SELECT document FROM admin_news WHERE json_extract(document,'$.status')='published' AND json_extract(document,'$.image.src')=?").all(source);
    const published=matches.some(row=>Date.parse(JSON.parse(row.document).publishedAt)<=Date.now());
    const companyPublished=store.db.prepare("SELECT 1 FROM admin_companies WHERE json_extract(document,'$.status')='published' AND json_extract(document,'$.logo')=? LIMIT 1").get(source);
    const galleryPublished=store.db.prepare("SELECT 1 FROM admin_companies, json_each(admin_companies.document, '$.gallery') WHERE json_extract(admin_companies.document, '$.status')='published' AND json_each.value=? LIMIT 1").get(source);
    const videoPoster=store.db.prepare("SELECT 1 FROM admin_intro_video WHERE json_extract(document,'$.poster')=? LIMIT 1").get(source);
    const homepageImage=store.db.prepare(`SELECT 1 FROM admin_mountain_talks, json_each(admin_mountain_talks.document) AS item WHERE json_extract(item.value,'$.image')=?
      UNION ALL SELECT 1 FROM admin_sponsors, json_each(admin_sponsors.document) AS item WHERE json_extract(item.value,'$.logo')=?
      UNION ALL SELECT 1 FROM admin_hero_images, json_each(admin_hero_images.document) AS item WHERE json_extract(item.value,'$.src')=?
      UNION ALL SELECT 1 FROM admin_councils, json_each(admin_councils.document) AS groups, json_each(groups.value,'$.members') AS member WHERE json_extract(member.value,'$.photo')=? LIMIT 1`).get(source,source,source,source);
    if(!published&&!companyPublished&&!galleryPublished&&!videoPoster&&!homepageImage&&!(await readAdminSession()))return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});
    return new Response(image.data,{headers:{'Content-Type':'image/webp','Content-Length':String(image.data.length),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
  }finally{store.close();}
}
