export const utmFields=['source','medium','campaign','term','content'];
export function normalizeUtm(input){
  if(!input||typeof input!=='object'||Array.isArray(input))return null;
  const result={};
  for(const key of utmFields){const value=input[key];if(value!==undefined&&typeof value!=='string')return null;const text=(value||'').normalize('NFC').trim();if(text.length>100||/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text))return null;result[key]=text;}
  return utmFields.some(key=>result[key])?result:null;
}
