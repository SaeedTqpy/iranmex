import {checkAdminOrigin,readAdminSession,readJson,response} from '../../../../lib/server/admin-request';
import {uploadIntroVideo,deleteIntroVideo,VideoError} from '../../../../lib/server/intro-video-store.mjs';
import {MAX_VIDEO_BYTES} from '../../../../lib/video-validation.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function authorize(request){
  if(!checkAdminOrigin(request))return response({message:'درخواست مجاز نیست.'},403);
  const session=await readAdminSession();
  return session||response({message:'لطفاً دوباره وارد پنل شوید.'},401);
}
function failure(error){
  if(error instanceof VideoError)return response({message:error.message},error.status);
  console.error('Intro clip storage unavailable.');
  return response({message:'ذخیره کلیپ انجام نشد. دوباره تلاش کنید.'},503);
}
export async function POST(request){
  const session=await authorize(request);if(session instanceof Response)return session;
  if(request.headers.get('content-type')?.split(';')[0].toLowerCase()!=='video/mp4')return response({message:'فقط کلیپ MP4 پذیرفته می‌شود.'},415);
  if(Number(request.headers.get('content-length'))>MAX_VIDEO_BYTES)return response({message:'حجم کلیپ باید حداکثر ۸۰ مگابایت باشد.'},413);
  const version=request.headers.get('x-video-version');
  if(!version||!/^\d+$/.test(version))return response({message:'نسخه کلیپ معتبر نیست.'},400);
  try{return response(await uploadIntroVideo(request.body,Number(version),session.username),201);}catch(error){return failure(error);}
}
export async function DELETE(request){
  const session=await authorize(request);if(session instanceof Response)return session;
  const input=await readJson(request,1024);
  if(!input)return response({message:'اطلاعات معتبر نیست.'},400);
  try{return response(await deleteIntroVideo(input.updatedAt,session.username));}catch(error){return failure(error);}
}
