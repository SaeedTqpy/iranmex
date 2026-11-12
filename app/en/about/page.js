import Link from 'next/link';
import {Header, Footer} from '../../components';
import EnglishAboutEvent from './about-event-en';
export const dynamic='force-dynamic';

export const metadata={title:'About IRANMEX | IRANMEX',description:'Learn about the IRANMEX exhibition, its organizers, vision and councils.'};

export default function EnglishAboutPage(){
  return <div className="english-home english-about" lang="en" dir="ltr"><Header locale="en"/><main className="about-page"><section className="inner-hero inner-about"><div className="inner-hero-content"><div className="breadcrumb"><Link href="/en">Home</Link><span>/</span>About the event</div><span className="eyebrow">About the event</span><h1>About IRANMEX</h1><p>The national specialized exhibition for mountaineering, climbing, outdoor recreation, equipment and related industries</p></div><span className="inner-number">IRANMEX<br/>EXPO</span></section><EnglishAboutEvent/></main><Footer locale="en"/></div>;
}
