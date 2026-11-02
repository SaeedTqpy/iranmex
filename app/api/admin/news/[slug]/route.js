import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../../lib/server/admin-request';
import {deleteDraftNews} from '../../../../../lib/server/news-store.mjs';
export const runtime='nodejs';
export async function DELETE(request,{params}){if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);const session=await readAdminSession();if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);const input=await readJson(request,1024);const {slug}=await params;if(!input)return response({message:'درخواست معتبر نیست.'},400);try{const result=deleteDraftNews(slug,input.updatedAt,session.username);return result.error?response({message:result.error},409):response(result);}catch{return response({message:'حذف پیش‌نویس انجام نشد.'},503);}}
