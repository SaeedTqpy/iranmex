'use client';

import Link from 'next/link';
import {useState} from 'react';
import {ArrowUpLeft,Search} from 'lucide-react';
import {filterNews,newsCategories,categoryLabel,formatNewsDate} from '../../lib/news-shared.mjs';
import styles from './styles.module.css';

const pageSize=9;
const englishCategories={news:'News',announcement:'Announcements',press:'Press notices'};
const arabicCategories={news:'الأخبار',announcement:'الإعلانات',press:'البيانات الصحفية'};
export default function NewsList({articles,locale='fa'}) {
  const en=locale==='en';
  const ar=locale==='ar';
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [page,setPage]=useState(1);
  const filtered=filterNews(articles,query,category);
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const currentPage=Math.min(page,totalPages);
  const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
  const number=value=>value.toLocaleString(en?'en-US':ar?'ar':'fa-IR');
  const label=id=>en?(englishCategories[id]||'News'):ar?(arabicCategories[id]||'الأخبار'):categoryLabel(id);
  const date=value=>(en||ar)?new Intl.DateTimeFormat(en?'en-GB':'ar',{dateStyle:'long',timeZone:'Asia/Tehran'}).format(new Date(value)):formatNewsDate(value);
  function reset(){setQuery('');setCategory('all');setPage(1);}
  return <>
    <div className={styles.filters}><div className={styles.search}><label htmlFor="news-query">{en?'Search news':ar?'البحث في الأخبار':'جست‌وجو در خبرها'}</label><div><Search size={20} aria-hidden="true"/><input id="news-query" type="search" maxLength={200} value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}} placeholder={en?'Search titles or topics in Persian':ar?'ابحثوا بالكلمات الفارسية':'عنوان یا موضوع خبر'}/></div></div><div className={styles.categoryFilter}><label htmlFor="news-category">{en?'Category':ar?'التصنيف':'دسته‌بندی'}</label><select id="news-category" value={category} onChange={event=>{setCategory(event.target.value);setPage(1);}}><option value="all">{en?'All articles':ar?'جميع المقالات':'همه مطالب'}</option>{newsCategories.map(item=><option key={item.id} value={item.id}>{en||ar?label(item.id):item.label}</option>)}</select></div></div>
    <p className={styles.results} role="status" aria-live="polite">{en?`${number(filtered.length)} ${filtered.length===1?'article':'articles'}${totalPages>1?`; page ${number(currentPage)} of ${number(totalPages)}`:''}`:ar?`${number(filtered.length)} مقالة${totalPages>1?`؛ الصفحة ${number(currentPage)} من ${number(totalPages)}`:''}`:<>{number(filtered.length)} مطلب{totalPages>1&&`؛ صفحه ${number(currentPage)} از ${number(totalPages)}`}</>}</p>
    {visible.length ? <ul className={styles.newsGrid}>{visible.map(article=><li key={article.slug}><article className={styles.card}><Link href={`/news/${article.slug}`} className={styles.cardLink}>
      {article.image&&<img className={styles.cardImage} src={article.image.src} alt={article.image.alt} lang={(en||ar)?'fa':undefined} width={article.image.width} height={article.image.height} loading="lazy"/>}
      <div className={styles.cardBody}><div className={styles.meta}><span>{label(article.category)}</span><time dateTime={article.publishedAt}>{date(article.publishedAt)}</time></div><h2 lang={(en||ar)?'fa':undefined} dir={(en||ar)?'rtl':undefined}>{article.title}</h2><p lang={(en||ar)?'fa':undefined} dir={(en||ar)?'rtl':undefined}>{article.excerpt}</p><span className={styles.readMore}>{en?'Read article in Persian':ar?'قراءة المقالة بالفارسية':'مشاهده مطلب'} <ArrowUpLeft size={18} aria-hidden="true"/></span></div>
    </Link></article></li>)}</ul> : <div className={styles.noResults}><h2>{en?'No articles found':ar?'لم يُعثر على مقالات':'مطلبی با این مشخصات پیدا نشد'}</h2><p>{en?'Try a different search or category.':ar?'جرّبوا بحثاً أو تصنيفاً آخر.':'عبارت جست‌وجو یا دسته‌بندی را تغییر دهید.'}</p><button type="button" className={styles.secondaryButton} onClick={reset}>{en?'Show all articles':ar?'عرض جميع المقالات':'نمایش همه مطالب'}</button></div>}
    {totalPages>1&&<nav className={styles.pagination} aria-label={en?'News pages':ar?'صفحات الأخبار':'صفحه‌های اخبار'}><button type="button" disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}>{en?'Previous':ar?'السابقة':'صفحه قبل'}</button><span aria-current="page">{number(currentPage)} {en?'of':ar?'من':'از'} {number(totalPages)}</span><button type="button" disabled={currentPage===totalPages} onClick={()=>setPage(currentPage+1)}>{en?'Next':ar?'التالية':'صفحه بعد'}</button></nav>}
  </>;
}
