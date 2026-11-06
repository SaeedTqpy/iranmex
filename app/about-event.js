import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, Eye, Leaf, MapPin, Target} from 'lucide-react';
import styles from './about-event.module.css';
import AboutPeople from './about-people';
import AboutPartnerLogos from './about-partner-logos';

const policyCouncil = [
  ['دکتر گل‌محمدی', 'رئیس شورا'],
  ['دکتر صالحی جوزانی', 'نایب‌رئیس شورا'],
  ['دکتر مژگان کوثری', 'دبیر اول شورا'],
  ['مهندس مهدی ارباب', 'دبیر دوم شورا', '/people/mehdi-arbab.webp'],
];

const executiveCouncil = [
  ['مهدی ارباب', 'مدیر اجرایی', '/people/mehdi-arbab.webp'],
  ['مهندس اسحاقی', 'مدیر ارتباطات و رسانه'],
  ['دکتر نوری', 'مدیر برنامه‌های علمی و محتوایی'],
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

export default function AboutEvent() {
  return (
    <div className={styles.page}>
      <section className={styles.introduction} aria-labelledby="about-intro-title">
        <div>
          <h2 id="about-intro-title">گردهمایی ملی جامعه کوهستان</h2>
          <p>نمایشگاه تخصصی و ملی کوهنوردی، سنگ‌نوردی و طبیعت‌گردی، تجهیزات و صنایع وابسته، گردهمایی فعالان، تولیدکنندگان، پیشکسوتان و علاقه‌مندان به ارتفاعات و طبیعت است.</p>
          <p>این رویداد با هدف ایجاد هم‌افزایی، معرفی تازه‌ترین دستاوردهای صنعتی و علمی و ارتقای سطح ایمنی و استانداردهای این حوزه برگزار می‌شود.</p>
          <dl className={styles.facts}>
            <div><dt><CalendarDays size={20} aria-hidden="true"/>تاریخ برگزاری</dt><dd>۱۸ و ۱۹ آذر ۱۴۰۵</dd></div>
            <div><dt><Clock size={20} aria-hidden="true"/>ساعت بازدید</dt><dd>۱۲:۰۰ تا ۲۲:۰۰</dd></div>
            <div><dt><MapPin size={20} aria-hidden="true"/>محل برگزاری</dt><dd>تهران، خیابان طالقانی، هتل پارسیان انقلاب</dd></div>
          </dl>
        </div>
        <img className={styles.logo} src="/iranmex-logo.png" width="1600" height="1053" alt="ایران مِکس ۲۰۲۶"/>
      </section>

      <section className={styles.organizers} aria-labelledby="organizers-title">
        <h2 id="organizers-title">برگزارکننده و شرکای استراتژیک</h2>
        <p>این نمایشگاه توسط شرکت آسو پویش داتیس، صاحب برند ایران مِکس، و با مشارکت و همکاری رسمی انجمن کوهنوردان ایران و فدراسیون کوهنوردی و صعودهای ورزشی ایران برنامه‌ریزی و اجرا می‌شود؛ با هدف ارائه بالاترین استاندارد اجرایی و تخصصی به جامعه مخاطب.</p>
        <dl className={styles.organizerList}>
          <div><dt>برگزارکننده و صاحب برند</dt><dd>شرکت آسو پویش داتیس</dd></div>
          <div><dt>همکار و شریک استراتژیک</dt><dd>انجمن کوهنوردان ایران</dd></div>
          <div><dt>همکار و شریک استراتژیک</dt><dd>فدراسیون کوهنوردی و صعودهای ورزشی ایران</dd></div>
        </dl>
        <AboutPartnerLogos locale="fa"/>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <h2 id="principles-title">چشم‌انداز، مأموریت و مسئولیت اجتماعی</h2>
        <div className={styles.principleGrid}>
          <article><Eye className={styles.principleIcon} aria-hidden="true"/><h3>چشم‌انداز</h3><p>تبدیل شدن به معتبرترین بستر ملی و منطقه‌ای برای تعالی صنایع و خدمات حوزه فعالیت‌های فضای باز و طبیعت‌گردی.</p></article>
          <article><Target className={styles.principleIcon} aria-hidden="true"/><h3>مأموریت</h3><p>هم‌افزایی اکوسیستم کوهنوردی، ارتقای کیفیت و ایمنی تجهیزات داخلی و معرفی ظرفیت‌های ملی به بازارهای جهانی.</p></article>
          <article><Leaf className={styles.principleIcon} aria-hidden="true"/><h3>مسئولیت اجتماعی</h3><p>پایش و محاسبه ردپای کربن نمایشگاه و کاشت درخت برای حفاظت از زیست‌بوم ارزشمند کوهستان.</p></article>
        </div>
      </section>

      <div className={styles.councils}>
        <Council id="policy-council-title" title="شورای سیاست‌گذاری" members={policyCouncil}/>
        <Council id="executive-council-title" title="شورای اجرایی" members={executiveCouncil}/>
      </div>

      <AboutPeople locale="fa"/>

      <section className={styles.registration} aria-labelledby="about-registration-title">
        <div><h2 id="about-registration-title">همراه ایران مِکس باشید</h2><p>برای بازدید از نمایشگاه، اطلاعات خود را در فرم ثبت‌نام وارد کنید.</p></div>
        <div className={styles.registrationAction}>
          <Link href="/registration" className={styles.registrationLink} aria-describedby="about-registration-status">ثبت‌نام رایگان بازدید <ArrowUpLeft size={19} aria-hidden="true"/></Link>
          <p id="about-registration-status">ثبت‌نام بازدید رایگان است.</p>
        </div>
      </section>
    </div>
  );
}
