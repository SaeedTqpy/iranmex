import Link from 'next/link';
import {Header, Footer} from '../../components';
import ArabicAboutEvent from './about-event-ar';
export const dynamic='force-dynamic';
export const metadata={title:'عن إيران مكس | إيران مكس',description:'تعرّفوا إلى معرض إيران مكس ومنظميه ورؤيته ومجالسه.'};
export default function ArabicAboutPage(){return <div className="arabic-home" lang="ar" dir="rtl"><Header locale="ar"/><main className="about-page"><section className="inner-hero inner-about"><div className="inner-hero-content"><div className="breadcrumb"><Link href="/ar">الرئيسية</Link><span aria-hidden="true">/</span>عن المعرض</div><span className="eyebrow">عن المعرض</span><h1>عن إيران مكس</h1><p>المعرض الوطني المتخصص لتسلق الجبال والتسلق والأنشطة الخارجية والمعدات والصناعات ذات الصلة</p></div><span className="inner-number">IRANMEX<br/>EXPO</span></section><ArabicAboutEvent/></main><Footer locale="ar"/></div>}
