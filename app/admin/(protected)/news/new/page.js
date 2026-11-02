import Link from 'next/link';
import {requireAdmin} from '../../../../../lib/server/admin-request';
import {NewsEditor} from '../../../admin-ui';
import styles from '../../../styles.module.css';
export const dynamic='force-dynamic';
export default async function NewNews(){await requireAdmin();return <><div className={styles.pageHead}><div><Link className={styles.backLink} href="/admin/news">بازگشت به خبرها</Link><h1>نوشتن خبر جدید</h1><p>با انتخاب «پیش‌نویس»، خبر فقط در پنل قابل مشاهده خواهد بود.</p></div></div><NewsEditor/></>;}
