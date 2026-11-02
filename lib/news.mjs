import articles from '../content/news.mjs';
import {readManagedNews} from './server/news-store.mjs';
import {publishedNews as filterPublished} from './news-validation.mjs';
export {categoryLabel,formatNewsDate} from './news-shared.mjs';

export function publishedNews(source,now=Date.now()){return filterPublished(source===undefined?[...articles,...readManagedNews()]:source,now);}
export function findPublishedNews(slug){return publishedNews().find(article=>article.slug===slug);}
