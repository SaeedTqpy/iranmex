'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CompaniesCarousel({locale='fa',companies=[]}){
  const rtl=locale!=='en',id=useId(),rail=useRef(null),gesture=useRef(null);
  const [position,setPosition]=useState({previous:false,next:false,first:1,last:1});
  const labels=locale==='en'?{title:'Exhibiting companies',previous:'Previous companies',next:'Next companies',help:'Swipe or use the arrows to browse companies',empty:'No companies to display',details:'View company details',of:'of'}:locale==='ar'?{title:'الشركات العارضة',previous:'الشركات السابقة',next:'الشركات التالية',help:'اسحب أو استخدم الأسهم لتصفح الشركات',empty:'لا توجد شركات للعرض',details:'عرض معلومات الشركة',of:'من'}:{title:'شرکت‌های نمایشگاه',previous:'شرکت‌های قبلی',next:'شرکت‌های بعدی',help:'برای دیدن شرکت‌ها بکشید یا از فلش‌ها استفاده کنید',empty:'شرکتی برای نمایش وجود ندارد',details:'مشاهده اطلاعات شرکت',of:'از'};
  useEffect(()=>{
    const node=rail.current;if(!node)return;
    let frame=0;
    const measure=()=>{
      const max=Math.max(0,node.scrollWidth-node.clientWidth),offset=Math.min(max,Math.abs(node.scrollLeft));
      const bounds=node.getBoundingClientRect();
      const visible=Array.from(node.children).map((child,index)=>({box:child.getBoundingClientRect(),index})).filter(({box})=>box.right>bounds.left+8&&box.left<bounds.right-8);
      const next={previous:offset>2,next:offset<max-2,first:(visible[0]?.index??0)+1,last:(visible.at(-1)?.index??0)+1};
      setPosition(old=>old.previous===next.previous&&old.next===next.next&&old.first===next.first&&old.last===next.last?old:next);
    };
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    measure();node.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;observer?.observe(node);
    return ()=>{cancelAnimationFrame(frame);observer?.disconnect();node.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[companies,rtl]);
  function scroll(step){
    const node=rail.current;if(!node)return;
    const card=node.firstElementChild;if(!card)return;
    const gap=parseFloat(getComputedStyle(node).columnGap)||12,stride=card.getBoundingClientRect().width+gap;
    const count=Math.max(1,Math.floor(node.clientWidth/stride));
    node.scrollBy({left:(rtl?-1:1)*step*stride*count,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  function keydown(event){
    if(event.target!==rail.current)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();scroll((event.key==='ArrowLeft')===rtl?1:-1);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();const node=rail.current;node.scrollTo({left:event.key==='Home'?0:(rtl?-1:1)*(node.scrollWidth-node.clientWidth),behavior:'auto'});}
  }
  function pointerdown(event){
    if(event.pointerType!=='mouse'||event.button!==0)return;
    gesture.current={id:event.pointerId,x:event.clientX,left:rail.current.scrollLeft,moved:false};
  }
  function pointermove(event){
    const active=gesture.current;if(!active||event.pointerId!==active.id||event.buttons!==1)return;
    const delta=event.clientX-active.x;
    if(!active.moved&&Math.abs(delta)<6)return;
    active.moved=true;event.preventDefault();
    if(!event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging='true';
    event.currentTarget.scrollLeft=active.left-delta;
  }
  function pointerend(event){
    const active=gesture.current;if(!active||event.pointerId!==active.id)return;
    event.currentTarget.dataset.dragging='false';
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    // Keep the moved flag through the click event to prevent accidental navigation.
    if(!active.moved)gesture.current=null;
  }
  if(!companies.length)return <p className="companies-slider-empty">{labels.empty}</p>;
  return <div className="companies-slider" role="region" aria-label={labels.title} aria-roledescription={locale==='en'?'carousel':locale==='ar'?'عارض شرائح':'اسلایدر'} dir={rtl?'rtl':'ltr'}>
    <div id={id} ref={rail} className="companies-slider-rail" tabIndex={0} aria-label={labels.help} onKeyDown={keydown} onPointerDown={pointerdown} onPointerMove={pointermove} onPointerUp={pointerend} onPointerCancel={event=>{gesture.current=null;event.currentTarget.dataset.dragging='false';}} onDragStart={event=>event.preventDefault()} onClickCapture={event=>{if(gesture.current?.moved&&event.detail!==0){event.preventDefault();event.stopPropagation();gesture.current=null;}}}>
      {companies.map(company=><Link key={company.slug} href={`/exhibition/${company.slug}`} prefetch={false} className="companies-slider-card" draggable={false} aria-label={labels.details+': '+company.name}>
        <span className="companies-slider-logo"><Image src={company.logo} alt="" width={160} height={96} sizes="(max-width: 640px) 112px, 148px" quality={75} loading="lazy" draggable={false}/></span><span className="companies-slider-name">{company.name}</span>
      </Link>)}
    </div>
    <div className="companies-slider-footer"><span className="companies-slider-hint">{labels.help}</span><div className="companies-slider-navigation">
      <button type="button" aria-label={labels.previous} aria-controls={id} disabled={!position.previous} onClick={()=>scroll(-1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={rtl?'m9 5 7 7-7 7':'m15 5-7 7 7 7'}/></svg></button>
      <span className="companies-slider-count"><bdi>{position.first}–{position.last}</bdi> {labels.of} <bdi>{companies.length}</bdi></span>
      <button type="button" aria-label={labels.next} aria-controls={id} disabled={!position.next} onClick={()=>scroll(1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={rtl?'m15 5-7 7 7 7':'m9 5 7 7-7 7'}/></svg></button>
    </div></div>
  </div>;
}
