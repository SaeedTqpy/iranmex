import {newsCategories} from './news-shared.mjs';

function validateArticle(article) {
  const label=article.slug||'بدون شناسه';
  const fail=message=>{throw new Error(`Invalid news article (${label}): ${message}`);};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug||''))fail('slug must contain lowercase Latin letters, digits and hyphens');
  for(const key of ['title','excerpt'])if(typeof article[key]!=='string'||!article[key].trim())fail(`${key} is required`);
  if(!newsCategories.some(category=>category.id===article.category))fail('unknown category');
  if(typeof article.publishedAt!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(article.publishedAt)||!Number.isFinite(Date.parse(article.publishedAt)))fail('publishedAt needs an ISO date with timezone');
  if(article.author!==undefined&&(typeof article.author!=='string'||!article.author.trim()))fail('author must be non-empty text');
  if(!Array.isArray(article.content)||!article.content.length)fail('content is required');
  for(const block of article.content) {
    if(['paragraph','heading'].includes(block.type)){if(typeof block.text!=='string'||!block.text.trim())fail('empty content block');}
    else if(block.type==='list'){if(!Array.isArray(block.items)||!block.items.length||block.items.some(item=>typeof item!=='string'||!item.trim()))fail('invalid list');}
    else fail('unsupported content block');
  }
  if(article.image&&(!article.image.src?.startsWith('/news/')||!article.image.alt?.trim()||!Number.isInteger(article.image.width)||article.image.width<1||!Number.isInteger(article.image.height)||article.image.height<1))fail('image requires a local /news/ path, alt text and dimensions');
  if(article.source){try {const url=new URL(article.source.url);if(!['https:','http:'].includes(url.protocol)||url.username||url.password||!article.source.label?.trim())throw new Error();}catch{fail('source requires a safe URL and label');}}
}

export function publishedNews(source=[],now=Date.now()) {
  const published=source.filter(article=>article.status==='published');
  const slugs=new Set();
  for(const article of published){validateArticle(article);if(slugs.has(article.slug))throw new Error(`Duplicate news slug: ${article.slug}`);slugs.add(article.slug);}
  return published.filter(article=>Date.parse(article.publishedAt)<=now).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.slug.localeCompare(b.slug));
}

