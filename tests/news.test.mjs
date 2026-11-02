import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedNews} from '../lib/news.mjs';
import {filterNews,formatNewsDate} from '../lib/news-shared.mjs';

const now=Date.parse('2026-11-01T12:00:00+03:30');
const fixture={slug:'test-article',status:'published',title:'اطلاعیه کوهنوردی',excerpt:'اطلاعات زمان برگزاری',category:'announcement',publishedAt:'2026-10-31T12:00:00+03:30',content:[{type:'paragraph',text:'متن آزمایشی؛ برای آزمون و بدون انتشار.'}]};

test('never exposes drafts or future publication dates',()=>{
  const source=[fixture,{slug:'draft',status:'draft',title:'پیش‌نویس محرمانه'},{...fixture,slug:'future',publishedAt:'2026-12-01T12:00:00+03:30'}];
  const result=publishedNews(source,now);assert.equal(result.length,1);assert.equal(result[0].slug,'test-article');
  assert.equal(publishedNews([],now).length,0);
});

test('rejects broken published articles, duplicate URLs and unsafe source links',()=>{
  assert.throws(()=>publishedNews([fixture,{...fixture}],now),/Duplicate news slug/);
  assert.throws(()=>publishedNews([{...fixture,content:[]}],now),/content is required/);
  assert.throws(()=>publishedNews([{...fixture,source:{url:'javascript:alert(1)',label:'منبع'}}],now),/safe URL/);
  assert.throws(()=>publishedNews([{...fixture,publishedAt:'2026-10-31'}],now),/timezone/);
  assert.throws(()=>publishedNews([{...fixture,content:[{type:'html',text:'<script>unsafe</script>'}]}],now),/unsupported content/);
});

test('orders latest first and searches Persian text with Arabic letter variants',()=>{
  const latest={...fixture,slug:'new',title:'تجهیزات کوهنوردی',publishedAt:'2026-11-01T10:00:00+03:30',category:'news'};
  const posts=publishedNews([fixture,latest],now);
  assert.equal(posts[0].slug,'new');
  assert.equal(filterNews(posts,'كوهنوردي تجهيزات','news')[0].slug,'new');
  assert.equal(filterNews(posts,'','announcement').length,1);
  assert.equal(filterNews(posts,'بدون نتیجه').length,0);
  assert.ok(formatNewsDate(fixture.publishedAt).includes('۱۴۰۵'));
});
