'use client';
import {useRef,useState} from 'react';
import {ArrowRight,ArrowLeft} from 'lucide-react';
import styles from '../styles.module.css';

export function CompanyGallery({images,name}){
  const [active,setActive]=useState(0);
  const start=useRef(null);
  const count=images.length;
  const number=value=>value.toLocaleString('fa-IR');
  const move=direction=>setActive(current=>(current+direction+count)%count);
  function position(index){
    let offset=index-active;
    if(offset>count/2)offset-=count;
    if(offset< -count/2)offset+=count;
    return offset;
  }
  function pointerDown(event){if(event.isPrimary)start.current={x:event.clientX,y:event.clientY};}
  function pointerUp(event){
    if(!start.current)return;
    const dx=event.clientX-start.current.x,dy=event.clientY-start.current.y;
    start.current=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx>0?1:-1);
  }
  return <section className={styles.gallery} aria-label={`تصاویر محصولات ${name}`} aria-roledescription="گالری تصاویر">
    <div className={styles.galleryHeading}><h2>تصاویر محصولات و خدمات</h2>{count>1&&<span className={styles.galleryCounter} aria-live="polite">{number(active+1)} <span>/</span> {number(count)}</span>}</div>
    <div className={styles.galleryStage} onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={()=>{start.current=null;}}>
      {images.map((src,index)=>{const offset=position(index);return <div key={src} className={styles.gallerySlide} data-position={offset} aria-hidden={index!==active}>
        <img src={src} alt={index===active?`تصویر ${number(index+1)} از محصولات و خدمات ${name}`:''} draggable="false"/>
      </div>;})}
    </div>
    {count>1&&<div className={styles.galleryNavigation}>
      <div className={styles.galleryControls}><button type="button" onClick={()=>move(-1)} aria-label="تصویر قبلی"><ArrowRight size={20}/></button><button type="button" onClick={()=>move(1)} aria-label="تصویر بعدی"><ArrowLeft size={20}/></button></div>
      <div className={styles.galleryDots} aria-label="انتخاب تصویر">{images.map((src,index)=><button type="button" key={src} onClick={()=>setActive(index)} aria-label={`نمایش تصویر ${number(index+1)}`} aria-current={active===index?'true':undefined}/>)}</div>
    </div>}
  </section>;
}
