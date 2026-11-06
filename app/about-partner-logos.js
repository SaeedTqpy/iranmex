import styles from './about-event.module.css';

const logos = [
  {src: '/organizers/mountaineering-federation.png', width: 1371, height: 1250, alt: {fa: 'فدراسیون کوهنوردی و صعودهای ورزشی جمهوری اسلامی ایران', en: 'Mountaineering and Sport Climbing Federation of Iran', ar: 'اتحاد تسلق الجبال والتسلق الرياضي الإيراني'}},
  {src: '/organizers/mountain-supporter.png', width: 84, height: 64, small: true, alt: {fa: 'نشان حامی کوهستان', en: 'Mountain supporter logo', ar: 'شعار داعم جبلي'}},
  {src: '/organizers/iran-mountain-medicine.png', width: 1874, height: 1045, alt: {fa: 'ایران مانتین مدیسین', en: 'Iran Mountain Medicine', ar: 'إيران ماونتن ميديسين'}},
  {src: '/organizers/tourism-association.png', width: 512, height: 512, alt: {fa: 'نشان انجمن صنفی گردشگری', en: 'Tourism trade association logo', ar: 'شعار الجمعية المهنية للسياحة'}},
];

const headings = {
  fa: 'حامیان و شرکای استراتژیک ایران مِکس',
  en: 'IRANMEX sponsors and strategic partners',
  ar: 'رعاة إيران مكس وشركاؤه الاستراتيجيون',
};

export default function AboutPartnerLogos({locale = 'fa'}) {
  return <div className={styles.partnerGallery}>
    <h3>{headings[locale]}</h3>
    <ul className={styles.partnerLogos}>
      {logos.map(({src, width, height, small, alt}) => <li key={src}>
        <img className={small ? styles.partnerSmallLogo : undefined} src={src} alt={alt[locale]} width={width} height={height} loading="lazy" decoding="async"/>
      </li>)}
    </ul>
  </div>;
}
