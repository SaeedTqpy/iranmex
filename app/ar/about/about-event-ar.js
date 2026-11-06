import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, Eye, Leaf, MapPin, Target} from 'lucide-react';
import styles from '../../about-event.module.css';
import AboutPeople from '../../about-people';
import AboutPartnerLogos from '../../about-partner-logos';

const policyCouncil = [
  ['الدكتور گل‌محمدي', 'رئيس المجلس'],
  ['الدكتور صالحي جوزاني', 'نائب رئيس المجلس'],
  ['الدكتورة مژگان كوثري', 'الأمين الأول'],
  ['المهندس مهدي أرباب', 'الأمين الثاني', '/people/mehdi-arbab.webp'],
];

const executiveCouncil = [
  ['مهدي أرباب', 'المدير التنفيذي', '/people/mehdi-arbab.webp'],
  ['المهندس إسحاقي', 'مدير الاتصالات والإعلام'],
  ['الدكتور نوري', 'مدير البرامج العلمية والمحتوى'],
];

function Council({id, title, members}) {
  return (
    <section className={styles.council} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul className={styles.members}>
        {members.map(([name, role, photo]) => (
          <li key={role} className={photo ? styles.memberWithPhoto : undefined}>
            {photo && <img className={styles.memberPhoto} src={photo} alt="" width="600" height="790"/>}
            <div><h3>{name}</h3>
            <p>{role}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

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
          <div><dt>المنظم ومالك العلامة التجارية</dt><dd>آسو بويش داتيس</dd></div>
          <div><dt>شريك استراتيجي</dt><dd>جمعية متسلقي الجبال الإيرانية</dd></div>
          <div><dt>شريك استراتيجي</dt><dd>اتحاد تسلق الجبال والتسلق الرياضي الإيراني</dd></div>
        </dl>
        <AboutPartnerLogos locale="ar"/>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <h2 id="principles-title">الرؤية والرسالة والمسؤولية الاجتماعية</h2>
        <div className={styles.principleGrid}>
          <article><Eye className={styles.principleIcon} aria-hidden="true"/><h3>الرؤية</h3><p>أن نصبح المنصة الوطنية والإقليمية الأكثر موثوقية للارتقاء بصناعات وخدمات الأنشطة الخارجية والسياحة الطبيعية.</p></article>
          <article><Target className={styles.principleIcon} aria-hidden="true"/><h3>الرسالة</h3><p>تعزيز التعاون في منظومة تسلق الجبال، ورفع جودة المعدات المحلية وسلامتها، وتقديم القدرات الوطنية إلى الأسواق العالمية.</p></article>
          <article><Leaf className={styles.principleIcon} aria-hidden="true"/><h3>المسؤولية الاجتماعية</h3><p>رصد البصمة الكربونية للمعرض وحسابها وزراعة الأشجار للمساهمة في حماية النظم البيئية الجبلية القيّمة.</p></article>
        </div>
      </section>

      <div className={styles.councils}>
        <Council id="policy-council-title" title="مجلس السياسات" members={policyCouncil}/>
        <Council id="executive-council-title" title="المجلس التنفيذي" members={executiveCouncil}/>
      </div>

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
