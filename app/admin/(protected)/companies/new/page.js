import Link from 'next/link';
import {requireAdmin} from '../../../../../lib/server/admin-request';
import {CompanyEditor} from '../../../company-editor';
import styles from '../../../styles.module.css';
export const dynamic='force-dynamic';
export default async function NewCompany(){await requireAdmin();return <><div className={styles.pageHead}><div><Link className={styles.backLink} href="/admin/companies">بازگشت به شرکت‌ها</Link><h1>افزودن مجموعه</h1><p>پیش‌نویس فقط در پنل نمایش داده می‌شود.</p></div></div><CompanyEditor/></>;}
