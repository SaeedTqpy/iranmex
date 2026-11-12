'use client';
import {useState} from 'react';
import {ArrowRight, ArrowLeft} from 'lucide-react';
import styles from '../styles.module.css';

export function CompanyGallery({images,name}){
  const [active,setActive]=useState(0);
  const count=images.length;
  const number=value=>value.toLocaleString('fa-IR');
  return <section className={styles.gallery} aria-label={`تصاویر محصولات ${name}`} aria-roledescription="گالری تصاویر">
    <div className={styles.galleryHeading}><div><span>نگاهی به مجموعه</span><h2>تصاویر محصولات و خدمات</h2></div><span className={styles.galleryCounter} aria-live="polite">{number(active+1)} <span>/</span> {number(count)}</span></div>
    <div className={styles.galleryStage} role="group" aria-label={`تصویر ${number(active+1)} از ${number(count)}`}>
      <img src={images[active]} alt={`تصویر ${number(active+1)} از محصولات و خدمات ${name}`}/>
      {count>1&&<div className={styles.galleryControls}><button type="button" onClick={()=>setActive((active-1+count)%count)} aria-label="تصویر قبلی"><ArrowRight size={20}/></button><button type="button" onClick={()=>setActive((active+1)%count)} aria-label="تصویر بعدی"><ArrowLeft size={20}/></button></div>}
    </div>
    {count>1&&<div className={styles.galleryThumbs} aria-label="انتخاب تصویر">{images.map((src,index)=><button type="button" key={src} onClick={()=>setActive(index)} aria-label={`نمایش تصویر ${number(index+1)}`} aria-current={active===index?'true':undefined}><img src={src} alt="" loading="lazy"/></button>)}</div>}
  </section>;
}
