import {resolveCardImage,CARD_PLACEHOLDER,advanceCardImage} from './card-assets.js';
// Native lazy loading avoids decoding the whole collection. Each node owns its
// identity and fallback; no prior card's source can bleed into the next reveal.
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cardImageMarkup(card,{eager=false,quality='thumb',frameless=false}={}){
 const source=resolveCardImage(card,quality);
 const url=/^(https?:|blob:|data:image\/|\.?\/?assets\/)/i.test(source)?source:'';
 const img=`<img ${frameless?'data-card-image="'+escape(card.id)+'"':''} data-card-quality="${escape(quality)}" data-card-source="${escape(card.thumb||card.img||card.art||'')}" data-card-high="${escape(card.img||card.art||card.thumb||'')}" ${url?'src="'+escape(url)+'"':''} alt="${escape(card.name)}" loading="${eager?'eager':'lazy'}" decoding="async" width="245" height="342">`;
 return frameless?img:`<span class="card-image" data-card-image="${escape(card.id)}">${img}<span class="card-image-message">${url&&url!==CARD_PLACEHOLDER?'LOADING ARTWORK':'ARTWORK UNAVAILABLE'}</span></span>`;
}
export function installCardImagePolicy(doc=document){
 const failed=img=>{const frame=img.closest('.card-image,.specialCardFrameV198,.collector-light-card');if(!frame)return;frame.classList.add('artwork-unavailable');let label=frame.querySelector('.card-image-message');if(!label){label=doc.createElement('span');label.className='card-image-message';frame.append(label);}label.textContent='ARTWORK UNAVAILABLE · Tap to retry';};
 doc.addEventListener('error',e=>{if(e.target.tagName==='IMG'){if(advanceCardImage(e.target)){e.stopImmediatePropagation();return;}failed(e.target);}},true);
 doc.addEventListener('load',e=>{if(e.target.tagName!=='IMG')return;if(e.target.getAttribute('src')?.endsWith('card-unavailable.svg')){failed(e.target);return;}const frame=e.target.closest('.card-image,.specialCardFrameV198,.collector-light-card');frame?.classList.add('artwork-loaded');frame?.classList.remove('artwork-unavailable');const timing=globalThis.tcgTenPackTimings;if(timing&&e.target.closest('.ten-results')){const ms=performance.now()-timing.renderAt;timing.imageLoad??={firstMs:ms,lastMs:ms,count:0};timing.imageLoad.lastMs=ms;timing.imageLoad.count++;}},true);
 doc.addEventListener('click',e=>{const frame=e.target.closest('.artwork-unavailable');if(!frame)return;const img=frame.querySelector('img');if(img?.getAttribute('src')){e.preventDefault();e.stopPropagation();frame.classList.remove('artwork-unavailable');img.__cardAssetIndex=0;img.src=img.__cardAssetCandidates?.[0]||img.getAttribute('src');}},true);
}
