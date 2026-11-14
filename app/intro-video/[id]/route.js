import {open} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {getIntroVideo,introVideoPath} from '../../../lib/server/intro-video-store.mjs';
import {parseVideoRange} from '../../../lib/video-validation.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function serve(request,{params},head=false){
  const {id}=await params;
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if(!/^[0-9a-f]{32}$/.test(id))return new Response(null,{status:404,headers});
  let file;
  try{
    const {video}=getIntroVideo();
    if(!video||video.id!==id)return new Response(null,{status:404,headers});
    file=await open(introVideoPath(id),'r');
    const {size}=await file.stat();
    headers['Content-Type']='video/mp4';headers['Accept-Ranges']='bytes';
    const range=parseVideoRange(head?null:request.headers.get('range'),size);
    if(!range){await file.close();file=null;return new Response(null,{status:416,headers:{...headers,'Content-Range':'bytes */'+size}});}
    const {start,end,partial}=range;
    headers['Content-Length']=String(end-start+1);
    if(partial)headers['Content-Range']=`bytes ${start}-${end}/${size}`;
    if(head){await file.close();file=null;return new Response(null,{headers});}
    const stream=file.createReadStream({start,end,autoClose:true});file=null;
    return new Response(Readable.toWeb(stream),{status:partial?206:200,headers});
  }catch(error){
    await file?.close();
    if(error.code!=='ENOENT')console.error('Intro clip playback unavailable.');
    return new Response(null,{status:error.code==='ENOENT'?404:503,headers});
  }
}
export const GET=(request,context)=>serve(request,context);
export const HEAD=(request,context)=>serve(request,context,true);
