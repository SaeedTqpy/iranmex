import styles from './about-event.module.css';

const people = [
  {photo: '/people/mehdi-kasebian.jpg', width: 807, height: 1062, names: {fa: 'مهدی کاسبیان', en: 'Mehdi Kasebian', ar: 'مهدي كاسبيان'}},
  {photo: '/people/abbas-mohammadi.jpg', width: 795, height: 1060, names: {fa: 'عباس محمدی', en: 'Abbas Mohammadi', ar: 'عباس محمدي'}},
  {photo: '/people/reza-zarei.jpg', width: 805, height: 1067, names: {fa: 'دکتر رضا زارعی', en: 'Dr. Reza Zarei', ar: 'الدكتور رضا زارعي'}},
  {photo: '/people/hamid-mosaedyan.jpg', width: 807, height: 1062, names: {fa: 'حمید مساعدیان', en: 'Hamid Mosaedyan', ar: 'حميد مساعديان'}},
];

const headings = {fa: 'چهره‌ها', en: 'People', ar: 'الشخصيات'};

export default function AboutPeople({locale = 'fa'}) {
  return <section className={styles.people} aria-labelledby="about-people-title">
    <h2 id="about-people-title">{headings[locale]}</h2>
    <ul className={styles.peopleGrid}>
      {people.map(({photo, width, height, names}) => <li key={photo}>
        <img src={photo} alt="" width={width} height={height} loading="lazy" decoding="async"/>
        <h3>{names[locale]}</h3>
      </li>)}
    </ul>
  </section>;
}
