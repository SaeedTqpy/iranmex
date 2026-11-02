import Link from 'next/link';
import {Newspaper,ArrowUpLeft} from 'lucide-react';
import {Header,Footer} from '../components';
import {publishedNews} from '../../lib/news.mjs';
import NewsList from './news-list';
import styles from './styles.module.css';

export const dynamic='force-dynamic';
export const metadata={title:'اخبار و اطلاعیه‌ها | ایران مِکس',description:'اخبار، اطلاعیه‌ها و آگهی‌های خبری نمایشگاه ایران مِکس؛ تازه‌ترین خبرهای رویداد، برنامه‌ها و شرکت‌کنندگان.'};

export default function NewsPage() {
  const articles=publishedNews().map(({slug,title,excerpt,category,publishedAt,image})=>({slug,title,excerpt,category,publishedAt,image}));
  return <><Header/><main className={`${styles.page} ${styles.newsIndex} news-index-page`}>
    <header className={styles.hero}><nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">خانه</Link><span aria-hidden="true">/</span><span aria-current="page">اخبار</span></nav><h1>اخبار و اطلاعیه‌ها</h1><p>تازه‌ترین خبرهای ایران مِکس، اطلاعیه‌های برگزاری و آگهی‌های خبری نمایشگاه را از اینجا دنبال کنید.</p></header>
    <section className={styles.archive} aria-label="فهرست اخبار و اطلاعیه‌ها">{articles.length ? <NewsList articles={articles}/> : <div className={styles.empty}><Newspaper size={42} strokeWidth={1.4} aria-hidden="true"/><h2>هنوز خبری منتشر نشده است</h2><p>اخبار و اطلاعیه‌های ایران مِکس پس از انتشار در این صفحه قرار می‌گیرند. برای آشنایی با رویداد، اطلاعات نمایشگاه را ببینید.</p><div className={styles.emptyActions}><Link className={styles.primaryButton} href="/exhibition">اطلاعات نمایشگاه <ArrowUpLeft size={18} aria-hidden="true"/></Link><Link className={styles.secondaryButton} href="/registration">ثبت‌نام رایگان بازدید</Link></div></div>}</section>
  </main><Footer/></>;
}
