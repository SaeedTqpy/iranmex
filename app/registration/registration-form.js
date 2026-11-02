'use client';

import Link from 'next/link';
import {useRef,useState} from 'react';
import {ArrowUpLeft,CheckCircle2} from 'lucide-react';
import {experienceOptions,referralOptions,validateRegistration} from '../../lib/registration-validation.mjs';
import styles from './styles.module.css';
import {boothTranslations,translateBoothErrors,translateBoothServerMessage} from './booth-translations.mjs';

export default function RegistrationForm({type,locale='fa'}) {
  const [errors,setErrors]=useState({});
  const [message,setMessage]=useState('');
  const [pending,setPending]=useState(false);
  const [reference,setReference]=useState('');
  const requestId=useRef(null);
  const summary=useRef(null);
  const success=useRef(null);
  const inFlight=useRef(false);
  const booth=type==='booth';
  const t=booth?boothTranslations[locale]:undefined;

  function focusSummary(){requestAnimationFrame(()=>summary.current?.focus());}
  async function submit(event) {
    event.preventDefault();
    if(inFlight.current)return;
    const fields=Object.fromEntries(new FormData(event.currentTarget));
    const {errors:validationErrors}=validateRegistration({...fields,type});
    setErrors(translateBoothErrors(validationErrors,locale));setMessage('');
    if(Object.keys(validationErrors).length){focusSummary();return;}
    inFlight.current=true;setPending(true);
    requestId.current ||= crypto.randomUUID();
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),20000);
    try {
      const response=await fetch('/api/registrations',{signal:controller.signal,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,type,requestId:requestId.current})});
      const result=await response.json();
      if(!response.ok){setErrors(translateBoothErrors(result.errors||{},locale));setMessage(t?(result.errors?t.correct:translateBoothServerMessage(result.message,locale)):(result.message||'ثبت اطلاعات انجام نشد. دوباره تلاش کنید.'));focusSummary();return;}
      if(!result.reference)throw new Error('Missing reference');
      setReference(result.reference);
      requestAnimationFrame(()=>success.current?.focus());
    } catch {setMessage(t?.network||'پاسخ سرور دریافت نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید؛ ارسال مجدد باعث ثبت تکراری نمی‌شود.');focusSummary();}
    finally{clearTimeout(timeout);inFlight.current=false;setPending(false);}
  }

  if(reference)return <section className={styles.success} ref={success} tabIndex={-1} aria-labelledby={`${type}-success-title`}>
    <CheckCircle2 size={38} aria-hidden="true"/>
    <h2 id={`${type}-success-title`}>{t?.success||(booth?'درخواست غرفه دریافت شد':'ثبت‌نام بازدید انجام شد')}</h2>
    <p>{t?.successText||(booth?'درخواست شما برای بررسی دبیرخانه ثبت شد. دریافت کد پیگیری به معنی تخصیص یا رزرو قطعی غرفه نیست.':'اطلاعات شما برای بازدید از نمایشگاه ایران مِکس ثبت شد. کد پیگیری را نگه دارید.')}</p>
    <div className={styles.reference}><span>{t?.reference||'کد پیگیری'}</span><bdi>{reference}</bdi></div>
    <p>{t?.follow||'برای پیگیری با دبیرخانه تماس بگیرید:'} <a href="tel:+989366181472" dir="ltr">{t?'+98 936 618 1472':'۰۹۳۶ ۶۱۸ ۱۴۷۲'}</a></p>
    <Link href={booth?(t?`/${locale}/exhibition`:'/exhibition'):'/visitors'} className={styles.primaryLink}>{t?.exhibition||(booth?'مشاهده نمایشگاه':'مشاهده راهنمای بازدید')} <ArrowUpLeft size={18} aria-hidden="true"/></Link>
  </section>;

  const id=name=>`${type}-${name}`;
  const error=name=>errors[name]&&<span className={styles.fieldError} id={`${id(name)}-error`}>{errors[name]}</span>;
  const attributes=name=>({id:id(name),name,'aria-invalid':errors[name]?'true':undefined,'aria-describedby':errors[name]?`${id(name)}-error`:undefined});
  function field(name,label,options={}) {
    const {required=false,full=false,description,...props}=options;
    return <div className={full?styles.full:styles.field} key={name}><label htmlFor={id(name)}>{label}{required&&<span aria-hidden="true"> *</span>}</label><input {...attributes(name)} {...props} aria-describedby={[description?`${id(name)}-hint`:null,errors[name]?`${id(name)}-error`:null].filter(Boolean).join(' ')||undefined} required={required}/>{description&&<span className={styles.fieldHint} id={`${id(name)}-hint`}>{description}</span>}{error(name)}</div>;
  }
  function select(name,label,options) {
    return <div className={styles.field}><label htmlFor={id(name)}>{label}<span aria-hidden="true"> *</span></label><select {...attributes(name)} required defaultValue=""><option value="" disabled>{t?.choose||'انتخاب کنید'}</option>{options.map(([value,label])=><option key={value} value={value}>{t?.options[value]||label}</option>)}</select>{error(name)}</div>;
  }
  return <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending} onChange={()=>{requestId.current=null;}}>
    <div className={styles.formHeading}><h2>{t?.heading||(booth?'اطلاعات درخواست غرفه':'اطلاعات بازدیدکننده')}</h2><p>{t?.hint||'فیلدهای ستاره‌دار الزامی‌اند. ایمیل و عنوان شغلی اختیاری هستند.'}</p></div>
    {(message||Object.keys(errors).length>0)&&<div className={styles.errorSummary} ref={summary} tabIndex={-1} role="alert"><p>{message||t?.correct||'برای ادامه، فیلدهای زیر را اصلاح کنید.'}</p>{Object.keys(errors).length>0&&<ul>{Object.entries(errors).map(([name,text])=><li key={name}>{name==='form'?text:<a href={`#${id(name)}`}>{text}</a>}</li>)}</ul>}</div>}
    <fieldset className={styles.fields} disabled={pending}>
      <legend className={styles.srOnly}>{t?.legend||(booth?'فرم درخواست غرفه':'فرم ثبت‌نام بازدید')}</legend>
      {field('firstName',t?.firstName||'نام',{required:true,autoComplete:'given-name',maxLength:60})}
      {field('lastName',t?.lastName||'نام خانوادگی',{required:true,autoComplete:'family-name',maxLength:80})}
      {field('mobile',t?.mobile||'شماره موبایل',{required:true,type:'tel',inputMode:'tel',autoComplete:'tel',dir:'ltr',maxLength:30,placeholder:t?'09123456789':'۰۹۱۲۳۴۵۶۷۸۹',description:t?.mobileHint})}
      {field('jobTitle',t?.jobTitle||'سمت یا عنوان شغلی',{autoComplete:'organization-title',maxLength:120})}
      {!booth&&select('experience','سابقه ورزش و فعالیت',experienceOptions)}
      {field('city',t?.city||'شهر محل سکونت',{required:true,autoComplete:'address-level2',maxLength:100})}
      {field('email',t?.email||'ایمیل',{type:'email',autoComplete:'email',dir:'ltr',maxLength:254})}
      {select('referral',t?.referral||'از کجا با نمایشگاه آشنا شدید؟',referralOptions)}
      {booth&&<>
        <div className={styles.divider}><h3>{t?.company||'اطلاعات شرکت یا برند'}</h3></div>
        {field('companyName',t?.companyName||'نام شرکت یا برند',{required:true,autoComplete:'organization',maxLength:160})}
        {field('website',t?.website||'وب‌سایت',{type:'url',inputMode:'url',autoComplete:'url',dir:'ltr',maxLength:250,placeholder:'https://example.com'})}
        <div className={styles.full}><label htmlFor={id('activity')}>{t?.activity||'نوع فعالیت و محصولات یا خدمات'} <span aria-hidden="true">*</span></label><textarea {...attributes('activity')} required maxLength={600} rows={3}/>{error('activity')}</div>
        {field('requestedArea',t?.requestedArea||'متراژ پیشنهادی غرفه (متر مربع)',{inputMode:'numeric',maxLength:8})}
        <div className={styles.full}><label htmlFor={id('notes')}>{t?.notes||'توضیحات و نیازهای حضور'}</label><textarea {...attributes('notes')} maxLength={1200} rows={3}/>{error('notes')}</div>
      </>}
      <div className={styles.honeypot} aria-hidden="true"><label htmlFor={id('companyFax')}>{t?.fax||'فکس'}</label><input id={id('companyFax')} name="companyFax" tabIndex={-1} autoComplete="off"/></div>
      <div className={styles.formFooter}><p>{t?.usage||<>اطلاعات این فرم برای {booth?'بررسی درخواست غرفه و تماس دبیرخانه':'ثبت‌نام بازدید و هماهنگی دبیرخانه'} استفاده می‌شود.</>}</p>{booth&&<p>{t?.terms||'هزینه، متراژ و تخصیص نهایی غرفه پس از بررسی دبیرخانه مشخص می‌شود.'}</p>}<button type="submit" className={styles.submit}>{pending?(t?.pending||'در حال ثبت اطلاعات…'):t?.submit||(booth?'ثبت درخواست غرفه':'ثبت‌نام رایگان بازدید')}<ArrowUpLeft size={19} aria-hidden="true"/></button><span role="status" aria-live="polite">{pending?(t?.wait||'لطفاً تا دریافت نتیجه منتظر بمانید.'):''}</span></div>
    </fieldset>
  </form>;
}
