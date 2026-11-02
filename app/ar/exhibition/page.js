import {listCompanies} from '../../../lib/server/company-store.mjs';
export const dynamic='force-dynamic';
import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, MapPin, Download} from 'lucide-react';
import {Header, Footer} from '../../components';
import {exhibitionDocuments} from '../../exhibition/companies';
import styles from '../../exhibition/styles.module.css';

export const metadata={title:'المعرض والشركات | إيران مكس',description:'تعرّفوا إلى الشركات العارضة ومعلومات الزيارة في إيران مكس.'};
const names={'haft-kooh':'هفت كوه','pay-kooh':'بايه كوه','company-015':'شركة قيد التعريف'};
const translations={map:{title:'خريطة المعرض',description:'توزيع الأجنحة ومسارات الزوار'},catalogue:{title:'كتالوج المعرض',description:'معلومات الشركات والمنتجات'}};
const documents=exhibitionDocuments.map(document=>({...document,...translations[document.id]}));

export default function ArabicExhibition(){
  return <div className="arabic-home" lang="ar" dir="rtl"><Header locale="ar"/><main className={`${styles.page} ${styles.directoryPage} exhibition-page`}>
    <section className={styles.hero} aria-labelledby="exhibition-title">
      <nav className={styles.breadcrumb} aria-label="مسار الصفحة"><Link href="/ar">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">المعرض</span></nav>
      <h1 id="exhibition-title">معرض <span className={styles.titleAccent}>إيران مكس</span></h1>
      <p>تعرّفوا إلى الشركات والمصنعين ومقدمي الخدمات في مجال تسلق الجبال والأنشطة الخارجية. اضغطوا على شعار أي شركة للاطلاع على تعريفها ومنتجاتها وطرق التواصل معها.</p>
      <p className="english-page-notice">صفحات الشركات وتسجيل الزوار متاحة حالياً باللغة الفارسية.</p>
      <dl className={styles.facts}><div><dt><CalendarDays size={20} aria-hidden="true"/>التاريخ</dt><dd>9–10 ديسمبر 2026</dd></div><div><dt><Clock size={20} aria-hidden="true"/>ساعات الزيارة</dt><dd>12:00–22:00</dd></div><div><dt><MapPin size={20} aria-hidden="true"/>المكان</dt><dd>فندق بارسيان إنقلاب، شارع طالقاني، طهران</dd></div></dl>
    </section>
    <section className={styles.directory} aria-labelledby="companies-title"><div className={styles.sectionHeading}><h2 id="companies-title">الشركات والمؤسسات</h2><p>الشعارات الواردة في مواد الفعالية؛ تُستكمل تفاصيل الشركات وتُؤكَّد مشاركتها لاحقاً.</p></div><ul className={styles.companyGrid}>{listCompanies().map(company=>{const name=company.legacy && company.updatedAt===0 ? (names[company.slug]||company.name) : company.name;return <li key={company.slug}><Link className={styles.companyCard} href={`/exhibition/${company.slug}`}><span className={styles.logoPanel}><img src={company.logo} alt={`شعار ${name}`} width="200" height="130"/></span><span className={styles.companyName}>{name}</span><span className={styles.cardAction}>عرض معلومات الشركة <ArrowUpLeft size={17} aria-hidden="true"/></span></Link></li>})}</ul></section>
    <section className={styles.documents} aria-labelledby="exhibition-documents-title"><h2 id="exhibition-documents-title">دليل المعرض</h2><div className={styles.documentGrid}>{documents.map(document=><article className={styles.documentCard} key={document.id}><Download size={25} aria-hidden="true"/><div><h3>{document.title}</h3><p>{document.description}</p></div>{document.href ? <a className={styles.secondaryButton} href={document.href} download>تنزيل {document.title}</a> : <><button className={styles.secondaryButton} type="button" disabled aria-describedby={`${document.id}-status`}>تنزيل {document.title}</button><p className={styles.status} id={`${document.id}-status`}>سيُتاح الملف بعد نشره.</p></>}</article>)}</div></section>
    <section className={styles.registration} aria-labelledby="exhibition-registration-title"><div><h2 id="exhibition-registration-title">استعدوا لزيارة <span className={styles.titleAccent}>IRANMEX</span></h2><p>اطلعوا على شروط المشاركة ومعلومات زيارة المعرض.</p></div><div><Link className={styles.primaryButton} href="/registration" aria-describedby="exhibition-registration-status">التسجيل المجاني للزيارة <ArrowUpLeft size={19} aria-hidden="true"/></Link><p className={styles.status} id="exhibition-registration-status">تسجيل الزيارة مجاني.</p></div></section>
    <div className={styles.boothLink}>للمشاركة بصفة عارض، <Link href="/ar/registration/booth">اطلعوا على معلومات طلب الجناح <ArrowUpLeft size={17} aria-hidden="true"/></Link></div>
  </main><Footer locale="ar"/></div>;
}
