'use client';
import {useEffect,useRef,useState} from 'react';
import {MAX_VIDEO_BYTES} from '../../lib/video-validation.mjs';
import styles from './styles.module.css';

export default function IntroVideoEditor({initial}){
  const [current,setCurrent]=useState(initial),[file,setFile]=useState(null),[preview,setPreview]=useState(''),[pending,setPending]=useState(false),[progress,setProgress]=useState(0),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
  const request=useRef(null),busy=useRef(false),input=useRef(null);
  useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return ()=>URL.revokeObjectURL(url);},[file]);
  useEffect(()=>()=>request.current?.abort(),[]);
  useEffect(()=>{if(!pending)return;const warn=event=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',warn);return ()=>window.removeEventListener('beforeunload',warn);},[pending]);
  function choose(event){
    const candidate=event.target.files?.[0];setFailed(false);setMessage('');
    if(!candidate)return;
    if(!/\.mp4$/i.test(candidate.name)||!candidate.size||candidate.size>MAX_VIDEO_BYTES){
      event.target.value='';setFile(null);setFailed(true);setMessage('یک فایل MP4 با حجم حداکثر ۱۰۰ مگابایت انتخاب کنید.');return;
    }
    setFile(candidate);
  }
  function resetSelection(){setFile(null);if(input.current)input.current.value='';}
  function upload(event){
    event.preventDefault();if(busy.current||!file)return;
    busy.current=true;setPending(true);setProgress(0);setMessage('');setFailed(false);
    const xhr=new XMLHttpRequest();request.current=xhr;
    xhr.open('POST','/api/admin/intro-video');xhr.setRequestHeader('Content-Type','video/mp4');xhr.setRequestHeader('X-Video-Version',String(current.updatedAt));xhr.timeout=10*60*1000;
    xhr.upload.onprogress=event=>{if(event.lengthComputable)setProgress(Math.round(event.loaded/event.total*100));};
    xhr.onload=()=>{
      let result;try{result=JSON.parse(xhr.responseText);}catch{}
      if(xhr.status>=200&&xhr.status<300&&result?.video){
        setCurrent(result);resetSelection();setMessage('کلیپ ذخیره شد و اکنون در سایت نمایش داده می‌شود.');
      }else{setFailed(true);setMessage(result?.message||(xhr.status===413?'سرور این حجم فایل را نمی‌پذیرد. تنظیم حجم آپلود Nginx باید افزایش یابد.':'بارگذاری انجام نشد. دوباره تلاش کنید.'));}
    };
    xhr.onerror=()=>{setFailed(true);setMessage('ارتباط قطع شد. برای بررسی نتیجه، صفحه را تازه‌سازی کنید.');};
    xhr.ontimeout=()=>{setFailed(true);setMessage('زمان بارگذاری تمام شد. اتصال را بررسی و دوباره تلاش کنید.');};
    xhr.onabort=()=>setMessage('بارگذاری متوقف شد. برای بررسی وضعیت ذخیره، صفحه را تازه‌سازی کنید.');
    xhr.onloadend=()=>{request.current=null;busy.current=false;setPending(false);};
    xhr.send(file);
  }
  async function remove(){
    if(busy.current||!current.video||!window.confirm('کلیپ فعلی از سایت حذف شود؟'))return;
    busy.current=true;setPending(true);setFailed(false);setMessage('');
    try{
      const response=await fetch('/api/admin/intro-video',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({updatedAt:current.updatedAt})});
      const result=await response.json();if(!response.ok)throw new Error(result.message||'حذف انجام نشد.');
      setCurrent(result);resetSelection();setMessage('کلیپ حذف شد و پلیر دیگر در سایت نمایش داده نمی‌شود.');
    }catch(error){setFailed(true);setMessage(error.message||'ارتباط با سرور برقرار نشد.');}
    finally{busy.current=false;setPending(false);}
  }
  async function savePoster(event){
    const input=event.currentTarget, selected=input.files?.[0];input.value='';if(!selected||busy.current)return;
    if(selected.size>3*1024*1024){setFailed(true);setMessage('حجم تصویر باید حداکثر ۳ مگابایت باشد.');return;}
    busy.current=true;setPending(true);setFailed(false);setMessage('');
    try{
      const form=new FormData();form.set('image',selected);
      const uploadResponse=await fetch('/api/admin/images',{method:'POST',body:form});const uploaded=await uploadResponse.json();
      if(!uploadResponse.ok)throw new Error(uploaded.message||'بارگذاری تصویر انجام نشد.');
      const response=await fetch('/api/admin/intro-video',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({poster:uploaded.src,updatedAt:current.updatedAt})});const result=await response.json();
      if(!response.ok)throw new Error(result.message||'ذخیره تصویر انجام نشد.');
      setCurrent(result);setMessage('تصویر بندانگشتی ذخیره شد.');
    }catch(error){setFailed(true);setMessage(error.message||'ارتباط با سرور برقرار نشد.');}finally{busy.current=false;setPending(false);}
  }
  async function removePoster(){
    if(busy.current)return;busy.current=true;setPending(true);setFailed(false);setMessage('');
    try{const response=await fetch('/api/admin/intro-video',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({poster:'',updatedAt:current.updatedAt})});const result=await response.json();if(!response.ok)throw new Error(result.message||'حذف تصویر انجام نشد.');setCurrent(result);setMessage('تصویر بندانگشتی حذف شد.');}catch(error){setFailed(true);setMessage(error.message||'ارتباط با سرور برقرار نشد.');}finally{busy.current=false;setPending(false);}
  }
  const src=preview||current.video?.src;
  return <form className={styles.editor} onSubmit={upload}>
    <div className={styles.videoPreview}>{src?<video key={src} src={src} poster={!file?current.video?.poster||undefined:undefined} controls playsInline preload="metadata" aria-label={file?'پیش‌نمایش کلیپ انتخاب‌شده':'کلیپ فعلی سایت'}/>:<div className={styles.videoEmpty}><span aria-hidden="true">▷</span><h2>هنوز کلیپی بارگذاری نشده</h2><p>کلیپ را انتخاب و بارگذاری کنید تا در صفحه اصلی نمایش داده شود.</p></div>}</div>
    <div className={styles.videoFields}><label htmlFor="intro-clip">انتخاب کلیپ {current.video?'جایگزین':''}</label><input ref={input} id="intro-clip" type="file" accept="video/mp4,.mp4" disabled={pending} onChange={choose} aria-describedby="intro-clip-help"/><small id="intro-clip-help">MP4، حداکثر ۱۰۰ مگابایت. برای پخش بهتر در مرورگرها، ویدیو با کدک H.264 و صدای AAC انتخاب کنید.</small>
    {file&&<p className={styles.videoFile}><bdi>{file.name}</bdi><span>{(file.size/1024/1024).toFixed(1)} مگابایت · آمادهٔ بارگذاری</span></p>}
    {!file&&current.video&&<p className={styles.videoFile}>کلیپ فعلی · {(current.video.size/1024/1024).toFixed(1)} مگابایت</p>}
    </div>
    {current.video&&<div className={styles.videoFields}><label htmlFor="intro-poster">تصویر بندانگشتی فیلم</label><input id="intro-poster" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={savePoster}/><small>تصویر پیش از پخش نمایش داده می‌شود. JPEG، PNG یا WebP؛ حداکثر ۳ مگابایت. تصویر افقی با نسبت ۱۶ به ۹ پیشنهاد می‌شود.</small>{current.video.poster&&<button type="button" className={styles.secondary} disabled={pending} onClick={removePoster}>حذف تصویر بندانگشتی</button>}</div>}
    {pending&&request.current&&<div className={styles.videoProgress}><progress max="100" value={progress} aria-label="پیشرفت آپلود"/><span>{progress<100?progress+'٪ بارگذاری شده':'در حال بررسی و ذخیره کلیپ…'}</span></div>}
    <div role={failed?'alert':'status'} aria-live="polite" className={failed?styles.error:styles.sponsorMessage}>{message}</div>
    <div className={styles.editorActions}><button type="submit" className={styles.primary} disabled={pending||!file}>{pending?'در حال انجام…':current.video?'بارگذاری و جایگزینی کلیپ':'بارگذاری و انتشار کلیپ'}</button>{!pending&&file&&<button type="button" className={styles.secondary} onClick={resetSelection}>لغو انتخاب</button>}{pending&&request.current&&<button type="button" className={styles.secondary} onClick={()=>request.current?.abort()}>لغو بارگذاری</button>}{current.video&&<button type="button" className={styles.danger} disabled={pending} onClick={remove}>حذف کلیپ فعلی</button>}</div>
  </form>;
}
