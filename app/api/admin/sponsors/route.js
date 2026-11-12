import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../lib/server/admin-request';
import {saveSponsors} from '../../../../lib/server/sponsor-store.mjs';
export const runtime='nodejs';
export async function POST(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);
  const session=await readAdminSession();if(!session)return response({message:'لطفاً دوباره وارد پنل شوید.'},401);
  const input=await readJson(request,196608);if(!input)return response({message:'اطلاعات معتبر نیست.'},400);
  try{const result=saveSponsors(input,session.username);return result.error?response({message:result.error},400):response(result);}catch{console.error('Sponsor save unavailable.');return response({message:'ذخیره حامیان انجام نشد.'},503);}
}
