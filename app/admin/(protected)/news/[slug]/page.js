import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdmin} from '../../../../../lib/server/admin-request';
import {getManagedNews} from '../../../../../lib/server/news-store.mjs';
import {NewsEditor} from '../../../admin-ui';
import styles from '../../../styles.module.css';
export const dynamic='force-dynamic';
export default async function EditNews({params}){await requireAdmin();const {slug}=await params;const article=getManagedNews(slug);if(!article)notFound();return <><div className={styles.pageHead}><div><Link className={styles.backLink} href="/admin/news">بازگشت به خبرها</Link><h1>ویرایش خبر</h1><p>{article.status==='published'?'این خبر در سایت منتشر شده است.':'این خبر به‌صورت پیش‌نویس ذخیره شده است.'}</p></div>{article.status==='published'&&<Link className={styles.secondary} href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer">مشاهده در سایت</Link>}</div><NewsEditor article={article}/></>;}
