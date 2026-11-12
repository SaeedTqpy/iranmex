import Link from 'next/link';
import {requireAdmin} from '../../../lib/server/admin-request';
import {LogoutButton} from '../admin-ui';
import styles from '../styles.module.css';
export const metadata={title:'پنل مدیریت | ایران مِکس',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function AdminLayout({children}){const session=await requireAdmin();return <div className={styles.shell}><header className={styles.header}><div><Link href="/admin" className={styles.headerBrand}>پنل مدیریت ایران مِکس</Link><span className={styles.user}><bdi>{session.username}</bdi></span></div><LogoutButton/></header><div className={styles.workspace}><nav className={styles.nav} aria-label="منوی پنل مدیریت"><Link href="/admin">نمای کلی</Link><Link href="/admin/registrations?type=visitor">ثبت‌نام بازدید</Link><Link href="/admin/registrations?type=booth">درخواست‌های غرفه</Link><Link href="/admin/analytics">آمار بازدید سایت</Link><Link href="/admin/companies">شرکت‌ها و مجموعه‌ها</Link><Link href="/admin/sponsors">حامیان و شرکا</Link><Link href="/admin/news">اخبار و اطلاعیه‌ها</Link><Link href="/">مشاهده سایت</Link></nav><main className={styles.main}>{children}</main></div></div>;}
