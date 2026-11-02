import Link from 'next/link';
import {Newspaper, ArrowUpLeft} from 'lucide-react';
import {Header, Footer} from '../../components';
import {publishedNews} from '../../../lib/news.mjs';
import NewsList from '../../news/news-list';
import styles from '../../news/styles.module.css';

export const dynamic='force-dynamic';
export const metadata={title:'News and Announcements | IRANMEX',description:'News and announcements from IRANMEX.'};

export default function EnglishNewsPage(){
  const articles=publishedNews().map(({slug,title,excerpt,category,publishedAt,image})=>({slug,title,excerpt,category,publishedAt,image}));
  return <div className="english-home" lang="en" dir="ltr"><Header locale="en"/><main className={`${styles.page} ${styles.newsIndex} news-index-page`}><header className={styles.hero}><nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/en">Home</Link><span aria-hidden="true">/</span><span aria-current="page">News</span></nav><h1>News and announcements</h1><p>Follow the latest IRANMEX news, event announcements and press notices here.</p></header><section className={styles.archive} aria-label="News and announcements">{articles.length ? <><p className="english-news-notice">Articles are currently published in Persian. Search using Persian terms.</p><NewsList articles={articles} locale="en"/></> : <div className={styles.empty}><Newspaper size={42} strokeWidth={1.4} aria-hidden="true"/><h2>No news has been published yet</h2><p>IRANMEX news and announcements will appear here when published. Explore the exhibition to learn more about the event.</p><div className={styles.emptyActions}><Link className={styles.primaryButton} href="/en/exhibition">Exhibition information <ArrowUpLeft size={18} aria-hidden="true"/></Link><Link className={styles.secondaryButton} href="/registration">Free visitor registration</Link></div><p className="english-news-notice">Registration is currently available in Persian.</p></div>}</section></main><Footer locale="en"/></div>;
}
