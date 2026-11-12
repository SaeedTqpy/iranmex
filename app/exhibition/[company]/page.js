import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowUpLeft, ExternalLink, Phone, Mail} from 'lucide-react';
import {Header, Footer} from '../../components';
import {getCompany} from '../../../lib/server/company-store.mjs';
export const dynamic='force-dynamic';
import styles from '../styles.module.css';
import {CompanyGallery} from './company-gallery';


export async function generateMetadata({params}) {
  const {company:slug}=await params;
  const company=getCompany(slug);
  return {title:company?`${company.name} | نمایشگاه ایران مِکس`:'مجموعه یافت نشد | ایران مِکس'};
}

export default async function CompanyPage({params}) {
  const {company:slug}=await params;
  const company=getCompany(slug);
  if(!company)notFound();
  const hasContact=company.website||company.phone||company.email;
  return <><Header/><main className={`${styles.page} ${styles.profilePage} company-profile-page`}>
    <section className={styles.profileHero}>
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">خانه</Link><span aria-hidden="true">/</span><Link href="/exhibition">نمایشگاه</Link><span aria-hidden="true">/</span><span aria-current="page">{company.name}</span></nav>
      <div className={styles.profileIdentity}><div><h1>{company.name}</h1>{company.slogan?<p className={styles.profileSlogan} dir="auto">{company.slogan}</p>:<p>معرفی مجموعه در نمایشگاه ایران مِکس</p>}</div><span className={styles.profileLogo}><img src={company.logo} alt={`نشان ${company.name}`} width="240" height="160"/></span></div>
      {company.gallery?.length>0&&<CompanyGallery images={company.gallery} name={company.name}/>}
    </section>
    <div className={styles.profileContent}>
      <div className={styles.profileMain}>
        <section aria-labelledby="company-about-title"><h2 id="company-about-title">درباره مجموعه</h2><p>{company.description||'متن معرفی این مجموعه هنوز ارائه نشده است و پس از دریافت منتشر می‌شود.'}</p></section>
        <section aria-labelledby="company-products-title"><h2 id="company-products-title">محصولات و خدمات</h2>{company.products.length ? <ul className={styles.products}>{company.products.map(product=><li key={product.name}><h3>{product.name}</h3><p>{product.description}</p></li>)}</ul> : <p>فهرست محصولات و خدمات پس از دریافت اطلاعات از مجموعه منتشر می‌شود.</p>}</section>
      </div>
      <section className={styles.contactCard} aria-labelledby="company-contact-title"><h2 id="company-contact-title">راه‌های ارتباطی</h2>
        {hasContact ? <ul>{company.website&&<li><a href={company.website} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} aria-hidden="true"/>وب‌سایت رسمی <span className={styles.visuallyHidden}>(در پنجره جدید)</span></a></li>}{company.phone&&<li><a href={`tel:${company.phone}`}><Phone size={18} aria-hidden="true"/><bdi>{company.phone}</bdi></a></li>}{company.email&&<li><a href={`mailto:${company.email}`}><Mail size={18} aria-hidden="true"/><bdi>{company.email}</bdi></a></li>}</ul> : <p>وب‌سایت و اطلاعات تماس این مجموعه هنوز اعلام نشده است.</p>}
        <Link className={styles.directoryBack} href="/exhibition">بازگشت به فهرست شرکت‌ها <ArrowUpLeft size={18} aria-hidden="true"/></Link>
      </section>
    </div>
  </main><Footer/></>;
}
