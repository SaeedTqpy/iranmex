import Link from 'next/link';
import {requireAdmin} from '../../../../lib/server/admin-request';
import {listManagedNews} from '../../../../lib/server/news-store.mjs';
import {categoryLabel,formatNewsDate} from '../../../../lib/news-shared.mjs';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function AdminNews(){await requireAdmin();const items=listManagedNews();return <><div className={styles.pageHead}><div><h1>اخبار و اطلاعیه‌ها</h1><p>خبرها را بنویسید، به‌صورت پیش‌نویس نگه دارید یا منتشر کنید.</p></div><Link className={styles.primary} href="/admin/news/new">نوشتن خبر جدید</Link></div>{items.length?<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>عنوان</th><th>دسته‌بندی</th><th>وضعیت</th><th>تاریخ</th><th><span className={styles.srOnly}>ویرایش</span></th></tr></thead><tbody>{items.map(item=><tr key={item.slug}><td>{item.title}</td><td>{categoryLabel(item.category)}</td><td>{item.status==='published'?'منتشرشده':'پیش‌نویس'}</td><td>{formatNewsDate(item.publishedAt)}</td><td><Link href={`/admin/news/${item.slug}`}>ویرایش</Link></td></tr>)}</tbody></table></div>:<div className={styles.empty}><h2>هنوز خبری ایجاد نشده است</h2><p>برای نوشتن اولین خبر از دکمه بالا استفاده کنید.</p></div>}</>;}
