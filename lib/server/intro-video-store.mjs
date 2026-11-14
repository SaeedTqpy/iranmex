import Database from 'better-sqlite3';
import {existsSync} from 'node:fs';
import {mkdir,open,rename,unlink} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import {openAdminStore} from './admin-store.mjs';
import {MAX_VIDEO_BYTES,validateMp4} from '../video-validation.mjs';

const databasePath=()=>resolve(/* turbopackIgnore: true */ (process.env.REGISTRATION_DB_PATH||'.data/registrations.sqlite'));
const directory=()=>join(dirname(databasePath()),'intro-videos');
export function introVideoPath(id){
  if(!/^[0-9a-f]{32}$/.test(id))throw new Error('Invalid clip ID');
  return join(directory(),id+'.mp4');
}
export class VideoError extends Error{
  constructor(message,status=400){super(message);this.status=status;}
}
export function getIntroVideo(){
  const path=databasePath();
  if(!existsSync(/* turbopackIgnore: true */ path))return {video:null,updatedAt:0};
  const db=new Database(path,{readonly:true,fileMustExist:true,timeout:5000});
  try{
    if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_intro_video'").get())return {video:null,updatedAt:0};
    const row=db.prepare('SELECT document,updated_at FROM admin_intro_video WHERE id=1').get();
    return row?{video:JSON.parse(row.document),updatedAt:row.updated_at}:{video:null,updatedAt:0};
  }finally{db.close();}
}
async function removeFile(path){
  try{await unlink(path);}catch(error){if(error.code!=='ENOENT')console.error('Clip file cleanup unavailable.');}
}
function commitVideo(video,expectedVersion,username){
  const store=openAdminStore();
  try{return store.db.transaction(()=>{
    const current=store.db.prepare('SELECT document,updated_at FROM admin_intro_video WHERE id=1').get();
    if((current?.updated_at||0)!==expectedVersion)throw new VideoError('کلیپ توسط مدیر دیگری تغییر کرده است. صفحه را تازه‌سازی کنید.',409);
    const updatedAt=Math.max(Date.now(),(current?.updated_at||0)+1);
    store.db.prepare('INSERT INTO admin_intro_video(id,document,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at').run(JSON.stringify(video),updatedAt);
    store.audit(username,video?'intro_video_uploaded':'intro_video_deleted','homepage');
    return {video,updatedAt,previous:current?JSON.parse(current.document):null};
  }).immediate();}finally{store.close();}
}
function checkVersion(value){
  if(!Number.isSafeInteger(value)||value<0)throw new VideoError('نسخه کلیپ معتبر نیست. صفحه را تازه‌سازی کنید.');
}
export async function uploadIntroVideo(body,expectedVersion,username){
  checkVersion(expectedVersion);
  if(getIntroVideo().updatedAt!==expectedVersion)throw new VideoError('کلیپ تغییر کرده است. صفحه را تازه‌سازی کنید.',409);
  if(!body)throw new VideoError('یک کلیپ MP4 انتخاب کنید.');
  await mkdir(directory(),{recursive:true,mode:0o700});
  const id=randomBytes(16).toString('hex'),temporary=join(directory(),'.upload-'+id),destination=introVideoPath(id);
  let file,reader,committed=false;
  try{
    file=await open(temporary,'wx+',0o600);reader=body.getReader();
    let size=0;
    while(true){
      const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>MAX_VIDEO_BYTES)throw new VideoError('حجم کلیپ باید حداکثر ۱۰۰ مگابایت باشد.',413);
      await file.writeFile(value);
    }
    if(!await validateMp4(file,size))throw new VideoError('فایل MP4 معتبر نیست. یک کلیپ MP4 دیگر انتخاب کنید.');
    await file.sync();await file.close();file=null;
    await rename(temporary,destination);
    const result=commitVideo({id,src:'/intro-video/'+id,size},expectedVersion,username);committed=true;
    if(result.previous)await removeFile(introVideoPath(result.previous.id));
    return {video:result.video,updatedAt:result.updatedAt};
  }finally{
    try{await reader?.cancel();}catch{}
    reader?.releaseLock();
    await file?.close();
    await removeFile(temporary);
    if(!committed)await removeFile(destination);
  }
}
export async function deleteIntroVideo(expectedVersion,username){
  checkVersion(expectedVersion);
  const result=commitVideo(null,expectedVersion,username);
  if(result.previous)await removeFile(introVideoPath(result.previous.id));
  return {video:null,updatedAt:result.updatedAt};
}
