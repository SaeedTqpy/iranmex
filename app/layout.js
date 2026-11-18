import './styles.css';
import {Suspense} from 'react';
import PageviewTracker from './pageview-tracker';
export const metadata={title:'ایران مِکس | نمایشگاه کوه‌نوردی و طبیعت‌گردی',description:'نمایشگاه تجهیزات کوه‌نوردی، کمپینگ و طبیعت‌گردی ایران مِکس'};
export default function Layout({children}){return <html lang="fa" dir="rtl"><body><Suspense fallback={null}><PageviewTracker/></Suspense>{children}</body></html>}
