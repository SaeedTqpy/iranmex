export const newsCategories=[
  {id:'news',label:'اخبار'},
  {id:'announcement',label:'اطلاعیه‌ها'},
  {id:'press',label:'آگهی‌های خبری'},
];

export function categoryLabel(id){return newsCategories.find(category=>category.id===id)?.label||'اخبار';}
export function formatNewsDate(date){return new Intl.DateTimeFormat('fa-IR',{dateStyle:'long',timeZone:'Asia/Tehran'}).format(new Date(date));}

export function normalizeNewsQuery(text){return text.normalize('NFKC').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[\s\u200c]+/g,' ').trim().toLocaleLowerCase('fa-IR');}

export function filterNews(items,query,category='all') {
  const words=normalizeNewsQuery(query).split(' ').filter(Boolean);
  return items.filter(item=>(category==='all'||item.category===category)&&words.every(word=>normalizeNewsQuery(item.title+' '+item.excerpt).includes(word)));
}
