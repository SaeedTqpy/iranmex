import {cookies} from 'next/headers';
import {resolveLoginClient} from '../../../../lib/server/login-source.mjs';
import {loginAdministrator} from '../../../../lib/server/admin-store.mjs';
import {checkAdminOrigin,cookieName,cookieOptions,readJson,response} from '../../../../lib/server/admin-request';
export const runtime='nodejs';
export async function POST(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست. صفحه را دوباره باز کنید.'},403);
  const clientAddress=resolveLoginClient(request);if(!clientAddress){console.error('Admin login requires a trusted proxy and valid client address.');return response({message:'ورود موقتاً در دسترس نیست. با مدیر سرور تماس بگیرید.'},503);}
  const input=await readJson(request,2048);if(!input||typeof input.username!=='string'||typeof input.password!=='string')return response({message:'نام کاربری و رمز عبور را وارد کنید.'},400);
  try {const result=await loginAdministrator(input.username,input.password,{clientAddress});if(result.error==='RATE_LIMIT')return response({message:'تلاش‌های ورود بیش از حد مجاز است. ۱۵ دقیقه بعد دوباره تلاش کنید.'},429,{'Retry-After':'900'});if(result.error)return response({message:'نام کاربری یا رمز عبور درست نیست.'},401);
    (await cookies()).set(cookieName,result.token,{...cookieOptions,expires:new Date(result.expiresAt)});return response({ok:true});
  } catch {console.error('Admin login unavailable.');return response({message:'ورود موقتاً در دسترس نیست. دوباره تلاش کنید.'},503);}
}
