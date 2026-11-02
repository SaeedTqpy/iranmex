import {recordPageview} from '../../../lib/server/pageviews.mjs';
import {normalizeUtm} from '../../../lib/utm.mjs';
export const runtime='nodejs';
export async function POST(request){
  const origin=process.env.APP_ORIGIN||new URL(request.url).origin;
  if(request.headers.get('origin')!==origin||!['same-origin','none',null].includes(request.headers.get('sec-fetch-site')))return new Response(null,{status:403,headers:{'Cache-Control':'no-store'}});
  let bytes=0,chunks=[];const reader=request.body?.getReader();
  try{if(reader)while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096){await reader.cancel();return new Response(null,{status:413,headers:{'Cache-Control':'no-store'}});}chunks.push(value);}
    let utm=null;if(bytes){const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!data||typeof data!=='object'||Array.isArray(data)||!data.utm||(utm=normalizeUtm(data.utm))===null)return new Response(null,{status:400,headers:{'Cache-Control':'no-store'}});}
    recordPageview(Date.now(),utm);return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
  }catch(error){if(error instanceof SyntaxError)return new Response(null,{status:400,headers:{'Cache-Control':'no-store'}});console.error('Pageview recording unavailable.');return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}});}
}
