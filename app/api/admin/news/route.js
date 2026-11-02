import {revalidatePath} from 'next/cache';
import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../lib/server/admin-request';
import {saveManagedNews} from '../../../../lib/server/news-store.mjs';
export const runtime='nodejs';
export async function POST(request){if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);const session=await readAdminSession();if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);const input=await readJson(request,64_000);if(!input)return response({message:'اطلاعات خبر معتبر نیست.'},400);try{const result=saveManagedNews(input,session.username);if(result.error)return response({message:result.error},400);revalidatePath('/news');revalidatePath(`/news/${result.slug}`);return response(result);}catch{console.error('Admin news update unavailable.');return response({message:'ذخیره خبر انجام نشد.'},503);}}
