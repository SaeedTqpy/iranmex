import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../lib/server/admin-request';
import {saveHeroImages} from '../../../../lib/server/hero-images-store.mjs';
export const runtime='nodejs';
export async function POST(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);
  const session=await readAdminSession();if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);
  const input=await readJson(request,8192);if(!input)return response({message:'اطلاعات معتبر نیست.'},400);
  try{const result=saveHeroImages(input,session.username);return result.error?response({message:result.error},400):response(result);}catch{console.error('Hero images save unavailable.');return response({message:'ذخیره تصاویر انجام نشد.'},503);}
}
