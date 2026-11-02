import {CalendarDays, Clock3, MapPin, Navigation, ExternalLink} from 'lucide-react';
import CopyAddress from './visit-copy-address';
import styles from './visit-details.module.css';

const neshanUrl = 'https://neshan.org/maps/places/e9abdc9985583384af3837718fc8c12f';
const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Parsian+Enghelab+Hotel+Taleghani+Tehran';
const address = 'تهران، خیابان طالقانی، بین ولیعصر و حافظ، هتل پارسیان انقلاب';

export default function VisitDetails({locale='fa'}) {
  if(locale==='en') return <EnglishVisitDetails/>;
  if(locale==='ar') return <ArabicVisitDetails/>;
  return <div className={styles.details}>
    <h2 id="visit-details-title" className={styles.heading}>زمان و مکان نمایشگاه</h2>
    <div className={styles.layout}>
      <div className={styles.information}>
        <div>
          <p className={styles.label}><MapPin size={18} aria-hidden="true"/>محل برگزاری</p>
          <h3 className={styles.hotel}>هتل پارسیان انقلاب</h3>
          <address className={styles.address}>تهران، خیابان طالقانی<br/>بین ولیعصر و حافظ</address>
          <CopyAddress address={address}/>
        </div>
        <div className={styles.directions}>
          <p className={styles.directionsLabel}>مسیر رسیدن به نمایشگاه</p>
          <div className={styles.mapLinks}>
            <a className={styles.primaryLink} href={neshanUrl} target="_blank" rel="noopener noreferrer" aria-label="مسیریابی با نشان به هتل پارسیان انقلاب، در پنجره جدید">
              <Navigation size={19} aria-hidden="true"/>مسیریابی با نشان
            </a>
            <a className={styles.secondaryLink} href={googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label="هتل پارسیان انقلاب در گوگل‌مپ، در پنجره جدید">
              گوگل‌مپ<ExternalLink size={16} aria-hidden="true"/>
            </a>
          </div>
        </div>
        <dl className={styles.schedule}>
          <div>
            <dt><CalendarDays size={17} aria-hidden="true"/>تاریخ بازدید</dt>
            <dd><span className={styles.date}>۱۸ و ۱۹ آذر <span>۱۴۰۵</span></span><span className={styles.weekdays}>چهارشنبه و پنج‌شنبه</span></dd>
          </div>
          <div>
            <dt><Clock3 size={17} aria-hidden="true"/>ساعت بازدید</dt>
            <dd><span className={styles.hours}>۱۲ تا ۲۲</span><span className={styles.weekdays}>در هر دو روز</span></dd>
          </div>
        </dl>
      </div>
      <figure className={styles.photo}>
        <img src="/venue/parsian-enghelab.webp" alt="نمای ساختمان و سردر ورودی هتل پارسیان انقلاب در خیابان طالقانی تهران" width="1440" height="959" loading="lazy" decoding="async"/>
        <figcaption><span>محل دیدار ما</span><strong>هتل پارسیان انقلاب، تهران</strong></figcaption>
      </figure>
    </div>
  </div>;
}

function EnglishVisitDetails(){
  const englishAddress='Parsian Enghelab Hotel, Taleghani Street, between Valiasr and Hafez, Tehran';
  return <div className={styles.details}><h2 id="visit-details-title" className={styles.heading}>When and where</h2><div className={styles.layout}><div className={styles.information}><div><p className={styles.label}><MapPin size={18} aria-hidden="true"/>Venue</p><h3 className={styles.hotel}>Parsian Enghelab Hotel</h3><address className={styles.address}>Taleghani Street, Tehran<br/>Between Valiasr and Hafez</address><CopyAddress address={englishAddress} locale="en"/></div><div className={styles.directions}><p className={styles.directionsLabel}>Directions to the exhibition</p><div className={styles.mapLinks}><a className={styles.primaryLink} href={neshanUrl} target="_blank" rel="noopener noreferrer"><Navigation size={19} aria-hidden="true"/>Directions with Neshan</a><a className={styles.secondaryLink} href={googleMapsUrl} target="_blank" rel="noopener noreferrer">Google Maps<ExternalLink size={16} aria-hidden="true"/></a></div></div><dl className={styles.schedule}><div><dt><CalendarDays size={17} aria-hidden="true"/>Visiting dates</dt><dd><span className={styles.date}>9–10 December 2026</span><span className={styles.weekdays}>Wednesday and Thursday</span></dd></div><div><dt><Clock3 size={17} aria-hidden="true"/>Visiting hours</dt><dd><span className={styles.hours}>12:00–22:00</span><span className={styles.weekdays}>Both days</span></dd></div></dl></div><figure className={styles.photo}><img src="/venue/parsian-enghelab.webp" alt="Exterior and entrance of Parsian Enghelab Hotel on Taleghani Street, Tehran" width="1440" height="959" loading="lazy" decoding="async"/><figcaption><span>Our meeting place</span><strong>Parsian Enghelab Hotel, Tehran</strong></figcaption></figure></div></div>;
}

function ArabicVisitDetails(){
  const englishAddress='فندق بارسيان إنقلاب، شارع طالقاني، بين ولي عصر وحافظ، طهران';
  return <div className={styles.details}><h2 id="visit-details-title" className={styles.heading}>زمان المعرض ومكانه</h2><div className={styles.layout}><div className={styles.information}><div><p className={styles.label}><MapPin size={18} aria-hidden="true"/>المكان</p><h3 className={styles.hotel}>فندق بارسيان إنقلاب</h3><address className={styles.address}>شارع طالقاني، طهران<br/>بين ولي عصر وحافظ</address><CopyAddress address={englishAddress} locale="ar"/></div><div className={styles.directions}><p className={styles.directionsLabel}>كيفية الوصول إلى المعرض</p><div className={styles.mapLinks}><a className={styles.primaryLink} href={neshanUrl} target="_blank" rel="noopener noreferrer"><Navigation size={19} aria-hidden="true"/>المسار عبر نشان</a><a className={styles.secondaryLink} href={googleMapsUrl} target="_blank" rel="noopener noreferrer">خرائط Google<ExternalLink size={16} aria-hidden="true"/></a></div></div><dl className={styles.schedule}><div><dt><CalendarDays size={17} aria-hidden="true"/>تاريخ الزيارة</dt><dd><span className={styles.date}>9–10 ديسمبر 2026</span><span className={styles.weekdays}>الأربعاء والخميس</span></dd></div><div><dt><Clock3 size={17} aria-hidden="true"/>ساعات الزيارة</dt><dd><span className={styles.hours}>12:00–22:00</span><span className={styles.weekdays}>في اليومين</span></dd></div></dl></div><figure className={styles.photo}><img src="/venue/parsian-enghelab.webp" alt="واجهة ومدخل فندق بارسيان إنقلاب في شارع طالقاني بطهران" width="1440" height="959" loading="lazy" decoding="async"/><figcaption><span>مكان لقائنا</span><strong>فندق بارسيان إنقلاب، طهران</strong></figcaption></figure></div></div>;
}
