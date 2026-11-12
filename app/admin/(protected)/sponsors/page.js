import {requireAdmin} from '../../../../lib/server/admin-request';
import {getSponsors} from '../../../../lib/server/sponsor-store.mjs';
import {SponsorsEditor} from '../../sponsors-editor';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function SponsorsPage(){await requireAdmin();const data=getSponsors();return <><div className={styles.pageHead}><div><h1>حامیان و شرکا</h1><p>نشان‌ها را برای صفحه اصلی مدیریت کنید. تغییرات پس از ذخیره در هر سه زبان نمایش داده می‌شوند.</p></div></div><SponsorsEditor initial={data}/></>;}
