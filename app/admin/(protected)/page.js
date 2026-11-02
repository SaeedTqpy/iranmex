import Link from 'next/link';
import {requireAdmin} from '../../../lib/server/admin-request';
import {registrationCounts} from '../../../lib/server/registrations-admin.mjs';
import {listManagedNews} from '../../../lib/server/news-store.mjs';
import styles from '../styles.module.css';
export const dynamic='force-dynamic';
export default async function AdminHome(){await requireAdmin();const counts=registrationCounts();const news=listManagedNews();return <><div className={styles.pageHead}><div><h1>نمای کلی</h1><p>اطلاعات ثبت‌شده و محتوای نمایشگاه را از اینجا مدیریت کنید.</p></div></div><div className={styles.stats}><Link href="/admin/registrations?type=visitor"><span>ثبت‌نام‌های بازدید</span><strong>{counts.visitor.toLocaleString('fa-IR')}</strong><small>مشاهده فهرست</small></Link><Link href="/admin/registrations?type=booth"><span>درخواست‌های غرفه</span><strong>{counts.booth.toLocaleString('fa-IR')}</strong><small>مشاهده و پیگیری</small></Link><Link href="/admin/news"><span>خبرها و اطلاعیه‌ها</span><strong>{news.length.toLocaleString('fa-IR')}</strong><small>مدیریت محتوا</small></Link></div><section className={styles.panel}><h2>دسترسی سریع</h2><div className={styles.quick}><Link href="/admin/news/new">نوشتن خبر جدید</Link><a href="/api/admin/export">دریافت خروجی ثبت‌نام‌ها</a><Link href="/admin/registrations?type=booth">بررسی درخواست‌های غرفه</Link></div></section></>;}
