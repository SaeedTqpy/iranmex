'use client';
import {useState} from 'react';
import {buildUtmUrl} from '../../lib/utm-builder.mjs';
import styles from './styles.module.css';
export function UtmBuilder(){
  const [url,setUrl]=useState(''),[error,setError]=useState(''),[status,setStatus]=useState('');
  function submit(event){event.preventDefault();setError('');setStatus('');const data=Object.fromEntries(new FormData(event.currentTarget));const result=buildUtmUrl(window.location.origin,data.destination,data);if(result.error){setUrl('');setError(result.error);return;}setUrl(result.url);}
  function change(){if(url)setUrl('');if(error)setError('');if(status)setStatus('');}
  async function copy(){try{await navigator.clipboard.writeText(url);setStatus('لینک کپی شد.');}catch{setStatus('کپی خودکار در دسترس نیست؛ لینک را انتخاب و کپی کنید.');}}
  return <form className={`${styles.editor} ${styles.utmBuilder}`} onSubmit={submit} onChange={change}>
    <div className={styles.editorGrid}>
      <div className={styles.full}><label htmlFor="utm-destination">آدرس صفحه مقصد *</label><input id="utm-destination" name="destination" type="text" defaultValue="/" dir="ltr" maxLength={2048} required aria-describedby="utm-destination-help"/><small id="utm-destination-help">مسیر صفحه مانند /exhibition یا آدرس کامل یکی از صفحه‌های همین سایت را وارد کنید.</small></div>
      <div><label htmlFor="utm-source">منبع *</label><input id="utm-source" name="source" dir="auto" maxLength={100} required placeholder="instagram"/><small>محل انتشار، مثلاً اینستاگرام</small></div>
      <div><label htmlFor="utm-medium">رسانه *</label><input id="utm-medium" name="medium" dir="auto" maxLength={100} required placeholder="social"/><small>نوع مسیر، مثلاً شبکه اجتماعی</small></div>
      <div><label htmlFor="utm-campaign">نام کمپین *</label><input id="utm-campaign" name="campaign" dir="auto" maxLength={100} required placeholder="autumn"/></div>
      <div><label htmlFor="utm-content">محتوا</label><input id="utm-content" name="content" dir="auto" maxLength={100} placeholder="story"/><small>برای تشخیص نسخه آگهی یا محتوا</small></div>
      <div><label htmlFor="utm-term">کلیدواژه</label><input id="utm-term" name="term" dir="auto" maxLength={100}/></div>
    </div>
    <p className={styles.utmPrivacy}>اطلاعات شخصی یا محرمانه را در لینک قرار ندهید.</p>
    {error&&<p className={styles.error} role="alert">{error}</p>}
    <div className={styles.editorActions}><button className={styles.primary} type="submit">ساخت لینک کمپین</button></div>
    {url&&<div className={styles.utmResult}><label htmlFor="utm-result">لینک آماده</label><textarea id="utm-result" dir="ltr" value={url} readOnly rows={3} onFocus={event=>event.currentTarget.select()}/><button type="button" className={styles.secondary} onClick={copy}>کپی لینک</button><span role="status">{status}</span></div>}
  </form>;
}
