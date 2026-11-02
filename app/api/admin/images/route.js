import sharp from 'sharp';
import {randomBytes} from 'node:crypto';
import {checkAdminOrigin,readAdminSession,readBytes,response} from '../../../../lib/server/admin-request';
import {openAdminStore} from '../../../../lib/server/admin-store.mjs';
export const runtime='nodejs';
export async function POST(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);
  const session=await readAdminSession();if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);
  const contentType=request.headers.get('content-type')||'';
  if(!contentType.toLowerCase().startsWith('multipart/form-data;'))return response({message:'قالب تصویر معتبر نیست.'},415);
  const bytes=await readBytes(request,3*1024*1024+65536);if(!bytes)return response({message:'حجم تصویر باید حداکثر ۳ مگابایت باشد.'},413);
  try {
    const form=await new Response(bytes,{headers:{'Content-Type':contentType}}).formData();
    const file=form.get('image');if(!(file instanceof File)||file.size===0||file.size>3*1024*1024)return response({message:'یک تصویر تا ۳ مگابایت انتخاب کنید.'},400);
    const input=Buffer.from(await file.arrayBuffer());
    const isJpeg=input.length>=3&&input[0]===0xff&&input[1]===0xd8&&input[2]===0xff;
    const isPng=input.length>=8&&input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const isWebp=input.length>=12&&input.toString('ascii',0,4)==='RIFF'&&input.toString('ascii',8,12)==='WEBP';
    if(!isJpeg&&!isPng&&!isWebp)return response({message:'فقط تصویر JPEG، PNG یا WebP غیرمتحرک پذیرفته می‌شود.'},400);
    const image=sharp(input,{limitInputPixels:16000000,failOn:'warning'});const meta=await image.metadata();
    if(!['jpeg','png','webp'].includes(meta.format)||!meta.width||!meta.height||meta.width*meta.height>16000000||meta.pages>1)return response({message:'فقط تصویر JPEG، PNG یا WebP غیرمتحرک پذیرفته می‌شود.'},400);
    const {data,info}=await image.rotate().resize({width:1600,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true});
    const id=randomBytes(16).toString('hex');let store;try{store=openAdminStore();const transaction=store.db.transaction(()=>{store.db.prepare('INSERT INTO admin_media(id,data,width,height,created_at) VALUES (?,?,?,?,?)').run(id,data,info.width,info.height,Date.now());store.audit(session.username,'image_uploaded',id);});transaction.immediate();}catch{console.error('Admin image storage unavailable.');return response({message:'ذخیره تصویر انجام نشد. دوباره تلاش کنید.'},503);}finally{store?.close();}
    return response({id,src:`/news/media/${id}`,width:info.width,height:info.height},201);
  }catch{return response({message:'تصویر قابل پردازش نیست. فایل دیگری انتخاب کنید.'},400);}
}
