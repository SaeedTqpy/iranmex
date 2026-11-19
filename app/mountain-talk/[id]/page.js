import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Header,Footer} from '../../components';
import {getMountainTalks} from '../../../lib/server/mountain-talk-store.mjs';
import styles from './styles.module.css';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const {id}=await params;
  const talk=getMountainTalks().items.find(item=>item.id===id);
  return {title:talk?`${talk.name} | Mountain Talk | ایران مِکس`:'سخنران یافت نشد | ایران مِکس'};
}
export default async function TalkPage({params}){
  const {id}=await params;
  const talk=getMountainTalks().items.find(item=>item.id===id);
  if(!talk)notFound();
  const details=[['تاریخ',talk.date],['ساعت',talk.time],['مکان',talk.location]].filter(([,value])=>value);
  return <><Header/><main className={styles.page} dir="rtl"><div className={styles.inner}>
    <nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">خانه</Link><span>/</span><Link href="/#mountain-talk">Mountain Talk</Link><span>/</span><span aria-current="page">{talk.name}</span></nav>
    <div className={styles.layout}><div className={styles.content}><span className={styles.kicker}>از برنامه‌های ایران مِکس</span><p className={styles.brand} lang="en" dir="ltr">Mountain Talk</p><h1>{talk.name}</h1>{talk.title&&<p className={styles.title}>{talk.title}</p>}
      {talk.topic&&<section className={styles.block}><h2>موضوع سخنرانی</h2><p className={styles.topic}>{talk.topic}</p></section>}
      {talk.summary&&<section className={styles.block}><h2>درباره سخنرانی</h2><p className={styles.text}>{talk.summary}</p></section>}
      {talk.bio&&<section className={styles.block}><h2>درباره سخنران</h2><p className={styles.text}>{talk.bio}</p></section>}
      {!talk.topic&&!talk.summary&&!talk.bio&&<p className={styles.placeholder}>اطلاعات تکمیلی این سخنرانی به‌زودی اعلام می‌شود.</p>}
      {details.length>0&&<dl className={styles.details}>{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      <Link className={styles.back} href="/#mountain-talk">بازگشت به سخنرانان ←</Link>
    </div><div className={styles.poster}><img src={talk.image} alt={talk.alt||`پوستر سخنرانی ${talk.name} در Mountain Talk`} width="1000" height="1252"/></div></div>
  </div></main><Footer/></>;
}
