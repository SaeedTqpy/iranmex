'use client';

import {useRef, useState} from 'react';
import {Play} from 'lucide-react';

export default function IntroVideo({locale='fa'}) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(true);

  async function playVideo() {
    try {
      await videoRef.current?.play();
    } catch {
      // Native controls remain available when playback cannot start.
    }
  }

  return <div className="intro-video-player">
    <video ref={videoRef} controls playsInline preload="none" width="1280" height="720" poster="/iranmex-introduction-poster.jpg" aria-labelledby="event-video-title" onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onEnded={() => setPaused(true)}>
      <source src="/iranmex-introduction.mp4" type="video/mp4"/>
      {locale==='en'?'Your browser does not support video playback. ':locale==='ar'?'متصفحك لا يدعم تشغيل الفيديو. ':'مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند. '}<a href="/iranmex-introduction.mp4">{locale==='en'?'Download video':locale==='ar'?'تنزيل الفيديو':'دریافت ویدیو'}</a>
    </video>
    {paused && <button className="intro-video-play" type="button" onClick={playVideo} aria-label={locale==='en'?'Play exhibition introduction video':locale==='ar'?'تشغيل الفيلم التعريفي بالمعرض':'پخش فیلم معرفی نمایشگاه'}><Play size={28} fill="currentColor" aria-hidden="true"/></button>}
  </div>;
}
