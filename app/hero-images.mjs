export const defaultHeroImages={berc:{src:'/organizers/berc.png',scale:100},alpine:{src:'/organizers/alpine-club.png',scale:100}};

export function validateHeroImages(input){
  if(!input||!Number.isSafeInteger(input.updatedAt)||input.updatedAt<0||!input.images||typeof input.images!=='object')return null;
  const images={};
  for(const key of ['berc','alpine']){
    const value=input.images[key];
    if(!value||typeof value.src!=='string'||(!/^\/news\/media\/[0-9a-f]{32}$/.test(value.src)&&value.src!==defaultHeroImages[key].src)||!Number.isInteger(value.scale)||value.scale<50||value.scale>150)return null;
    images[key]={src:value.src,scale:value.scale};
  }
  return images;
}
