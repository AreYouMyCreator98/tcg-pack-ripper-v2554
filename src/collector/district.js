export function districtOffer(state,day,key,generate){
 const meta=state.collectorV260;
 if(meta.district?.day!==day)meta.district={day,offers:{},used:{}};
 const district=meta.district;
 if(district.used[key])return null;
 if(!district.offers[key]){
  const offer=generate();
  if(!offer?.cards?.length||offer.cards.some(c=>!c?.id))return null;
  district.offers[key]=structuredClone(offer);
 }
 return {...structuredClone(district.offers[key]),districtKey:key,districtDay:day};
}
