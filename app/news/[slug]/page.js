import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowUpLeft,ExternalLink} from 'lucide-react';
import {Header,Footer} from '../../components';
import {publishedNews,findPublishedNews,categoryLabel,formatNewsDate} from '../../../lib/news.mjs';
import styles from '../styles.module.css';

export const dynamic='force-dynamic';
export async function generateMetadata({params}) {
  const {slug}=await params;const article=findPublishedNews(slug);if(!article)notFound();
  return {title:`${article.title} | ایران مِکس`,description:article.excerpt,openGraph:{type:'article',title:article.title,description:article.excerpt,publishedTime:article.publishedAt,locale:'fa_IR',...(article.author?{authors:[article.author]}:{})}};
}

export default async function NewsArticle({params}) {
  const {slug}=await params;const article=findPublishedNews(slug);if(!article)notFound();
  const related=publishedNews().filter(item=>item.slug!==slug&&item.category===article.category).slice(0,3);
  return <><Header/><main className={styles.page}>
    <article>
      <header className={styles.articleHeader}><nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">خانه</Link><span aria-hidden="true">/</span><Link href="/news">اخبار</Link><span aria-hidden="true">/</span><span aria-current="page">{article.title}</span></nav><div className={styles.meta}><span>{categoryLabel(article.category)}</span><time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time>{article.author&&<span>{article.author}</span>}</div><h1>{article.title}</h1><p className={styles.excerpt}>{article.excerpt}</p></header>
      <div className={styles.articleBody}>{article.image&&<figure><img src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height}/>{article.image.caption&&<figcaption>{article.image.caption}</figcaption>}</figure>}
        {article.content.map((block,index)=>block.type==='heading'?<h2 key={index}>{block.text}</h2>:block.type==='list'?<ul key={index}>{block.items.map((item,itemIndex)=><li key={itemIndex}>{item}</li>)}</ul>:<p key={index}>{block.text}</p>)}
        {article.source&&<p className={styles.source}>منبع: <a href={article.source.url} target="_blank" rel="noopener noreferrer">{article.source.label} <ExternalLink size={16} aria-hidden="true"/><span className={styles.srOnly}>(در پنجره جدید)</span></a></p>}
        <Link href="/news" className={styles.backLink}>بازگشت به اخبار و اطلاعیه‌ها <ArrowUpLeft size={18} aria-hidden="true"/></Link>
      </div>
    </article>
    {related.length>0&&<aside className={styles.related} aria-labelledby="related-news-title"><h2 id="related-news-title">مطالب مرتبط</h2><ul>{related.map(item=><li key={item.slug}><Link href={`/news/${item.slug}`}><span>{item.title}</span><time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time><ArrowUpLeft size={18} aria-hidden="true"/></Link></li>)}</ul></aside>}
  </main><Footer/></>;
}
