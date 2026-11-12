import {requireAdmin} from '../../../../lib/server/admin-request';
import {getMountainTalks} from '../../../../lib/server/mountain-talk-store.mjs';
import {MountainTalkEditor} from '../../mountain-talk-editor';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function MountainTalkPage(){await requireAdmin();const data=getMountainTalks();return <><div className={styles.pageHead}><div><h1>سخنرانان Mountain Talk</h1><p>پوسترها و ترتیب نمایش آن‌ها را در صفحه اصلی مدیریت کنید.</p></div></div><MountainTalkEditor initial={data}/></>;}
