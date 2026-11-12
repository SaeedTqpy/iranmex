import Link from 'next/link';
import {ArrowUpLeft, CalendarDays, Clock, Eye, Leaf, MapPin, Target} from 'lucide-react';
import styles from '../../about-event.module.css';
import AboutPeople from '../../about-people';

const policyCouncil = [
  ['Dr. Gol-Mohammadi', 'Council Chair'],
  ['Dr. Salehi Jozani', 'Vice Chair'],
  ['Dr. Mojgan Kosari', 'First Secretary'],
  ['Eng. Mehdi Arbab', 'Second Secretary', '/people/mehdi-arbab-portrait.webp'],
];

const executiveCouncil = [
  ['Mehdi Arbab', 'Executive Director', '/people/mehdi-arbab-portrait.webp'],
  ['Eng. Eshaghi', 'Director of Communications and Media'],
  ['Dr. Nouri', 'Director of Scientific and Content Programs'],
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

export default function EnglishAboutEvent() {
  return (
    <div className={styles.page}>
      <section className={styles.introduction} aria-labelledby="about-intro-title">
        <div>
          <h2 id="about-intro-title">A national gathering of the mountain community</h2>
          <p>The national specialized exhibition for mountaineering, climbing, outdoor recreation, equipment and related industries brings together professionals, manufacturers, pioneers and enthusiasts of mountains and nature.</p>
          <p>The event aims to encourage collaboration, present the latest industrial and scientific achievements, and improve safety and standards in the field.</p>
          <dl className={styles.facts}>
            <div><dt><CalendarDays size={20} aria-hidden="true"/>Dates</dt><dd>9–10 December 2026</dd></div>
            <div><dt><Clock size={20} aria-hidden="true"/>Visiting hours</dt><dd>12:00–22:00</dd></div>
            <div><dt><MapPin size={20} aria-hidden="true"/>Venue</dt><dd>Parsian Enghelab Hotel, Taleghani Street, Tehran</dd></div>
          </dl>
        </div>
        <img className={styles.logo} src="/iranmex-logo.png" width="1600" height="1053" alt="IRANMEX 2026"/>
      </section>

      <section className={styles.organizers} aria-labelledby="organizers-title">
        <h2 id="organizers-title">Organizer and strategic partners</h2>
        <p>The exhibition is planned and delivered by Aso Puyesh Datis, owner of the IRANMEX brand, in official partnership with the Alpine Club of Iran and the Mountaineering and Sport Climbing Federation of Iran. It aims to provide the audience with the highest professional and operational standards.</p>
        <dl className={styles.organizerList}>
          <div><dt>Organizer and brand owner</dt><dd><img className={styles.organizerLogo} src="/organizers/berc.png" alt="" width="744" height="496" loading="lazy"/>Aso Puyesh Datis</dd></div>
          <div><dt>Strategic partner</dt><dd><img className={styles.organizerLogo} src="/organizers/alpine-club.png" alt="" width="171" height="180" loading="lazy"/>Alpine Club of Iran</dd></div>
          <div><dt>Strategic partner</dt><dd><img className={styles.organizerLogo} src="/organizers/mountaineering-federation.png" alt="" width="1371" height="1250" loading="lazy"/>Mountaineering and Sport Climbing Federation of Iran</dd></div>
        </dl>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <h2 id="principles-title">Vision, mission and social responsibility</h2>
        <div className={styles.principleGrid}>
          <article><Eye className={styles.principleIcon} aria-hidden="true"/><h3>Vision</h3><p>To become the most trusted national and regional platform for advancing outdoor and nature tourism industries and services.</p></article>
          <article><Target className={styles.principleIcon} aria-hidden="true"/><h3>Mission</h3><p>To strengthen collaboration across the mountaineering ecosystem, improve the quality and safety of domestically produced equipment, and present national capabilities to global markets.</p></article>
          <article><Leaf className={styles.principleIcon} aria-hidden="true"/><h3>Social responsibility</h3><p>Monitor and calculate the exhibition’s carbon footprint and plant trees to help protect valuable mountain ecosystems.</p></article>
        </div>
      </section>

      <div className={styles.councils}>
        <Council id="policy-council-title" title="Policy Council" members={policyCouncil}/>
        <Council id="executive-council-title" title="Executive Council" members={executiveCouncil}/>
      </div>

      <AboutPeople locale="en"/>

      <section className={styles.registration} aria-labelledby="about-registration-title">
        <div><h2 id="about-registration-title">Join IRANMEX</h2><p>Enter your details in the registration form to visit the exhibition.</p></div>
        <div className={styles.registrationAction}>
          <Link href="/registration" className={styles.registrationLink} aria-describedby="about-registration-status">Free visitor registration <ArrowUpLeft size={19} aria-hidden="true"/></Link>
          <p id="about-registration-status">Visitor registration is free.</p>
        </div>
      </section>
    </div>
  );
}
