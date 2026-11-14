import Link from 'next/link';
import {requireAdmin} from '../../../../lib/server/admin-request';
import {listCompanies} from '../../../../lib/server/company-store.mjs';
import CompanyList from '../../company-list';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function Companies(){
  await requireAdmin();
  const items=listCompanies({admin:true}).map(({slug,name,status})=>({slug,name,status}));
  return <><div className={styles.pageHead}><div><h1>شرکت‌ها و مجموعه‌ها</h1><p>اطلاعات و ترتیب نمایش مجموعه‌ها را مدیریت کنید. تغییر ترتیب بلافاصله ذخیره می‌شود. انتشار به معنی تخصیص غرفه نیست.</p></div><Link className={styles.primary} href="/admin/companies/new">افزودن مجموعه</Link></div><CompanyList items={items}/></>;
}
