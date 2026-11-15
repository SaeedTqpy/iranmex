import {requireAdmin} from '../../../../lib/server/admin-request';
import {getHeroImages} from '../../../../lib/server/hero-images-store.mjs';
import {HeroImagesEditor} from '../../hero-images-editor';
import styles from '../../styles.module.css';
export const dynamic='force-dynamic';
export default async function HeroImagesPage(){await requireAdmin();return <><div className={styles.pageHead}><div><h1>تصاویر هدر صفحه اصلی</h1><p>تصویر و اندازهٔ نمایش هر لوگو را تنظیم کنید. تغییرات در هر سه زبان اعمال می‌شوند.</p></div></div><HeroImagesEditor initial={getHeroImages()}/></>;}
