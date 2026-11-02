import Link from 'next/link';
import {Newspaper, ArrowUpLeft} from 'lucide-react';
import {Header, Footer} from '../../components';
import {publishedNews} from '../../../lib/news.mjs';
import NewsList from '../../news/news-list';
import styles from '../../news/styles.module.css';
export const dynamic='force-dynamic';
export const metadata={title:'الأخبار والإعلانات | إيران مكس',description:'أخبار معرض إيران مكس وإعلاناته.'};
export default function ArabicNewsPage(){
  const articles=publishedNews().map(({slug,title,excerpt,category,publishedAt,image})=>({slug,title,excerpt,category,publishedAt,image}));
  return <div className="arabic-home" lang="ar" dir="rtl"><Header locale="ar"/><main className={`${styles.page} ${styles.newsIndex} news-index-page`}><header className={styles.hero}><nav className={styles.breadcrumb} aria-label="مسار الصفحة"><Link href="/ar">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">الأخبار</span></nav><h1>الأخبار والإعلانات</h1><p>تابعوا أحدث أخبار إيران مكس وإعلانات المعرض وبياناته الصحفية من هنا.</p></header><section className={styles.archive} aria-label="الأخبار والإعلانات">{articles.length ? <><p className="english-news-notice">تُنشر المقالات حالياً باللغة الفارسية. يرجى البحث بالكلمات الفارسية.</p><NewsList articles={articles} locale="ar"/></> : <div className={styles.empty}><Newspaper size={42} strokeWidth={1.4} aria-hidden="true"/><h2>لم تُنشر أخبار بعد</h2><p>ستظهر أخبار إيران مكس وإعلاناته هنا عند نشرها. تعرّفوا إلى المعرض للاطلاع على تفاصيل الفعالية.</p><div className={styles.emptyActions}><Link className={styles.primaryButton} href="/ar/exhibition">معلومات المعرض <ArrowUpLeft size={18} aria-hidden="true"/></Link><Link className={styles.secondaryButton} href="/registration">التسجيل المجاني للزيارة</Link></div><p className="english-news-notice">التسجيل متاح حالياً باللغة الفارسية.</p></div>}</section></main><Footer locale="ar"/></div>;
}
