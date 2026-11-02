import {normalizeUtm,utmFields} from './utm.mjs';
export function buildUtmUrl(origin,destination,values){
  let url;try{const raw=destination.trim();if(!raw||raw.startsWith('//'))throw Error();url=new URL(raw,origin);const base=new URL(origin);if(url.origin!==base.origin||!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();}catch{return {error:'نشانی باید به یکی از صفحه‌های همین سایت اشاره کند.'};}
  if(url.pathname==='/admin'||url.pathname.startsWith('/admin/')||url.pathname==='/api'||url.pathname.startsWith('/api/'))return {error:'یک صفحه عمومی سایت را انتخاب کنید.'};
  const utm=normalizeUtm(values);if(!utm||!utm.source||!utm.medium||!utm.campaign)return {error:'منبع، رسانه و نام کمپین را معتبر و حداکثر ۱۰۰ نویسه وارد کنید.'};
  for(const key of utmFields){url.searchParams.delete(`utm_${key}`);if(utm[key])url.searchParams.set(`utm_${key}`,utm[key]);}
  return {url:url.toString()};
}
