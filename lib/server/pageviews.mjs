import {openAdminStore} from './admin-store.mjs';
import {normalizeUtm} from '../utm.mjs';
const dayFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'});
export function tehranDay(now=Date.now()){return dayFormatter.format(new Date(now));}
export function recordPageview(now=Date.now(),utm=null){
  const campaign=normalizeUtm(utm);const store=openAdminStore();try{store.db.transaction(()=>{
    const day=tehranDay(now);store.db.prepare('INSERT OR IGNORE INTO pageview_meta(id,started_at) VALUES (1,?)').run(now);
    store.db.prepare('INSERT OR IGNORE INTO pageview_utm_meta(id,started_at) VALUES (1,?)').run(now);
    store.db.prepare('INSERT INTO pageview_days(day,views) VALUES (?,1) ON CONFLICT(day) DO UPDATE SET views=views+1').run(day);
    if(campaign){const values=[day,campaign.source,campaign.medium,campaign.campaign,campaign.term,campaign.content];const existing=store.db.prepare('SELECT 1 FROM pageview_utm_days WHERE day=? AND source=? AND medium=? AND campaign=? AND term=? AND content=?').get(...values);const count=existing?0:store.db.prepare('SELECT COUNT(*) AS n FROM pageview_utm_days WHERE day=?').get(day).n;if(existing||count<5000)store.db.prepare('INSERT INTO pageview_utm_days(day,source,medium,campaign,term,content,views) VALUES (?,?,?,?,?,?,1) ON CONFLICT(day,source,medium,campaign,term,content) DO UPDATE SET views=views+1').run(...values);}
  }).immediate();}finally{store.close();}
}
export function pageviewTimeline(days=30,now=Date.now()){
  if(![7,30,90].includes(days))days=30;
  const store=openAdminStore();try{
    const started=store.db.prepare('SELECT started_at FROM pageview_meta WHERE id=1').get()?.started_at??null;
    const utmStartedAt=store.db.prepare('SELECT started_at FROM pageview_utm_meta WHERE id=1').get()?.started_at??null;
    const today=tehranDay(now);const end=new Date(`${today}T00:00:00Z`);const start=new Date(end.getTime()-(days-1)*86400000);const from=start.toISOString().slice(0,10);
    const counts=new Map(store.db.prepare('SELECT day,views FROM pageview_days WHERE day BETWEEN ? AND ?').all(from,today).map(row=>[row.day,row.views]));
    const firstDay=started===null?null:tehranDay(started);
    const rows=Array.from({length:days},(_,i)=>{const day=new Date(start.getTime()+i*86400000).toISOString().slice(0,10);return {day,views:firstDay&&day>=firstDay?(counts.get(day)||0):null};});
    const campaigns=store.db.prepare('SELECT source,medium,campaign,term,content,SUM(views) AS views FROM pageview_utm_days WHERE day BETWEEN ? AND ? GROUP BY source,medium,campaign,term,content ORDER BY views DESC,source,medium,campaign,term,content LIMIT 100').all(from,today);
    return {rows,startedAt:started,total:rows.reduce((sum,row)=>sum+(row.views??0),0),utmStartedAt,campaigns};
  }finally{store.close();}
}
