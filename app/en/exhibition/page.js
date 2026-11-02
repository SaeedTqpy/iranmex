import {listCompanies} from '../../../lib/server/company-store.mjs';
export const dynamic='force-dynamic';
import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, MapPin, Download} from 'lucide-react';
import {Header, Footer} from '../../components';
import {exhibitionDocuments} from '../../exhibition/companies';
import styles from '../../exhibition/styles.module.css';

export const metadata={title:'Exhibition and Companies | IRANMEX',description:'Explore IRANMEX exhibitors and visitor information.'};
const names={'haft-kooh':'Haft Kooh','pay-kooh':'Paye Kooh','company-015':'Company pending identification'};
const translations={map:{title:'Exhibition map',description:'Booth layout and visitor routes'},catalogue:{title:'Exhibition catalogue',description:'Company and product information'}};
const documents=exhibitionDocuments.map(document=>({...document,...translations[document.id]}));

export default function EnglishExhibition(){
  return <div className="english-home english-exhibition" lang="en" dir="ltr"><Header locale="en"/><main className={`${styles.page} ${styles.directoryPage} exhibition-page`}>
    <section className={styles.hero} aria-labelledby="exhibition-title">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/en">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Exhibition</span></nav>
      <h1 id="exhibition-title"><span className={styles.titleAccent}>IRANMEX</span> Exhibition</h1>
      <p>Discover companies, manufacturers and service providers in mountaineering and outdoor activities. Select a logo to view the company’s profile, products and contact information.</p>
      <p className="english-page-notice">Company profiles and visitor registration are currently available in Persian.</p>
      <dl className={styles.facts}><div><dt><CalendarDays size={20} aria-hidden="true"/>Dates</dt><dd>9–10 December 2026</dd></div><div><dt><Clock size={20} aria-hidden="true"/>Visiting hours</dt><dd>12:00–22:00</dd></div><div><dt><MapPin size={20} aria-hidden="true"/>Venue</dt><dd>Parsian Enghelab Hotel, Taleghani Street, Tehran</dd></div></dl>
    </section>
    <section className={styles.directory} aria-labelledby="companies-title"><div className={styles.sectionHeading}><h2 id="companies-title">Companies and organizations</h2><p>Logos presented in the event materials; participation and company details will be finalized after confirmation.</p></div><ul className={styles.companyGrid}>{listCompanies().map(company=>{const name=company.legacy && company.updatedAt===0 ? (names[company.slug]||company.name) : company.name;return <li key={company.slug}><Link className={styles.companyCard} href={`/exhibition/${company.slug}`}><span className={styles.logoPanel}><img src={company.logo} alt={`${name} logo`} width="200" height="130"/></span><span className={styles.companyName}>{name}</span><span className={styles.cardAction}>View company information <ArrowUpLeft size={17} aria-hidden="true"/></span></Link></li>})}</ul></section>
    <section className={styles.documents} aria-labelledby="exhibition-documents-title"><h2 id="exhibition-documents-title">Exhibition guide</h2><div className={styles.documentGrid}>{documents.map(document=><article className={styles.documentCard} key={document.id}><Download size={25} aria-hidden="true"/><div><h3>{document.title}</h3><p>{document.description}</p></div>{document.href ? <a className={styles.secondaryButton} href={document.href} download>Download {document.title}</a> : <><button className={styles.secondaryButton} type="button" disabled aria-describedby={`${document.id}-status`}>Download {document.title}</button><p className={styles.status} id={`${document.id}-status`}>The file will be available once published.</p></>}</article>)}</div></section>
    <section className={styles.registration} aria-labelledby="exhibition-registration-title"><div><h2 id="exhibition-registration-title">Get ready to visit <span className={styles.titleAccent}>IRANMEX</span></h2><p>View visitor information and participation details.</p></div><div><Link className={styles.primaryButton} href="/registration" aria-describedby="exhibition-registration-status">Free visitor registration <ArrowUpLeft size={19} aria-hidden="true"/></Link><p className={styles.status} id="exhibition-registration-status">Visitor registration is free.</p></div></section>
    <div className={styles.boothLink}>Interested in exhibiting? <Link href="/en/registration/booth">View booth request information <ArrowUpLeft size={17} aria-hidden="true"/></Link></div>
  </main><Footer locale="en"/></div>;
}
