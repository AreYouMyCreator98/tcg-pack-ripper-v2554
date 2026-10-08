// URLs are presentation data only. Never decorate or persist player card objects.
export const CARD_PLACEHOLDER='assets/ui/card-unavailable.svg';
export const normalizeQuality=q=>q==='high'?'high':q==='medium'?'medium':'thumb';
let manifest={version:1,cards:{}};
let sourceCards=new Map();
const safe=url=>typeof url==='string'&&/^(https:\/\/|blob:|data:image\/|\.?\/?assets\/)/i.test(url)&&!/[<>"']/.test(url)?url:'';
export function setCardAssetManifest(value){
 if(value?.version!==1||!value.cards||Array.isArray(value.cards))throw Error('Invalid card artwork manifest');
 for(const [id,c] of Object.entries(value.cards)){
  if(!id||!c.set||!['thumb','medium','high'].every(q=>/^https:\/\//.test(safe(c[q]))))throw Error('Invalid mirrored card '+id);
 }
 manifest=value;
 sourceCards=new Map();
 for(const [id,c] of Object.entries(value.cards))if(safe(c.fallback)){
  const art={id,setId:c.set,img:c.fallback,thumb:c.fallback.replace('/high.','/low.')};
  sourceCards.set(art.img,art);sourceCards.set(art.thumb,art);
 }
}
export async function loadCardAssetManifest(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),2500);
 try{const r=await fetch(new URL('card-assets.json',document.baseURI),{signal:controller.signal});if(r.ok)setCardAssetManifest(await r.json());}catch{}finally{clearTimeout(timer);}
}
export function cardFromImageSource(source){
 if(!source)return null;
 const known=sourceCards.get(source.split(/[?#]/)[0]);if(known)return {...known};
 const custom=source.match(/(?:^|\/)assets\/specials\/(sp_[\w-]+)\.webp(?:\?|$)/);
 if(custom)return {id:custom[1],setId:'specials',art:'assets/specials/'+custom[1]+'.webp'};
 try{const u=new URL(source);
 const mirrored=u.pathname.match(/\/cards\/[^/]+\/([^/]+)\/[^/]+\/(thumb|medium|high)\.webp$/);
 if(mirrored){const e=manifest.cards[mirrored[1]];if(e&&e[mirrored[2]]===source)return {id:mirrored[1],setId:e.set,img:e.fallback,thumb:e.fallback?.replace('/high.','/low.')};}
 if(u.hostname==='assets.tcgdex.net'){
  const m=u.pathname.match(/^\/en\/[^/]+\/([^/]+)\/([^/]+)\/(low|high)\.(?:webp|png|jpg)$/);
  if(m)return {id:m[1]+'-'+m[2],setId:m[1],img:source.replace(/\/(low|high)\./,'/high.'),thumb:source.replace(/\/(low|high)\./,'/low.')};
 }}catch{}
 return null;
}
export function cardImageCandidates(card,quality='thumb'){
 const q=normalizeQuality(quality),c=typeof card==='string'?{id:card}:card||{},entry=manifest.cards[c.id],urls=[];
 // Explicit custom overrides remain first. Known Specials prefer their controlled
 // custom mirror when present and fall back to the original local artwork.
 const override=safe(c.artworkOverride?.[q]||c.artworkOverride);
 if(override)urls.push(override);
 if(entry?.[q])urls.push(entry[q]);
 const source=q==='thumb'?(c.thumb||c.img||c.art):(c.img||c.art||c.thumb);
 if(safe(source))urls.push(source);
 if(safe(entry?.fallback))urls.push(q==='thumb'?entry.fallback.replace('/high.','/low.'):entry.fallback);
 if(q==='thumb'&&safe(c.img)&&c.img!==source)urls.push(c.img);
 urls.push(CARD_PLACEHOLDER);
 return [...new Set(urls)];
}
export function resolveCardImage(card,quality='thumb'){return cardImageCandidates(card,quality)[0];}
export function imageQualityForElement(img){
 if(img.dataset?.cardQuality)return normalizeQuality(img.dataset.cardQuality);
 if(img.closest('.batch-grid,.collector-grid,.bulk-grid,.specialGridV198,.gradeItem,.gradingItemV44,.gradeRow'))return 'thumb';
 if(img.closest('.pack-top-pulls'))return 'medium';
 if(img.closest('.collector-modal,.inspect3d,.gradeReturnStage,.slabInspect,.gradeSlab,.hub-reveal,#stack,#v128Hero,#v128Extract,.cardStack.show'))return 'high';
 if(img.closest('.single-grid,.trade-preview,.physical-tub,.slabItem'))return 'medium';
 return 'thumb';
}
export function applyCardImage(img,card,quality='thumb'){
 const candidates=cardImageCandidates(card,quality);img.dataset.cardAssetId=card.id;img.dataset.cardQuality=normalizeQuality(quality);
 img.decoding='async';img.loading=quality==='high'?'eager':'lazy';
 img.__cardAssetCandidates=candidates;img.__cardAssetIndex=0;
 if(img.getAttribute('src')!==candidates[0])img.setAttribute('src',candidates[0]);
}
export function advanceCardImage(img){
 const list=img.__cardAssetCandidates;if(!list)return false;
 const index=(img.__cardAssetIndex||0)+1;
 if(index>=list.length)return false;
 img.__cardAssetIndex=index;img.src=list[index];return true;
}
