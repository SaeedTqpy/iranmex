import Link from 'next/link';
import {CalendarDays,Clock,MapPin} from 'lucide-react';
import {Header,Footer} from '../components';
import RegistrationForm from './registration-form';
import styles from './styles.module.css';

export default function RegistrationLayout({type}) {
  const booth=type==='booth';
  return <><Header/><main className={`${styles.page} ${styles.registrationTheme}${booth ? ` ${styles.boothPage}` : ''}`}>
    <header className={styles.intro}><nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">خانه</Link><span aria-hidden="true">/</span><span aria-current="page">{booth?'درخواست غرفه':'ثبت‌نام بازدید'}</span></nav><h1>{booth?'درخواست غرفه نمایشگاهی':'ثبت‌نام رایگان بازدید'}</h1><p>{booth?'اطلاعات مجموعه و زمینه فعالیت خود را وارد کنید تا درخواست حضور شما در ایران مِکس توسط دبیرخانه بررسی شود.':'برای بازدید از نمایشگاه ایران مِکس، اطلاعات خود را در فرم زیر ثبت کنید.'}</p><nav className={styles.paths} aria-label="نوع ثبت‌نام"><Link href="/registration" aria-current={!booth?'page':undefined}>ثبت‌نام بازدید</Link><Link href="/registration/booth" aria-current={booth?'page':undefined}>درخواست غرفه</Link></nav></header>
    <div className={styles.layout}><RegistrationForm type={type}/><aside className={styles.aside} aria-label="اطلاعات نمایشگاه"><h2>دیدار در ایران مِکس</h2><dl><div><dt><CalendarDays size={19} aria-hidden="true"/>تاریخ</dt><dd>۱۸ و ۱۹ آذر ۱۴۰۵</dd></div><div><dt><Clock size={19} aria-hidden="true"/>ساعت بازدید</dt><dd>۱۲:۰۰ تا ۲۲:۰۰</dd></div><div><dt><MapPin size={19} aria-hidden="true"/>مکان</dt><dd>تهران، خیابان طالقانی، هتل پارسیان انقلاب</dd></div></dl><div className={styles.help}><h3>ارتباط با دبیرخانه</h3><p>برای پرسش درباره {booth?'حضور و شرایط غرفه‌داری':'ثبت‌نام و بازدید'} تماس بگیرید.</p><a href="tel:+989366181472" dir="ltr">۰۹۳۶ ۶۱۸ ۱۴۷۲</a></div><Link href={booth?'/exhibition':'/visitors'}>{booth?'مشاهده نمایشگاه و شرکت‌ها':'راهنمای بازدید از نمایشگاه'}</Link></aside></div>
  </main><Footer/></>;
}

