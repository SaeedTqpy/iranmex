import {listCompanies} from '../../lib/server/company-store.mjs';
export const dynamic='force-dynamic';
import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, MapPin, Download} from 'lucide-react';
import {Header, Footer} from '../components';
import {exhibitionDocuments} from './companies';
import styles from './styles.module.css';

export const metadata = {
  title:'نمایشگاه و شرکت‌ها | ایران مِکس',
  description:'آشنایی با شرکت‌ها و برندهای نمایشگاه ایران مِکس، اطلاعات بازدید و دسترسی به معرفی محصولات و راه‌های ارتباطی مجموعه‌ها.',
};

export default function ExhibitionPage() {
  return <><Header/><main className={`${styles.page} ${styles.directoryPage} exhibition-page`}>
    <section className={styles.hero} aria-labelledby="exhibition-title">
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">خانه</Link><span aria-hidden="true">/</span><span aria-current="page">نمایشگاه</span></nav>
      <h1 id="exhibition-title">نمایشگاه <span className={styles.titleAccent}>ایران مِکس</span></h1>
      <p>با شرکت‌ها، تولیدکنندگان و ارائه‌دهندگان حوزه کوهنوردی و فعالیت‌های فضای باز آشنا شوید. برای مشاهده معرفی، محصولات و راه‌های ارتباطی هر مجموعه، روی لوگوی آن کلیک کنید.</p>
      <dl className={styles.facts}>
        <div><dt><CalendarDays size={20} aria-hidden="true"/>تاریخ برگزاری</dt><dd>۱۸ و ۱۹ آذر ۱۴۰۵</dd></div>
        <div><dt><Clock size={20} aria-hidden="true"/>ساعت بازدید</dt><dd>۱۲:۰۰ تا ۲۲:۰۰</dd></div>
        <div><dt><MapPin size={20} aria-hidden="true"/>محل برگزاری</dt><dd>تهران، خیابان طالقانی، هتل پارسیان انقلاب</dd></div>
      </dl>
    </section>

    <section className={styles.directory} aria-labelledby="companies-title">
      <div className={styles.sectionHeading}><h2 id="companies-title">شرکت‌ها و مجموعه‌ها</h2><p>نشان‌های معرفی‌شده در طرح رویداد؛ حضور نهایی و اطلاعات شرکت‌ها پس از تأیید تکمیل می‌شود.</p></div>
      <ul className={styles.companyGrid}>
        {listCompanies().map(company=><li key={company.slug}><Link className={styles.companyCard} href={`/exhibition/${company.slug}`}>
          <span className={styles.logoPanel}><img src={company.logo} alt={`نشان ${company.name}`} width="200" height="130"/></span>
          <span className={styles.companyName}>{company.name}</span>
          <span className={styles.cardAction}>مشاهده اطلاعات مجموعه <ArrowUpLeft size={17} aria-hidden="true"/></span>
        </Link></li>)}
      </ul>
    </section>

    <section className={styles.documents} aria-labelledby="exhibition-documents-title">
      <h2 id="exhibition-documents-title">راهنمای نمایشگاه</h2>
      <div className={styles.documentGrid}>{exhibitionDocuments.map(document=><article className={styles.documentCard} key={document.id}>
        <Download size={25} aria-hidden="true"/><div><h3>{document.title}</h3><p>{document.description}</p></div>
        {document.href ? <a className={styles.secondaryButton} href={document.href} download>دانلود {document.title}</a> : <><button className={styles.secondaryButton} type="button" disabled aria-describedby={`${document.id}-status`}>دانلود {document.title}</button><p className={styles.status} id={`${document.id}-status`}>فایل پس از انتشار در دسترس قرار می‌گیرد.</p></>}
      </article>)}</div>
    </section>

    <section className={styles.registration} aria-labelledby="exhibition-registration-title"><div><h2 id="exhibition-registration-title">برای بازدید از <span className={styles.titleAccent}>ایران مِکس</span> آماده شوید</h2><p>شرایط حضور و اطلاعات بازدید از نمایشگاه را ببینید.</p></div><div><Link className={styles.primaryButton} href="/registration" aria-describedby="exhibition-registration-status">ثبت‌نام رایگان بازدید <ArrowUpLeft size={19} aria-hidden="true"/></Link><p className={styles.status} id="exhibition-registration-status">ثبت‌نام بازدید رایگان است.</p></div></section>
    <div className={styles.boothLink}>برای حضور به‌عنوان غرفه‌دار <Link href="/registration/booth">اطلاعات درخواست غرفه را ببینید <ArrowUpLeft size={17} aria-hidden="true"/></Link></div>
  </main><Footer/></>;
}
