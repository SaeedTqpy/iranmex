import styles from './about-event.module.css';

export default function CouncilList({items,locale='fa'}){
  return <div className={styles.councils}>{items.map(group=><section className={styles.council} aria-labelledby={`${group.id}-council-title`} key={group.id}><h2 id={`${group.id}-council-title`}>{group.title[locale]||group.title.fa}</h2>{group.members.length>0&&<ul className={styles.members} style={{'--member-columns':Math.min(group.members.length,4)}}>{group.members.map(member=><li key={member.id} className={member.photo?styles.memberWithPhoto:undefined}>{member.photo&&<img className={styles.memberPhoto} src={member.photo} alt="" width="600" height="790"/>}<div><h3 dir="auto">{member.name[locale]||member.name.fa}</h3><p dir="auto">{member.role[locale]||member.role.fa}</p></div></li>)}</ul>}</section>)}</div>;
}
