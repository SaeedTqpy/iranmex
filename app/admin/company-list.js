'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './styles.module.css';

export default function CompanyList({items}){
  const router=useRouter();
  const [rows,setRows]=useState(items),[pending,setPending]=useState(false),[preview,setPreview]=useState(null),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
  const rowsRef=useRef(items),tableRef=useRef(null),drag=useRef(null),frame=useRef(null),busy=useRef(false);
  function showRows(next){rowsRef.current=next;setRows(next);}
  useEffect(()=>{if(!busy.current&&!drag.current){rowsRef.current=items;setRows(items);}},[items]);
  function cancelDrag(){
    const active=drag.current;if(!active)return;
    drag.current=null;cancelAnimationFrame(frame.current);showRows(active.original);setPreview(null);setMessage('جابه‌جایی لغو شد.');
  }
  useEffect(()=>{
    const escape=event=>{if(event.key==='Escape'&&drag.current){event.preventDefault();cancelDrag();}};
    const blur=()=>cancelDrag();
    const move=event=>{const active=drag.current;if(active&&active.pointerId===event.pointerId){event.preventDefault();active.x=event.clientX;active.y=event.clientY;}};
    const cancel=event=>{if(drag.current?.pointerId===event.pointerId)cancelDrag();};
    window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',cancel);
    window.addEventListener('keydown',escape);window.addEventListener('blur',blur);
    return ()=>{window.removeEventListener('keydown',escape);window.removeEventListener('blur',blur);cancelAnimationFrame(frame.current);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',cancel);};
  },[]);
  async function save(original,slug,targetIndex){
    if(busy.current||original.findIndex(item=>item.slug===slug)===targetIndex)return;
    busy.current=true;setPending(true);setFailed(false);setMessage('در حال ذخیره ترتیب…');
    try{
      const response=await fetch('/api/admin/companies/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,direction:'position',targetIndex,expectedOrder:original.map(item=>item.slug)})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.message||'ذخیره ترتیب انجام نشد.');
      setMessage('ترتیب نمایش ذخیره شد.');
    }catch(error){showRows(original);setFailed(true);setMessage(error.message||'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');}
    finally{busy.current=false;setPending(false);router.refresh();}
  }
  function tick(){
    const active=drag.current;if(!active)return;
    const edge=64;
    const speed=active.y<edge?-Math.min(16,(edge-active.y)/3):active.y>window.innerHeight-edge?Math.min(16,(active.y-window.innerHeight+edge)/3):0;
    if(speed)window.scrollBy(0,speed);
    const pageY=active.y+window.scrollY;let target=0;
    active.centers.forEach((center,index)=>{if(Math.abs(center-pageY)<Math.abs(active.centers[target]-pageY))target=index;});
    if(active.target!==target){
      active.target=target;const next=[...active.original];const [item]=next.splice(next.findIndex(item=>item.slug===active.slug),1);next.splice(target,0,item);showRows(next);
    }
    setPreview(previous=>previous&&previous.y===active.y&&previous.x===active.x&&previous.target===target?previous:{slug:active.slug,name:active.name,x:active.x,y:active.y,target});
    frame.current=requestAnimationFrame(tick);
  }
  function start(event,item){
    if(busy.current||drag.current||rowsRef.current.length<2||!event.isPrimary||event.button!==0)return;
    event.preventDefault();
    const original=rowsRef.current;
    const centers=Array.from(tableRef.current.querySelectorAll('tbody tr')).map(row=>{const box=row.getBoundingClientRect();return box.top+window.scrollY+box.height/2;});
    drag.current={slug:item.slug,name:item.name,original,centers,target:original.findIndex(row=>row.slug===item.slug),pointerId:event.pointerId,x:event.clientX,y:event.clientY};
    setFailed(false);setMessage('ردیف را جابه‌جا کنید؛ با رها کردن ذخیره می‌شود.');tick();
  }
  function finish(event){
    const active=drag.current;if(!active||active.pointerId!==event.pointerId)return;
    const pageY=event.clientY+window.scrollY;
    let target=0;active.centers.forEach((center,index)=>{if(Math.abs(center-pageY)<Math.abs(active.centers[target]-pageY))target=index;});
    active.target=target;
    const next=[...active.original];const [moved]=next.splice(next.findIndex(item=>item.slug===active.slug),1);next.splice(target,0,moved);showRows(next);
    drag.current=null;cancelAnimationFrame(frame.current);setPreview(null);
    if(active.target===active.original.findIndex(item=>item.slug===active.slug)){setMessage('ترتیب تغییری نکرد.');return;}
    save(active.original,active.slug,active.target);
  }
  function keyboard(event,item,index){
    if(busy.current||drag.current||!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();
    const target=event.key==='Home'?0:event.key==='End'?rowsRef.current.length-1:Math.max(0,Math.min(rowsRef.current.length-1,index+(event.key==='ArrowUp'?-1:1)));
    if(target===index)return;
    const original=rowsRef.current,next=[...original];const [moved]=next.splice(index,1);next.splice(target,0,moved);showRows(next);save(original,item.slug,target);
  }
  if(!rows.length)return <div className={styles.empty}><h2>هنوز مجموعه‌ای ثبت نشده است</h2></div>;
  return <>
    <p id="company-order-help" className={styles.orderHelp}>برای تغییر ترتیب، دستگیرهٔ سه‌خطی کنار شرکت را بگیرید و بالا یا پایین بکشید. ترتیب پس از رها کردن ذخیره می‌شود.<span className={styles.srOnly}>با صفحه‌کلید: کلیدهای بالا و پایین برای جابه‌جایی، Home برای اول و End برای آخر. Escape برای لغو کشیدن.</span></p>
    <p role={failed?'alert':'status'} aria-live="polite" className={failed?styles.error:styles.orderStatus}>{message}</p>
    <div className={styles.tableWrap} aria-busy={pending}><table ref={tableRef} className={styles.table}><thead><tr><th><span className={styles.srOnly}>جابه‌جایی</span></th><th>نام مجموعه</th><th>شناسه</th><th>وضعیت</th><th><span className={styles.srOnly}>ویرایش</span></th></tr></thead><tbody>{rows.map((item,index)=><tr key={item.slug} className={preview?.slug===item.slug?styles.draggingRow:undefined}>
      <td className={styles.handleCell}><button type="button" className={styles.dragHandle} disabled={pending||rows.length<2} aria-label={'تغییر ترتیب '+item.name+'، ردیف '+(index+1)+' از '+rows.length} aria-describedby="company-order-help" onPointerDown={event=>start(event,item)} onKeyDown={event=>keyboard(event,item,index)}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button></td>
      <td>{item.name}</td><td><bdi>{item.slug}</bdi></td><td>{item.status==='published'?'منتشرشده':'پیش‌نویس'}</td><td><Link href={`/admin/companies/${item.slug}`}>ویرایش</Link></td>
    </tr>)}</tbody></table></div>
    {preview&&<div aria-hidden="true" className={styles.dragPreview} style={{top:Math.max(8,Math.min(preview.y+18,window.innerHeight-64)),left:Math.max(8,Math.min(preview.x-120,window.innerWidth-248))}}><span>☰</span><strong>{preview.name}</strong><small>ردیف {preview.target+1}</small></div>}
  </>;
}
