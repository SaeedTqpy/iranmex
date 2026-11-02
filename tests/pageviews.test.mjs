import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {recordPageview,pageviewTimeline,tehranDay} from '../lib/server/pageviews.mjs';
import {openAdminStore} from '../lib/server/admin-store.mjs';

test('daily totals use Tehran dates, distinguish unavailable days, and aggregate repeated views',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-views-'));const previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const first=Date.parse('2026-11-01T21:00:00Z');assert.equal(tehranDay(first),'2026-11-02');
 let result=pageviewTimeline(7,first);assert.equal(result.startedAt,null);assert.ok(result.rows.every(row=>row.views===null));
 recordPageview(first);recordPageview(first+1000);recordPageview(Date.parse('2026-11-04T12:00:00Z'));
 result=pageviewTimeline(7,Date.parse('2026-11-04T12:00:00Z'));assert.equal(result.startedAt,first);assert.equal(result.total,3);assert.deepEqual(result.rows.slice(-4).map(x=>x.views),[null,2,0,1]);
 const store=openAdminStore();const columns=store.db.prepare('PRAGMA table_info(pageview_days)').all().map(row=>row.name);store.close();assert.deepEqual(columns,['day','views']);
});

test('UTM combinations are aggregated by day while old totals remain intact',t=>{
 const dir=mkdtempSync(join(tmpdir(),'iranmex-utm-'));const previous=process.env.REGISTRATION_DB_PATH;process.env.REGISTRATION_DB_PATH=join(dir,'db.sqlite');t.after(()=>{if(previous===undefined)delete process.env.REGISTRATION_DB_PATH;else process.env.REGISTRATION_DB_PATH=previous;rmSync(dir,{recursive:true,force:true});});
 const first=Date.parse('2026-11-02T12:00:00Z');const utm={source:' instagram ',medium:'social',campaign:'پاییز',term:'',content:'story'};
 recordPageview(first,utm);recordPageview(first+1,utm);recordPageview(first+2);recordPageview(first+3,{source:'google'});
 const report=pageviewTimeline(7,first+4);assert.equal(report.total,4);assert.equal(report.utmStartedAt,first);assert.equal(report.campaigns.length,2);assert.deepEqual(report.campaigns[0],{source:'instagram',medium:'social',campaign:'پاییز',term:'',content:'story',views:2});
});
