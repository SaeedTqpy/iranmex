'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './styles.module.css';

export default function CompanyList({items}){
  const router=useRouter();
  const busy=useRef(false);
  const [pending,setPending]=useState(false);
  const [message,setMessage]=useState('');
  const [failed,setFailed]=useState(false);
  async function move(slug,direction){
    if(busy.current)return;
    busy.current=true;setPending(true);setMessage('');setFailed(false);
    try{
      const response=await fetch('/api/admin/companies/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,direction,expectedOrder:items.map(item=>item.slug)})});
      const result=await response.json();
      if(!response.ok){setFailed(true);setMessage(result.message||'ذخیره ترتیب انجام نشد.');}
      else setMessage('ترتیب نمایش ذخیره شد.');
      router.refresh();
    }catch{setFailed(true);setMessage('ارتباط با سرور برقرار نشد. صفحه را تازه‌سازی کنید و دوباره تلاش کنید.');}
    finally{busy.current=false;setPending(false);}
  }
  if(!items.length)return <div className={styles.empty}><h2>هنوز مجموعه‌ای ثبت نشده است</h2></div>;
  return <><p role={failed?'alert':'status'} aria-live="polite" className={failed?styles.error:styles.sponsorMessage}>{pending?'در حال ذخیره ترتیب…':message}</p><div className={styles.tableWrap} aria-busy={pending}><table className={styles.table}><thead><tr><th>ردیف</th><th>نام مجموعه</th><th>شناسه</th><th>وضعیت</th><th>ترتیب نمایش</th><th><span className={styles.srOnly}>ویرایش</span></th></tr></thead><tbody>{items.map((item,index)=><tr key={item.slug}><td>{index+1}</td><td>{item.name}</td><td><bdi>{item.slug}</bdi></td><td>{item.status==='published'?'منتشرشده':'پیش‌نویس'}</td><td><div className={styles.companyOrder}>{[['first','انتقال به اول'],['up','بالاتر'],['down','پایین‌تر'],['last','انتقال به آخر']].map(([direction,label])=><button key={direction} type="button" className={styles.secondary} aria-label={label+': '+item.name} disabled={pending||((direction==='first'||direction==='up')?index===0:index===items.length-1)} onClick={()=>move(item.slug,direction)}>{label}</button>)}</div></td><td><Link href={`/admin/companies/${item.slug}`}>ویرایش</Link></td></tr>)}</tbody></table></div></>;
}
