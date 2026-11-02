import {isIP} from 'node:net';

export function normalizeClientAddress(value){
  if(typeof value!=='string'||value.length>45||value.includes('%'))return null;
  const address=value.trim();const version=isIP(address);if(version===4)return address;
  if(version!==6)return null;
  try{
    const canonical=new URL(`http://[${address}]/`).hostname.slice(1,-1).toLowerCase();
    const mapped=/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(canonical);
    if(mapped){const a=parseInt(mapped[1],16),b=parseInt(mapped[2],16);return `${a>>8}.${a&255}.${b>>8}.${b&255}`;}
    return canonical;
  }catch{return null;}
}

export function resolveLoginClient(request,{production=process.env.NODE_ENV==='production',trustProxy=process.env.ADMIN_TRUST_PROXY}={}){
  if(trustProxy==='1')return normalizeClientAddress(request.headers.get('x-real-ip'));
  if(production)return null;
  return '127.0.0.1';
}
