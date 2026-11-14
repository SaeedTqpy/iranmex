'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CompaniesCarousel({locale='fa',companies=[]}){
  const rtl=locale!=='en',id=useId(),rail=useRef(null),gesture=useRef(null);
  const [playing,setPlaying]=useState(true),[loopable,setLoopable]=useState(false);
  const cycle=useRef(0);
  const resumeAt=useRef(0),interacting=useRef(false);
  const [position,setPosition]=useState({previous:false,next:false});
  const labels=locale==='en'?{title:'Exhibiting companies',previous:'Previous companies',next:'Next companies',help:'Swipe or use the arrows to browse companies',empty:'No companies to display',details:'View company details',of:'of'}:locale==='ar'?{title:'الشركات العارضة',previous:'الشركات السابقة',next:'الشركات التالية',help:'اسحب أو استخدم الأسهم لتصفح الشركات',empty:'لا توجد شركات للعرض',details:'عرض معلومات الشركة',of:'من'}:{title:'شرکت‌های نمایشگاه',previous:'شرکت‌های قبلی',next:'شرکت‌های بعدی',help:'برای دیدن شرکت‌ها بکشید یا از فلش‌ها استفاده کنید',empty:'شرکتی برای نمایش وجود ندارد',details:'مشاهده اطلاعات شرکت',of:'از'};
  useEffect(()=>{
    const node=rail.current;if(!node)return;
    let frame=0;
    const measure=()=>{
      const card=node.firstElementChild,gap=parseFloat(getComputedStyle(node).columnGap)||12;
      cycle.current=card?(card.getBoundingClientRect().width+gap)*companies.length:0;
      const overflow=cycle.current-gap>node.clientWidth+2;
      setLoopable(overflow);
      const max=Math.max(0,node.scrollWidth-node.clientWidth),offset=Math.min(max,Math.abs(node.scrollLeft));
      const next={previous:overflow||offset>2,next:overflow||offset<max-2};
      setPosition(old=>old.previous===next.previous&&old.next===next.next?old:next);
    };
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    measure();node.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;observer?.observe(node);
    return ()=>{cancelAnimationFrame(frame);observer?.disconnect();node.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[companies,rtl]);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(media.matches)setPlaying(false);
    const changed=()=>{if(media.matches)setPlaying(false);};
    media.addEventListener('change',changed);
    return ()=>media.removeEventListener('change',changed);
  },[]);
  useEffect(()=>{
    const node=rail.current;if(!node||!playing)return;
    const host=node.closest('.companies-slider');
    let visible=false,frame=0,lastTime=null,logical=null,lastWritten=null;
    const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.25}):null;
    if(observer)observer.observe(node);else visible=true;
    const pause=()=>{interacting.current=true;resumeAt.current=Date.now()+6000;};
    const release=()=>{interacting.current=false;resumeAt.current=Date.now()+6000;};
    const wheel=()=>{resumeAt.current=Date.now()+6000;};
    host.addEventListener('pointerdown',pause);
    host.addEventListener('wheel',wheel,{passive:true});
    window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
    const tick=time=>{
      frame=requestAnimationFrame(tick);
      const focused=document.activeElement;
      const paused=!visible||document.hidden||interacting.current||Date.now()<resumeAt.current||
        (window.matchMedia('(hover: hover)').matches&&host.matches(':hover'))||
        (host.contains(focused)&&focused?.dataset.rotationToggle!=='true');
      if(paused||!cycle.current||!loopable){lastTime=null;logical=null;lastWritten=null;return;}
      const actual=Math.abs(node.scrollLeft);
      if(logical===null||lastWritten===null||Math.abs(actual-lastWritten)>2)logical=actual;
      const elapsed=lastTime===null?0:Math.min(time-lastTime,40);lastTime=time;
      logical=(logical+elapsed*0.028)%cycle.current;
      node.scrollLeft=(rtl?-1:1)*logical;lastWritten=Math.abs(node.scrollLeft);
    };
    frame=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(frame);observer?.disconnect();host.removeEventListener('pointerdown',pause);host.removeEventListener('wheel',wheel);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);interacting.current=false;};
  },[playing,companies,rtl,loopable]);
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
      {(loopable?[0,1,2]:[0]).flatMap(copy=>companies.map(company=><Link key={copy+'-'+company.slug} aria-hidden={copy>0?true:undefined} tabIndex={copy>0?-1:undefined} href={`/exhibition/${company.slug}`} prefetch={false} className="companies-slider-card" draggable={false} aria-label={labels.details+': '+company.name}>
        <span className="companies-slider-logo"><Image src={company.logo} alt="" width={160} height={96} sizes="(max-width: 640px) 112px, 148px" quality={75} loading="lazy" draggable={false}/></span><span className="companies-slider-name">{company.name}</span>
      </Link>))}
    </div>
    <div className="companies-slider-footer"><span className="companies-slider-hint">{labels.help}</span><div className="companies-slider-navigation">
      <button type="button" data-rotation-toggle="true" aria-controls={id} aria-label={playing?(locale==='en'?'Pause automatic sliding':locale==='ar'?'إيقاف الحركة التلقائية':'توقف حرکت خودکار'):(locale==='en'?'Start automatic sliding':locale==='ar'?'تشغيل الحركة التلقائية':'شروع حرکت خودکار')} onClick={()=>{resumeAt.current=0;setPlaying(value=>!value);}}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{playing?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<path d="M7 4v16l14-8z"/>}</svg></button>
      <button type="button" aria-label={labels.previous} aria-controls={id} disabled={!position.previous} onClick={()=>scroll(-1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={rtl?'m9 5 7 7-7 7':'m15 5-7 7 7 7'}/></svg></button>
      <span className="companies-slider-count"><bdi>{companies.length}</bdi> {locale==='en'?'companies':locale==='ar'?'شركة':'شرکت'}</span>
      <button type="button" aria-label={labels.next} aria-controls={id} disabled={!position.next} onClick={()=>scroll(1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={rtl?'m15 5-7 7 7 7':'m9 5 7 7-7 7'}/></svg></button>
    </div></div>
  </div>;
}
