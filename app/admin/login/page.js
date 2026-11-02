import Link from 'next/link';
import {redirect} from 'next/navigation';
import {readAdminSession} from '../../../lib/server/admin-request';
import {LoginForm} from '../admin-ui';
import styles from '../styles.module.css';
export const metadata={title:'ورود مدیر | ایران مِکس',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function AdminLogin(){if(await readAdminSession())redirect('/admin');return <main className={styles.loginPage}><div className={styles.loginCard}><Link className={styles.brand} href="/"><img src="/iranmex-logo.png" width="155" height="102" alt="ایران مِکس"/></Link><h1>ورود به پنل مدیریت</h1><p>برای مدیریت ثبت‌نام‌ها و خبرهای نمایشگاه وارد شوید.</p><LoginForm/><Link className={styles.back} href="/">بازگشت به سایت</Link></div></main>;}
