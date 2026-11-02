import Link from 'next/link';
import {requireAdmin} from '../../../../lib/server/admin-request';
import {listCompanies} from '../../../../lib/server/company-store.mjs';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function Companies(){await requireAdmin();const items=listCompanies({admin:true});return <><div className={styles.pageHead}><div><h1>شرکت‌ها و مجموعه‌ها</h1><p>اطلاعات مجموعه‌ها را مدیریت کنید. انتشار به معنی تخصیص غرفه نیست.</p></div><Link className={styles.primary} href="/admin/companies/new">افزودن مجموعه</Link></div>{items.length?<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>نام مجموعه</th><th>شناسه</th><th>وضعیت</th><th><span className={styles.srOnly}>ویرایش</span></th></tr></thead><tbody>{items.map(item=><tr key={item.slug}><td>{item.name}</td><td><bdi>{item.slug}</bdi></td><td>{item.status==='published'?'منتشرشده':'پیش‌نویس'}</td><td><Link href={`/admin/companies/${item.slug}`}>ویرایش</Link></td></tr>)}</tbody></table></div>:<div className={styles.empty}><h2>هنوز مجموعه‌ای ثبت نشده است</h2></div>}</>;}
