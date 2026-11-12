import {requireAdmin} from '../../../../lib/server/admin-request';
import {getCouncils} from '../../../../lib/server/council-store.mjs';
import {CouncilsEditor} from '../../councils-editor';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function CouncilsPage(){await requireAdmin();const data=getCouncils();return <><div className={styles.pageHead}><div><h1>شوراها و اعضا</h1><p>عنوان شوراها و اطلاعات اعضا در صفحه درباره رویداد را مدیریت کنید.</p></div></div><CouncilsEditor initial={data}/></>;}
