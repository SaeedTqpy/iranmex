export const experienceOptions = [
  ['under-one', 'کمتر از یک سال'], ['one-to-three', 'یک تا سه سال'], ['over-three', 'بیش از سه سال'],
];
export const referralOptions = [
  ['bale','بله'], ['eitaa','ایتا'], ['instagram','اینستاگرام'], ['telegram','تلگرام'],
  ['website','سایت'], ['friends','معرفی دوستان'], ['sms','پیامک'], ['organization','سازمان/دانشگاه'],
];

export function normalizeDigits(value) {
  return value.replace(/[۰-۹٠-٩]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)>=0 ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit) : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

export function normalizeMobile(value) {
  let mobile=normalizeDigits(value).replace(/[\s()\-]/g,'');
  if(mobile.startsWith('+98'))mobile='0'+mobile.slice(3);
  else if(mobile.startsWith('0098'))mobile='0'+mobile.slice(4);
  return mobile;
}

export function validateRegistration(input) {
  const errors={};
  if(!input||typeof input!=='object'||Array.isArray(input))return {errors:{form:'اطلاعات فرم معتبر نیست.'}};
  const type=input.type;
  if(!['visitor','booth'].includes(type))return {errors:{form:'نوع درخواست معتبر نیست.'}};
  const data={type};
  function text(key,label,{required=false,max=120,min=1}={}) {
    const raw=input[key];
    if(raw!==undefined&&typeof raw!=='string'){errors[key]=`${label} معتبر نیست.`;data[key]='';return;}
    const value=(raw||'').normalize('NFC').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').trim();
    data[key]=value;
    if(required&&!value)errors[key]=`${label} را وارد کنید.`;
    else if(value&&(value.length<min||value.length>max))errors[key]=`${label} باید بین ${min} و ${max} نویسه باشد.`;
  }
  text('firstName','نام',{required:true,min:2,max:60});
  text('lastName','نام خانوادگی',{required:true,min:2,max:80});
  text('mobile','شماره موبایل',{required:true,max:30});
  data.mobile=normalizeMobile(data.mobile);
  if(data.mobile&&!/^09\d{9}$/.test(data.mobile))errors.mobile='شماره موبایل معتبر، مانند ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.';
  text('jobTitle','سمت یا عنوان شغلی',{max:120});
  text('city','شهر محل سکونت',{required:true,min:2,max:100});
  text('email','ایمیل',{max:254});
  if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))errors.email='نشانی ایمیل معتبر وارد کنید.';
  data.email=data.email.toLowerCase();
  if(!referralOptions.some(([value])=>value===input.referral))errors.referral='نحوه آشنایی با نمایشگاه را انتخاب کنید.';
  else data.referral=input.referral;
  if(type==='visitor') {
    if(!experienceOptions.some(([value])=>value===input.experience))errors.experience='سابقه ورزش و فعالیت را انتخاب کنید.';
    else data.experience=input.experience;
  } else {
    text('companyName','نام شرکت یا برند',{required:true,min:2,max:160});
    text('activity','نوع فعالیت و محصولات یا خدمات',{required:true,min:3,max:600});
    text('website','وب‌سایت',{max:250});
    if(data.website) {
      try {const url=new URL(data.website);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error();data.website=url.href;}
      catch {errors.website='نشانی وب‌سایت را با https:// وارد کنید.';}
    }
    text('requestedArea','متراژ پیشنهادی',{max:8});
    data.requestedArea=normalizeDigits(data.requestedArea);
    if(data.requestedArea&&(!/^\d{1,4}$/.test(data.requestedArea)||Number(data.requestedArea)<1))errors.requestedArea='متراژ را به‌صورت عدد صحیح مثبت وارد کنید.';
    text('notes','توضیحات',{max:1200});
  }
  return {data,errors};
}
