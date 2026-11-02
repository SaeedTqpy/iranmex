import test from 'node:test';
import assert from 'node:assert/strict';
import {buildUtmUrl} from '../lib/utm-builder.mjs';
const origin='https://example.org';
const utm={source:' instagram ',medium:'social',campaign:'پاییز',term:'',content:'story'};
test('builder preserves other query values and replaces old UTM values',()=>{const result=buildUtmUrl(origin,'/exhibition?sort=recent&utm_term=old#top',utm);const url=new URL(result.url);assert.equal(url.pathname,'/exhibition');assert.equal(url.searchParams.get('sort'),'recent');assert.equal(url.searchParams.get('utm_source'),'instagram');assert.equal(url.searchParams.get('utm_campaign'),'پاییز');assert.equal(url.searchParams.has('utm_term'),false);assert.equal(url.hash,'#top');});
test('builder rejects external, administrative and invalid input',()=>{for(const path of ['https://evil.example/','//evil.example/','javascript:alert(1)','/admin/login','/api/pageviews'])assert.ok(buildUtmUrl(origin,path,utm).error);assert.ok(buildUtmUrl(origin,'/',{...utm,campaign:'  '}).error);assert.ok(buildUtmUrl(origin,'/',{...utm,content:'x'.repeat(101)}).error);});
