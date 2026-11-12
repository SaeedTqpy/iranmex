import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, Eye, Leaf, MapPin, Target} from 'lucide-react';
import styles from '../../about-event.module.css';
import AboutPeople from '../../about-people';
import CouncilList from '../../council-list';
import {getCouncils} from '../../../lib/server/council-store.mjs';

export default function ArabicAboutEvent() {
  return (
    <div className={styles.page}>
      <section className={styles.introduction} aria-labelledby="about-intro-title">
        <div>
          <h2 id="about-intro-title">ملتقى وطني لمجتمع الجبال</h2>
          <p>يجمع المعرض الوطني المتخصص لتسلق الجبال والتسلق والأنشطة الخارجية والمعدات والصناعات ذات الصلة العاملين والمصنعين والرواد ومحبي الجبال والطبيعة.</p>
          <p>تهدف الفعالية إلى تعزيز التعاون وعرض أحدث الإنجازات الصناعية والعلمية والارتقاء بالسلامة والمعايير في هذا المجال.</p>
          <dl className={styles.facts}>
            <div><dt><CalendarDays size={20} aria-hidden="true"/>التاريخ</dt><dd>9–10 ديسمبر 2026</dd></div>
            <div><dt><Clock size={20} aria-hidden="true"/>ساعات الزيارة</dt><dd>12:00–22:00</dd></div>
            <div><dt><MapPin size={20} aria-hidden="true"/>المكان</dt><dd>فندق بارسيان إنقلاب، شارع طالقاني، طهران</dd></div>
          </dl>
        </div>
        <img className={styles.logo} src="/iranmex-logo.png" width="1600" height="1053" alt="IRANMEX 2026"/>
      </section>

      <section className={styles.organizers} aria-labelledby="organizers-title">
        <h2 id="organizers-title">المنظم والشركاء الاستراتيجيون</h2>
        <p>تخطط شركة آسو بويش داتيس، مالكة العلامة التجارية إيران مكس، للمعرض وتنظمه بالشراكة الرسمية مع جمعية متسلقي الجبال الإيرانية واتحاد تسلق الجبال والتسلق الرياضي الإيراني، بهدف تقديم أعلى المعايير المهنية والتنفيذية للجمهور.</p>
        <dl className={styles.organizerList}>
          <div><dt>المنظم ومالك العلامة التجارية</dt><dd><img className={styles.organizerLogo} src="/organizers/berc.png" alt="" width="744" height="496" loading="lazy"/>آسو بويش داتيس</dd></div>
          <div><dt>شريك استراتيجي</dt><dd><img className={styles.organizerLogo} src="/organizers/alpine-club.png" alt="" width="171" height="180" loading="lazy"/>جمعية متسلقي الجبال الإيرانية</dd></div>
          <div><dt>شريك استراتيجي</dt><dd><img className={styles.organizerLogo} src="/organizers/mountaineering-federation.png" alt="" width="1371" height="1250" loading="lazy"/>اتحاد تسلق الجبال والتسلق الرياضي الإيراني</dd></div>
        </dl>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <h2 id="principles-title">الرؤية والرسالة والمسؤولية الاجتماعية</h2>
        <div className={styles.principleGrid}>
          <article><Eye className={styles.principleIcon} aria-hidden="true"/><h3>الرؤية</h3><p>أن نصبح المنصة الوطنية والإقليمية الأكثر موثوقية للارتقاء بصناعات وخدمات الأنشطة الخارجية والسياحة الطبيعية.</p></article>
          <article><Target className={styles.principleIcon} aria-hidden="true"/><h3>الرسالة</h3><p>تعزيز التعاون في منظومة تسلق الجبال، ورفع جودة المعدات المحلية وسلامتها، وتقديم القدرات الوطنية إلى الأسواق العالمية.</p></article>
          <article><Leaf className={styles.principleIcon} aria-hidden="true"/><h3>المسؤولية الاجتماعية</h3><p>رصد البصمة الكربونية للمعرض وحسابها وزراعة الأشجار للمساهمة في حماية النظم البيئية الجبلية القيّمة.</p></article>
        </div>
      </section>

      <CouncilList items={getCouncils().items} locale="ar"/>

      <AboutPeople locale="ar"/>

      <section className={styles.registration} aria-labelledby="about-registration-title">
        <div><h2 id="about-registration-title">انضموا إلى إيران مكس</h2><p>أدخلوا بياناتكم في استمارة التسجيل لزيارة المعرض.</p></div>
        <div className={styles.registrationAction}>
          <Link href="/registration" className={styles.registrationLink} aria-describedby="about-registration-status">التسجيل المجاني للزيارة <ArrowUpLeft size={19} aria-hidden="true"/></Link>
          <p id="about-registration-status">تسجيل الزيارة مجاني.</p>
        </div>
      </section>
    </div>
  );
}
