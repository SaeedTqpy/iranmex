import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../../lib/server/admin-request';
import {moveCompany} from '../../../../../lib/server/company-store.mjs';
export const runtime='nodejs';
export async function POST(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);
  const session=await readAdminSession();
  if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);
  const input=await readJson(request,256000);
  if(!input||typeof input!=='object'||Array.isArray(input))return response({message:'اطلاعات معتبر نیست.'},400);
  try{
    const result=moveCompany(input,session.username);
    return result.error?response({message:result.error},result.conflict?409:400):response(result);
  }catch{
    console.error('Company ordering unavailable.');
    return response({message:'ذخیره ترتیب انجام نشد.'},503);
  }
}
