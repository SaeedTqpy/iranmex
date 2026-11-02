'use client';

import {useState} from 'react';
import {Check, Copy} from 'lucide-react';
import styles from './visit-details.module.css';

export default function CopyAddress({address,locale='fa'}) {
  const [status, setStatus] = useState('idle');

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return <div className={styles.copyAddress}>
    <button type="button" className={styles.copyButton} onClick={copyAddress}>
      {status === 'copied' ? <Check size={15} aria-hidden="true"/> : <Copy size={15} aria-hidden="true"/>}
      {status === 'copied' ? (locale==='en'?'Address copied':locale==='ar'?'تم نسخ العنوان':'آدرس کپی شد') : (locale==='en'?'Copy address':locale==='ar'?'نسخ العنوان':'کپی آدرس')}
    </button>
    <span className={status === 'error' ? styles.copyError : styles.srOnly} role="status">
      {status === 'error' ? (locale==='en'?'Copy failed; select and copy the address above.':locale==='ar'?'تعذّر النسخ؛ يرجى تحديد العنوان أعلاه ونسخه.':'کپی انجام نشد؛ آدرس بالا را انتخاب و کپی کنید.') : status === 'copied' ? (locale==='en'?'Parsian Enghelab Hotel address copied.':locale==='ar'?'تم نسخ عنوان فندق بارسيان إنقلاب.':'آدرس هتل پارسیان انقلاب کپی شد.') : ''}
    </span>
  </div>;
}
