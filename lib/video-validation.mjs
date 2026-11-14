export const MAX_VIDEO_BYTES=100*1024*1024;

export function parseVideoRange(header,size){
  if(!header)return {start:0,end:size-1,partial:false};
  const match=/^bytes=(\d*)-(\d*)$/.exec(header);
  if(!match||(!match[1]&&!match[2]))return null;
  let start,end;
  if(!match[1]){
    const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return null;
    start=Math.max(0,size-suffix);end=size-1;
  }else{
    start=Number(match[1]);end=match[2]?Number(match[2]):size-1;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return null;
    end=Math.min(end,size-1);
  }
  return {start,end,partial:true};
}

// Check the top-level MP4 boxes without loading the clip into memory.
export async function validateMp4(file,size){
  if(size<32||size>MAX_VIDEO_BYTES)return false;
  let offset=0,ftyp=false,moov=false,mdat=false;
  const header=Buffer.alloc(32);
  while(offset<size){
    if(size-offset<8)return false;
    const {bytesRead}=await file.read(header,0,Math.min(32,size-offset),offset);
    if(bytesRead<8)return false;
    let length=header.readUInt32BE(0),headerSize=8;
    const type=header.toString('ascii',4,8);
    if(length===1){if(bytesRead<16)return false;const large=header.readBigUInt64BE(8);if(large>BigInt(Number.MAX_SAFE_INTEGER))return false;length=Number(large);headerSize=16;}
    if(length===0)length=size-offset;
    if(length<headerSize||offset+length>size)return false;
    if(type==='ftyp'){
      if(offset!==0||length<headerSize+8)return false;
      const brand=header.toString('ascii',headerSize,headerSize+4);
      if(!['isom','iso2','iso3','iso4','iso5','iso6','mp41','mp42','avc1','M4V '].includes(brand))return false;
      ftyp=true;
    }
    if(type==='moov')moov=length>headerSize;
    if(type==='mdat')mdat=length>headerSize;
    offset+=length;
  }
  return ftyp&&moov&&mdat;
}
