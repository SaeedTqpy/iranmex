import {requireAdmin} from '../../../../lib/server/admin-request';
import {getIntroVideo} from '../../../../lib/server/intro-video-store.mjs';
import IntroVideoEditor from '../../intro-video-editor';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function IntroVideoPage(){
  await requireAdmin();
  return <><div className={styles.pageHead}><div><h1>کلیپ معرفی سایت</h1><p>کلیپ صفحه اصلی را بارگذاری، جایگزین یا حذف کنید. تغییرات در هر سه زبان سایت نمایش داده می‌شوند.</p></div></div><IntroVideoEditor initial={getIntroVideo()}/></>;
}
