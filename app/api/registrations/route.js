import {validateRegistration} from '../../../lib/registration-validation.mjs';
import {openRegistrationStore,RegistrationError} from '../../../lib/server/registration-store.mjs';

export const runtime='nodejs';
const maxBytes=16_384;
function json(body,status=200,extra={}){return Response.json(body,{status,headers:{'Cache-Control':'no-store',...extra}});}

export async function POST(request) {
  const origin=request.headers.get('origin');
  const allowedOrigin=process.env.APP_ORIGIN||new URL(request.url).origin;
  if(origin!==allowedOrigin)return json({message:'این درخواست مجاز نیست. صفحه را دوباره باز کنید.'},403);
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return json({message:'قالب درخواست معتبر نیست.'},415);
  if(Number(request.headers.get('content-length'))>maxBytes)return json({message:'حجم اطلاعات بیش از حد مجاز است.'},413);
  const reader=request.body?.getReader();
  if(!reader)return json({message:'اطلاعات فرم دریافت نشد.'},400);
  let input;
  try {
    const chunks=[];let length=0;
    while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();return json({message:'حجم اطلاعات بیش از حد مجاز است.'},413);}chunks.push(Buffer.from(value));}
    input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {return json({message:'اطلاعات فرم قابل خواندن نیست.'},400);}
  if(!input||typeof input!=='object'||input.companyFax)return json({message:'درخواست معتبر نیست.'},400);
  if(typeof input.requestId!=='string'||!/^\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b$/i.test(input.requestId))return json({message:'شناسه درخواست معتبر نیست. صفحه را تازه‌سازی کنید.'},400);
  const {data,errors}=validateRegistration(input);
  if(Object.keys(errors).length)return json({message:'فیلدهای مشخص‌شده را اصلاح کنید.',errors},422);
  let store;
  try {
    store=openRegistrationStore();
    const result=store.save(data,input.requestId);
    return json({reference:result.reference,type:data.type},result.replayed?200:201);
  } catch(error) {
    if(error instanceof RegistrationError) {
      if(error.code==='DUPLICATE')return json({message:'برای این شماره موبایل قبلاً در همین بخش درخواست ثبت شده است. برای پیگیری با دبیرخانه تماس بگیرید.'},409);
      if(error.code==='RATE_LIMIT')return json({message:'تعداد درخواست‌ها زیاد است. چند دقیقه بعد دوباره تلاش کنید.'},429,{'Retry-After':'600'});
      if(error.code==='IDEMPOTENCY_CONFLICT')return json({message:'اطلاعات این درخواست تغییر کرده است. صفحه را تازه‌سازی کنید.'},409);
    }
    // Never log submitted personal data or database errors containing payloads.
    console.error('Registration storage unavailable.');
    return json({message:'ثبت اطلاعات انجام نشد. کمی بعد دوباره تلاش کنید یا با دبیرخانه تماس بگیرید.'},503);
  } finally {store?.close();}
}
