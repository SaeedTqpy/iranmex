import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {getAdminSession} from './admin-store.mjs';

export const cookieName=process.env.NODE_ENV==='production'?'__Host-iranmex_admin':'iranmex_admin';
export const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/'};
export function checkAdminOrigin(request) {
  const configured=process.env.APP_ORIGIN;
  if(process.env.NODE_ENV==='production'&&(!configured||!/^https:\/\//i.test(configured)))return false;
  return request.headers.get('origin')===(configured||new URL(request.url).origin);
}
export async function readAdminSession(){const token=(await cookies()).get(cookieName)?.value;return getAdminSession(token);}
export async function requireAdmin(){const session=await readAdminSession();if(!session)redirect('/admin/login');return session;}
export function response(data,status=200,headers={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
export async function readBytes(request,limit) {
  if(Number(request.headers.get('content-length'))>limit)return null;
  const reader=request.body?.getReader();if(!reader)return null;
  try {const chunks=[];let length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();return null;}chunks.push(Buffer.from(value));}return Buffer.concat(chunks);}
  catch{return null;}
}
export async function readJson(request,limit=24_000) {
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return null;
  const bytes=await readBytes(request,limit);if(!bytes)return null;
  try {const data=JSON.parse(bytes.toString('utf8'));return data&&typeof data==='object'&&!Array.isArray(data)?data:null;}catch{return null;}
}
