import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../lib/server/admin-request';
import {saveCouncils} from '../../../../lib/server/council-store.mjs';
export const runtime='nodejs';
export async function POST(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);
  const session=await readAdminSession();if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);
  const input=await readJson(request,600000);if(!input)return response({message:'اطلاعات معتبر نیست.'},400);
  try{const result=saveCouncils(input,session.username);return result.error?response({message:result.error},400):response(result);}catch{console.error('Council save unavailable.');return response({message:'ذخیره شوراها انجام نشد.'},503);}
}
