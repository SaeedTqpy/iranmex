'use client';
import {useEffect,useRef} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {normalizeUtm,utmFields} from '../lib/utm.mjs';
const storageKey='iranmex-utm-v1',lifetime=30*60*1000;
export default function PageviewTracker(){
  const pathname=usePathname();const params=useSearchParams();const previous=useRef(null);
  const utm=normalizeUtm(Object.fromEntries(utmFields.map(key=>[key,params.get(`utm_${key}`)||''])));
  const campaignKey=utm?JSON.stringify(utm):'';
  useEffect(()=>{
    if(!pathname)return;const pageKey=pathname+'\n'+campaignKey;if(pageKey===previous.current)return;previous.current=pageKey;
    if(pathname==='/admin'||pathname.startsWith('/admin/'))return;
    let active=campaignKey?JSON.parse(campaignKey):null;const now=Date.now();
    try{if(!active){const stored=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(stored&&Number.isFinite(stored.lastSeen)&&now>=stored.lastSeen&&now-stored.lastSeen<lifetime)active=normalizeUtm(stored.utm);}
      if(active)sessionStorage.setItem(storageKey,JSON.stringify({utm:active,lastSeen:now}));else sessionStorage.removeItem(storageKey);
    }catch{}
    fetch('/api/pageviews',{method:'POST',credentials:'omit',keepalive:true,...(active?{headers:{'Content-Type':'application/json'},body:JSON.stringify({utm:active})}:{})}).catch(()=>{});
  },[pathname,campaignKey]);
  return null;
}
