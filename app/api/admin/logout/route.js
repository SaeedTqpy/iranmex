import {cookies} from 'next/headers';
import {logoutAdministrator} from '../../../../lib/server/admin-store.mjs';
import {checkAdminOrigin,cookieName,cookieOptions,response} from '../../../../lib/server/admin-request';
export const runtime='nodejs';
export async function POST(request){if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);const jar=await cookies();try{logoutAdministrator(jar.get(cookieName)?.value);jar.set(cookieName,'',{...cookieOptions,maxAge:0});return response({ok:true});}catch{return response({message:'خروج انجام نشد. دوباره تلاش کنید.'},503);}}
