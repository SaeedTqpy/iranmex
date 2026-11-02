import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdmin} from '../../../../../lib/server/admin-request';
import {getCompany} from '../../../../../lib/server/company-store.mjs';
import {CompanyEditor} from '../../../company-editor';
import styles from '../../../styles.module.css';
export const dynamic='force-dynamic';
export default async function EditCompany({params}){await requireAdmin();const {slug}=await params;const company=getCompany(slug,{admin:true});if(!company)notFound();return <><div className={styles.pageHead}><div><Link className={styles.backLink} href="/admin/companies">بازگشت به شرکت‌ها</Link><h1>ویرایش مجموعه</h1><p>{company.status==='published'?'این مجموعه در سایت نمایش داده می‌شود.':'این مجموعه پیش‌نویس است.'}</p></div>{company.status==='published'&&<Link className={styles.secondary} href={`/exhibition/${company.slug}`} target="_blank">مشاهده در سایت</Link>}</div><CompanyEditor company={company}/></>;}
