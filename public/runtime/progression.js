
/* ===== original script 19 id=v161-next-level-controller ===== */

(()=>{try{
 const dayKeyV161=()=>window.gameDayKeyV170?.()||new Date().toISOString().slice(0,10);
 const hashV161=s=>{let h=2166136261;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const clampV161=(n,a,b)=>Math.max(a,Math.min(b,n));
 state.marketV161=state.marketV161||{started:dayKeyV161()};
 state.collectorNetV161=state.collectorNetV161||{day:dayKeyV161(),completed:{},count:0};
 state.sealedV161=state.sealedV161||{inventory:{},packCredits:{},history:[],display:{}};
 if(state.collectorNetV161.day!==dayKeyV161()){state.collectorNetV161.day=dayKeyV161();state.collectorNetV161.completed={}}
 state.collectorNetV161.completed=state.collectorNetV161.completed||{};
 state.sealedV161.inventory=state.sealedV161.inventory||{};state.sealedV161.packCredits=state.sealedV161.packCredits||{};state.sealedV161.history=state.sealedV161.history||[];state.sealedV161.display=state.sealedV161.display||{};

 /* ---------- Living market ---------- */
 const originalSellPriceV161=sellPrice;
 function setFactorV161(setId,offset=0){
  const k=window.gameDayKeyOffsetV170?.(offset)||(()=>{const d=new Date();d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)})()
  const n=hashV161(`${setId}|${k}|market`)%10001;
  return .91+(n/10000)*.20;
 }
 function cardFactorV161(id,offset=0){
  const k=window.gameDayKeyOffsetV170?.(offset)||(()=>{const d=new Date();d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)})()
  const n=hashV161(`${id}|${k}|card`)%10001;
  return .965+(n/10000)*.07;
 }
 window.marketValueV161=function(c,offset=0){
  const base=Math.max(.1,Number(c?.market||c?.raw||.1)),setId=c?.setId||masterResolveSetV62(c,c?.id)||'unknown';
  const mult=setFactorV161(setId,offset)*cardFactorV161(c?.id||c?.name||'card',offset);
  return Math.max(.1,Math.round(base*mult*100)/100);
 };
 sellPrice=function(c){return marketValueV161(c)};
 const originalGradedValueV161=gradedValueV56;
 gradedValueV56=function(j){
  const raw=marketValueV161({id:j.id,setId:j.setId,set:j.set,market:Number(j.raw||.1)}),g=Number(j.grade||0);
  const mult=g>=10?4.8:g>=9.5?3.2:g>=9?2.25:g>=8.5?1.65:g>=8?1.3:g>=7?1.05:.85;
  return Math.round(raw*mult*100)/100;
 };
 function setTrendV161(id){const now=setFactorV161(id,0),prev=setFactorV161(id,-1);return ((now/prev)-1)*100}
 function renderMarketPulseV161(){
  const el=document.getElementById('marketPulseV161');if(!el)return;
  const rows=SETS.filter(setUnlocked).map(s=>({s,t:setTrendV161(s.id),f:setFactorV161(s.id)})).sort((a,b)=>Math.abs(b.t)-Math.abs(a.t)).slice(0,4);
  el.innerHTML=rows.map(({s,t,f})=>{const hist=Array.from({length:7},(_,i)=>setFactorV161(s.id,i-6)),mn=Math.min(...hist),mx=Math.max(...hist),bars=hist.map(v=>{let h=8+(v-mn)/(Math.max(.001,mx-mn))*17;return `<i style="height:${h}px"></i>`}).join('');return `<div class="marketPulseCardV161 ${t>=0?'up':'down'}"><img src="${logo(s)}" onerror="this.style.display='none'"><b>${s.name}</b><strong>${t>=0?'▲':'▼'} ${Math.abs(t).toFixed(1)}%</strong><em>${f>=1?'Hotter':'Softer'} today</em><div class="marketPulseBarsV161">${bars}</div></div>`}).join('');
 }

 /* ---------- Card condition / provenance ---------- */
 function conditionScoreV161(cond){const a=Object.values(cond||{}).map(Number).filter(Number.isFinite);return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}
 function conditionNameV161(n){return n>=97?'Pristine':n>=94?'Near Mint+':n>=90?'Near Mint':n>=84?'Excellent':n>=76?'Very Good':'Played'}
 window.ensureConditionV161=function(c,origin='collection'){
  if(!c)return null;
  if(!c.conditionV161){
   const seed=hashV161(`${c.id||c.name}|${origin}|condition`),pack=/pack|pull/i.test(origin),trade=/trade/i.test(origin),buy=/purchase|customer|lot|show/i.test(origin);
   const lo=pack?92:trade?86:buy?80:87,span=pack?8:trade?13:buy?19:12;
   const v=n=>Math.round((lo+(((seed+n*2654435761)>>>0)%1001)/1000*span)*10)/10;
   c.conditionV161={centering:v(1),corners:v(2),edges:v(3),surface:v(4)};
  }
  c.historyV161=c.historyV161||[];
  if(!c.historyV161.length)c.historyV161.push({time:Date.now(),label:origin==='pack'?'Pulled from a booster':origin==='purchase'?'Purchased from another collector':'Added to your collection'});
  return c.conditionV161;
 };
 window.conditionForGradingV161=function(c,uid){const x=ensureConditionV161(c,'collection');return {...x}};
 Object.values(state.binder||{}).forEach(c=>ensureConditionV161(c,'legacy collection'));
 Object.values(state.bulkV64||{}).forEach(c=>ensureConditionV161(c,'legacy bulk'));
 const originalAddBinderV161=addToBinderV64;
 addToBinderV64=function(c,count=1){
  const inPack=(pulls||[]).some(p=>p&&p.id===c?.id),origin=c?.__originV161||(inPack?'pack':'collection');
  originalAddBinderV161(c,count);const x=state.binder?.[c.id];if(x){ensureConditionV161(x,origin);x.historyV161=x.historyV161||[];if(inPack)x.historyV161.unshift({time:Date.now(),label:`Pulled • ${c.set||sel.name}`});x.historyV161=x.historyV161.slice(0,8)}
 };
 const originalAddBulkV161=addToBulkV64;
 addToBulkV64=function(c,count=1){const inPack=(pulls||[]).some(p=>p&&p.id===c?.id);originalAddBulkV161(c,count);const x=state.bulkV64?.[c.id];if(x){ensureConditionV161(x,inPack?'pack':'collection')}};
 const originalRouteShopV161=routeShopCardV87;
 routeShopCardV87=function(c,count=1){if(c)c.__originV161='purchase';const r=originalRouteShopV161(c,count);delete c?.__originV161;const x=state.binder?.[c?.id]||state.bulkV64?.[c?.id];if(x){ensureConditionV161(x,'purchase');x.historyV161=x.historyV161||[];x.historyV161.unshift({time:Date.now(),label:'Purchased from Collector Exchange'});x.historyV161=x.historyV161.slice(0,8)}return r};
 const inspectCard=document.querySelector('#cardModal .inspectCard');
 if(inspectCard&&!document.getElementById('conditionPanelV161')){
  const anchor=document.getElementById('sellValue');anchor?.insertAdjacentHTML('afterend','<div class="conditionPanelV161" id="conditionPanelV161"></div>');
 }
 window.renderConditionV161=function(id){
  const c=state.binder?.[id],el=document.getElementById('conditionPanelV161');if(!c||!el)return;const q=ensureConditionV161(c,'collection'),score=conditionScoreV161(q),hist=(c.historyV161||[]).slice(0,4);
  el.innerHTML=`<div class="conditionHeadV161"><div><small>RAW CARD CONDITION</small><b>${conditionNameV161(score)}</b></div><strong>${(score/10).toFixed(1)}</strong></div><div class="conditionMetricsV161">${Object.entries(q).map(([k,v])=>`<div class="conditionMetricV161"><div><span>${k[0].toUpperCase()+k.slice(1)}</span><b>${(v/10).toFixed(1)}</b></div><i><u style="width:${v}%"></u></i></div>`).join('')}</div><button type="button" class="conditionInspectBtnV161" id="conditionInspectBtnV161">INSPECT UNDER LIGHT</button><div class="conditionHistoryV161"><small>CARD HISTORY</small>${hist.map(h=>`<p>${h.label}</p>`).join('')}</div>`;
  document.getElementById('conditionInspectBtnV161')?.addEventListener('click',()=>document.getElementById('inspect3d')?.classList.toggle('inspectionLightV161'));
 };
 const originalOpenBinderV161=openBinderCard;
 openBinderCard=async function(id){await originalOpenBinderV161(id);renderConditionV161(id);const c=state.binder?.[id];if(c){document.getElementById('sellValue').textContent=`Live market value: $${sellPrice(c).toFixed(2)} each`}};

 /* ---------- Sealed product economy ---------- */
 const SEALED_PRODUCTS_V161=[
  {id:'pack',name:'Sleeved Booster',packs:1,price:8.5,tag:'1 PACK',model:'pack',desc:'A premium sealed single booster for your shelf or next rip.'},
  {id:'bundle',name:'Booster Bundle',packs:6,price:46,tag:'6 PACKS',model:'bundle',desc:'A compact six-pack bundle with collector shelf presence.'},
  {id:'binder',name:'Collector Binder Box',packs:5,price:54,tag:'BINDER',model:'binder',desc:'An inspired binder collection box with bonus packs included.'},
  {id:'tin',name:'Mini Tin',packs:2,price:16,tag:'2 PACKS',model:'tin',desc:'A compact collectible tin you can hold or crack later.'},
  {id:'etb',name:'Elite Trainer Box',packs:9,price:68,tag:'9 PACKS',model:'etb',desc:'A larger premium box built for display or opening.'},
  {id:'box',name:'Booster Box',packs:36,price:250,tag:'36 PACKS',model:'box',desc:'The biggest sealed display in the room with serious upside.'}
 ];
 let sealedSetV161=sel?.id||SETS[0].id;
 function sealedProductPriceV161(product,setId){const age=SETS.findIndex(s=>s.id===setId),scarcity=1+Math.max(0,age-12)*.006;return Math.round(product.price*setFactorV161(setId)*scarcity*100)/100}
 function sealedKeyV161(setId,pid){return `${setId}|${pid}`}
 function sealedProductV179(pid){return SEALED_PRODUCTS_V161.find(x=>x.id===pid)}
 function packCreditsV161(setId){return Number(state.sealedV161.packCredits?.[setId]||0)}
 function displayQtyV179(key){return Number(state.sealedV161.display?.[key]||0)}
 function setDisplayQtyV179(key,n){state.sealedV161.display[key]=Math.max(0,Math.floor(n)||0);if(state.sealedV161.display[key]<=0)delete state.sealedV161.display[key]}
 function ownedQtyV179(key){return Number(state.sealedV161.inventory?.[key]||0)}
 function shelfCountV179(){return Object.values(state.sealedV161.display||{}).reduce((a,b)=>a+Number(b||0),0)}
 function totalSealedValueV179(){return Object.entries(state.sealedV161.inventory||{}).reduce((sum,[key,q])=>{const [setId,pid]=key.split('|'),p=sealedProductV179(pid);return sum+(p?sealedProductPriceV161(p,setId)*Number(q||0):0)},0)}
 window.canAffordPackV161=function(setId,count=1){const cr=packCreditsV161(setId),cashNeeded=Math.max(0,count-cr)*8;return Number(state.coins||0)+1e-9>=cashNeeded};
 window.payForPackV161=function(setId){const n=packCreditsV161(setId);if(n>0){state.sealedV161.packCredits[setId]=n-1}else state.coins=Math.round((Number(state.coins||0)-8)*100)/100;syncPackCreditV161()};
 function syncPackCreditV161(){
  const pill=document.getElementById('sealedCreditV161');if(!pill)return;const n=packCreditsV161(sel.id);pill.classList.toggle('show',n>0);pill.innerHTML=`SEALED CREDIT <b>${n}</b>`;
  const cost=document.getElementById('v114Cost');if(cost){const need=Math.max(0,v114PackCount-n);cost.textContent=need===0?'SEALED CREDIT':`$${(need*8).toFixed(2)}${n?` + ${Math.min(n,v114PackCount)} CREDIT`:''}`}
 }
 const stage=document.getElementById('stage');if(stage&&!document.getElementById('sealedCreditV161'))stage.insertAdjacentHTML('afterbegin','<div class="sealedCreditV161" id="sealedCreditV161"></div>');
 const oldResetV161=resetPack;resetPack=function(){oldResetV161();setTimeout(syncPackCreditV161,0)};
 document.getElementById('v114PackMode')?.addEventListener('click',()=>setTimeout(syncPackCreditV161,30));
 function modelDimsV179(model){
  if(model==='pack')return {w:126,h:194,d:12};
  if(model==='bundle')return {w:160,h:112,d:52};
  if(model==='binder')return {w:142,h:188,d:34};
  if(model==='tin')return {w:142,h:112,d:42};
  if(model==='etb')return {w:150,h:158,d:76};
  return {w:176,h:124,d:88};
 }
 function artForSealedV179(setId){return (OFFICIAL_PACK_ART[setId]||[])[0]||''}
 function safeLogoV179(setId){const s=SETS.find(x=>x.id===setId);return s?logo(s):''}
 function sealedThemeV184(setId){
  const set=SETS.find(x=>x.id===setId),k=String(set?.name||setId||'').toLowerCase();
  if(k.includes('paldean fates')) return {c1:'#17365d',c2:'#277c77',c3:'#dfbd50',acc:'#ddfff7',label:'SHINY VAULT',motif:'spark'};
  if(k.includes('hidden fates')) return {c1:'#301d51',c2:'#7041a3',c3:'#42b6d2',acc:'#f3dc72',label:'HIDDEN VAULT',motif:'star'};
  if(k.includes('shining fates')) return {c1:'#0f4d5d',c2:'#1f9187',c3:'#efc44e',acc:'#d8fff8',label:'SHIMMER SERIES',motif:'star'};
  if(k.includes('crown zenith')) return {c1:'#163a78',c2:'#573cb6',c3:'#e8517f',acc:'#f3cf67',label:'ROYAL COLLECTION',motif:'crown'};
  if(k.includes('stellar crown')) return {c1:'#173f63',c2:'#326cb0',c3:'#7d5adb',acc:'#bff5ff',label:'COSMIC GEM',motif:'gem'};
  if(k.includes('surging sparks')) return {c1:'#7d2a1f',c2:'#d06b1f',c3:'#ffd44a',acc:'#fff1b3',label:'VOLT STORM',motif:'spark'};
  if(k.includes('obsidian flames')) return {c1:'#23171e',c2:'#7f2c1f',c3:'#ef8a2e',acc:'#ffd7a3',label:'EMBER VAULT',motif:'flame'};
  if(k.includes('twilight')) return {c1:'#283156',c2:'#70578d',c3:'#65a097',acc:'#eadcf8',label:'TWILIGHT ARCHIVE',motif:'gem'};
  if(k.includes('151')) return {c1:'#183c63',c2:'#b8473d',c3:'#e0b84e',acc:'#f8f0ca',label:'KANTO ARCHIVE',motif:'star'};
  if(k.includes('evolving skies')) return {c1:'#263f68',c2:'#75568e',c3:'#68a7a1',acc:'#e6f4ff',label:'SKYLINE SERIES',motif:'gem'};
  if(k.includes('brilliant stars')) return {c1:'#243969',c2:'#6d53aa',c3:'#d4aa42',acc:'#fff0a8',label:'STAR GALLERY',motif:'star'};
  if(k.includes('lost origin')) return {c1:'#301e49',c2:'#72434f',c3:'#cf7444',acc:'#f4d6be',label:'RIFT COLLECTION',motif:'gem'};
  if(k.includes('silver tempest')) return {c1:'#273c56',c2:'#6a7f94',c3:'#ab5d87',acc:'#eff7ff',label:'TEMPEST ARCHIVE',motif:'spark'};
  if(k.includes('cosmic eclipse')) return {c1:'#1d3158',c2:'#6c427c',c3:'#cf8240',acc:'#fff0bc',label:'COSMIC SERIES',motif:'star'};
  if(k.includes('evolutions')) return {c1:'#315377',c2:'#cb673d',c3:'#ddb84c',acc:'#fff2bd',label:'CLASSIC ARCHIVE',motif:'star'};
  /* Fallback is still set-specific: derive a stable palette from the expansion ID. */
  let hash=0;for(const ch of String(setId||''))hash=(hash*31+ch.charCodeAt(0))>>>0;const hue=hash%360,h2=(hue+54)%360;
  return {c1:`hsl(${hue} 42% 24%)`,c2:`hsl(${h2} 48% 40%)`,c3:`hsl(${(hue+118)%360} 58% 54%)`,acc:`hsl(${(hue+35)%360} 72% 80%)`,label:'COLLECTOR SERIES',motif:(hash%3===0?'star':hash%3===1?'gem':'spark')};
 }
 function sealedFaceContentV183(setId,p,face){
  const art=artForSealedV179(setId),logoSrc=safeLogoV179(setId),set=SETS.find(x=>x.id===setId),setName=set?.name||setId,t=sealedThemeV184(setId),vars=`--c1:${t.c1};--c2:${t.c2};--c3:${t.c3};--acc:${t.acc};`;
  if(face==='front'){
    if(p.model==='pack') return `<div class="sealedPackSurfaceV184 motif-${t.motif}" style="${vars}"><div class="sealedPackBackdropV184"></div><div class="sealedPackHeaderV184"><span>POKÉMON TCG</span><i>${p.tag}</i></div><div class="sealedPackArtFrameV184">${art?`<img class="sealedPackFullArtV184" src="${art}" alt="">`:''}</div>${logoSrc?`<img class="sealedSetLogoV184 packLogo" src="${logoSrc}" alt="">`:''}<div class="sealedPackSetNameV184">${setName}</div><div class="sealedPackGlossV184"></div><div class="sealedCrimpV183 top"></div><div class="sealedCrimpV183 bottom"></div></div>`;
    return `<div class="sealedPanelV184 frontPanel type-${p.model} motif-${t.motif}" style="${vars}"><div class="sealedHeroBgV184"></div><div class="sealedHeroPatternV184"></div><div class="sealedToplineV184"><span>POKÉMON TCG</span><i>${p.tag}</i></div><div class="sealedHeroChipV184">${t.label}</div><div class="sealedArtWindowV184">${art?`<img src="${art}" alt="">`:''}</div>${logoSrc?`<img class="sealedSetLogoV184" src="${logoSrc}" alt="">`:''}<b>${p.name}</b><small>${setName}</small><div class="sealedPanelShineV184"></div></div>`;
  }
  if(face==='back') return `<div class="sealedPanelV184 backPanel motif-${t.motif}" style="${vars}"><div class="sealedBackGridV184"></div><div class="sealedBackBlurbV184">COLLECT • HOLD • DISPLAY</div>${logoSrc?`<img class="sealedSetLogoV184 backLogo" src="${logoSrc}" alt="">`:''}<b>${p.name}</b><small>${p.packs} PACK${p.packs===1?'':'S'} INSIDE • LIVE MARKET TRACKED</small></div>`;
  if(face==='left'||face==='right') return `<div class="sealedSidePanelV184 motif-${t.motif}" style="${vars}">${logoSrc?`<img src="${logoSrc}" alt="">`:''}<span>${p.name}</span><i>${p.tag}</i></div>`;
  return `<div class="sealedTopPanelV184 motif-${t.motif}" style="${vars}">${logoSrc?`<img src="${logoSrc}" alt="">`:''}<span>${setName}</span></div>`;
 }
 function sealedModelHtmlV179(setId,p,small=false){
  const d=modelDimsV179(p.model),scale=small?.68:1,cls=small?'small':'';
  return `<div class="sealedModelV179 ${cls} model-${p.model}" style="--mw:${d.w}px;--mh:${d.h}px;--md:${d.d}px;--mScale:${scale}"><div class="sealedFloorShadowV183"></div><div class="sealedModelAuraV183"></div><div class="sealedModelWrapV179"><div class="sealedPrismV183"><div class="sealedFaceV183 face-front">${sealedFaceContentV183(setId,p,'front')}</div><div class="sealedFaceV183 face-back">${sealedFaceContentV183(setId,p,'back')}</div><div class="sealedFaceV183 face-left">${sealedFaceContentV183(setId,p,'left')}</div><div class="sealedFaceV183 face-right">${sealedFaceContentV183(setId,p,'right')}</div><div class="sealedFaceV183 face-top">${sealedFaceContentV183(setId,p,'top')}</div><div class="sealedFaceV183 face-bottom">${sealedFaceContentV183(setId,p,'bottom')}</div></div></div></div>`
 }
 function buySealedV161(pid){const p=sealedProductV179(pid),set=SETS.find(x=>x.id===sealedSetV161);if(!p||!set)return;const price=sealedProductPriceV161(p,set.id);if(Number(state.coins||0)<price)return toast(`You need $${price.toFixed(2)}.`);state.coins=Math.round((Number(state.coins)-price)*100)/100;const key=sealedKeyV161(set.id,p.id);state.sealedV161.inventory[key]=ownedQtyV179(key)+1;state.sealedV161.history.unshift({time:Date.now(),type:'buy',setId:set.id,pid:p.id,price});state.sealedV161.history=state.sealedV161.history.slice(0,30);save();renderSealedV161();toast(`${p.name} added to your Sealed Collection`)}
 function openSealedV161(key){const [setId,pid]=key.split('|'),p=sealedProductV179(pid),qty=ownedQtyV179(key);if(!p||qty<=0)return;if(displayQtyV179(key)>=qty)return toast('Take one off the display shelf before opening it.');state.sealedV161.inventory[key]=qty-1;if(state.sealedV161.inventory[key]<=0){delete state.sealedV161.inventory[key];delete state.sealedV161.display[key]}state.sealedV161.packCredits[setId]=packCreditsV161(setId)+p.packs;state.sealedV161.history.unshift({time:Date.now(),type:'open',setId,pid,packs:p.packs});save();renderSealedV161();const set=SETS.find(x=>x.id===setId);if(set){sel=set;try{renderSets();applyPackArt();resetPack()}catch(e){}}syncPackCreditV161();toast(`${p.name} opened • ${p.packs} pack credit${p.packs===1?'':'s'} ready`)}
 function sellSealedV161(key){const [setId,pid]=key.split('|'),p=sealedProductV179(pid),qty=ownedQtyV179(key);if(!p||qty<=0)return;if(displayQtyV179(key)>=qty)return toast('Take one off the display shelf before selling it.');const value=Math.round(sealedProductPriceV161(p,setId)*.88*100)/100;state.sealedV161.inventory[key]=qty-1;if(state.sealedV161.inventory[key]<=0){delete state.sealedV161.inventory[key];delete state.sealedV161.display[key]}state.coins=Math.round((Number(state.coins||0)+value)*100)/100;save();renderSealedV161();toast(`Sealed ${p.name} sold • +$${value.toFixed(2)}`)}
 function toggleDisplaySealedV179(key){const owned=ownedQtyV179(key),shown=displayQtyV179(key);if(owned<=0)return;if(shown<owned){setDisplayQtyV179(key,shown+1);toast('Placed on your display shelf')}else{setDisplayQtyV179(key,shown-1);toast('Removed from your display shelf')}save();renderSealedV161()}
 function openSealedPreviewV181(setId,pid){const p=sealedProductV179(pid),set=SETS.find(x=>x.id===setId),modal=document.getElementById('sealedInspectModalV179');if(!p||!modal)return;modal.dataset.mode='preview';modal.dataset.previewSetId=setId;modal.dataset.previewPid=pid;delete modal.dataset.inspectKey;document.getElementById('sealedInspectTitleV179').textContent=p.name;document.getElementById('sealedInspectSubV179').textContent=`${set?.name||setId} • live market $${sealedProductPriceV161(p,setId).toFixed(2)} • ${p.packs} pack${p.packs===1?'':'s'} inside`;document.getElementById('sealedInspectStageV179').innerHTML=sealedModelHtmlV179(setId,p,false);document.getElementById('sealedInspectDescV179').textContent=p.desc||'Display-grade inspired sealed product.';const d=document.getElementById('sealedInspectDisplayV179'),o=document.getElementById('sealedInspectOpenV179'),s=document.getElementById('sealedInspectSellV179');if(d)d.style.display='none';if(s)s.style.display='none';if(o){o.style.display='';o.textContent='BUY NOW'}modal.classList.add('show');bindSealedInspectStageV179()}
 function openSealedInspectV179(key){const [setId,pid]=key.split('|'),p=sealedProductV179(pid),set=SETS.find(x=>x.id===setId),modal=document.getElementById('sealedInspectModalV179');if(!p||!modal)return;modal.dataset.mode='owned';modal.dataset.inspectKey=key;delete modal.dataset.previewSetId;delete modal.dataset.previewPid;document.getElementById('sealedInspectTitleV179').textContent=p.name;document.getElementById('sealedInspectSubV179').textContent=`${set?.name||setId} • live market $${sealedProductPriceV161(p,setId).toFixed(2)} • ${p.packs} pack${p.packs===1?'':'s'} inside`;document.getElementById('sealedInspectStageV179').innerHTML=sealedModelHtmlV179(setId,p,false);document.getElementById('sealedInspectDescV179').textContent=p.desc||'Display-grade inspired sealed product.';const d=document.getElementById('sealedInspectDisplayV179'),o=document.getElementById('sealedInspectOpenV179'),s=document.getElementById('sealedInspectSellV179');if(d)d.style.display='';if(s)s.style.display='';if(o){o.style.display='';o.textContent='OPEN'}modal.classList.add('show');bindSealedInspectStageV179()}
 function bindSealedInspectStageV179(){bindSealedModelInteractionsV181(document.getElementById('sealedInspectStageV179'))}
 function bindSealedModelInteractionsV181(root=document){root.querySelectorAll('.sealedModelV179').forEach(stage=>{if(stage.dataset.boundV183)return;stage.dataset.boundV183='1';let id=null,rx=-9,ry=20,lastX=0,lastY=0;const setAngles=(a,b)=>{rx=Math.max(-38,Math.min(38,a));ry=b;stage.style.setProperty('--userTransform',`rotateX(${rx}deg) rotateY(${ry}deg)`);stage.style.setProperty('--mx',`${Math.sin(ry*Math.PI/180)*10}px`);stage.style.setProperty('--my',`${Math.sin(rx*Math.PI/180)*7}px`);};setAngles(rx,ry);stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;id=e.pointerId;lastX=e.clientX;lastY=e.clientY;stage.classList.add('dragging');stage.setPointerCapture?.(id);e.preventDefault()});stage.addEventListener('pointermove',e=>{if(id!==e.pointerId)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;ry+=dx*.48;rx-=dy*.42;setAngles(rx,ry);e.preventDefault()});const release=e=>{if(id===null)return;if(e?.pointerId!=null&&e.pointerId!==id)return;try{stage.releasePointerCapture?.(id)}catch(_e){}id=null;stage.classList.remove('dragging')};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);if(!stage.classList.contains('small')){let t=0;const tick=()=>{if(!document.body.contains(stage))return;t+=.012;if(id===null&&stage.closest('#sealedInspectStageV179')){const idleRx=rx+Math.sin(t)*.7,idleRy=ry+Math.cos(t*1.15)*1.1;stage.style.setProperty('--userTransform',`rotateX(${idleRx}deg) rotateY(${idleRy}deg)`)}requestAnimationFrame(tick)};requestAnimationFrame(tick)}})}
 function renderSealedV161(){
  const rail=document.getElementById('sealedSetRailV161'),products=document.getElementById('sealedProductsV161'),vault=document.getElementById('sealedVaultGridV161'),shelf=document.getElementById('sealedShelfGridV179');if(!rail||!products||!vault)return;
  const unlocked=SETS.filter(setUnlocked);if(!unlocked.some(s=>s.id===sealedSetV161))sealedSetV161=unlocked[0]?.id||SETS[0].id;
  rail.innerHTML=unlocked.map(s=>`<button type="button" class="sealedSetChipV161 ${s.id===sealedSetV161?'active':''}" data-sealed-set-v161="${s.id}"><img src="${logo(s)}" onerror="this.style.display='none'"></button>`).join('');
  products.innerHTML=SEALED_PRODUCTS_V161.map(p=>{let price=sealedProductPriceV161(p,sealedSetV161);return `<div class="sealedProductV179"><button type="button" class="sealedProductStageV181" data-preview-sealed-v181="${sealedSetV161}|${p.id}">${sealedModelHtmlV179(sealedSetV161,p,true)}<span>Tap to inspect in 3D</span></button><div class="sealedProductMetaV179"><div><h3>${p.name}</h3><p>${p.desc}</p></div><i>${p.tag}</i></div><div class="sealedProductPriceV181"><b>$${price.toFixed(2)}</b><div class="sealedProductCtasV181"><button type="button" class="ghost" data-preview-sealed-v181="${sealedSetV161}|${p.id}">INSPECT</button><button type="button" data-buy-sealed-v161="${p.id}">BUY</button></div></div></div>`}).join('');
  const owned=Object.entries(state.sealedV161.inventory).filter(([,q])=>Number(q)>0);
  if(shelf){const displayRows=Object.entries(state.sealedV161.display||{}).filter(([k,q])=>Number(q)>0&&ownedQtyV179(k)>0);shelf.innerHTML=displayRows.length?displayRows.map(([key,q])=>{const [setId,pid]=key.split('|'),p=sealedProductV179(pid),set=SETS.find(x=>x.id===setId);return Array.from({length:Number(q)}).map((_,i)=>`<button type="button" class="sealedShelfItemV179" data-inspect-sealed-v179="${key}"><div class="sealedShelfStageV179">${sealedModelHtmlV179(setId,p,true)}</div><b>${p.name}</b><small>${set?.name||setId}</small></button>`).join('')}).join(''):'<div class="sealedEmptyV161">Your display shelf is empty. Add sealed products from the vault below.</div>'}
  vault.innerHTML=owned.length?owned.map(([key,q])=>{const [setId,pid]=key.split('|'),p=sealedProductV179(pid),set=SETS.find(x=>x.id===setId),resale=Math.round(sealedProductPriceV161(p,setId)*.88*100)/100,shown=displayQtyV179(key);return `<div class="sealedOwnedCardV179"><div class="sealedOwnedArtV179">${sealedModelHtmlV179(setId,p,true)}</div><div class="sealedOwnedInfoV179"><b>${p.name} ×${q}</b><small>${set?.name||setId} • ${p.packs} pack${p.packs===1?'':'s'} inside</small><small>Live market $${sealedProductPriceV161(p,setId).toFixed(2)} • resale $${resale.toFixed(2)} • on shelf ${shown}</small></div><div class="sealedOwnedActionsV179"><button data-inspect-sealed-v179="${key}">INSPECT</button><button data-display-sealed-v179="${key}">${shown<q?'DISPLAY':'REMOVE'}</button>${p.packs>0?`<button class="open" data-open-sealed-v161="${key}">OPEN</button>`:''}<button data-sell-sealed-v161="${key}">SELL</button></div></div>`}).join(''):'<div class="sealedEmptyV161">Your Sealed Collection is empty. Buy a product above and decide later whether to rip it, hold it or display it.</div>';
  const summary=document.getElementById('sealedCreditsSummaryV161');if(summary)summary.textContent=`${Object.values(state.sealedV161.packCredits||{}).reduce((a,b)=>a+Number(b||0),0)} pack credit${Object.values(state.sealedV161.packCredits||{}).reduce((a,b)=>a+Number(b||0),0)===1?'':'s'} • shelf ${shelfCountV179()} • vault $${totalSealedValueV179().toFixed(2)}`;
  rail.querySelectorAll('[data-sealed-set-v161]').forEach(b=>b.onclick=()=>{sealedSetV161=b.dataset.sealedSetV161;renderSealedV161()});
  products.querySelectorAll('[data-buy-sealed-v161]').forEach(b=>b.onclick=()=>buySealedV161(b.dataset.buySealedV161));
  products.querySelectorAll('[data-preview-sealed-v181]').forEach(b=>b.onclick=()=>{const [setId,pid]=b.dataset.previewSealedV181.split('|');openSealedPreviewV181(setId,pid)});
  vault.querySelectorAll('[data-open-sealed-v161]').forEach(b=>b.onclick=()=>openSealedV161(b.dataset.openSealedV161));
  vault.querySelectorAll('[data-sell-sealed-v161]').forEach(b=>b.onclick=()=>sellSealedV161(b.dataset.sellSealedV161));
  document.querySelectorAll('[data-display-sealed-v179]').forEach(b=>b.onclick=()=>toggleDisplaySealedV179(b.dataset.displaySealedV179));
  document.querySelectorAll('[data-inspect-sealed-v179]').forEach(b=>b.onclick=()=>openSealedInspectV179(b.dataset.inspectSealedV179));
  bindSealedModelInteractionsV181(document.getElementById('sealedModalV161'));
 }
 /* ---------- NPC Collector network ---------- */
 const NPCS_V161=[
  {id:'maya',name:'Maya',avatar:'🌙',label:'Illustration collector',want:'Illustration & art rares',boost:1.10,patience:2,color:'#9d76ef'},
  {id:'dex',name:'Dex',avatar:'⚡',label:'Chase hunter',want:'Big-name chase cards',boost:1.14,patience:1,color:'#ffd956'},
  {id:'ivy',name:'Ivy',avatar:'🌿',label:'Set completionist',want:'Cards missing from master sets',boost:1.07,patience:3,color:'#6bd59b'},
  {id:'ace',name:'Ace',avatar:'🧢',label:'Value trader',want:'Balanced, liquid trades',boost:1.04,patience:2,color:'#65b6f4'}
 ];
 let negotiationV161=null;
 function tradePoolAddV167(out,seen,c){if(!c?.id||seen.has(c.id)||!(c.thumb||c.img))return;seen.add(c.id);out.push(c)}
 async function tradePoolV161(){
  const out=[],seen=new Set(),addCache=()=>Object.values(cache||{}).forEach(d=>((d?.base?.cards||d?.cards||[])).forEach(c=>tradePoolAddV167(out,seen,c)));
  addCache();
  /* The old trade pool looked at cache[set].cards, but set data actually lives in cache[set].base.cards.
     It also discarded every unhydrated card because summaries do not have market prices yet. Load a real
     pool first, then price only the small candidate group we are considering. */
  if(out.length<80){
   const unlocked=SETS.filter(setUnlocked),ordered=[sel,...unlocked.filter(x=>x.id!==sel.id)];
   await Promise.allSettled(ordered.slice(0,Math.min(8,ordered.length)).map(x=>getSet(x)));
   addCache();
  }
  return out;
 }
 function npcInterestV161(npc,c){let x=1,s=String(`${c?.name||''} ${c?.rarity||''}`).toLowerCase();if(npc.id==='maya'&&/illustration|trainer gallery|art/.test(s))x+=.18;if(npc.id==='dex'&&(isChaseCard(c)||tier(c)>=4))x+=.20;if(npc.id==='ivy'){let set=SETS.find(z=>z.id===(c.setId||masterResolveSetV62(c,c.id)));if(set){let mp=masterProgressV58(set);if(mp.total&&mp.n<mp.total)x+=.10}if(!state.binder?.[c.id])x+=.08}if(npc.id==='ace')x+=.03;return x}
 function npcCandidateRankV167(npc,c,give,target,round){
  const t=tier(c),wantedTier=target>=80?4:target>=25?3:target>=8?2:target>=2?1:0;
  let score=Math.abs(t-wantedTier)*2.1-npcInterestV161(npc,c)*1.4;
  if(npc.id==='ivy'&&!state.binder?.[c.id])score-=1.2;
  if(c.setId===give.setId)score+=.16;
  score+=(hashV161(`${npc.id}|${give.id}|${c.id}|${dayKeyV161()}|${round}`)%1000)/7000;
  return score;
 }
 async function npcReturnCardV161(npc,give,round=0){
  const pool=await tradePoolV161(),target=marketValueV161(give)*npcInterestV161(npc,give)*(.96+round*.035);
  let choices=pool.filter(c=>c?.id&&c.id!==give.id&&(c.thumb||c.img));
  if(!choices.length)return null;
  choices.sort((a,b)=>npcCandidateRankV167(npc,a,give,target,round)-npcCandidateRankV167(npc,b,give,target,round));
  /* Hydrate just a shortlist so the NPC's value is real instead of the old $0.10 placeholder. */
  const shortlist=choices.slice(0,18);
  await Promise.allSettled(shortlist.map(c=>hydrateCard(c)));
  let priced=shortlist.filter(c=>Number(c.market||0)>.1&&(c.thumb||c.img));
  if(!priced.length){
   const fallback=choices.find(c=>c.thumb||c.img)||null;
   if(fallback)await hydrateCard(fallback);
   return fallback;
  }
  priced.sort((a,b)=>{
   const av=marketValueV161(a),bv=marketValueV161(b),
    ad=Math.abs(Math.log(Math.max(.1,av)/Math.max(.1,target)))-(.045*(npcInterestV161(npc,a)-1)),
    bd=Math.abs(Math.log(Math.max(.1,bv)/Math.max(.1,target)))-(.045*(npcInterestV161(npc,b)-1));
   return ad-bd;
  });
  const top=priced.slice(0,Math.min(5,priced.length));
  return top[hashV161(`${npc.id}|${give.id}|${dayKeyV161()}|offer|${round}`)%top.length]||priced[0]||null;
 }
 let npcOfferTokenV167=0;
 function npcLoadingV167(w,text='Finding a real card offer…'){
  const body=document.getElementById('collectorDealBodyV161');if(!body||!w)return;
  body.innerHTML=`<div class="collectorDealTopV161"><span class="collectorAvatarV161">${w.npc.avatar}</span><div><small>${w.npc.label.toUpperCase()}</small><b>${w.npc.name}</b><p>${text}</p></div><button type="button" class="collectorCloseV161" id="collectorCloseV161">×</button></div><div class="collectorOfferGridV161"><div class="collectorOfferCardV161"><small>YOU OFFER</small><img src="${w.give.thumb||w.give.img||''}"><b>${w.give.name}</b><strong>$${marketValueV161(w.give).toFixed(2)}</strong></div><div class="collectorSwapV161">⇄</div><div class="collectorOfferCardV161"><small>${w.npc.name.toUpperCase()} OFFERS</small><div style="height:160px;display:grid;place-items:center;color:#8fa0b8;font-weight:900">SEARCHING…</div><b>Checking collection</b><strong>—</strong></div></div><div class="collectorMessageV161">${w.npc.name}: “Give me a second — I’m finding a fair swap.”</div>`;
  document.getElementById('collectorCloseV161').onclick=()=>document.getElementById('collectorModalV161').classList.remove('show');
 }
 async function openNpcV161(id){
  const npc=NPCS_V161.find(x=>x.id===id);if(!npc)return;if(state.collectorNetV161.completed[id])return toast(`${npc.name} already traded with you today.`);
  const owned=Object.values(state.binder||{}).filter(c=>c&&Number(c.qty||0)>0&&marketValueV161(c)>=.35).sort((a,b)=>marketValueV161(b)-marketValueV161(a)).slice(0,18);
  if(!owned.length)return toast('You need at least one Binder card to negotiate.');
  negotiationV161={npc,give:owned[0],take:null,round:0,owned};document.getElementById('collectorModalV161')?.classList.add('show');npcLoadingV167(negotiationV161);await renderNpcDealV161();
 }
 async function renderNpcDealV161(message=''){
  const w=negotiationV161,body=document.getElementById('collectorDealBodyV161');if(!w||!body)return;
  const token=++npcOfferTokenV167;npcLoadingV167(w,message||'Finding a real card offer…');
  const take=await npcReturnCardV161(w.npc,w.give,w.round);if(token!==npcOfferTokenV167||w!==negotiationV161)return;w.take=take;
  if(!take){body.innerHTML=`<div class="collectorDealTopV161"><span class="collectorAvatarV161">${w.npc.avatar}</span><div><small>${w.npc.label.toUpperCase()}</small><b>${w.npc.name}</b><p>No card pool loaded yet.</p></div><button type="button" class="collectorCloseV161" id="collectorCloseV161">×</button></div><div class="collectorMessageV161">Couldn’t load a trade card. Check your connection and try again.</div><button type="button" class="makeOffer85" id="npcRetryV167">RETRY OFFER</button>`;document.getElementById('collectorCloseV161').onclick=()=>document.getElementById('collectorModalV161').classList.remove('show');document.getElementById('npcRetryV167').onclick=()=>renderNpcDealV161('Trying the card pool again…');return}
  const gv=marketValueV161(w.give)*npcInterestV161(w.npc,w.give),tv=marketValueV161(w.take),fair=clampV161(100-Math.abs(tv-gv)/Math.max(.1,gv)*100,8,100);
  body.innerHTML=`<div class="collectorDealTopV161"><span class="collectorAvatarV161">${w.npc.avatar}</span><div><small>${w.npc.label.toUpperCase()}</small><b>${w.npc.name}</b><p>Looking for ${w.npc.want.toLowerCase()}.</p></div><button type="button" class="collectorCloseV161" id="collectorCloseV161">×</button></div><div class="collectorOfferGridV161"><div class="collectorOfferCardV161"><small>YOU OFFER</small><img src="${w.give.thumb||w.give.img||''}"><b>${w.give.name}</b><strong>$${marketValueV161(w.give).toFixed(2)}</strong></div><div class="collectorSwapV161">⇄</div><div class="collectorOfferCardV161"><small>${w.npc.name.toUpperCase()} OFFERS</small><img src="${w.take.thumb||w.take.img||''}" onerror="this.onerror=null;this.src='${w.take.img||w.take.thumb||''}'"><b>${w.take.name}</b><strong>$${tv.toFixed(2)}</strong></div></div><div class="collectorCardPickerV161">${w.owned.map(c=>`<button type="button" class="collectorPickV161 ${c.id===w.give.id?'active':''}" data-npc-give-v161="${c.id}"><img src="${c.thumb||c.img||''}"><b>${c.name}</b></button>`).join('')}</div><div class="collectorFairV161"><div class="collectorFairTopV161"><span>DEAL QUALITY</span><b>${fair>=88?'STRONG':fair>=72?'FAIR':'TOUGH'} • ${Math.round(fair)}%</b></div><div class="collectorFairBarV161"><i style="width:${fair}%"></i></div></div><div class="collectorActionsV161"><button type="button" id="npcNextV161">NEXT CARD</button><button type="button" class="push" id="npcPushV161">PUSH DEAL</button><button type="button" class="accept" id="npcAcceptV161">ACCEPT</button></div><div class="collectorMessageV161">${message||`${w.npc.name}: “Show me what you've got.”`}</div>`;
  document.getElementById('collectorCloseV161').onclick=()=>document.getElementById('collectorModalV161').classList.remove('show');
  body.querySelectorAll('[data-npc-give-v161]').forEach(b=>b.onclick=async()=>{w.give=w.owned.find(c=>c.id===b.dataset.npcGiveV161)||w.give;w.round=0;w.take=null;await renderNpcDealV161(`${w.npc.name}: “Let me look at that one.”`)});
  document.getElementById('npcNextV161').onclick=async()=>{w.round=(w.round+1)%4;w.take=null;await renderNpcDealV161(`${w.npc.name}: “Here's another possibility.”`)};
  document.getElementById('npcPushV161').onclick=async()=>{if(w.round>=w.npc.patience)return renderNpcDealV161(`${w.npc.name}: “That's my limit. Take it or leave it.”`);w.round++;w.take=null;await renderNpcDealV161(`${w.npc.name}: “Alright — I can improve it a little.”`)};
  document.getElementById('npcAcceptV161').onclick=acceptNpcDealV161;
 }
 function acceptNpcDealV161(){const w=negotiationV161;if(!w?.give||!w?.take)return;const owned=state.binder?.[w.give.id];if(!owned||Number(owned.qty||0)<=0)return toast('You no longer own that card.');owned.qty--;if(owned.qty<=0)delete state.binder[w.give.id];const take={...w.take,__originV161:'trade'};addToBinderV64(take,1);const got=state.binder?.[take.id];if(got){ensureConditionV161(got,'trade');got.historyV161=got.historyV161||[];got.historyV161.unshift({time:Date.now(),label:`Traded with ${w.npc.name}`})}state.collectorNetV161.completed[w.npc.id]=Date.now();state.collectorNetV161.count=Number(state.collectorNetV161.count||0)+1;state.tradeV154=state.tradeV154||{day:dayKeyV161(),accepted:{},count:0};state.tradeV154.count=Number(state.tradeV154.count||0)+1;save();document.getElementById('collectorModalV161').classList.remove('show');renderCollectorNetworkV161();try{renderBinder();renderProfile()}catch(e){}toast(`Trade complete • ${take.name} added to Binder`)}
 function renderCollectorNetworkV161(){const el=document.getElementById('collectorNetworkV161');if(!el)return;el.innerHTML=NPCS_V161.map(n=>{let done=!!state.collectorNetV161.completed[n.id];return `<button type="button" class="collectorNpcV161 ${done?'done':''}" data-npc-v161="${n.id}"><span class="collectorAvatarV161">${n.avatar}</span><div><small>${n.label.toUpperCase()}</small><b>${n.name}</b><p>Wants ${n.want.toLowerCase()}</p></div><strong>${done?'DONE':'›'}</strong></button>`}).join('');el.querySelectorAll('[data-npc-v161]').forEach(b=>b.onclick=()=>openNpcV161(b.dataset.npcV161))}
 window.renderCollectorNetworkV161=renderCollectorNetworkV161;

 /* ---------- Mount UI ---------- */
 const buyPanel=document.querySelector('[data-exchange-panel-v154="buy"]');
 if(buyPanel&&!document.getElementById('marketPulseV161')){
  const marketGrid=document.getElementById('marketBuyV58');
  marketGrid?.insertAdjacentHTML('beforebegin','<div class="v161Section"><div class="v161SectionHead"><div><small>LIVING MARKET</small><b>Market Pulse</b></div><span>Updates daily</span></div><div class="marketPulseV161" id="marketPulseV161"></div></div>');
  const sourceGrid=buyPanel.querySelector('.exchangeSourceGridV154');
  sourceGrid?.insertAdjacentHTML('afterend','<div class="v161Section"><div class="v161SectionHead"><div><small>SEALED PRODUCTS</small><b>Sealed Collection</b></div><span>Open or hold</span></div><div class="sealedFeatureRowV161"><button type="button" class="sealedFeatureV161" id="openSealedShopV161"><small>SEALED SHOP</small><b>Buy Products</b><p>Inspired sealed packs, boxes, tins and binder collections.</p><strong>＋</strong></button><button type="button" class="sealedFeatureV161" id="openSealedVaultV161"><small>YOUR SEALED</small><b>Collection</b><p>Hold, resell or crack products into pack credits.</p><strong>▣</strong></button></div></div>');
 }
 const tradePanel=document.querySelector('[data-exchange-panel-v154="trade"]');
 if(tradePanel&&!document.getElementById('collectorNetworkV161'))tradePanel.insertAdjacentHTML('afterbegin','<div class="v161Section" style="margin-top:0"><div class="v161SectionHead"><div><small>COLLECTOR NETWORK</small><b>Trade With Collectors</b></div><span>1 deal each / day</span></div><div class="collectorNetworkV161" id="collectorNetworkV161"></div></div>');
 if(!document.getElementById('collectorModalV161'))document.body.insertAdjacentHTML('beforeend','<div class="collectorModalV161" id="collectorModalV161"><div class="collectorDealV161" id="collectorDealBodyV161"></div></div>');
 if(!document.getElementById('sealedModalV161'))document.body.insertAdjacentHTML('beforeend','<div class="sealedModalV161" id="sealedModalV161"><div class="sealedSheetV161"><div class="sealedSheetTopV161"><div><small>SEALED COLLECTION</small><h2 id="sealedTitleV161">Sealed Products</h2><p>Buy it, hold it, resell it, inspect it in 3D, or open it into packs.</p></div><button type="button" class="sealedCloseV161" id="sealedCloseV161">×</button></div><div class="sealedSetRailV161" id="sealedSetRailV161"></div><div class="sealedProductsV161" id="sealedProductsV161"></div><div class="v161SectionHead" style="margin-top:19px"><div><small>DISPLAY SHELF</small><b>Collector Shelf</b></div><span>Touch any item to inspect it</span></div><div class="sealedShelfGridV179" id="sealedShelfGridV179"></div><div class="v161SectionHead" style="margin-top:19px"><div><small>YOUR INVENTORY</small><b>Sealed Vault</b></div><span id="sealedCreditsSummaryV161">Pack credits ready</span></div><div class="sealedVaultGridV161" id="sealedVaultGridV161"></div></div></div>');
 const updateSealedEntryV180=()=>{const own=Object.values(state.sealedV161.inventory||{}).reduce((a,b)=>a+Number(b||0),0),sh=shelfCountV179(),val=totalSealedValueV179();const a=document.getElementById('sealedEntryOwnedV180'),b=document.getElementById('sealedEntryShelfV180'),c=document.getElementById('sealedEntryValueV180');if(a)a.textContent=own;if(b)b.textContent=sh;if(c)c.textContent='$'+val.toFixed(2)};const openSealed=()=>{renderSealedV161();updateSealedEntryV180();document.getElementById('sealedModalV161')?.classList.add('show')};document.getElementById('openSealedShopV161')?.addEventListener('click',openSealed);document.getElementById('openSealedVaultV161')?.addEventListener('click',openSealed);document.getElementById('openSealedMainV180')?.addEventListener('click',openSealed);document.querySelector('[data-exchange-tab-v154="sealed"]')?.addEventListener('click',()=>setTimeout(updateSealedEntryV180,30));document.getElementById('sealedCloseV161')?.addEventListener('click',()=>document.getElementById('sealedModalV161')?.classList.remove('show'));document.getElementById('sealedModalV161')?.addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('show')});if(!document.getElementById('sealedInspectModalV179'))document.body.insertAdjacentHTML('beforeend','<div class="sealedInspectModalV179" id="sealedInspectModalV179"><div class="sealedInspectCardV179"><button type="button" class="sealedInspectCloseV179" id="sealedInspectCloseV179">×</button><div class="sealedInspectStageWrapV179"><div class="sealedInspectStageV179" id="sealedInspectStageV179"></div></div><div class="sealedInspectMetaV179"><small>INSPIRED SEALED DISPLAY</small><h3 id="sealedInspectTitleV179">Sealed Product</h3><p id="sealedInspectSubV179"></p><div class="sealedInspectDescV179" id="sealedInspectDescV179"></div><div class="sealedInspectActionsV179"><button type="button" id="sealedInspectDisplayV179">DISPLAY / REMOVE</button><button type="button" id="sealedInspectOpenV179">OPEN</button><button type="button" id="sealedInspectSellV179">SELL</button></div></div></div></div>');document.getElementById('sealedInspectCloseV179')?.addEventListener('click',()=>document.getElementById('sealedInspectModalV179')?.classList.remove('show'));document.getElementById('sealedInspectModalV179')?.addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('show')});document.getElementById('sealedInspectDisplayV179')?.addEventListener('click',()=>{const m=document.getElementById('sealedInspectModalV179'),key=m?.dataset.inspectKey;if(key)toggleDisplaySealedV179(key)});document.getElementById('sealedInspectOpenV179')?.addEventListener('click',()=>{const m=document.getElementById('sealedInspectModalV179');if(!m)return; if(m.dataset.mode==='preview'){const pid=m.dataset.previewPid,setId=m.dataset.previewSetId; if(pid&&setId){sealedSetV161=setId; m.classList.remove('show'); buySealedV161(pid);} return;} const key=m.dataset.inspectKey;if(key){m.classList.remove('show');openSealedV161(key)}});document.getElementById('sealedInspectSellV179')?.addEventListener('click',()=>{const m=document.getElementById('sealedInspectModalV179'),key=m?.dataset.inspectKey;if(key){m.classList.remove('show');sellSealedV161(key)}});document.getElementById('collectorModalV161')?.addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('show')});

 function refreshV161(){renderMarketPulseV161();renderCollectorNetworkV161();syncPackCreditV161();try{updateSealedEntryV180()}catch(e){}try{renderSlabVaultV52();renderProfile()}catch(e){}}
 window.refreshV161=refreshV161;
 const earnRoot=document.getElementById('earn');new MutationObserver(()=>{if(earnRoot?.classList.contains('active')){refreshV161()}}).observe(earnRoot,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',e=>{if(e.target.closest('[data-exchange-tab-v154],.nav button[data-s="earn"]'))setTimeout(refreshV161,70)});
 refreshV161();save();
}catch(err){console.error('V161 optional systems failed safely',err)}})();



/* ===== original script 20 id=v162-uniform-nav-script ===== */
(()=>{const n=document.querySelector('.nav');if(!n)return;const labels={rip:'Rip Packs',binder:'Binder',bulk:'Bulk Tub',earn:'Trade',profile:'Profile'};Object.entries(labels).forEach(([k,v])=>{const b=n.querySelector(`button[data-s="${k}"]`);if(b)b.textContent=v})})();


/* ===== original script 21 id=v163-achievements-polish-script ===== */

(()=>{
try{
 const V163_FEATURES=[
  'Collector HQ dashboard','Profile completion ring','Daily Challenge Board','Daily cash + XP reward','Daily completion streak','Session pack counter','Session hit counter','Session cash delta','Live collection value breakdown','Achievement search','Achievement category filters','Achievement sorting','Achievement difficulty tiers','Weighted Collector Score','Pin up to 3 achievements','Next Milestone tracker','Badge earned / locked filters','Badge rarity frames','Badge progress bars','Master Set completion analytics','Closest Master Set spotlight','Chase-card progression analytics','Slab grade distribution','Grade 10 counter','Marketplace sales + revenue analytics','Trade career analytics','Sealed inventory summary','Recent activity feed','Resume last opened set','Rolling local save backups + restore'
 ];
 const p=state.polishV163=state.polishV163||{};p.pinned=p.pinned||[];p.notified=p.notified||{};p.lastSet=p.lastSet||sel?.id||'';p.daily=p.daily||{};p.backupStamp=Number(p.backupStamp||0);
 const sessionStart={packs:Number(state.packs||0),hits:Number(state.hits||0),coins:Number(state.coins||0)};
 const localDayV163=(d=new Date())=>window.gameDayKeyV170?.()||`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const prevDayV163=()=>window.gamePrevDayKeyV170?.()||(()=>{let d=new Date();d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})()
 const marketSalesV163=()=>Number(state.marketV57?.sold||state.marketV57?.sales?.length||0);
 const marketRevenueV163=()=>Number((state.marketV57?.sales||[]).reduce((n,x)=>n+Number(x.soldFor||0),0));
 const tradeCountV163=()=>Math.max(Number(state.tradeV154?.count||0),Number(state.collectorNetV161?.count||0));
 const slabsV163=()=>state.gradingV44?.graded||[];
 const grade10V163=()=>slabsV163().filter(x=>Number(x.grade||0)>=10).length;
 const masterCountV163=()=>SETS.filter(x=>{let m=masterProgressV58(x);return m.total>0&&m.n>=m.total}).length;
 const chaseCountV163=()=>SETS.filter(x=>state.chaseBadges?.[x.id]).length;
 const sealedOwnedV163=()=>Object.values(state.sealedV161?.inventory||{}).reduce((n,q)=>n+Number(q||0),0);
 const bulkTotalV163=()=>Object.values(state.bulkV64||{}).reduce((n,c)=>n+Number(c?.qty||0),0);
 const binderValueV163=()=>Object.values(state.binder||{}).reduce((n,c)=>n+sellPrice(c)*Number(c?.qty||0),0);
 const bulkValueV163=()=>Object.values(state.bulkV64||{}).reduce((n,c)=>n+sellPrice(c)*Number(c?.qty||0),0);
 const slabValueV163=()=>slabsV163().reduce((n,j)=>n+gradedValueV56(j),0);
 const collectionValueV163=()=>binderValueV163()+bulkValueV163()+slabValueV163();
 const allThemesV163=()=>Math.max(1,typeof BINDER_THEMES!=='undefined'?BINDER_THEMES.length:1);
 const escV163=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

 // 20 harder badges — 35 total.
 const EXTRA_BADGES_V163=[
  ['packTitanV163','PACK TITAN','Open 500 packs',()=>state.packs>=500,'🗿',{tier:'EPIC',get:()=>state.packs,target:500}],
  ['packMythV163','PACK MYTH','Open 1,000 packs',()=>state.packs>=1000,'🌌',{tier:'LEGEND',get:()=>state.packs,target:1000}],
  ['hitRoyalV163','HIT ROYALTY','Pull 250 hits',()=>state.hits>=250,'⚜️',{tier:'EPIC',get:()=>state.hits,target:250}],
  ['hitImmortalV163','HIT IMMORTAL','Pull 500 hits',()=>state.hits>=500,'☄️',{tier:'LEGEND',get:()=>state.hits,target:500}],
  ['archiveV163','LIVING ARCHIVE','Own 300 unique Binder cards',()=>Object.keys(state.binder||{}).length>=300,'🏛️',{tier:'EPIC',get:()=>Object.keys(state.binder||{}).length,target:300}],
  ['hoarderV163','CARDBOARD FORTRESS','Hold 1,000 Binder cards',()=>binderTotal()>=1000,'🏰',{tier:'LEGEND',get:()=>binderTotal(),target:1000}],
  ['maxLevelV163','LEVEL CAP','Reach Level 50',()=>levelFromXP(state.xp)>=50,'🌠',{tier:'LEGEND',get:()=>levelFromXP(state.xp),target:50}],
  ['master5V163','FIVE CROWNS','Complete 5 Master Sets',()=>masterCountV163()>=5,'👑',{tier:'EPIC',get:masterCountV163,target:5}],
  ['master10V163','MASTER DYNASTY','Complete 10 Master Sets',()=>masterCountV163()>=10,'🔱',{tier:'LEGEND',get:masterCountV163,target:10}],
  ['masterAllV163','TOTAL COMPLETION','Complete every Master Set',()=>masterCountV163()>=SETS.length,'🌐',{tier:'MYTHIC',get:masterCountV163,target:SETS.length}],
  ['chase5V163','CHASE FIVE','Earn 5 chase badges',()=>chaseCountV163()>=5,'🎯',{tier:'RARE',get:chaseCountV163,target:5}],
  ['chase15V163','CHASE VAULT','Earn 15 chase badges',()=>chaseCountV163()>=15,'💠',{tier:'EPIC',get:chaseCountV163,target:15}],
  ['chaseAllV163','CHASE CONSTELLATION','Earn every set chase badge',()=>chaseCountV163()>=SETS.length,'✨',{tier:'MYTHIC',get:chaseCountV163,target:SETS.length}],
  ['slab25V163','SLAB WALL','Own 25 graded cards',()=>slabsV163().length>=25,'🧊',{tier:'RARE',get:()=>slabsV163().length,target:25}],
  ['slab100V163','SLAB MUSEUM','Own 100 graded cards',()=>slabsV163().length>=100,'🏦',{tier:'LEGEND',get:()=>slabsV163().length,target:100}],
  ['ten10V163','PERFECT TEN CLUB','Own 10 Grade 10 slabs',()=>grade10V163()>=10,'💯',{tier:'LEGEND',get:grade10V163,target:10}],
  ['market50V163','MARKET MOGUL','Complete 50 marketplace sales',()=>marketSalesV163()>=50,'📈',{tier:'EPIC',get:marketSalesV163,target:50}],
  ['trade50V163','TRADE KING','Complete 50 trades',()=>tradeCountV163()>=50,'🤝',{tier:'EPIC',get:tradeCountV163,target:50}],
  ['bankerV163','FOUR FIGURES','Hold $1,000 cash',()=>Number(state.coins||0)>=1000,'🏦',{tier:'LEGEND',get:()=>Number(state.coins||0),target:1000}],
  ['binderLordV163','BINDER LORD','Own every binder theme',()=>Number(state.binderOwned?.length||0)>=allThemesV163(),'📚',{tier:'MYTHIC',get:()=>Number(state.binderOwned?.length||0),target:allThemesV163()}]
 ];
 EXTRA_BADGES_V163.forEach(x=>{if(!BADGE_DEFS.some(b=>b[0]===x[0]))BADGE_DEFS.push(x)});

 // 50 additional harder achievements — 109 total.
 const EXTRA_ACHIEVEMENTS_V163=[
  ['a60','Pack Avalanche','Open 750 packs','🏔️',()=>state.packs,750,{cat:'PACKS',diff:'EXPERT',points:250}],
  ['a61','Four Digits','Open 1,000 packs','1️⃣',()=>state.packs,1000,{cat:'PACKS',diff:'LEGEND',points:350}],
  ['a62','Cardboard Marathon','Open 1,500 packs','🏃',()=>state.packs,1500,{cat:'PACKS',diff:'LEGEND',points:450}],
  ['a63','Ripper Eternal','Open 2,500 packs','♾️',()=>state.packs,2500,{cat:'PACKS',diff:'MYTHIC',points:700}],
  ['a64','Heat Check','Pull 150 hits','🌡️',()=>state.hits,150,{cat:'HITS',diff:'EXPERT',points:250}],
  ['a65','Hit Factory','Pull 250 hits','🏭',()=>state.hits,250,{cat:'HITS',diff:'EXPERT',points:300}],
  ['a66','Foil Tsunami','Pull 500 hits','🌊',()=>state.hits,500,{cat:'HITS',diff:'LEGEND',points:450}],
  ['a67','One Thousand Sparks','Pull 1,000 hits','⚡',()=>state.hits,1000,{cat:'HITS',diff:'MYTHIC',points:750}],
  ['a68','Deep Catalogue','Own 300 unique Binder cards','🗃️',()=>Object.keys(state.binder||{}).length,300,{cat:'COLLECTION',diff:'EXPERT',points:250}],
  ['a69','Living Pokédex Shelf','Own 500 unique Binder cards','📚',()=>Object.keys(state.binder||{}).length,500,{cat:'COLLECTION',diff:'LEGEND',points:400}],
  ['a70','Heavy Binder','Hold 500 total Binder cards','🏋️',()=>binderTotal(),500,{cat:'COLLECTION',diff:'EXPERT',points:250}],
  ['a71','Four-Figure Binder','Hold 1,000 total Binder cards','🧱',()=>binderTotal(),1000,{cat:'COLLECTION',diff:'LEGEND',points:400}],
  ['a72','Cardboard Warehouse','Hold 1,500 total Binder cards','🏬',()=>binderTotal(),1500,{cat:'COLLECTION',diff:'MYTHIC',points:600}],
  ['a73','Icon Ascendant','Reach Level 40','🌟',()=>levelFromXP(state.xp),40,{cat:'LEVEL',diff:'EXPERT',points:250}],
  ['a74','Vault Royalty','Reach Level 45','⚜️',()=>levelFromXP(state.xp),45,{cat:'LEVEL',diff:'LEGEND',points:400}],
  ['a75','Absolute Collector','Reach Level 50','🌠',()=>levelFromXP(state.xp),50,{cat:'LEVEL',diff:'MYTHIC',points:700}],
  ['a76','Master Apprentice','Complete 5 Master Sets','🎓',masterCountV163,5,{cat:'MASTER SETS',diff:'EXPERT',points:300}],
  ['a77','Master Architect','Complete 10 Master Sets','🏗️',masterCountV163,10,{cat:'MASTER SETS',diff:'LEGEND',points:450}],
  ['a78','Master Empire','Complete 20 Master Sets','🏰',masterCountV163,20,{cat:'MASTER SETS',diff:'MYTHIC',points:650}],
  ['a79','Nothing Missing','Complete every Master Set','🌐',masterCountV163,SETS.length,{cat:'MASTER SETS',diff:'MYTHIC',points:1000}],
  ['a80','Chase Starter','Earn 5 chase-card badges','🎯',chaseCountV163,5,{cat:'CHASE',diff:'EXPERT',points:250}],
  ['a81','Chase Cabinet','Earn 10 chase-card badges','💠',chaseCountV163,10,{cat:'CHASE',diff:'EXPERT',points:350}],
  ['a82','Chase Museum','Earn 20 chase-card badges','🏛️',chaseCountV163,20,{cat:'CHASE',diff:'LEGEND',points:500}],
  ['a83','Every Grail','Earn every set chase badge','✨',chaseCountV163,SETS.length,{cat:'CHASE',diff:'MYTHIC',points:900}],
  ['a84','Slab Starter Wall','Own 10 slabs at once','🧊',()=>slabsV163().length,10,{cat:'GRADING',diff:'EXPERT',points:200}],
  ['a85','Slab Cabinet','Own 25 slabs at once','🗄️',()=>slabsV163().length,25,{cat:'GRADING',diff:'EXPERT',points:300}],
  ['a86','Slab Room','Own 50 slabs at once','🏢',()=>slabsV163().length,50,{cat:'GRADING',diff:'LEGEND',points:450}],
  ['a87','Slab Museum','Own 100 slabs at once','🏦',()=>slabsV163().length,100,{cat:'GRADING',diff:'MYTHIC',points:700}],
  ['a88','Gem Minted','Own a Grade 10 slab','💯',grade10V163,1,{cat:'GRADING',diff:'EXPERT',points:250}],
  ['a89','Ten Perfect Tens','Own 10 Grade 10 slabs','🔟',grade10V163,10,{cat:'GRADING',diff:'LEGEND',points:500}],
  ['a90','Perfect Shelf','Own 25 Grade 10 slabs','💎',grade10V163,25,{cat:'GRADING',diff:'MYTHIC',points:750}],
  ['a91','Perfect Vault','Own 50 Grade 10 slabs','👑',grade10V163,50,{cat:'GRADING',diff:'MYTHIC',points:1000}],
  ['a92','Seller Reputation','Complete 10 marketplace sales','🧾',marketSalesV163,10,{cat:'MARKET',diff:'EXPERT',points:200}],
  ['a93','Market Veteran','Complete 50 marketplace sales','📈',marketSalesV163,50,{cat:'MARKET',diff:'LEGEND',points:400}],
  ['a94','Market Institution','Complete 100 marketplace sales','🏛️',marketSalesV163,100,{cat:'MARKET',diff:'MYTHIC',points:650}],
  ['a95','Sales Ledger','Earn $500 from recorded marketplace sales','💵',marketRevenueV163,500,{cat:'MARKET',diff:'EXPERT',points:300}],
  ['a96','Auction House','Earn $2,000 from recorded marketplace sales','💰',marketRevenueV163,2000,{cat:'MARKET',diff:'MYTHIC',points:700}],
  ['a97','Trade Circuit','Complete 10 trades','🤝',tradeCountV163,10,{cat:'TRADING',diff:'EXPERT',points:250}],
  ['a98','Trade Network','Complete 50 trades','🌐',tradeCountV163,50,{cat:'TRADING',diff:'LEGEND',points:450}],
  ['a99','Trade Legend','Complete 100 trades','♻️',tradeCountV163,100,{cat:'TRADING',diff:'MYTHIC',points:700}],
  ['a100','Shop Veteran','Complete 100 shifts','🛠️',totalJobs,100,{cat:'CAREER',diff:'LEGEND',points:400}],
  ['a101','Shop Lifer','Complete 250 shifts','🏪',totalJobs,250,{cat:'CAREER',diff:'MYTHIC',points:650}],
  ['a102','Arcade Veteran','Win 100 premium mini-games','🕹️',totalMini,100,{cat:'CAREER',diff:'LEGEND',points:400}],
  ['a103','Arcade Immortal','Win 250 premium mini-games','👾',totalMini,250,{cat:'CAREER',diff:'MYTHIC',points:650}],
  ['a104','Serious Cash','Hold $500 at once','💸',()=>Number(state.coins||0),500,{cat:'ECONOMY',diff:'EXPERT',points:250}],
  ['a105','Four-Figure Float','Hold $1,000 at once','🏦',()=>Number(state.coins||0),1000,{cat:'ECONOMY',diff:'LEGEND',points:450}],
  ['a106','Quarter-K Grail','Own a raw card worth $250+','🪙',maxCardValue,250,{cat:'VALUE',diff:'LEGEND',points:500}],
  ['a107','Monster Grail','Own a raw card worth $500+','🐉',maxCardValue,500,{cat:'VALUE',diff:'MYTHIC',points:850}],
  ['a108','Binder Boutique Complete','Own every binder theme','📚',()=>Number(state.binderOwned?.length||0),allThemesV163(),{cat:'COLLECTION',diff:'MYTHIC',points:800}],
  ['a109','Sealed Wall','Hold 20 sealed products at once','📦',sealedOwnedV163,20,{cat:'SEALED',diff:'LEGEND',points:500}]
 ];
 EXTRA_ACHIEVEMENTS_V163.forEach(x=>{if(!ACHIEVEMENTS.some(a=>a[0]===x[0]))ACHIEVEMENTS.push(x)});

 function metaV163(a){
  if(a[6])return a[6];const n=Number(String(a[0]).replace(/\D/g,''));let cat='GENERAL',diff='STARTER',points=100;
  if(n<=8)cat='PACKS';else if(n<=14)cat='HITS';else if(n<=21)cat='COLLECTION';else if(n<=27)cat='LEVEL';else if(n<=31)cat='MASTER SETS';else if(n<=36)cat='CAREER';else if(n<=46)cat='MINIGAMES';else if(n<=51)cat='ECONOMY';else if(n<=53)cat='COLLECTION';else if(n<=59)cat='VALUE';
  const t=Number(a[5]||0);if(n>=47||t>=100)diff='VETERAN';if(t>=250||n>=54)diff='EXPERT';points=diff==='EXPERT'?175:diff==='VETERAN'?140:100;return {cat,diff,points}
 }
 function achievementRowsV163(){return ACHIEVEMENTS.map(a=>{const [id,n,d,ico,get,target]=a,m=metaV163(a),v=Math.max(0,Number(get())||0),pc=Math.min(100,target?v/target*100:0),ok=!!state.achievements[id];return{id,n,d,ico,get,target,m,v,pc,ok}})}
 function collectorScoreV163(){return achievementRowsV163().filter(x=>x.ok).reduce((n,x)=>n+Number(x.m.points||100),0)}

 // Daily challenge + streak system.
 function ensureDailyV163(){
  const key=localDayV163();let d=p.daily||{};
  if(d.day!==key){d={day:key,base:{packs:Number(state.packs||0),hits:Number(state.hits||0),xp:Number(state.xp||0)},claimed:false,streak:Number(d.streak||0),lastClaim:d.lastClaim||''};p.daily=d}
  d.base=d.base||{packs:Number(state.packs||0),hits:Number(state.hits||0),xp:Number(state.xp||0)};return d
 }
 function dailyRowsV163(){const d=ensureDailyV163();return [
  {name:'RIP RUN',desc:'Open 5 packs today',v:Math.max(0,Number(state.packs||0)-Number(d.base.packs||0)),target:5,ico:'🎴'},
  {name:'HIT HUNT',desc:'Pull 2 hits today',v:Math.max(0,Number(state.hits||0)-Number(d.base.hits||0)),target:2,ico:'✨'},
  {name:'XP PUSH',desc:'Earn 120 XP today',v:Math.max(0,Number(state.xp||0)-Number(d.base.xp||0)),target:120,ico:'⚡'}
 ]}
 function dailyReadyV163(){return dailyRowsV163().every(x=>x.v>=x.target)}
 function claimDailyV163(){let d=ensureDailyV163();if(d.claimed)return toast('Daily reward already claimed.');if(!dailyReadyV163())return toast('Finish all 3 daily challenges first.');d.claimed=true;d.streak=d.lastClaim===prevDayV163()?Number(d.streak||0)+1:1;d.lastClaim=localDayV163();state.coins=Math.round((Number(state.coins||0)+25)*100)/100;addXP(100,'daily');save();hitSound?.(4);navigator.vibrate?.([18,30,45]);toast(`Daily complete • +$25 • +100 XP • ${d.streak} day streak`);refreshV163()}

 // Rolling local backups (max 5 snapshots).
 const BACKUP_KEY_V163='tcgRipperBackupsV163';
 function readBackupsV163(){try{return JSON.parse(localStorage.getItem(BACKUP_KEY_V163)||'[]')}catch(e){return[]}}
 function backupV163(force=false){if(!force&&Date.now()-Number(p.backupStamp||0)<120000)return;try{let a=readBackupsV163(),snap=JSON.stringify(state);if(a[0]?.data===snap)return;p.backupStamp=Date.now();a.unshift({time:Date.now(),data:snap});a=a.slice(0,5);localStorage.setItem(BACKUP_KEY_V163,JSON.stringify(a))}catch(e){}}
 function restoreBackupV163(){let a=readBackupsV163();if(!a.length)return toast('No local backup exists yet.');let x;try{x=JSON.parse(a[0].data)}catch(e){return toast('Backup could not be read.')}if(confirm(`Restore backup from ${new Date(a[0].time).toLocaleString()}? Current progress will be replaced.`)){localStorage.setItem('tcgRipperSave',JSON.stringify(x));location.reload()}}

 // Make all future core saves evaluate the new progression and create rolling snapshots.
 const baseSaveV163=save;
 save=function(){
  ensureDailyV163();updateBadges();let newly=achievementRowsV163().filter(x=>x.ok&&!p.notified[x.id]);newly.forEach(x=>p.notified[x.id]=Date.now());backupV163(false);baseSaveV163();
  if(newly.length){setTimeout(()=>showUnlockV163(newly.length===1?`${newly[0].ico} ${newly[0].n} complete!`:`🏆 ${newly.length} achievements completed!`),30)}
  if(document.getElementById('profile')?.classList.contains('active'))setTimeout(refreshV163,20)
 };

 function showUnlockV163(msg){let e=document.getElementById('v163UnlockBurst');if(!e){e=document.createElement('div');e.id='v163UnlockBurst';e.className='v163UnlockBurst';document.body.appendChild(e)}e.textContent=msg;e.classList.remove('show');void e.offsetWidth;e.classList.add('show')}

 // Collector HQ mount.
 function mountHQV163(){if(document.getElementById('collectorHQV163'))return;const career=document.getElementById('careerGrid');if(!career)return;career.insertAdjacentHTML('afterend',`<section class="v163HQ" id="collectorHQV163"><div class="v163HQTop"><div class="v163Card v163RingCard"><div class="v163Ring" id="v163Ring"><div style="text-align:center"><b id="v163RingPct">0%</b><span>COMPLETE</span></div></div><div class="v163RingText"><b id="v163Score">0</b> Collector Score</div></div><div class="v163Card"><small>SESSION PULSE</small><h3>Right now</h3><div class="v163PulseGrid"><div class="v163Pulse"><b id="v163SessionPacks">0</b><span>PACKS</span></div><div class="v163Pulse"><b id="v163SessionHits">0</b><span>HITS</span></div><div class="v163Pulse"><b id="v163SessionCash">$0</b><span>CASH Δ</span></div></div><div class="v163Resume" id="v163Resume"></div></div></div><div class="v163Card"><small>DAILY BOARD</small><h3>Collector Challenges <span id="v163DailyStreak" style="float:right;color:#ffd84d;font-size:10px"></span></h3><div class="v163Daily" id="v163Daily"></div><button class="v163DailyClaim" id="v163DailyClaim">CLAIM DAILY REWARD • $25 + 100 XP</button></div><div class="v163Card"><small>COLLECTION INTELLIGENCE</small><h3>Vault snapshot</h3><div class="v163Intel" id="v163Intel"></div></div><div class="v163Card"><small>NEXT MILESTONES</small><h3>Closest hard goals</h3><div class="v163Milestones" id="v163Milestones"></div></div><div class="v163Card"><small>RECENT ACTIVITY</small><h3>Latest pack history</h3><div class="v163Milestones" id="v163Recent"></div></div></section>`);document.getElementById('v163DailyClaim').onclick=claimDailyV163}

 function closestMasterV163(){let a=SETS.map(s=>({s,m:masterProgressV58(s)})).filter(x=>x.m.total>0&&x.m.n<x.m.total).sort((a,b)=>b.m.p-a.m.p);return a[0]||null}
 function updateHQV163(){mountHQV163();let el=document.getElementById('collectorHQV163');if(!el)return;let rows=achievementRowsV163(),done=rows.filter(x=>x.ok).length,pct=Math.round(done/Math.max(1,rows.length)*100),ring=document.getElementById('v163Ring');if(ring)ring.style.setProperty('--p',pct);document.getElementById('v163RingPct').textContent=pct+'%';document.getElementById('v163Score').textContent=collectorScoreV163().toLocaleString();document.getElementById('v163SessionPacks').textContent=Math.max(0,Number(state.packs||0)-sessionStart.packs);document.getElementById('v163SessionHits').textContent=Math.max(0,Number(state.hits||0)-sessionStart.hits);let dc=Number(state.coins||0)-sessionStart.coins;document.getElementById('v163SessionCash').textContent=(dc>=0?'+':'')+'$'+dc.toFixed(2);
  let d=ensureDailyV163(),dr=dailyRowsV163();document.getElementById('v163DailyStreak').textContent=`🔥 ${Number(d.streak||0)} DAY STREAK`;document.getElementById('v163Daily').innerHTML=dr.map(x=>{let pc=Math.min(100,x.v/x.target*100);return `<div class="v163DailyRow"><div><b>${x.ico} ${x.name}</b><small>${x.desc}</small><div class="v163MiniTrack"><i style="width:${pc}%"></i></div></div><strong>${Math.min(x.target,Math.floor(x.v))}/${x.target}</strong></div>`}).join('');let cb=document.getElementById('v163DailyClaim');cb.disabled=!!d.claimed||!dailyReadyV163();cb.textContent=d.claimed?'DAILY REWARD CLAIMED ✓':'CLAIM DAILY REWARD • $25 + 100 XP';
  const slabs=slabsV163(),gm=grade10V163(),m=closestMasterV163(),sealed=sealedOwnedV163(),sales=marketSalesV163(),revenue=marketRevenueV163(),trades=tradeCountV163();document.getElementById('v163Intel').innerHTML=`<div><b>$${collectionValueV163().toFixed(2)}</b><span>TOTAL COLLECTION VALUE</span></div><div><b>${masterCountV163()} / ${SETS.length}</b><span>MASTER SETS COMPLETE</span></div><div><b>${chaseCountV163()} / ${SETS.length}</b><span>CHASE BADGES</span></div><div><b>${slabs.length} • ${gm} GEM 10</b><span>SLAB VAULT</span></div><div><b>${slabs.filter(x=>Number(x.grade||0)>=9).length}</b><span>SLABS GRADE 9+</span></div><div><b>${sales} • $${revenue.toFixed(0)}</b><span>MARKET SALES / REVENUE</span></div><div><b>${trades}</b><span>TRADES COMPLETED</span></div><div><b>${sealed}</b><span>SEALED PRODUCTS HELD</span></div>${m?`<div style="grid-column:1/-1"><b>${escV163(m.s.name)} • ${Math.round(m.m.p)}%</b><span>CLOSEST MASTER SET • ${m.m.n}/${m.m.total}</span></div>`:''}`;
  let pins=(p.pinned||[]).map(id=>rows.find(x=>x.id===id)).filter(x=>x&&!x.ok),near=rows.filter(x=>!x.ok&&!p.pinned.includes(x.id)).sort((a,b)=>b.pc-a.pc).slice(0,3),show=[...pins,...near].slice(0,3);document.getElementById('v163Milestones').innerHTML=show.length?show.map(x=>`<div class="v163Milestone"><i>${x.ico}</i><div><b>${escV163(x.n)}</b><small>${escV163(x.d)}</small><div class="v163MiniTrack"><i style="width:${x.pc}%"></i></div></div><strong>${Math.floor(x.pc)}%</strong></div>`).join(''):'<div class="v163Milestone"><i>🏆</i><div><b>Everything complete</b><small>No unfinished milestones.</small></div><strong>100%</strong></div>';
  let recent=(state.history||[]).slice(0,4);document.getElementById('v163Recent').innerHTML=recent.length?recent.map(h=>`<div class="v163Milestone"><i>🎴</i><div><b>${escV163(h.best||'Pack opened')}</b><small>${escV163(h.set||'Unknown set')} • ${new Date(h.time||Date.now()).toLocaleDateString()}</small></div><strong>${escV163(h.rarity||'')}</strong></div>`).join(''):'<div class="v163Milestone"><i>•</i><div><b>No recent packs yet</b><small>Open a pack to start the feed.</small></div><strong></strong></div>';
  let last=SETS.find(x=>x.id===p.lastSet)||sel,rr=document.getElementById('v163Resume');if(last){rr.innerHTML=`<div><b>Resume ${escV163(last.name)}</b><small>Jump straight back to your last booster shelf selection.</small></div><button type="button">OPEN</button>`;rr.querySelector('button').onclick=()=>resumeSetV163(last.id)}
 }
 function resumeSetV163(id){let s=SETS.find(x=>x.id===id);if(!s||!setUnlocked(s))return toast('That set is still locked.');sel=s;p.lastSet=s.id;renderSets();applyPackArt();resetPack();document.querySelector('.nav button[data-s="rip"]')?.click();save()}

 // Achievement controls, categories, sorting, difficulty, pinning.
 function mountAchievementToolsV163(){if(document.getElementById('v163AchTools'))return;let grid=document.getElementById('achievementGrid');if(!grid)return;let wrap=document.createElement('div');wrap.id='v163AchTools';wrap.className='v163AchTools';wrap.innerHTML=`<input id="v163AchSearch" placeholder="Search 109 achievements"><select id="v163AchCategory"><option value="ALL">ALL CATEGORIES</option>${[...new Set(ACHIEVEMENTS.map(a=>metaV163(a).cat))].sort().map(x=>`<option>${x}</option>`).join('')}</select><select id="v163AchSort"><option value="near">Closest first</option><option value="hard">Hardest first</option><option value="points">Most points</option><option value="name">Name A–Z</option></select>`;grid.before(wrap);['v163AchSearch','v163AchCategory','v163AchSort'].forEach(id=>document.getElementById(id).addEventListener(id==='v163AchSearch'?'input':'change',()=>renderAchievementsV163(window.profileAchFilterV160||'all')))}
 function renderAchievementsV163(filter='all'){window.profileAchFilterV160=filter;mountAchievementToolsV163();let el=document.getElementById('achievementGrid');if(!el)return;let q=(document.getElementById('v163AchSearch')?.value||'').trim().toLowerCase(),cat=document.getElementById('v163AchCategory')?.value||'ALL',sort=document.getElementById('v163AchSort')?.value||'near',rows=achievementRowsV163();if(filter==='done')rows=rows.filter(x=>x.ok);if(filter==='near')rows=rows.filter(x=>!x.ok&&x.pc>=40);if(cat!=='ALL')rows=rows.filter(x=>x.m.cat===cat);if(q)rows=rows.filter(x=>(x.n+' '+x.d+' '+x.m.cat).toLowerCase().includes(q));const rank={STARTER:1,VETERAN:2,EXPERT:3,LEGEND:4,MYTHIC:5};if(sort==='near')rows.sort((a,b)=>(a.ok-b.ok)||b.pc-a.pc);if(sort==='hard')rows.sort((a,b)=>(rank[b.m.diff]||0)-(rank[a.m.diff]||0)||b.target-a.target);if(sort==='points')rows.sort((a,b)=>b.m.points-a.m.points);if(sort==='name')rows.sort((a,b)=>a.n.localeCompare(b.n));el.innerHTML=rows.length?rows.map(x=>{let pin=p.pinned.includes(x.id),dc=x.m.diff==='MYTHIC'?'mythic':(x.m.diff==='LEGEND'||x.m.diff==='EXPERT')?'hard':'';return `<div class="achievement ${x.ok?'done':''} ${pin?'v163Pinned':''}"><button type="button" class="v163Pin ${pin?'on':''}" data-v163-pin="${x.id}" title="Pin achievement">${pin?'★':'☆'}</button><div class="achIcon">${x.ok?x.ico:'◆'}</div><div><b>${escV163(x.n)}</b><small>${escV163(x.d)}</small><div class="v163AchMeta"><span class="v163Tag">${escV163(x.m.cat)}</span><span class="v163Tag ${dc}">${escV163(x.m.diff)}</span><span class="v163Tag">${x.m.points} PTS</span></div><div class="achProgress"><i style="width:${x.pc}%"></i></div></div><em>${x.ok?'DONE':`${Math.floor(Math.min(x.v,x.target))}/${x.target}`}</em></div>`}).join(''):'<div class="profileEmptyV158">Nothing matches this filter.</div>';document.querySelectorAll('[data-ach-filter-v160]').forEach(b=>b.classList.toggle('active',b.dataset.achFilterV160===filter))}
 window.renderAchievementsV160=renderAchievementsV163;
 document.getElementById('achievementGrid')?.addEventListener('click',e=>{let b=e.target.closest('[data-v163-pin]');if(!b)return;let id=b.dataset.v163Pin,arr=p.pinned||[];if(arr.includes(id))arr=arr.filter(x=>x!==id);else{if(arr.length>=3){toast('You can pin up to 3 achievements.');return}arr=[...arr,id]}p.pinned=arr;save();renderAchievementsV163(window.profileAchFilterV160||'all')});

 // Badge filters + rarity frames + live progress bars.
 let badgeFilterV163='all';
 function mountBadgeToolsV163(){if(document.getElementById('v163BadgeTools'))return;let el=document.getElementById('badges');if(!el)return;el.insertAdjacentHTML('beforebegin','<div class="v163BadgeTools" id="v163BadgeTools"><button class="active" data-v163-badge-filter="all">ALL</button><button data-v163-badge-filter="earned">EARNED</button><button data-v163-badge-filter="locked">LOCKED</button></div>');document.getElementById('v163BadgeTools').onclick=e=>{let b=e.target.closest('[data-v163-badge-filter]');if(!b)return;badgeFilterV163=b.dataset.v163BadgeFilter;renderBadgesV163()}}
 const OLD_BADGE_PROGRESS_V163={first:[()=>state.packs,1],ten:[()=>state.packs,10],fifty:[()=>state.packs,50],hundred:[()=>state.packs,100],hit1:[()=>state.hits,10],hit50:[()=>state.hits,50],hit100:[()=>state.hits,100],binder:[()=>Object.keys(state.binder||{}).length,25],vault:[()=>Object.keys(state.binder||{}).length,100],level10:[()=>levelFromXP(state.xp),10],elite:[()=>levelFromXP(state.xp),20],master:[()=>levelFromXP(state.xp),30],icon:[()=>levelFromXP(state.xp),38],worker:[totalJobs,20],arcade:[totalMini,20]};
 function renderBadgesV163(){mountBadgeToolsV163();let el=document.getElementById('badges');if(!el)return;let defs=BADGE_DEFS.filter(([id])=>badgeFilterV163==='all'||(badgeFilterV163==='earned')===!!state.badges[id]);el.innerHTML=defs.map((b,i)=>{let [id,n,d,fn,ico,meta]=b,earned=!!state.badges[id],pr=meta?.get?[meta.get,meta.target]:OLD_BADGE_PROGRESS_V163[id],v=pr?Number(pr[0]())||0:(earned?1:0),target=Number(pr?.[1]||1),pc=Math.min(100,target?v/target*100:0),tier=meta?.tier||(i>=25?'EPIC':i>=15?'RARE':'STANDARD'),cl=tier==='MYTHIC'||tier==='LEGEND'?'v163Legend':tier==='EPIC'?'v163Epic':tier==='RARE'?'v163Rare':'';return `<div class="badge ${earned?'earned':'lockedBadge'} ${cl}"><i>${earned?ico:'◆'}</i><b>${escV163(n)}</b><span>${escV163(d)}</span><div class="v163BadgeProgress"><i style="width:${pc}%"></i></div><span class="v163BadgeTier">${tier} • ${earned?'EARNED':`${Math.floor(Math.min(v,target))}/${target}`}</span></div>`}).join('');document.querySelectorAll('[data-v163-badge-filter]').forEach(b=>b.classList.toggle('active',b.dataset.v163BadgeFilter===badgeFilterV163))}

 // Settings backup/restore controls + displayed version.
 function mountSettingsV163(){let data=document.querySelector('.settingsDataV158');if(!data||document.getElementById('v163BackupRow'))return;data.querySelectorAll('.settingsDataLineV158').forEach(r=>{if(r.textContent.includes('Game Version'))r.querySelector('b').textContent='V195 AUDITED'});let div=document.createElement('div');div.id='v163BackupRow';div.className='v163BackupRow';div.innerHTML='<button type="button" id="v163MakeBackup">MAKE BACKUP</button><button type="button" id="v163RestoreBackup">RESTORE LAST</button><button type="button" id="v164WhatsNewBtn" style="grid-column:1/-1">SYSTEM AUDIT / WHAT’S NEW</button>';data.appendChild(div);document.getElementById('v163MakeBackup').onclick=()=>{backupV163(true);toast('Local V196 backup created.')};document.getElementById('v163RestoreBackup').onclick=restoreBackupV163;document.getElementById('v164WhatsNewBtn').onclick=()=>{mountWhatsNewV163();document.getElementById('v163WhatsNew')?.classList.add('show')}}

 // Release panel is now opt-in from Settings. It never interrupts startup.
 function mountWhatsNewV163(){if(document.getElementById('v163WhatsNew'))return;const fixes=[
  'FIXED • 10-pack mode could trap the selector and block returning to 1 pack on mobile.',
  'FIXED • Two sale/purchase paths called a missing renderStats() function and could crash after transactions.',
  'FIXED • Audio cash-change tracking watched an obsolete state.money field instead of the live cash balance.',
  'FIXED • Sealed-product themes matched raw set IDs against set names, causing generic artwork on many expansions.',
  'FIXED • Master Set totals could exclude secret cards and Gallery / Vault subset cards.',
  'FIXED • Master Set progress could temporarily fall when a card was grading, slabbed, or actively listed even though you still owned it.',
  'FIXED • Old V163/V190 copy remained in Settings and audit panels after later upgrades.',
  'VERIFIED • All 32 set pack generators create complete 10-card packs.',
  'VERIFIED • All 32 sets can roll a God Pack at the global 1 in 1,000 rate.',
  'VERIFIED • Complete card acquisition catalog has a valid rip / buy / trade route once its set is unlocked.',
  'VERIFIED • Binder, Bulk Tub, grading, slab sales, marketplace listing/cancel/sale, trades, NPC collectors and sealed products complete their lifecycle.',
  'VERIFIED • 109 achievements and 35 badges have unique IDs and safe progress callbacks.',
  'VERIFIED • Daily challenges, shop-reputation gates, game clock, backup/export and all main navigation/sub-tabs complete without dead ends.',
  'NOTE • Live card art/catalog/pricing still depend on TCGdex/network availability; cloud save still depends on a confirmed Supabase login.'
 ];document.body.insertAdjacentHTML('beforeend',`<div class="v163WhatsNew" id="v163WhatsNew"><div class="v163WhatsCard"><small style="color:#ffd84d;font-weight:1000;letter-spacing:2px">V196 • MYTHIC REWARDS</small><h2>Full-game stability + mythic rewards</h2><p>I audited the game end-to-end, repaired the confirmed defects, then ran regression tests across every core progression and economy route. This is the in-game audit log, plus the new mythic promo reward system.</p><div class="v163FeatureGrid">${fixes.map((x,i)=>`<div>${String(i+1).padStart(2,'0')} • ${escV163(x)}</div>`).join('')}</div><button type="button" id="v163WhatsClose">BACK TO GAME</button></div></div>`);document.getElementById('v163WhatsClose').onclick=()=>document.getElementById('v163WhatsNew').classList.remove('show')}

 // Track last selected set without changing pack-opening logic.
 document.getElementById('sets')?.addEventListener('click',e=>{let card=e.target.closest('.set[data-set-id]');if(!card||e.target.closest('.setReqBtn'))return;setTimeout(()=>{if(card.classList.contains('selected')){p.lastSet=card.dataset.setId;try{baseSaveV163()}catch(_){}}},80)});

 // Wrap the existing profile renderer safely, preserving V158/V160 behavior.
 const baseRenderProfileV163=renderProfile;
 renderProfile=function(){baseRenderProfileV163();refreshV163()};
 function refreshV163(){updateBadges();let done=ACHIEVEMENTS.filter(a=>state.achievements[a[0]]).length;let ac=document.getElementById('achievementCount');if(ac)ac.textContent=`${done} / ${ACHIEVEMENTS.length}`;let bc=BADGE_DEFS.filter(b=>state.badges[b[0]]).length,bce=document.getElementById('badgeCount');if(bce)bce.textContent=`${bc} / ${BADGE_DEFS.length}`;let ap=document.getElementById('achPercent');if(ap)ap.textContent=Math.round(done/ACHIEVEMENTS.length*100)+'%';let pts=document.getElementById('achPoints');if(pts)pts.textContent=collectorScoreV163().toLocaleString();updateHQV163();renderBadgesV163();renderAchievementsV163(window.profileAchFilterV160||'all');mountSettingsV163()}
 window.refreshV163=refreshV163;

 // Migration: award retroactive hard goals silently, then show one summary rather than dozens of toasts.
 const hadMigration=!!p.migratedV163;updateBadges();let retro=EXTRA_ACHIEVEMENTS_V163.filter(a=>state.achievements[a[0]]).length;if(!hadMigration){achievementRowsV163().filter(x=>x.ok).forEach(x=>p.notified[x.id]=Date.now());p.migratedV163=Date.now();baseSaveV163();if(retro)setTimeout(()=>showUnlockV163(`🏆 ${retro} new hard achievement${retro===1?'':'s'} already earned`),900)}
 backupV163(true);mountSettingsV163();refreshV163();baseSaveV163();
}catch(err){console.error('V163 polish layer failed safely',err)}
})();



/* ===== original script 22 id=v165-centre-set-rail ===== */

(()=>{
  function centreSelectedSetV165(behavior='smooth'){
    const rail=document.getElementById('sets');
    const card=rail?.querySelector('.set.selected');
    if(!rail||!card)return;
    const target=card.offsetLeft-(rail.clientWidth-card.offsetWidth)/2;
    try{rail.scrollTo({left:Math.max(0,target),behavior})}
    catch(_){rail.scrollLeft=Math.max(0,target)}
  }
  window.centreSelectedSetV165=centreSelectedSetV165;
  const centreSoon=(behavior='smooth')=>{
    requestAnimationFrame(()=>requestAnimationFrame(()=>centreSelectedSetV165(behavior)));
    setTimeout(()=>centreSelectedSetV165(behavior),110);
  };
  document.addEventListener('click',e=>{
    if(e.target.closest('.nav button[data-s="rip"]'))centreSoon('smooth');
    if(e.target.closest('#sets .set')&&!e.target.closest('.setReqBtn'))centreSoon('smooth');
  },true);
  let resizeTimer=0;
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>centreSelectedSetV165('auto'),120)},{passive:true});
  addEventListener('orientationchange',()=>setTimeout(()=>centreSelectedSetV165('auto'),180),{passive:true});
  setTimeout(()=>centreSelectedSetV165('auto'),180);
})();



/* ===== original script 23 id=v168-inspection-light-controller ===== */

(()=>{
  const q=s=>document.querySelector(s);
  function ensureInspectionLayersV168(){
    const card=q('#inspect3d');if(!card)return null;
    if(!card.querySelector('.inspectionLampV168')){
      card.insertAdjacentHTML('beforeend','<span class="inspectionLampV168"></span><span class="inspectionSheenV168"></span><span class="inspectionHintV168">DRAG LIGHT ACROSS CARD</span>');
    }
    return card;
  }
  function setLightPositionV168(card,clientX,clientY){
    if(!card)return;const r=card.getBoundingClientRect();if(!r.width||!r.height)return;
    const x=Math.max(0,Math.min(100,((clientX-r.left)/r.width)*100));
    const y=Math.max(0,Math.min(100,((clientY-r.top)/r.height)*100));
    card.style.setProperty('--light-x',x.toFixed(1)+'%');
    card.style.setProperty('--light-y',y.toFixed(1)+'%');
  }
  function setInspectionV168(on){
    const card=ensureInspectionLayersV168(),modal=q('#cardModal .inspectCard'),btn=q('#conditionInspectBtnV161');
    if(!card)return;
    card.classList.toggle('inspectionLightV168',!!on);
    // Retire the old pseudo-element implementation so it cannot conflict with this one.
    card.classList.remove('inspectionLightV161');
    modal?.classList.toggle('inspectionModeV168',!!on);
    if(btn){btn.classList.toggle('inspectionActiveV168',!!on);btn.textContent=on?'EXIT LIGHT INSPECTION':'INSPECT UNDER LIGHT'}
    if(on){card.style.setProperty('--light-x','50%');card.style.setProperty('--light-y','42%');if(navigator.vibrate)try{navigator.vibrate(16)}catch(_){}}
  }
  function inspectionOnV168(){return !!q('#inspect3d.inspectionLightV168')}

  // Direct delegation survives the condition panel being re-rendered for every card.
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#conditionInspectBtnV161');if(!btn)return;
    // The legacy handler fires on the target first; always clear its class and use the V168 mode.
    const next=!inspectionOnV168();
    setTimeout(()=>setInspectionV168(next),0);
  });

  document.addEventListener('pointerdown',e=>{
    const card=e.target.closest?.('#inspect3d.inspectionLightV168');if(!card)return;
    setLightPositionV168(card,e.clientX,e.clientY);
  },{passive:true});
  document.addEventListener('pointermove',e=>{
    const card=e.target.closest?.('#inspect3d.inspectionLightV168');if(!card)return;
    setLightPositionV168(card,e.clientX,e.clientY);
  },{passive:true});

  // Reset cleanly when leaving the inspector or opening another card.
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#closeCard'))setInspectionV168(false);
  },true);
  const modal=q('#cardModal');
  if(modal&&window.MutationObserver){
    new MutationObserver(()=>{if(!modal.classList.contains('show'))setInspectionV168(false)}).observe(modal,{attributes:true,attributeFilter:['class']});
  }
})();



/* ===== original script 24 id=v170-game-clock-controller ===== */

(()=>{try{
 const DAY_MS=60*60*1000;
 const pad=n=>String(n).padStart(2,'0');
 const parseDateKey=k=>{const m=String(k||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?{y:+m[1],m:+m[2],d:+m[3]}:null};
 const keyFromDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const safeBase=()=>{const fromDaily=parseDateKey(state?.polishV163?.daily?.day);const now=new Date();return fromDaily||{y:now.getFullYear(),m:now.getMonth()+1,d:now.getDate()}};
 state.gameClockV170=state.gameClockV170||{};
 const gc=state.gameClockV170;
 if(!Number.isFinite(Number(gc.anchorReal))||Number(gc.anchorReal)<=0)gc.anchorReal=Date.now();
 if(!parseDateKey(gc.anchorDate)){const b=safeBase();gc.anchorDate=`${b.y}-${pad(b.m)}-${pad(b.d)}`}
 gc.dayLengthMs=DAY_MS;
 const dayIndex=()=>Math.max(0,Math.floor(Math.max(0,Date.now()-Number(gc.anchorReal||Date.now()))/DAY_MS));
 const dateForOffset=(off=0)=>{const b=parseDateKey(gc.anchorDate)||safeBase();return new Date(b.y,b.m-1,b.d+dayIndex()+Number(off||0),12,0,0,0)};
 const gameKey=(off=0)=>keyFromDate(dateForOffset(off));
 window.gameDayKeyV170=()=>gameKey(0);
 window.gamePrevDayKeyV170=()=>gameKey(-1);
 window.gameDayKeyOffsetV170=off=>gameKey(off);
 function gameProgress(){const elapsed=Math.max(0,Date.now()-Number(gc.anchorReal||Date.now())),within=elapsed%DAY_MS,totalMinutes=Math.floor(within/DAY_MS*1440),left=DAY_MS-within;return {within,totalMinutes,left,h:Math.floor(totalMinutes/60)%24,m:totalMinutes%60}}
 function fmtLeft(ms){ms=Math.max(0,Math.ceil(ms/1000));const mm=Math.floor(ms/60),ss=ms%60;return `${pad(mm)}:${pad(ss)}`}
 function fmtDate(d){return d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
 function buildCalendar(d){const grid=document.getElementById('gameMonthGridV170');if(!grid)return;const y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0,12).getDate(),first=new Date(y,m,1,12).getDay(),mondayIndex=(first+6)%7;let a=[];for(let i=0;i<mondayIndex;i++)a.push('<span class="blank"></span>');for(let n=1;n<=days;n++)a.push(`<span class="${n===d.getDate()?'today':''}">${n}</span>`);while(a.length%7)a.push('<span class="blank"></span>');grid.innerHTML=a.join('');const t=document.getElementById('gameMonthTitleV170');if(t)t.textContent=d.toLocaleDateString(undefined,{month:'long',year:'numeric'})}
 function resetDailySystems(force=false){const key=gameKey();if(!force&&gc.lastProcessedDay===key)return;const oldKey=gc.lastProcessedDay;gc.lastProcessedDay=key;
  try{if(state.polishV163?.daily&&state.polishV163.daily.day!==key){const prev=state.polishV163.daily;state.polishV163.daily={day:key,base:{packs:Number(state.packs||0),hits:Number(state.hits||0),xp:Number(state.xp||0)},claimed:false,streak:Number(prev.streak||0),lastClaim:prev.lastClaim||''}}}catch(_){ }
  try{state.tradeV154=state.tradeV154||{day:key,accepted:{},count:0};if(state.tradeV154.day!==key){state.tradeV154.day=key;state.tradeV154.accepted={}}}catch(_){ }
  try{state.collectorNetV161=state.collectorNetV161||{day:key,completed:{},count:0};if(state.collectorNetV161.day!==key){state.collectorNetV161.day=key;state.collectorNetV161.completed={}}}catch(_){ }
  try{save()}catch(_){try{localStorage.setItem('tcgRipperSave',JSON.stringify(state))}catch(__){}}
  try{window.refreshV163?.()}catch(_){ }try{window.renderTradeBoardV154?.()}catch(_){ }try{window.renderCollectorNetworkV161?.()}catch(_){ }try{window.refreshV161?.()}catch(_){ }
  if(oldKey&&oldKey!==key)try{toast(`🌅 Day ${dayIndex()+1} started • daily challenges and trades refreshed`)}catch(_){ }
 }
 function renderClock(){resetDailySystems(false);const d=dateForOffset(0),p=gameProgress(),day=dayIndex()+1,time=`${pad(p.h)}:${pad(p.m)}`,left=fmtLeft(p.left),dow=d.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};set('gameDayV170',`DAY ${day} • ${dow}`);set('gameTimeV170',time);set('gameResetV170',left);set('gameCalendarDayV170',`DAY ${day}`);set('gameCalendarDateV170',fmtDate(d));set('gameCalendarTimeV170',time);set('gameCalendarResetV170',left);const tr=document.getElementById('tradeRefreshV154');if(tr)tr.textContent=`RESET ${left}`;buildCalendar(d)}
 const modal=document.getElementById('gameCalendarModalV170'),open=document.getElementById('gameClockV170'),close=document.getElementById('gameCalendarCloseV170');
 const openCal=()=>{renderClock();modal?.classList.add('show');modal?.setAttribute('aria-hidden','false')};const closeCal=()=>{modal?.classList.remove('show');modal?.setAttribute('aria-hidden','true')};open?.addEventListener('click',openCal);close?.addEventListener('click',closeCal);modal?.addEventListener('click',e=>{if(e.target===modal)closeCal()});
 resetDailySystems(true);renderClock();const timer=setInterval(renderClock,1000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 try{save()}catch(_){ }
}catch(err){console.error('V170 game clock',err)}})();



/* ===== original script 25 id=v171-ten-pack-controller ===== */

(()=>{try{
 const mode=document.getElementById('v114PackMode');
 if(mode){
  /* Own the selector interaction so mobile taps cannot fall through to older handlers. */
  mode.addEventListener('click',e=>{
   const b=e.target.closest('button[data-count]');
   if(!b)return;
   e.preventDefault();e.stopImmediatePropagation();
   if(typeof busy!=='undefined'&&busy)return;
   const next=Number(b.dataset.count)===10?10:1;
   if(typeof v114PackCount!=='undefined')v114PackCount=next;
   if(typeof resetPack==='function')resetPack();
   if(typeof syncPackCreditV161==='function')setTimeout(syncPackCreditV161,0);
   if(next===10&&typeof toast==='function')toast('10-pack mode ready • swipe the main pack to rip all 10');
  },true);
 }
 /* Keep wording aligned with the new gesture model whenever mode is rendered. */
 const oldRender=typeof v114RenderMode==='function'?v114RenderMode:null;
 if(oldRender){
  v114RenderMode=function(){
   oldRender();
   const hint=document.querySelector('#v114TenLine .v114TenHint');
   if(hint)hint.textContent='SWIPE THE MAIN PACK TO RIP ALL 10';
  };
  try{v114RenderMode()}catch(_){ }
 }
}catch(err){console.error('V171 ten-pack fix',err)}})();



/* ===== original script 26 id=v175-ten-pack-mode-controller ===== */

(()=>{try{
  const oldMode=document.getElementById('v114PackMode');
  if(!oldMode)return;

  /* Replace the selector node so legacy V114/V161/V171 click handlers cannot fight each other. */
  const mode=oldMode.cloneNode(true);
  oldMode.replaceWith(mode);

  const packArt=document.getElementById('packArt');
  const line=document.getElementById('v114TenLine');
  const instruction=document.getElementById('instruction');
  let lastChoose=0;

  function selectedArtV175(){
    try{
      const direct=(typeof OFFICIAL_PACK_ART!=='undefined'&&typeof sel!=='undefined'&&OFFICIAL_PACK_ART?.[sel.id]?.[0])||'';
      const live=packArt?.currentSrc||packArt?.src||'';
      /* Prefer the selected set's known artwork so switching sets does not inherit the previous fan. */
      return direct||live;
    }catch(_){return packArt?.currentSrc||packArt?.src||''}
  }

  function refreshFanV175(){
    if(!line||typeof v114PackCount==='undefined'||v114PackCount!==10)return;
    const src=selectedArtV175();
    const imgs=[...line.querySelectorAll('.v114MiniPack img')];
    imgs.forEach(img=>{
      if(src&&img.src!==src)img.src=src;
      img.alt='';
      img.onerror=()=>{
        const live=packArt?.currentSrc||packArt?.src||'';
        if(live&&img.src!==live){img.onerror=null;img.src=live}else img.style.visibility='hidden';
      };
      img.onload=()=>{img.style.visibility='visible'};
    });
  }

  /* Keep the original renderer, but strip all helper copy and force correct fan art. */
  const renderBase=typeof v114RenderMode==='function'?v114RenderMode:null;
  if(renderBase){
    v114RenderMode=function(){
      renderBase();
      line?.querySelectorAll('.v114TenHint').forEach(x=>x.remove());
      if(typeof v114PackCount!=='undefined'&&v114PackCount===10){
        if(instruction)instruction.textContent='';
        refreshFanV175();
      }
    };
  }

  /* Reset still handles all pack state; V175 only removes pre-open ten-pack helper copy. */
  const resetBase=typeof resetPack==='function'?resetPack:null;
  if(resetBase){
    resetPack=function(){
      resetBase();
      if(typeof v114PackCount!=='undefined'&&v114PackCount===10&&instruction)instruction.textContent='';
      refreshFanV175();
    };
  }

  function chooseV175(count){
    if(typeof busy!=='undefined'&&busy)return;
    const next=count===10?10:1;
    if(typeof v114PackCount!=='undefined')v114PackCount=next;
    mode.querySelectorAll('button[data-count]').forEach(b=>b.classList.toggle('active',Number(b.dataset.count)===next));
    if(typeof resetPack==='function')resetPack();
    if(typeof syncPackCreditV161==='function')setTimeout(syncPackCreditV161,0);
    if(next===10){
      requestAnimationFrame(refreshFanV175);
      setTimeout(refreshFanV175,120);
    }
  }

  function handleChoice(e){
    const b=e.target.closest('button[data-count]');
    if(!b)return;
    e.preventDefault();e.stopPropagation();
    const now=Date.now();
    if(now-lastChoose<180)return;
    lastChoose=now;
    chooseV175(Number(b.dataset.count));
  }
  mode.addEventListener('pointerup',handleChoice,{passive:false});
  mode.addEventListener('click',e=>{if(e.detail===0)handleChoice(e)});

  /* Switching expansion while ten-pack mode is selected must repaint every fan card. */
  document.getElementById('sets')?.addEventListener('click',e=>{
    if(!e.target.closest('.set[data-set-id]')||e.target.closest('.setReqBtn'))return;
    [0,90,260,650].forEach(ms=>setTimeout(refreshFanV175,ms));
  });
  packArt?.addEventListener('load',()=>setTimeout(refreshFanV175,0));
  packArt?.addEventListener('error',()=>setTimeout(refreshFanV175,80));

  /* Clean up any message left by the previous V171 controller on startup. */
  line?.querySelectorAll('.v114TenHint').forEach(x=>x.remove());
  if(typeof v114PackCount!=='undefined'&&v114PackCount===10&&instruction)instruction.textContent='';
  try{v114RenderMode?.()}catch(_){ }
}catch(err){console.error('V175 ten-pack controller',err)}})();



/* ===== original script 27 id=v176-pack-art-cache-race-fix ===== */

(()=>{try{
  const SAFE_DB='tcgPackArtCacheV176SetSafe';
  let requestSerial=0;
  let safeObjectURL='';

  function openSafeDBV176(){
    return new Promise((resolve,reject)=>{
      try{
        const q=indexedDB.open(SAFE_DB,1);
        q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('art'))q.result.createObjectStore('art')};
        q.onsuccess=()=>resolve(q.result);
        q.onerror=()=>reject(q.error);
      }catch(e){reject(e)}
    });
  }
  async function getSafePackV176(setId){
    try{
      const db=await openSafeDBV176();
      return await new Promise((resolve,reject)=>{
        const q=db.transaction('art').objectStore('art').get(setId);
        q.onsuccess=()=>resolve(q.result||null);
        q.onerror=()=>reject(q.error);
      });
    }catch(_){return null}
  }
  async function putSafePackV176(setId,url){
    try{
      const r=await fetch(url,{mode:'cors',cache:'force-cache'});
      if(!r.ok)return;
      const blob=await r.blob();
      const db=await openSafeDBV176();
      await new Promise((resolve,reject)=>{
        const q=db.transaction('art','readwrite').objectStore('art').put(blob,setId);
        q.onsuccess=()=>resolve();q.onerror=()=>reject(q.error);
      });
    }catch(_){ }
  }
  function selectedPackUrlV176(setId){
    try{return OFFICIAL_PACK_ART?.[setId]?.[0]||''}catch(_){return ''}
  }
  function paintFanV176(setId){
    try{
      if(typeof v114PackCount==='undefined'||v114PackCount!==10)return;
      const url=selectedPackUrlV176(setId);
      if(!url)return;
      document.querySelectorAll('#v114TenLine .v114MiniPack img').forEach(img=>{
        img.style.visibility='visible';
        if(img.getAttribute('src')!==url)img.src=url;
      });
    }catch(_){ }
  }

  /* Replace the old async loader. Every request captures its own set ID and token. */
  applyPackArt=async function(){
    const p=document.getElementById('pack'),im=document.getElementById('packArt');
    if(!p||!im||typeof sel==='undefined')return;
    const setId=String(sel.id||'');
    const url=selectedPackUrlV176(setId);
    const myRequest=++requestSerial;

    p.dataset.packArtSet=setId;
    p.classList.remove('artFallback');
    p.classList.add('officialPack');
    im.style.display='block';
    im.style.opacity='0';
    im.onerror=null;im.onload=null;
    paintFanV176(setId);

    if(safeObjectURL){try{URL.revokeObjectURL(safeObjectURL)}catch(_){ }safeObjectURL=''}

    const stillCurrent=()=>myRequest===requestSerial&&typeof sel!=='undefined'&&String(sel.id||'')===setId;
    const showFallback=()=>{
      if(!stillCurrent())return;
      im.style.opacity='0';
      p.classList.remove('officialPack');
      p.classList.add('artFallback');
    };
    const commitSource=(src,isBlob=false)=>{
      if(!stillCurrent())return;
      im.onload=()=>{
        if(!stillCurrent())return;
        im.style.opacity='1';
        p.classList.add('officialPack');p.classList.remove('artFallback');
        paintFanV176(setId);
        if(!isBlob&&url)putSafePackV176(setId,url); /* captured setId: never cache under a later selection */
      };
      im.onerror=()=>showFallback();
      im.src=src;
    };

    const cached=await getSafePackV176(setId);
    if(!stillCurrent())return;
    if(cached){
      safeObjectURL=URL.createObjectURL(cached);
      commitSource(safeObjectURL,true);
      return;
    }
    if(!url){showFallback();return}
    commitSource(url,false);
  };

  /* Repaint immediately after a set click, and again after the new source settles. */
  document.getElementById('sets')?.addEventListener('click',e=>{
    const card=e.target.closest('.set[data-set-id]');
    if(!card||e.target.closest('.setReqBtn'))return;
    const setId=card.dataset.setId||'';
    requestAnimationFrame(()=>paintFanV176(setId));
    setTimeout(()=>{if(typeof sel!=='undefined')paintFanV176(sel.id)},120);
  });

  /* Force one clean reload at startup to escape any corrupted legacy IndexedDB entry. */
  setTimeout(()=>{try{applyPackArt()}catch(_){ }},60);
}catch(err){console.error('V176 pack art fix',err)}})();



/* ===== original script 28 id=v177-pack-3d-touch-js ===== */

(()=>{
  const st=document.getElementById('gradeReturnStageV53');
  const pack=document.getElementById('gradeReturnPackV53');
  if(!st||!pack) return;
  let activeId=null;
  function resetPackTilt(immediate=false){
    if(immediate) pack.style.transition='none'; else pack.style.transition='';
    pack.classList.remove('tiltActiveV177');
    st.style.setProperty('--pack-rx','1deg');
    st.style.setProperty('--pack-ry','-2.1deg');
    st.style.setProperty('--pack-tx','0px');
    st.style.setProperty('--pack-ty','0px');
    st.style.setProperty('--pack-scale','1');
    st.style.setProperty('--pack-parallax-x','0px');
    st.style.setProperty('--pack-parallax-y','0px');
    st.style.setProperty('--pack-gloss-x','50%');
    st.style.setProperty('--pack-gloss-y','26%');
    if(immediate){void pack.offsetHeight; pack.style.transition='';}
  }
  function canTilt(){
    return st.classList.contains('show') && !st.classList.contains('torn') && !st.classList.contains('launch') && !st.classList.contains('revealed');
  }
  function updateTilt(clientX,clientY){
    const r=pack.getBoundingClientRect();
    let x=Math.max(0,Math.min(1,(clientX-r.left)/Math.max(1,r.width)));
    let y=Math.max(0,Math.min(1,(clientY-r.top)/Math.max(1,r.height)));
    const nx=(x-.5)*2, ny=(y-.5)*2;
    st.style.setProperty('--pack-rx',`${(-ny*13+1).toFixed(2)}deg`);
    st.style.setProperty('--pack-ry',`${(nx*15-2.1).toFixed(2)}deg`);
    st.style.setProperty('--pack-tx',`${(nx*8).toFixed(2)}px`);
    st.style.setProperty('--pack-ty',`${(ny*6).toFixed(2)}px`);
    st.style.setProperty('--pack-scale','1.015');
    st.style.setProperty('--pack-parallax-x',`${(nx*12).toFixed(2)}px`);
    st.style.setProperty('--pack-parallax-y',`${(ny*10).toFixed(2)}px`);
    st.style.setProperty('--pack-gloss-x',`${(18 + x*64).toFixed(2)}%`);
    st.style.setProperty('--pack-gloss-y',`${(10 + y*54).toFixed(2)}%`);
  }
  pack.addEventListener('pointerdown',e=>{
    if(!canTilt()||e.target.closest('.returnTear')) return;
    activeId=e.pointerId;
    pack.classList.add('tiltActiveV177');
    pack.setPointerCapture?.(activeId);
    updateTilt(e.clientX,e.clientY);
  });
  pack.addEventListener('pointermove',e=>{
    if(activeId!==e.pointerId||!canTilt()) return;
    updateTilt(e.clientX,e.clientY);
  });
  function releaseTilt(e){
    if(activeId===null) return;
    if(e?.pointerId!=null && e.pointerId!==activeId) return;
    try{pack.releasePointerCapture?.(activeId)}catch(_e){}
    activeId=null;
    resetPackTilt();
  }
  pack.addEventListener('pointerup',releaseTilt);
  pack.addEventListener('pointercancel',releaseTilt);
  pack.addEventListener('pointerleave',()=>{ if(activeId===null) resetPackTilt(); });
  const _start=startReturnRevealV53;
  startReturnRevealV53=function(j){ resetPackTilt(true); return _start(j); };
  const _tear=tearReturnV53;
  tearReturnV53=function(){ resetPackTilt(true); return _tear(); };
  const _finish=finishReturnV53;
  finishReturnV53=function(){ resetPackTilt(true); return _finish(); };
})();



/* ===== original script 29 id=v186-set-chase-script ===== */

(function(){
  const modal=document.getElementById('setChaseOverlayV186');
  const closeBtn=document.getElementById('setChaseCloseV186');
  if(!modal||!closeBtn||typeof renderSets!=='function') return;
  const $id=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const eraLabel=s=>s?.series==='sv'?'Scarlet & Violet':s?.series==='swsh'?'Sword & Shield':s?.series==='sm'?'Sun & Moon':'XY';
  const guideCache={};
  let guideToken=0;
  function showModal(){modal.classList.add('show');modal.setAttribute('aria-hidden','false')}
  function hideModal(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
  closeBtn.onclick=hideModal;
  modal.addEventListener('click',e=>{if(e.target===modal)hideModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hideModal()});
  function slot2(rate,count){count=Math.max(1,Number(count)||1);return 1-Math.pow(1-rate/count,2)}
  function countPool(P,label){return Math.max(1,(P?.[label]||[]).length||0)}
  function chanceForCardV186(card,set,P){
    const cfg=(typeof SIM_PULL_RATES!=='undefined'?(SIM_PULL_RATES[set.series]||SIM_PULL_RATES.xy):null)||{wildcard:.012};
    const total=Math.max(1,P?.all?.length||1);
    const bigCount=Math.max(1,(P?.big||[]).length||1);
    const r=String(card?.rarity||'').toLowerCase();
    let p=0,tag='Approx pack odds';
    if(set.series==='sv'){
      if(/special illustration/.test(r)) p+=slot2(.009,countPool(P,'Special illustration rare'))+(.025/countPool(P,'Special illustration rare'));
      else if(/hyper|secret rare|rainbow/.test(r)) p+=slot2(.003,countPool(P,'Hyper rare'))+(.01/countPool(P,'Hyper rare'));
      else if(/shiny ultra/.test(r)) p+=(.055/Math.max(1,countPool(P,'Shiny Ultra Rare')));
      else if(/ultra/.test(r)) p+=slot2(.018,countPool(P,'Ultra Rare'))+(.055/countPool(P,'Ultra Rare'));
      else if(/illustration/.test(r)) p+=slot2(.055,countPool(P,'Illustration rare'))+(.035/countPool(P,'Illustration rare'));
      else if(/shiny rare/.test(r)) p+=(.035/Math.max(1,countPool(P,'Shiny rare')));
      else if(/ace spec/.test(r)) p+=(.005/countPool(P,'ACE SPEC Rare'));
      else if(/double rare/.test(r)) p+=(.17/countPool(P,'Double rare'));
      else p+=(.70/Math.max(1,(P?.rare||[]).length||1));
    }else if(set.series==='swsh'){
      if(/vmax/.test(r)) p+=(.035/Math.max(1,countPool(P,'Holo Rare VMAX')+countPool(P,'Shiny rare VMAX')));
      else if(/vstar/.test(r)) p+=(.02/countPool(P,'Holo Rare VSTAR'));
      else if(/radiant/.test(r)) p+=(.02/countPool(P,'Radiant Rare'));
      else if(/amazing/.test(r)) p+=(.02/countPool(P,'Amazing Rare'));
      else if(/secret/.test(r)) p+=(.008/countPool(P,'Secret Rare'));
      else if(/full art trainer/.test(r)) p+=(.012/countPool(P,'Full Art Trainer'));
      else if(/shiny rare/.test(r)) p+=(.012/Math.max(1,countPool(P,'Shiny rare')+countPool(P,'Shiny rare V')));
      else if(/ultra/.test(r)) p+=(.012/countPool(P,'Ultra Rare'));
      else if(/rare holo v|\bv\b/.test(r)) p+=(.09/countPool(P,'Holo Rare V'));
      else p+=(.18/Math.max(1,(P?.rare||[]).length||1));
    }else if(set.series==='sm'){
      if(/secret/.test(r)) p+=(.025/countPool(P,'Secret Rare'));
      else if(/ultra/.test(r)) p+=(.075/countPool(P,'Ultra Rare'));
      else if(/prism/.test(r)) p+=(.01/countPool(P,'Prism Star'));
      else p+=(.16/Math.max(1,(P?.['Rare Holo']||P?.['Holo Rare']||[]).length||1));
    }else{
      if(/secret/.test(r)) p+=(.025/countPool(P,'Secret Rare'));
      else if(/ultra/.test(r)) p+=(.075/countPool(P,'Ultra Rare'));
      else p+=(.16/Math.max(1,(P?.['Rare Holo']||P?.['Holo Rare']||[]).length||1));
    }
    p+=(Number(cfg.wildcard)||0)/total;
    if((card?.secret||/special illustration|illustration|hyper|secret|ultra|double rare|shiny|radiant|amazing|ace spec|vmax|vstar|rare holo v|gx|ex/.test(r))) p+=GOD_PACK_RATE*Math.min(1,10/bigCount);
    return Math.max(0,Math.min(.999,p));
  }
  function rarityBucketV186(card){
    const r=String(card?.rarity||'').toLowerCase();
    if(/special illustration/.test(r)) return 'Special illustration rare';
    if(/hyper|secret rare|rainbow/.test(r)) return 'Hyper / secret rare';
    if(/shiny ultra/.test(r)) return 'Shiny ultra rare';
    if(/ultra/.test(r)) return 'Ultra rare';
    if(/illustration/.test(r)) return 'Illustration rare';
    if(/shiny rare/.test(r)) return 'Shiny rare';
    if(/ace spec/.test(r)) return 'ACE SPEC';
    if(/double rare/.test(r)) return 'Double rare';
    if(/vmax/.test(r)) return 'VMAX';
    if(/vstar/.test(r)) return 'VSTAR';
    if(/rare holo v/.test(r)) return 'Pokémon V';
    if(/radiant/.test(r)) return 'Radiant rare';
    if(/amazing/.test(r)) return 'Amazing rare';
    if(/full art trainer/.test(r)) return 'Full Art Trainer';
    return card?.rarity||'Rare';
  }
  function isChaseCandidateV186(c){
    const r=String(c?.rarity||'').toLowerCase();
    return !!(c?.secret||/special illustration|illustration|hyper|secret|ultra|double rare|shiny|radiant|amazing|ace spec|vmax|vstar|rare holo v|rare holo gx|gx|ex|full art trainer|prism/.test(r));
  }
  async function buildPoolsForSetV186(target){
    const base=await getSet(target); if(!base) return null;
    if(base.emergency){const all=base.cards; return {all,base,common:all,uncommon:all,rare:all,big:all}};
    const ERA_RARITIES={
      sv:['Common','Uncommon','Rare','Double rare','Illustration rare','Ultra Rare','Special illustration rare','Hyper rare','ACE SPEC Rare','Shiny rare','Shiny Ultra Rare'],
      swsh:['Common','Uncommon','Rare','Holo Rare','Holo Rare V','Holo Rare VMAX','Holo Rare VSTAR','Amazing Rare','Radiant Rare','Ultra Rare','Secret Rare','Shiny rare','Shiny rare V','Shiny rare VMAX','Full Art Trainer'],
      sm:['Common','Uncommon','Rare','Rare Holo','Ultra Rare','Secret Rare','Prism Star'],
      xy:['Common','Uncommon','Rare','Rare Holo','Ultra Rare','Secret Rare']
    };
    const names=ERA_RARITIES[target.series]||ERA_RARITIES.xy;
    const lists=await Promise.all(names.map(r=>rarityPool(target,r)));
    const P={all:base.cards,names};
    names.forEach((n,i)=>P[n]=lists[i]);
    P.common=P.Common||[];P.uncommon=P.Uncommon||[];
    P.rare=[...(P.Rare||[]),...(P['Holo Rare']||[]),...(P['Rare Holo']||[])];
    P.big=names.slice(3).flatMap(n=>P[n]||[]);
    return P;
  }
  async function getGuideDataV186(set){
    if(guideCache[set.id]) return guideCache[set.id];
    const P=await buildPoolsForSetV186(set);
    if(!P) return null;
    let candidates=(P.all||[]).filter(isChaseCandidateV186).map(c=>({...c}));
    if(!candidates.length) candidates=(P.big||[]).map(c=>({...c}));
    await Promise.all(candidates.map(c=>hydrateCard(c).catch(()=>c)));
    candidates.forEach(c=>{c.market=Number(c.market||0)});
    candidates.sort((a,b)=>(Number(b.market||0)-Number(a.market||0))||(tier(b)-tier(a))||String(a.number).localeCompare(String(b.number),undefined,{numeric:true}));
    const top=candidates.slice(0,8).map((c,i)=>({
      ...c,
      rank:i+1,
      chance:chanceForCardV186(c,set,P),
      bucket:rarityBucketV186(c),
      owned:!!(state.binder?.[c.id]||state.bulkV64?.[c.id]),
      badge:!!(state.chaseBadges?.[set.id] && String(state.chaseBadges[set.id].name||'').toLowerCase()===String(c.name||'').toLowerCase())
    }));
    const values=top.filter(c=>c.market>0).map(c=>c.market);
    const avgChance=top.length?top.reduce((n,c)=>n+c.chance,0)/top.length:0;
    const data={set,P,top,totalHits:candidates.length,avgChance,topValue:values.length?Math.max(...values):0};
    guideCache[set.id]=data;
    return data;
  }
  function renderLoadingV186(set){
    $id('setChaseLogoV186').src=logo(set); $id('setChaseLogoV186').onerror=function(){this.style.display='none'}; $id('setChaseLogoV186').style.display='block';
    $id('setChaseNameV186').textContent=set.name;
    $id('setChaseSubV186').textContent=`Preview the biggest chase cards in ${set.name} and their approximate simulator odds.`;
    $id('setChasePillV186').textContent=eraLabel(set)+' • loading';
    $id('setChaseSummaryV186').innerHTML='';
    $id('setChaseRateBoxV186').innerHTML='<div class="setChaseLoadingV186"><div class="spin"></div><b>Loading chase guide…</b><div style="margin-top:6px">Fetching card values and building odds for this set.</div></div>';
    $id('setChaseCardsGridV186').innerHTML='';
  }
  async function showSetGuideV186(set){
    if(!set) return;
    const myToken=++guideToken;
    showModal();
    renderLoadingV186(set);
    try{
      const data=await getGuideDataV186(set);
      if(myToken!==guideToken||!data) return;
      const gotBadge=!!state.chaseBadges?.[set.id];
      $id('setChaseLogoV186').src=logo(set); $id('setChaseLogoV186').style.display='block';
      $id('setChaseNameV186').textContent=set.name;
      $id('setChaseSubV186').textContent=`Top chase cards for ${set.name}. Prices are live from TCGdex/market data when available.`;
      $id('setChasePillV186').textContent=`${eraLabel(set)} • ${data.totalHits} chase cards`;
      const best=data.top[0];
      $id('setChaseSummaryV186').innerHTML=`
        <div class="setChaseStatV186"><small>TOP CHASE</small><b>${esc(best?.name||'—')}</b><span>${best?.market?`~$${Number(best.market).toFixed(2)}`:'Value loading / unavailable'}</span></div>
        <div class="setChaseStatV186"><small>SET BADGE</small><b>${gotBadge?'EARNED':'NOT YET'}</b><span>${gotBadge?esc(state.chaseBadges?.[set.id]?.name||'Badge earned'):'Pull one of the big chase cards to hunt the badge.'}</span></div>
        <div class="setChaseStatV186"><small>BEST ODDS HERE</small><b>${best?oneIn(best.chance):'—'}</b><span>${best?`${pct(best.chance)} for ${esc(best.name)}`:'Approx per-pack simulator odds'}</span></div>
        <div class="setChaseStatV186"><small>VALUE CEILING</small><b>${data.topValue?`$${Number(data.topValue).toFixed(2)}`:'—'}</b><span>${data.top.length} cards shown • highest current market price.</span></div>`;
      const cfg=(typeof SIM_PULL_RATES!=='undefined'?(SIM_PULL_RATES[set.series]||SIM_PULL_RATES.xy):null)||{wildcard:.012};
      $id('setChaseRateBoxV186').innerHTML=`<h4>SIMULATOR RATE SNAPSHOT</h4><div class="setChaseRateRowsV186"><div class="r"><b>God Pack</b><span>${pct(GOD_PACK_RATE)} • ${oneIn(GOD_PACK_RATE)}</span></div><div class="r"><b>Wildcard Route</b><span>${pct(Number(cfg.wildcard)||0)} • ${oneIn(Number(cfg.wildcard)||0)}</span></div><div class="r"><b>Selected set</b><span>${esc(set.name)} • Level ${Number(set.unlock||1)} unlock</span></div><div class="r"><b>Odds note</b><span>Per-card chase odds are estimated from the current generator + rarity pool sizes.</span></div></div>`;
      if(!data.top.length){
        $id('setChaseCardsGridV186').innerHTML='<div class="setChaseEmptyV186">No chase-card preview was available for this set yet.</div>';
      }else{
        $id('setChaseCardsGridV186').innerHTML=data.top.map(c=>`<article class="setChaseCardV186"><div class="setChaseThumbV186"><img src="${esc(c.img||c.thumb||'')}" alt="${esc(c.name)}"><span class="setChaseRankV186">#${c.rank}</span>${c.owned?'<span class="setChaseOwnedV186">OWNED</span>':''}</div><div class="setChaseBodyV186"><b>${esc(c.name)}</b><small>${esc(c.bucket)} • ${esc(c.number||'')}</small><div class="setChaseMetaV186"><span>${c.market?`$${Number(c.market).toFixed(2)}`:'No live price'}</span><span>${pct(c.chance)} • ${oneIn(c.chance)}</span></div><p>Approximate chance to pull this exact card in a pack using this game\'s current simulator logic.</p>${c.badge?'<div class="setChaseBadgeHintV186">🏆 Your current set badge chase</div>':''}</div></article>`).join('');
      }
      $id('setChaseFootV186').textContent='These are simulator odds based on this game\'s current pack generator and set rarity pools. They are intended to be useful in-game guidance, not official Pokémon odds.';
    }catch(err){
      if(myToken!==guideToken) return;
      $id('setChaseRateBoxV186').innerHTML='<div class="setChaseEmptyV186"><b>Couldn\'t load this chase guide right now.</b><div style="margin-top:6px">Try again in a moment — the card server may be slow.</div></div>';
      $id('setChaseCardsGridV186').innerHTML='';
    }
  }
  window.showSetGuideV186=showSetGuideV186;
  function enhanceSetTilesV186(){
    document.querySelectorAll('#sets .set').forEach(tile=>{
      if(tile.querySelector('.setInfoIconV186')) return;
      const set=SETS.find(s=>s.id===tile.dataset.setId); if(!set) return;
      const btn=document.createElement('button');
      btn.type='button'; btn.className='setInfoIconV186'; btn.innerHTML='<span>i</span>'; btn.setAttribute('aria-label',`View ${set.name} chase info`);
      btn.onclick=e=>{e.stopPropagation(); showSetGuideV186(set)};
      tile.appendChild(btn);
    });
  }
  const originalRenderSets=renderSets;
  renderSets=function(){ const r=originalRenderSets.apply(this,arguments); try{enhanceSetTilesV186()}catch(_e){} return r; };
  setTimeout(()=>{try{enhanceSetTilesV186()}catch(_e){}},60);
})();



/* ===== original script 30 id=v187-complete-chase-script ===== */

(function(){
  const SUBSET_CONFIG_V187={
    'swsh12.5':[{ids:['swsh12.5gg'],name:'Galarian Gallery',assetSet:'swsh12.5',rate:.30}],
    'swsh4.5':[{ids:['swsh4.5sv'],name:'Shiny Vault',assetSet:'swsh4.5',rate:.25}],
    'swsh9':[{ids:['swsh9.5tg','swsh9tg'],name:'Trainer Gallery',assetSet:'swsh9',rate:.12}],
    'swsh10':[{ids:['swsh10.5tg','swsh10tg'],name:'Trainer Gallery',assetSet:'swsh10',rate:.12}],
    'swsh11':[{ids:['swsh11.5tg','swsh11tg'],name:'Trainer Gallery',assetSet:'swsh11',rate:.12}],
    'swsh12':[{ids:['swsh12.5tg','swsh12tg'],name:'Trainer Gallery',assetSet:'swsh12',rate:.12}],
    'sm11.5':[{ids:['sma'],name:'Shiny Vault',assetSet:'sma',rate:.30}]
  };
  window.SUBSET_CONFIG_V187=SUBSET_CONFIG_V187;
  const subsetCacheV187={};
  const guideCacheV187={};
  let currentGuideV187=null, currentSortV187='value', currentSearchV187='';
  const escV187=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const eraRaritiesV187={
    sv:['Common','Uncommon','Rare','Double rare','Illustration rare','Ultra Rare','Special illustration rare','Hyper rare','ACE SPEC Rare','Shiny rare','Shiny Ultra Rare'],
    swsh:['Common','Uncommon','Rare','Holo Rare','Holo Rare V','Holo Rare VMAX','Holo Rare VSTAR','Amazing Rare','Radiant Rare','Ultra Rare','Secret Rare','Shiny rare','Shiny rare V','Shiny rare VMAX','Full Art Trainer'],
    sm:['Common','Uncommon','Rare','Rare Holo','Ultra Rare','Secret Rare','Prism Star'],
    xy:['Common','Uncommon','Rare','Rare Holo','Ultra Rare','Secret Rare']
  };
  function assetFallbackV187(parent,c,cfg,q='high'){
    if(c?.image)return asset(c.image,q);
    const lid=String(c?.localId||c?.number||'').trim();
    if(!lid)return'';
    return `https://assets.tcgdex.net/en/${parent.series}/${cfg.assetSet||parent.id}/${lid}/${q}.webp`;
  }
  async function loadSubsetV187(parent,cfg){
    const key=parent.id+'|'+cfg.name;
    if(subsetCacheV187[key])return subsetCacheV187[key];
    let payload=null,usedId='';
    for(const sid of cfg.ids){
      try{
        const r=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(sid)}`,7000);
        if(!r.ok)continue;
        const j=await r.json();
        if(j?.cards?.length){payload=j;usedId=sid;break}
      }catch(_e){}
    }
    if(!payload){subsetCacheV187[key]=[];return[]}
    let cards=(payload.cards||[]).map(c=>({
      id:c.id||`${usedId}-${c.localId}`,
      name:c.name||'Card',number:c.localId||'',rarity:c.rarity||'',
      img:assetFallbackV187(parent,c,cfg,'high'),thumb:assetFallbackV187(parent,c,cfg,'low'),
      set:parent.name,setId:parent.id,secret:true,
      _subsetId:usedId,_subsetName:cfg.name,_subsetRate:Number(cfg.rate||0),_parentSetId:parent.id,_parentSetName:parent.name
    }));
    subsetCacheV187[key]=cards;
    return cards;
  }
  async function hydrateLimitedV187(cards,limit=8){
    let i=0;
    async function worker(){
      while(i<cards.length){
        const n=i++,c=cards[n];
        try{
          const oldSetId=c.setId,oldSet=c.set,sub=c._subsetId,subName=c._subsetName,subRate=c._subsetRate,parentId=c._parentSetId,parentName=c._parentSetName,img=c.img,thumb=c.thumb;
          await hydrateCard(c);
          c.setId=oldSetId;c.set=oldSet;c._subsetId=sub;c._subsetName=subName;c._subsetRate=subRate;c._parentSetId=parentId;c._parentSetName=parentName;
          if(!c.img)c.img=img;if(!c.thumb)c.thumb=thumb;
        }catch(_e){}
      }
    }
    await Promise.all(Array.from({length:Math.min(limit,cards.length||1)},worker));
    return cards;
  }
  function subsetWeightV187(c){
    const r=String(c?.rarity||'').toLowerCase();
    if(/secret|hyper|gold|rainbow/.test(r))return .45;
    if(/ultra|full art|shiny gx/.test(r))return .75;
    if(/vmax|vstar|gx|\bex\b/.test(r))return 1.05;
    if(/rare holo v|rare shiny|shiny rare/.test(r))return 1.35;
    if(/trainer gallery|galarian gallery|rare holo/.test(r))return 2.1;
    return 2.5;
  }
  window.maybeSubsetHitV187=function(P,out,u,parent){
    const groups=P?.subsetsV187||[];
    if(!groups.length)return false;
    for(const g of groups){
      if(!g?.cards?.length||Math.random()>=Number(g.rate||0))continue;
      const avail=g.cards.filter(c=>!u.has(c.id));
      const pool=avail.length?avail:g.cards;
      const total=pool.reduce((n,c)=>n+subsetWeightV187(c),0)||1;
      let x=Math.random()*total,pickCard=pool[0];
      for(const c of pool){x-=subsetWeightV187(c);if(x<=0){pickCard=c;break}}
      if(!pickCard)return false;
      u.add(pickCard.id);
      out.push({...pickCard,setId:parent.id,set:parent.name,secret:true,finish:g.name,_subsetName:g.name,_subsetRate:g.rate,_parentSetId:parent.id,_parentSetName:parent.name});
      return true;
    }
    return false;
  };
  const originalBuildPoolsV187=buildPools;
  buildPools=async function(){
    const P=await originalBuildPoolsV187.apply(this,arguments);
    if(!P)return P;
    const cfgs=SUBSET_CONFIG_V187[sel.id]||[];
    P.subsetsV187=[];
    for(const cfg of cfgs){
      const cards=await loadSubsetV187(sel,cfg);
      if(cards.length)P.subsetsV187.push({name:cfg.name,rate:Number(cfg.rate||0),cards});
    }
    return P;
  };
  function isMainHitV187(c){
    const r=String(c?.rarity||'').toLowerCase();
    return !!(c?.secret||/double rare|illustration|ultra|special illustration|hyper|ace spec|shiny|rare holo v|vmax|vstar|radiant|amazing|secret rare|full art trainer|prism star|rare holo gx|rare ultra|rare rainbow/.test(r));
  }
  async function guidePoolsV187(set){
    const base=await getSet(set);if(!base)return null;
    const names=eraRaritiesV187[set.series]||eraRaritiesV187.xy;
    const lists=await Promise.all(names.map(r=>rarityPool(set,r)));
    const P={all:base.cards||[],names};names.forEach((n,i)=>P[n]=lists[i]);
    P.rare=[...(P.Rare||[]),...(P['Holo Rare']||[]),...(P['Rare Holo']||[])];
    P.big=names.slice(3).flatMap(n=>P[n]||[]);
    P.subsetsV187=[];
    for(const cfg of SUBSET_CONFIG_V187[set.id]||[]){
      const cards=await loadSubsetV187(set,cfg);
      if(cards.length)P.subsetsV187.push({name:cfg.name,rate:Number(cfg.rate||0),cards});
    }
    return P;
  }
  function slot2V187(rate,count){count=Math.max(1,Number(count)||1);return 1-Math.pow(1-rate/count,2)}
  function poolCountV187(P,n){return Math.max(1,(P?.[n]||[]).length||0)}
  function subsetChanceV187(c,P){
    const g=(P.subsetsV187||[]).find(x=>x.name===c._subsetName);if(!g)return 0;
    const total=g.cards.reduce((n,x)=>n+subsetWeightV187(x),0)||1;
    return Number(g.rate||0)*subsetWeightV187(c)/total;
  }
  function mainChanceV187(c,set,P){
    const cfg=SIM_PULL_RATES[set.series]||SIM_PULL_RATES.xy,total=Math.max(1,P.all?.length||1),r=String(c?.rarity||'').toLowerCase();
    let p=0;
    if(set.series==='sv'){
      if(/special illustration/.test(r))p+=slot2V187(.009,poolCountV187(P,'Special illustration rare'))+.025/poolCountV187(P,'Special illustration rare');
      else if(/hyper/.test(r))p+=slot2V187(.003,poolCountV187(P,'Hyper rare'))+.01/poolCountV187(P,'Hyper rare');
      else if(/shiny ultra/.test(r))p+=.055/poolCountV187(P,'Shiny Ultra Rare');
      else if(/ultra/.test(r))p+=slot2V187(.018,poolCountV187(P,'Ultra Rare'))+.055/poolCountV187(P,'Ultra Rare');
      else if(/illustration/.test(r))p+=slot2V187(.055,poolCountV187(P,'Illustration rare'))+.035/poolCountV187(P,'Illustration rare');
      else if(/ace spec/.test(r))p+=.005/poolCountV187(P,'ACE SPEC Rare');
      else if(/double rare/.test(r))p+=.17/poolCountV187(P,'Double rare');
      else if(/shiny rare/.test(r))p+=.035/poolCountV187(P,'Shiny rare');
    }else if(set.series==='swsh'){
      if(/shiny rare vmax/.test(r))p+=.005/poolCountV187(P,'Shiny rare VMAX');
      else if(/vmax/.test(r))p+=.035/poolCountV187(P,'Holo Rare VMAX');
      else if(/vstar/.test(r))p+=.02/poolCountV187(P,'Holo Rare VSTAR');
      else if(/radiant/.test(r))p+=.02/poolCountV187(P,'Radiant Rare');
      else if(/amazing/.test(r))p+=.02/poolCountV187(P,'Amazing Rare');
      else if(/secret/.test(r))p+=.008/poolCountV187(P,'Secret Rare');
      else if(/full art trainer/.test(r))p+=.012/poolCountV187(P,'Full Art Trainer');
      else if(/shiny rare v/.test(r))p+=.012/poolCountV187(P,'Shiny rare V');
      else if(/shiny rare/.test(r))p+=.012/poolCountV187(P,'Shiny rare');
      else if(/ultra/.test(r))p+=.012/poolCountV187(P,'Ultra Rare');
      else if(/rare holo v/.test(r))p+=.09/poolCountV187(P,'Holo Rare V');
    }else if(set.series==='sm'){
      if(/secret/.test(r))p+=.025/poolCountV187(P,'Secret Rare');
      else if(/ultra/.test(r))p+=.075/poolCountV187(P,'Ultra Rare');
      else if(/prism/.test(r))p+=.01/poolCountV187(P,'Prism Star');
    }else{
      if(/secret/.test(r))p+=.025/poolCountV187(P,'Secret Rare');
      else if(/ultra/.test(r))p+=.075/poolCountV187(P,'Ultra Rare');
    }
    p+=(Number(cfg.wildcard)||0)/total;
    const big=Math.max(1,(P.big||[]).filter(isMainHitV187).length||1);
    p+=GOD_PACK_RATE*Math.min(1,10/big);
    return Math.max(0,Math.min(.999,p));
  }
  function pctV187(v){return (v*100).toFixed(v<.001?3:v<.01?2:1).replace(/\.0$/,'')+'%'}
  function oneInV187(v){return v>0?'1 in '+Math.max(1,Math.round(1/v)).toLocaleString():'—'}
  async function buildGuideV187(set){
    if(guideCacheV187[set.id])return guideCacheV187[set.id];
    const P=await guidePoolsV187(set);if(!P)return null;
    const byId=new Map();
    (P.big||[]).filter(isMainHitV187).forEach(c=>byId.set(c.id,{...c,_subsetName:''}));
    (P.all||[]).filter(c=>c.secret).forEach(c=>{if(!byId.has(c.id))byId.set(c.id,{...c,_subsetName:''})});
    const named=(typeof CHASE_CARDS!=='undefined'?(CHASE_CARDS[set.id]||[]):[]).map(x=>String(x).toLowerCase());
    (P.all||[]).filter(c=>named.includes(String(c.name||'').toLowerCase())).forEach(c=>{if(!byId.has(c.id))byId.set(c.id,{...c,_subsetName:''})});
    (P.subsetsV187||[]).forEach(g=>g.cards.forEach(c=>byId.set(c.id,{...c,_subsetName:g.name,_subsetRate:g.rate})));
    const cards=[...byId.values()];
    await hydrateLimitedV187(cards,8);
    cards.forEach(c=>{
      c.setId=set.id;c.set=set.name;
      c.chance=c._subsetName?subsetChanceV187(c,P):mainChanceV187(c,set,P);
      c.owned=!!(state.binder?.[c.id]||state.bulkV64?.[c.id]);
      c.badge=!!(state.chaseBadges?.[set.id]&&String(state.chaseBadges[set.id].name||'').toLowerCase()===String(c.name||'').toLowerCase());
      c.value=Number(c.market||0);
    });
    const data={set,P,cards};guideCacheV187[set.id]=data;return data;
  }
  function rarityLabelV187(c){return c._subsetName?`${c._subsetName} • ${c.rarity||'Hit'}`:(c.rarity||'Hit')}
  function ensureControlsV187(){
    const rate=document.getElementById('setChaseRateBoxV186');if(!rate||document.getElementById('setChaseControlsV187'))return;
    const box=document.createElement('div');box.className='setChaseControlsV187';box.id='setChaseControlsV187';box.innerHTML='<input id="setChaseSearchV187" type="search" placeholder="Search chase cards…"><select id="setChaseSortV187"><option value="value">Highest value</option><option value="odds">Rarest odds</option><option value="number">Card number</option></select><button type="button" id="setChaseClearV187">SHOW ALL</button><div class="setChaseCountV187" id="setChaseCountV187"></div>';
    rate.insertAdjacentElement('afterend',box);
    document.getElementById('setChaseSearchV187').addEventListener('input',e=>{currentSearchV187=e.target.value||'';renderCardsV187()});
    document.getElementById('setChaseSortV187').addEventListener('change',e=>{currentSortV187=e.target.value||'value';renderCardsV187()});
    document.getElementById('setChaseClearV187').onclick=()=>{currentSearchV187='';document.getElementById('setChaseSearchV187').value='';renderCardsV187()};
  }
  function renderCardsV187(){
    const data=currentGuideV187,grid=document.getElementById('setChaseCardsGridV186'),count=document.getElementById('setChaseCountV187');if(!data||!grid)return;
    let cards=data.cards.filter(c=>!currentSearchV187||`${c.name} ${c.rarity} ${c.number} ${c._subsetName}`.toLowerCase().includes(currentSearchV187.toLowerCase()));
    if(currentSortV187==='odds')cards.sort((a,b)=>(a.chance-b.chance)||(b.value-a.value));
    else if(currentSortV187==='number')cards.sort((a,b)=>String(a.number||'').localeCompare(String(b.number||''),undefined,{numeric:true}));
    else cards.sort((a,b)=>(b.value-a.value)||(a.chance-b.chance));
    if(count)count.textContent=`Showing ${cards.length} of ${data.cards.length} chase / hit cards${(data.P.subsetsV187||[]).length?' • special subsets included':''}`;
    if(!cards.length){grid.innerHTML='<div class="setChaseEmptyV186">No chase cards match that search.</div>';return}
    grid.innerHTML=cards.map((c,i)=>`<article class="setChaseCardV186 ${c._subsetName?'subsetV187':''}"><div class="setChaseThumbV186"><img src="${escV187(c.img||c.thumb||'')}" alt="${escV187(c.name)}"><span class="setChaseRankV186">${currentSortV187==='value'?'#'+(i+1):escV187(c.number||'HIT')}</span>${c.owned?'<span class="setChaseOwnedV186">OWNED</span>':''}</div><div class="setChaseBodyV186"><b>${escV187(c.name)}</b><small>${escV187(rarityLabelV187(c))} • ${escV187(c.number||'')}</small><div class="setChaseMetaV186"><span>${c.value>0.11?`$${c.value.toFixed(2)}`:'No live value'}</span><span>${pctV187(c.chance)} • ${oneInV187(c.chance)}</span></div><p>Approximate chance to pull this exact card from one pack using the game\'s current generator.</p>${c._subsetName?`<div class="setChaseSubsetTagV187">✦ ${escV187(c._subsetName)} included</div>`:''}${c.badge?'<div class="setChaseBadgeHintV186">🏆 Your current set badge chase</div>':''}</div></article>`).join('');
  }
  async function showGuideV187(set){
    const modal=document.getElementById('setChaseOverlayV186');if(!modal||!set)return;
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
    const logoEl=document.getElementById('setChaseLogoV186');logoEl.src=logo(set);logoEl.style.display='block';
    document.getElementById('setChaseNameV186').textContent=set.name;
    document.getElementById('setChaseSubV186').textContent='Loading every chase / hit card, live value and simulator odds…';
    document.getElementById('setChasePillV186').textContent='AUDITING SET…';
    document.getElementById('setChaseSummaryV186').innerHTML='';
    document.getElementById('setChaseRateBoxV186').innerHTML='<div class="setChaseLoadingV186"><div class="spin"></div><b>Checking full set + special subsets…</b><div style="margin-top:6px">This can take a moment the first time because live values are loaded for every chase.</div></div>';
    document.getElementById('setChaseCardsGridV186').innerHTML='';
    document.getElementById('setChaseControlsV187')?.remove();
    currentGuideV187=null;currentSearchV187='';currentSortV187='value';
    try{
      const data=await buildGuideV187(set);if(!data)return;
      currentGuideV187=data;
      const subsets=data.P.subsetsV187||[],best=[...data.cards].sort((a,b)=>b.value-a.value)[0],rarest=[...data.cards].filter(c=>c.chance>0).sort((a,b)=>a.chance-b.chance)[0];
      document.getElementById('setChaseSubV186').textContent=`Complete chase guide for ${set.name}${subsets.length?' including '+subsets.map(x=>x.name).join(' + '):''}.`;
      document.getElementById('setChasePillV186').textContent=`${data.cards.length} CHASE / HIT CARDS`;
      document.getElementById('setChaseSummaryV186').innerHTML=`<div class="setChaseStatV186"><small>TOP VALUE</small><b>${escV187(best?.name||'—')}</b><span>${best?.value>0.11?'$'+best.value.toFixed(2):'No live value'}</span></div><div class="setChaseStatV186"><small>RAREST SHOWN</small><b>${rarest?oneInV187(rarest.chance):'—'}</b><span>${escV187(rarest?.name||'Approx simulator odds')}</span></div><div class="setChaseStatV186"><small>SPECIAL SUBSETS</small><b>${subsets.length}</b><span>${subsets.length?escV187(subsets.map(x=>`${x.name} ${pctV187(x.rate)}`).join(' • ')):'None for this set'}</span></div><div class="setChaseStatV186"><small>OWNED</small><b>${data.cards.filter(c=>c.owned).length} / ${data.cards.length}</b><span>Chase / hit cards currently in your collection.</span></div>`;
      const cfg=SIM_PULL_RATES[set.series]||SIM_PULL_RATES.xy;
      document.getElementById('setChaseRateBoxV186').innerHTML=`<h4>SIMULATOR RATE SNAPSHOT</h4><div class="setChaseRateRowsV186"><div class="r"><b>God Pack</b><span>${pctV187(GOD_PACK_RATE)} • ${oneInV187(GOD_PACK_RATE)}</span></div><div class="r"><b>Wildcard Route</b><span>${pctV187(cfg.wildcard)} • ${oneInV187(cfg.wildcard)}</span></div>${subsets.map(s=>`<div class="r"><b>${escV187(s.name)} slot</b><span>${pctV187(s.rate)} • ${oneInV187(s.rate)} chance that the special reverse slot upgrades</span></div>`).join('')}<div class="r"><b>Per-card odds</b><span>Calculated from the exact rarity/subset pool used by this build.</span></div></div>`;
      document.querySelectorAll('.setChaseAllNoteV187').forEach(x=>x.remove());
      const note=document.createElement('div');note.className='setChaseAllNoteV187';note.textContent='This view now includes every high-rarity hit configured for the main expansion plus its supported special gallery/vault subset. Sort by value, rarity odds, or card number.';document.getElementById('setChaseRateBoxV186').insertAdjacentElement('afterend',note);
      ensureControlsV187();
      renderCardsV187();
      document.getElementById('setChaseFootV186').textContent='Values come from the game’s live TCGdex card pricing data when available. Odds are simulator odds generated from this game’s current pack logic, not official Pokémon pull odds.';
    }catch(e){
      document.getElementById('setChaseRateBoxV186').innerHTML='<div class="setChaseEmptyV186"><b>Couldn\'t finish the full chase audit.</b><div style="margin-top:6px">The card server may be slow. Close this screen and try again.</div></div>';
    }
  }
  window.showSetGuideV186=showGuideV187;
  window.showSetGuideV187=showGuideV187;
  function rebindV187(){
    document.querySelectorAll('#sets .set').forEach(tile=>{
      const b=tile.querySelector('.setInfoIconV186'),set=SETS.find(s=>s.id===tile.dataset.setId);if(!b||!set)return;
      b.onclick=e=>{e.stopPropagation();showGuideV187(set)};
    });
  }
  const previousRenderV187=renderSets;
  renderSets=function(){const r=previousRenderV187.apply(this,arguments);setTimeout(rebindV187,0);return r};
  setTimeout(rebindV187,100);
})();



/* ===== original script 31 id=v188-universal-card-availability ===== */

(()=>{
  /* V188 — one complete acquisition catalog for ripping, buying, shops and trades. */
  const catalogCacheV188=new Map(),subsetCacheV188=new Map();
  let primePromiseV188=null,primeSigV188='';
  state.recentHitsV188=Array.isArray(state.recentHitsV188)?state.recentHitsV188.slice(0,48):[];
  state.acquisitionAuditV188=state.acquisitionAuditV188||{};
  const subsetCfgV188=window.SUBSET_CONFIG_V187||{};
  const parentSetForV188=c=>SETS.find(s=>s.id===(c?._parentSetId||c?.setId))||SETS.find(s=>s.name===c?.set)||null;
  const isUnlockedCardV188=c=>{const s=parentSetForV188(c);return !!(s&&setUnlocked(s))};
  function estimateMarketV188(c){
    if(Number(c?.market)>0.11)return Number(c.market);
    const t=tier(c);if(t>=5)return 55;if(t>=4)return 24;if(t>=3)return 8.5;if(t>=2)return 2.25;if(t>=1)return .65;return .18;
  }
  function normalizeCardV188(c,parent,meta={}){
    if(!c||!parent)return null;
    const x={...c};
    x.setId=parent.id;x.set=parent.name;x._parentSetId=parent.id;x._parentSetName=parent.name;
    if(meta.subsetName)x._subsetName=meta.subsetName;
    if(meta.subsetId)x._subsetId=meta.subsetId;
    if(meta.subsetRate!=null)x._subsetRate=Number(meta.subsetRate||0);
    if(!(Number(x.market)>.11))x.market=estimateMarketV188(x);
    return x;
  }
  async function loadSubsetCatalogV188(parent,cfg){
    const key=parent.id+'|'+cfg.name;if(subsetCacheV188.has(key))return subsetCacheV188.get(key);
    let payload=null,used='';
    for(const sid of (cfg.ids||[])){
      try{const r=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(sid)}`,7500);if(!r.ok)continue;const j=await r.json();if(j?.cards?.length){payload=j;used=sid;break}}catch(_e){}
    }
    if(!payload){subsetCacheV188.set(key,[]);return[]}
    const cards=(payload.cards||[]).map(c=>{
      const img=c.image?asset(c.image,'high'):'';
      const thumb=c.image?asset(c.image,'low'):img;
      return normalizeCardV188({id:c.id||`${used}-${c.localId}`,name:c.name||'Card',number:c.localId||'',rarity:c.rarity||'Card',img,thumb,secret:true},parent,{subsetName:cfg.name,subsetId:used,subsetRate:cfg.rate});
    }).filter(Boolean);
    subsetCacheV188.set(key,cards);return cards;
  }
  async function completeCatalogV188(set){
    if(!set)return[];if(catalogCacheV188.has(set.id))return catalogCacheV188.get(set.id);
    const base=await getSet(set);const byId=new Map();
    if(base&&!base.emergency){(base.cards||[]).forEach(c=>{const x=normalizeCardV188(c,set);if(x?.id)byId.set(x.id,x)})}
    for(const cfg of (subsetCfgV188[set.id]||[])){for(const c of await loadSubsetCatalogV188(set,cfg)){if(c?.id)byId.set(c.id,c)}}
    const cards=[...byId.values()];catalogCacheV188.set(set.id,cards);
    cache[set.id]=cache[set.id]||{};
    /* V195: Master Set totals use every obtainable checklist card. Only commit a subset-aware total when every configured subset loaded. */
    const expected=subsetCfgV188[set.id]||[],loadedNames=new Set(cards.filter(c=>c?._subsetName).map(c=>c._subsetName));
    const completeSubsets=expected.every(cfg=>loadedNames.has(cfg.name));
    if(base&&!base.emergency&&completeSubsets){state.masterTotalsV195=state.masterTotalsV195||{};state.masterTotalsV195[set.id]=cards.length;}
    /* Legacy BUY/TRADE code reads .cards, so bridge it to the complete catalog. */
    cache[set.id].cards=cards;
    return cards;
  }
  window.completeCatalogV188=completeCatalogV188;
  window.getAcquisitionPoolV188=function({hitsOnly=false}={}){
    const out=[],seen=new Set();
    for(const s of SETS){if(!setUnlocked(s))continue;for(const c of (catalogCacheV188.get(s.id)||[])){if(!c?.id||seen.has(c.id))continue;if(hitsOnly&&!(tier(c)>=2||c.secret||c._subsetName))continue;seen.add(c.id);out.push(c)}}
    return out;
  };
  async function primeUnlockedCatalogV188(force=false){
    const unlocked=SETS.filter(setUnlocked),sig=unlocked.map(s=>s.id).join('|');
    if(!force&&sig===primeSigV188&&window.getAcquisitionPoolV188().length)return window.getAcquisitionPoolV188();
    if(primePromiseV188)return primePromiseV188;
    primeSigV188=sig;
    primePromiseV188=(async()=>{
      let next=0;async function worker(){while(next<unlocked.length){const s=unlocked[next++];try{await completeCatalogV188(s)}catch(_e){}}}
      await Promise.all(Array.from({length:Math.min(5,Math.max(1,unlocked.length))},worker));
      const pool=window.getAcquisitionPoolV188();
      try{renderMarketBuyV58()}catch(_e){}try{window.renderTradeBoardV154?.()}catch(_e){}
      return pool;
    })().finally(()=>{primePromiseV188=null});
    return primePromiseV188;
  }
  window.primeUnlockedCatalogV188=primeUnlockedCatalogV188;
  /* Preserve parent expansion identity when a Gallery/Vault card is hydrated from its actual TCGdex subset ID. */
  const hydrateOriginalV188=hydrateCard;
  hydrateCard=async function(c){
    if(!c)return c;const p=c._parentSetId,n=c._parentSetName,sn=c._subsetName,si=c._subsetId,sr=c._subsetRate;
    const x=await hydrateOriginalV188(c);
    if(p){c.setId=p;c.set=n||SETS.find(z=>z.id===p)?.name||c.set;c._parentSetId=p;c._parentSetName=c.set;c._subsetName=sn;c._subsetId=si;c._subsetRate=sr}
    return x;
  };
  /* Cross-pack duplicate protection. It changes only card choice inside a chosen pool; rarity-route rates stay intact. */
  function recentPenaltyV188(c){
    if(!(tier(c)>=2||c?.secret||c?._subsetName))return 1;
    const i=state.recentHitsV188.indexOf(c.id);if(i<0)return 1;
    if(i<3)return .18;if(i<8)return .34;if(i<16)return .56;if(i<28)return .76;return .9;
  }
  function weightedPickV188(pool,weightFn){
    if(!pool?.length)return null;let total=0;const ws=pool.map(c=>{const w=Math.max(.02,Number(weightFn(c))||.02);total+=w;return w});let x=Math.random()*total;
    for(let i=0;i<pool.length;i++){x-=ws[i];if(x<=0)return pool[i]}return pool[pool.length-1];
  }
  unique=function(a,used){
    let p=(a||[]).filter(c=>c&&!used.has(c.id));if(!p.length)p=(a||[]).filter(Boolean);if(!p.length)return null;
    const c=weightedPickV188(p,recentPenaltyV188);if(c)used.add(c.id);return c;
  };
  if(typeof window.maybeSubsetHitV187==='function'){
    window.maybeSubsetHitV187=function(P,out,u,parent){
      const groups=P?.subsetsV187||[];if(!groups.length)return false;
      for(const g of groups){
        if(!g?.cards?.length||Math.random()>=Number(g.rate||0))continue;
        const avail=g.cards.filter(c=>!u.has(c.id)),pool=avail.length?avail:g.cards;
        const c=weightedPickV188(pool,x=>{let base=1;try{const r=String(x?.rarity||'').toLowerCase();base=/secret|hyper|gold|rainbow/.test(r)?.45:/ultra|full art|shiny gx/.test(r)?.75:/vmax|vstar|gx|\bex\b/.test(r)?1.05:/rare holo v|rare shiny|shiny rare/.test(r)?1.35:/trainer gallery|galarian gallery|rare holo/.test(r)?2.1:2.5}catch(_e){}return base*recentPenaltyV188(x)});
        if(!c)return false;u.add(c.id);out.push({...c,setId:parent.id,set:parent.name,secret:true,finish:g.name,_subsetName:g.name,_subsetRate:g.rate,_parentSetId:parent.id,_parentSetName:parent.name});return true;
      }return false;
    };
  }
  const makePackOriginalV188=makePack;
  makePack=async function(){
    const ok=await makePackOriginalV188.apply(this,arguments);
    if(ok&&Array.isArray(pulls)){
      const hits=pulls.filter(c=>tier(c)>=2||c.secret||c._subsetName).map(c=>c.id).filter(Boolean);
      if(hits.length){state.recentHitsV188=[...hits.reverse(),...state.recentHitsV188.filter(id=>!hits.includes(id))].slice(0,48);save()}
    }
    return ok;
  };
  /* General shop/customer/card-show pool: complete unlocked catalog, not only whatever happened to be cached first. */
  shopPool84=function(){const p=window.getAcquisitionPoolV188();return p.length?p:Object.values(state.binder||{}).filter(c=>c&&(c.img||c.thumb))};
  shopCardPick84=function(minTier=0){const all=shopPool84(),p=all.filter(c=>tier(c)>=minTier);return weightedPickV188(p.length?p:all,c=>recentPenaltyV188(c))};
  /* Marketplace BUY now rotates through the entire unlocked hit catalog instead of the same top eight. */
  const marketHydratingV188=new Set();
  function gameDayIndexV188(){const a=Number(state.gameClockV170?.anchorReal||Date.now()),len=Number(state.gameClockV170?.dayLengthMs||3600000);return Math.max(0,Math.floor((Date.now()-a)/Math.max(1,len)))}
  marketCandidatesV58=function(){
    let pool=window.getAcquisitionPoolV188({hitsOnly:true}).filter(c=>tier(c)>=2||c.secret||c._subsetName);
    pool.sort((a,b)=>String(a.setId).localeCompare(String(b.setId))||String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
    if(!pool.length)return[];const n=Math.min(8,pool.length),start=(gameDayIndexV188()*n)%pool.length,out=[];
    for(let i=0;i<n;i++)out.push(pool[(start+i)%pool.length]);
    out.forEach(c=>{if(detailCache[c.id]||marketHydratingV188.has(c.id))return;marketHydratingV188.add(c.id);hydrateCard(c).catch(()=>{}).finally(()=>{marketHydratingV188.delete(c.id);try{renderMarketBuyV58()}catch(_e){}})});
    return out;
  };
  /* NPC collector trading receives the same full catalog, including Gallery/Vault cards. */
  tradePoolV161=async function(){
    await primeUnlockedCatalogV188();return window.getAcquisitionPoolV188().filter(c=>c?.id&&(c.thumb||c.img));
  };
  /* Keep the legacy exchange's local cache-based trade pool complete by maintaining cache[set].cards above. */
  function auditV188(){
    const rows=[];let total=0,reachable=0;
    for(const s of SETS){
      if(!setUnlocked(s))continue;const cards=catalogCacheV188.get(s.id)||[],base=cache[s.id]?.base?.cards||[],subset=cards.filter(c=>c._subsetName);
      const mainOK=base.length?base.every(c=>cards.some(x=>x.id===c.id)):false;
      const subsetOK=subset.every(c=>Number(c._subsetRate||0)>0);
      const acquisitionOK=cards.every(c=>window.getAcquisitionPoolV188().some(x=>x.id===c.id));
      total+=cards.length;if(mainOK&&subsetOK&&acquisitionOK)reachable+=cards.length;
      rows.push({setId:s.id,name:s.name,cards:cards.length,main:base.length,subset:subset.length,mainRipRoute:mainOK,subsetRipRoute:subsetOK,buyTradeCatalog:acquisitionOK});
    }
    const report={time:Date.now(),sets:rows,totalCards:total,reachableCards:reachable,complete:!!total&&reachable===total};
    state.acquisitionAuditV188={time:report.time,totalCards:total,reachableCards:reachable,complete:report.complete};window.cardReachabilityAuditV188=report;save();return report;
  }
  window.runCardReachabilityAuditV188=async function(){await primeUnlockedCatalogV188(true);return auditV188()};
  const renderSetsBeforeV188=renderSets;
  renderSets=function(){const r=renderSetsBeforeV188.apply(this,arguments);setTimeout(()=>primeUnlockedCatalogV188().then(auditV188).catch(()=>{}),0);return r};
  const addXPBeforeV188=addXP;
  addXP=function(){const before=SETS.filter(setUnlocked).length,r=addXPBeforeV188.apply(this,arguments),after=SETS.filter(setUnlocked).length;if(after!==before)setTimeout(()=>primeUnlockedCatalogV188(true).then(auditV188).catch(()=>{}),0);return r};
  const earn=document.getElementById('earn');if(earn)new MutationObserver(()=>{if(earn.classList.contains('active'))primeUnlockedCatalogV188().then(()=>{try{renderMarketBuyV58()}catch(_e){}try{window.renderTradeBoardV154?.()}catch(_e){}})}).observe(earn,{attributes:true,attributeFilter:['class']});
  setTimeout(()=>primeUnlockedCatalogV188().then(auditV188).catch(()=>{}),350);
})();



/* ===== original script 32 id=v189-universal-god-pack-audit ===== */

(()=>{
  /* V189 — God Packs are global for all selectable sets and use full hit catalogs. */
  const SUPPORTED_SERIES_V189=new Set(['sv','swsh','sm','xy']);
  function godPackStaticAuditV189(){
    const rate=Number(typeof GOD_PACK_RATE!=='undefined'?GOD_PACK_RATE:0);
    const rows=SETS.map(s=>({
      setId:s.id,
      name:s.name,
      series:s.series,
      rate,
      oneIn:rate>0?Math.round(1/rate):null,
      globalRoll:rate>0&&SUPPORTED_SERIES_V189.has(s.series),
      unlock:Number(s.unlock||1)
    }));
    return {sets:rows.length,eligible:rows.filter(x=>x.globalRoll).length,rate,oneIn:rate>0?Math.round(1/rate):null,complete:rows.length>0&&rows.every(x=>x.globalRoll),rows};
  }
  window.godPackStaticAuditV189=godPackStaticAuditV189();
  window.runGodPackAuditV189=async function(){
    const base=godPackStaticAuditV189(),rows=[];
    for(const s of SETS){
      let cards=[],hits=[],subsets=0,error='';
      try{
        if(typeof completeCatalogV188==='function')cards=await completeCatalogV188(s);
        else {const b=await getSet(s);cards=b?.cards||[]}
        hits=cards.filter(c=>tier(c)>=2||c?.secret||c?._subsetName);
        subsets=cards.filter(c=>c?._subsetName).length;
      }catch(e){error=String(e?.message||e||'catalog load failed')}
      rows.push({setId:s.id,name:s.name,series:s.series,rate:base.rate,globalRoll:SUPPORTED_SERIES_V189.has(s.series)&&base.rate>0,cards:cards.length,hits:hits.length,subsetHits:subsets,canBuildTen:cards.length>=10,error});
    }
    const report={time:Date.now(),sets:rows.length,eligible:rows.filter(x=>x.globalRoll&&x.canBuildTen).length,complete:rows.length===SETS.length&&rows.every(x=>x.globalRoll&&x.canBuildTen),rate:base.rate,oneIn:base.oneIn,rows};
    window.godPackAuditV189=report;
    state.godPackAuditV189={time:report.time,sets:report.sets,eligible:report.eligible,complete:report.complete,rate:report.rate};
    try{save()}catch(_e){}
    return report;
  };
  /* Run a lightweight static check immediately; full catalog audit is available on demand. */
  try{state.godPackAuditV189={time:Date.now(),sets:window.godPackStaticAuditV189.sets,eligible:window.godPackStaticAuditV189.eligible,complete:window.godPackStaticAuditV189.complete,rate:window.godPackStaticAuditV189.rate};save()}catch(_e){}
})();



/* ===== original script 33 id=v237-cloud-save-runtime ===== */

(()=>{
  const CLOUD_TABLE='user_saves';
  const STAMP_KEY='tcgCloudLastSyncV190';
  const PENDING_EMAIL_KEY='tcgCloudPendingEmailV192';
  const VERSION_PREFIX='tcgCloudVersionV237:';
  const DIRTY_PREFIX='tcgCloudDirtyV237:';
  const BOUND_PREFIX='tcgCloudBoundV237:';
  const DEVICE_KEY='tcgCloudDeviceV236';
  const PRECLOUD_KEY='tcgRipperPreCloudBackupV190';
  const LINK_BACKUP_KEY='tcgRipperLinkBackupV237';
  const CONFLICT_BACKUP_KEY='tcgRipperConflictBackupV237';
  let client=null,user=null,syncTimer=null,syncBusy=false,authBusy=false,pushPausedUntil=0,cloudVersion=null,recoveryPending=false;
  let hubHold=false;
  let sessionState='restoring',sessionRetry=null;
  let deviceId='';
  try{deviceId=localStorage.getItem(DEVICE_KEY)||('dev_'+crypto.randomUUID());localStorage.setItem(DEVICE_KEY,deviceId)}catch(_){deviceId='dev_'+Math.random().toString(36).slice(2)}
  const cfg=()=>window.TCG_CLOUD_CONFIG||{};
  const configured=()=>!!(cfg().supabaseUrl&&cfg().supabaseAnonKey&&window.supabase?.createClient);
  const el=id=>document.getElementById(id);
  const uid=()=>user?.id||'guest';
  const versionKey=()=>VERSION_PREFIX+uid();
  const dirtyKey=()=>DIRTY_PREFIX+uid();
  const boundKey=()=>BOUND_PREFIX+uid();
  const isDirty=()=>{try{return localStorage.getItem(dirtyKey())==='1'}catch(_){return false}};
  const setDirty=v=>{try{if(v)localStorage.setItem(dirtyKey(),'1');else localStorage.removeItem(dirtyKey())}catch(_){}};
  const storedVersion=()=>{try{return Number(localStorage.getItem(versionKey())||0)}catch(_){return 0}};
  const setStoredVersion=v=>{cloudVersion=Number(v||0)||null;try{if(cloudVersion)localStorage.setItem(versionKey(),String(cloudVersion));else localStorage.removeItem(versionKey())}catch(_){}};
  const isBound=()=>{try{return !!user&&localStorage.getItem(boundKey())==='1'}catch(_){return false}};
  const setBound=()=>{try{if(user)localStorage.setItem(boundKey(),'1')}catch(_){}};
  function pendingEmail(){try{return localStorage.getItem(PENDING_EMAIL_KEY)||''}catch(_){return''}}
  function setPendingEmail(v){try{if(v)localStorage.setItem(PENDING_EMAIL_KEY,v);else localStorage.removeItem(PENDING_EMAIL_KEY)}catch(_){}}
  function setStatus(kind,title,text){const c=el('cloudStatusCardV190');if(c)c.className='cloudStatusCardV190 '+(kind||'');if(el('cloudStatusTitleV190'))el('cloudStatusTitleV190').textContent=title;if(el('cloudStatusTextV190'))el('cloudStatusTextV190').textContent=text;}
  function syncUI(){
    const login=el('cloudLoginV190'),signed=el('cloudSignedV190'),saveStatus=el('settingsSaveStatusV190');
    if(!configured()){
      login?.classList.remove('hide');signed?.classList.remove('show');
      setStatus('warn','Cloud setup required','Your local save is safe. Connect Supabase to enable account login and cross-device saves.');
      if(saveStatus)saveStatus.textContent='LOCAL BACKUP';return;
    }
    if(user){
      login?.classList.add('hide');signed?.classList.add('show');
      if(el('cloudUserEmailV190'))el('cloudUserEmailV190').textContent=user.email||user.id;
      if(recoveryPending)setStatus('warn','Choose which save to keep','Sync is paused until you choose the device save or account save.');
      else setStatus('online','Account save active','Your account is the primary save. This device keeps an offline fallback copy.');
      if(saveStatus)saveStatus.textContent=recoveryPending?'SAVE CHOICE':'ACCOUNT PRIMARY';
    }else{
      login?.classList.remove('hide');signed?.classList.remove('show');
      const pe=pendingEmail();
      if(pe)setStatus('warn','Confirm your email',`We sent a confirmation link to ${pe}. Open that email, confirm the account, then return here and tap LOG IN.`);
      else setStatus('warn','Local-only mode','Log in to protect progress with your account. Local browser data can be cleared by the device.');
      if(saveStatus)saveStatus.textContent='LOCAL ONLY';
    }
    if(sessionState!=='ready'){setStatus('warn',sessionState==='restoring'?'Restoring sign-in':'Reconnecting account',sessionState==='restoring'?'Checking your saved sign-in. You can close Settings while this finishes.':'Your saved sign-in is kept. Reconnecting automatically when the connection returns.');if(saveStatus)saveStatus.textContent='CONNECTING';}
    let t=0;try{t=Number(localStorage.getItem(STAMP_KEY)||0)}catch(_){}if(el('cloudLastSyncV190'))el('cloudLastSyncV190').textContent=t?new Date(t).toLocaleString():'Not synced yet';
  }
  function snapshot(){
    let prefs=null,audio=null;try{prefs=JSON.parse(localStorage.getItem('tcgPrefsV160')||'null')}catch(e){}try{audio=JSON.parse(localStorage.getItem('tcgAudioV68')||'null')}catch(e){}
    return {version:239,saved_at:Date.now(),state:JSON.parse(JSON.stringify(state)),prefs,audio,selectedSetId:typeof sel!=='undefined'?sel?.id:null};
  }
  function localChangedAt(){return Number(state?.cloudV190?.changedAt||0)}
  function markLocalChange(){state.cloudV190=state.cloudV190||{};state.cloudV190.changedAt=Date.now();}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function qtyObj(o){return Object.values(o||{}).reduce((n,x)=>n+Math.max(0,Number(x?.qty??x??0)||0),0)}
  function saveSummary(st){
    st=st||{};
    const graded=(st.gradingV44?.graded||[]).length+(st.gradingV44?.submissions||[]).length;
    return {binder:qtyObj(st.binder),binderUnique:Object.keys(st.binder||{}).length,bulk:qtyObj(st.bulkV64),graded,packs:Number(st.packs||0),hits:Number(st.hits||0),xp:Number(st.xp||0),coins:Number(st.coins||0)};
  }
  function meaningful(st){const x=saveSummary(st);return x.binder>0||x.bulk>0||x.graded>0||x.packs>0||x.hits>0||x.xp>0||Math.abs(x.coins-80)>.01}
  function materiallyDifferent(a,b){
    const x=saveSummary(a),y=saveSummary(b);
    return Math.abs(x.binder-y.binder)>=2||Math.abs(x.bulk-y.bulk)>=5||Math.abs(x.graded-y.graded)>=1||Math.abs(x.packs-y.packs)>=3||Math.abs(x.hits-y.hits)>=2||Math.abs(x.xp-y.xp)>=100||Math.abs(x.coins-y.coins)>=20||(x.coins<0)!=(y.coins<0);
  }
  function readStateKey(k){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'?v:null}catch(_){return null}}
  function applySnapshot(data){
    if(!data?.state)return false;
    try{
      const next=clone(data.state);next.cloudV190=next.cloudV190||{};next.cloudV190.changedAt=Number(data.saved_at||Date.now());
      localStorage.setItem('tcgRipperSave',JSON.stringify(next));
      if(data.prefs)localStorage.setItem('tcgPrefsV160',JSON.stringify(data.prefs));
      if(data.audio)localStorage.setItem('tcgAudioV68',JSON.stringify(data.audio));
      if(data.selectedSetId)localStorage.setItem('tcgCloudSelectedSetV190',data.selectedSetId);
      localStorage.setItem(STAMP_KEY,String(Date.now()));return true;
    }catch(e){return false}
  }
  function ensureChoiceUI(){
    if(document.getElementById('v237SaveChoice'))return;
    const css=document.createElement('style');css.id='v237SaveChoiceStyle';css.textContent=`
#v237SaveChoice{position:fixed;inset:0;z-index:2147483000;background:rgba(13,18,29,.62);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:none;align-items:center;justify-content:center;padding:18px;font-family:system-ui,-apple-system,sans-serif}
#v237SaveChoice.show{display:flex}.v237ChoiceCard{width:min(520px,100%);border-radius:28px;padding:20px;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(239,246,255,.94));border:1px solid rgba(255,255,255,.9);box-shadow:0 30px 80px rgba(0,0,0,.28);color:#172238}.v237ChoiceTop small{font-size:9px;font-weight:1000;letter-spacing:1.8px;color:#7c6ce7}.v237ChoiceTop h3{font-size:23px;line-height:1.05;margin:5px 0 7px}.v237ChoiceTop p{font-size:12px;line-height:1.45;color:#68758a;margin:0 0 14px}.v237Choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v237SaveBox{border:1px solid rgba(130,148,174,.25);background:rgba(255,255,255,.7);border-radius:19px;padding:13px}.v237SaveBox b{display:block;font-size:13px}.v237SaveBox small{display:block;font-size:9px;color:#7a8799;margin-top:2px}.v237Stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}.v237Stat{padding:7px 8px;border-radius:10px;background:rgba(225,233,245,.62);font-size:9px;color:#66748a}.v237Stat strong{display:block;font-size:12px;color:#172238}.v237SaveBox button{width:100%;border:0;border-radius:13px;padding:11px 8px;font:1000 10px system-ui;letter-spacing:.35px}.v237DeviceBtn{background:linear-gradient(180deg,#8b6dff,#7354e7);color:#fff}.v237CloudBtn{background:#172238;color:#fff}.v237ChoiceNote{font-size:9px;line-height:1.4;color:#7a8799;margin-top:11px;text-align:center}@media(max-width:520px){.v237Choices{grid-template-columns:1fr}.v237ChoiceCard{padding:16px;border-radius:23px}}`;
    document.head.appendChild(css);
    const d=document.createElement('div');d.id='v237SaveChoice';d.innerHTML=`<div class="v237ChoiceCard"><div class="v237ChoiceTop"><small>ACCOUNT SAVE SAFETY</small><h3 id="v237ChoiceTitle">Choose which progress to keep</h3><p id="v237ChoiceText"></p></div><div class="v237Choices"><div class="v237SaveBox"><b id="v237LocalLabel">THIS DEVICE</b><small>Stored on this phone/browser</small><div class="v237Stats" id="v237LocalStats"></div><button class="v237DeviceBtn" id="v237UseLocal">USE DEVICE SAVE</button></div><div class="v237SaveBox"><b>ACCOUNT SAVE</b><small>Stored with your email/password</small><div class="v237Stats" id="v237CloudStats"></div><button class="v237CloudBtn" id="v237UseCloud">USE ACCOUNT SAVE</button></div></div><div class="v237ChoiceNote">Nothing is deleted until you choose. A safety backup is kept on this device.</div></div>`;document.body.appendChild(d);
  }
  function statsHTML(st){const x=saveSummary(st);const money=Number.isFinite(x.coins)?x.coins:0;return `<div class="v237Stat">Binder<strong>${x.binder} cards</strong></div><div class="v237Stat">Bulk<strong>${x.bulk} cards</strong></div><div class="v237Stat">Packs opened<strong>${x.packs}</strong></div><div class="v237Stat">Hits<strong>${x.hits}</strong></div><div class="v237Stat">XP<strong>${Math.round(x.xp).toLocaleString()}</strong></div><div class="v237Stat">Money<strong>$${money.toFixed(2)}</strong></div>`}
  function chooseSave(localState,remoteState,{recovery=false}={}){
    ensureChoiceUI();recoveryPending=true;syncUI();clearTimeout(syncTimer);syncTimer=null;
    const m=el('v237SaveChoice');m.classList.add('show');
    el('v237ChoiceTitle').textContent=recovery?'Your earlier device save was found':'Choose which progress belongs to this account';
    el('v237ChoiceText').textContent=recovery?'The previous cloud sync replaced a richer device save. The safety copy is still on this phone. Choose the copy you want attached to your account.':'Both this device and the account already contain progress, so the game will not overwrite either one automatically.';
    el('v237LocalLabel').textContent=recovery?'RECOVERED DEVICE SAVE':'THIS DEVICE';
    el('v237LocalStats').innerHTML=statsHTML(localState);el('v237CloudStats').innerHTML=statsHTML(remoteState);
    return new Promise(resolve=>{
      el('v237UseLocal').onclick=()=>{m.classList.remove('show');resolve('local')};
      el('v237UseCloud').onclick=()=>{m.classList.remove('show');resolve('cloud')};
    });
  }
  async function refreshSession(){
    if(!client)return null;
    try{
      const {data,error}=await client.auth.getSession();if(error)throw error;
      const session=data?.session||null;user=session?.user||null;sessionState='ready';
      clearTimeout(sessionRetry);sessionRetry=null;
      if(user){setPendingEmail('');try{const pending=JSON.parse(localStorage.getItem('tcg-hub-v256-pending:'+user.id)||'null');if(pending&&['listing_create','listing_buy','listing_cancel','trade_offer','room_ready','room_cancel','heartbeat'].includes(pending.action))holdHubTransaction();}catch(_){}}
      syncUI();return session;
    }catch(e){
      // A failed refresh is not a sign-out. Let the SDK retain/refresh its stored
      // session; never replace the account or enable a cloud write on this path.
      sessionState='retry';syncUI();
      if(!sessionRetry)sessionRetry=setTimeout(()=>{sessionRetry=null;refreshSession().then(session=>{if(session?.user&&!recoveryPending)reconcile();});},5000);
      return null;
    }
  }
  async function getRemote(){
    if(!client)return null;const session=await refreshSession();if(!session?.user)return null;
    const {data,error}=await client.from(CLOUD_TABLE).select('save_data,save_version,device_id,updated_at').eq('user_id',session.user.id).maybeSingle();if(error)throw error;return data||null;
  }
  async function pushNow(showToast=false,force=false,inPlaceConflict=false){
    if(!client||syncBusy||hubHold)return false;if(recoveryPending&&!force){if(showToast)toast('Choose which save to keep first.');return false}if(Date.now()<pushPausedUntil&&!showToast&&!force)return false;syncBusy=true;
    try{
      const session=await refreshSession();if(!session?.user){if(showToast)toast('Log in before syncing account progress.');setStatus('warn','Sign-in required','Progress is only protected by the browser until you log in.');return false}
      const data=snapshot(),expected=(cloudVersion??storedVersion())||null;
      const {data:result,error}=await client.rpc('tcg_account_save',{p_save_data:data,p_expected_version:expected,p_device_id:deviceId});if(error)throw error;
      if(result?.conflict){
        try{localStorage.setItem(CONFLICT_BACKUP_KEY,JSON.stringify(state))}catch(_){ }
        setStoredVersion(result.save_version);setDirty(false);
        if(inPlaceConflict){await pullInPlace(false);setStatus('warn','Account collection refreshed','Review the updated collection before trying your action again.');return false;}
        if(result.save_data&&applySnapshot(result.save_data)){setStatus('warn','Account changed on another device','The newer account save was loaded. Your unsynced device copy was preserved as a safety backup.');if(showToast)toast('☁️ Newer account save loaded');setTimeout(()=>location.reload(),350)}
        return false;
      }
      setStoredVersion(result?.save_version||expected||1);setDirty(false);setBound();try{localStorage.setItem(STAMP_KEY,String(Date.now()))}catch(_){}syncUI();if(showToast)toast('☁️ Account save synced');return true;
    }catch(e){console.error('Account save failed',e);setDirty(true);const msg=String(e?.message||'');if(/row-level security|401|jwt|auth/i.test(msg))setStatus('warn','Sign-in required','Your account session needs to be refreshed. The offline backup is still safe on this device.');else setStatus('warn','Account sync pending','Your latest progress is queued on this device and will retry when the connection recovers.');if(showToast)toast('Account sync pending • offline backup is safe');return false}finally{syncBusy=false}
  }
  function pausePush(ms=3000){pushPausedUntil=Math.max(pushPausedUntil,Date.now()+Math.max(250,Number(ms)||3000));clearTimeout(syncTimer);syncTimer=null}
  function queuePush(){if(!user||!client||recoveryPending)return;if(hubHold){setDirty(true);return;}setDirty(true);clearTimeout(syncTimer);const wait=Date.now()<pushPausedUntil?Math.max(80,pushPausedUntil-Date.now()+80):350;syncTimer=setTimeout(()=>pushNow(false),wait)}
  async function reconcile(){
    if(!client||recoveryPending||hubHold||(typeof busy!=='undefined'&&busy))return;const session=await refreshSession();if(!session?.user)return;
    try{
      const remote=await getRemote();
      if(!remote?.save_data){setBound();setStoredVersion(null);setDirty(true);await pushNow(false,true);return}
      const remoteVersion=Number(remote.save_version||1),cloud=remote.save_data,remoteState=cloud?.state||{};
      if(!isBound()){
        const pre=readStateKey(PRECLOUD_KEY);const current=clone(state);const candidate=(pre&&meaningful(pre)&&materiallyDifferent(pre,remoteState))?pre:current;
        const recovering=!!(pre&&candidate===pre);
        if(meaningful(candidate)&&meaningful(remoteState)&&materiallyDifferent(candidate,remoteState)){
          try{localStorage.setItem(LINK_BACKUP_KEY,JSON.stringify(current))}catch(_){ }
          const choice=await chooseSave(candidate,remoteState,{recovery:recovering});
          recoveryPending=false;setBound();setStoredVersion(remoteVersion);
          if(choice==='local'){
            state=clone(candidate);state.cloudV190=state.cloudV190||{};state.cloudV190.changedAt=Date.now();
            localStorage.setItem('tcgRipperSave',JSON.stringify(state));setDirty(true);syncUI();
            const ok=await pushNow(true,true);if(ok)setTimeout(()=>location.reload(),300);return;
          }
          setDirty(false);applySnapshot(cloud);syncUI();toast('☁️ Account save kept');setTimeout(()=>location.reload(),300);return;
        }
        setBound();setStoredVersion(remoteVersion);
        if(meaningful(candidate)&&!meaningful(remoteState)){
          if(candidate!==current){state=clone(candidate);localStorage.setItem('tcgRipperSave',JSON.stringify(state))}
          setDirty(true);await pushNow(false,true);return;
        }
        if(meaningful(remoteState)&&!meaningful(current)){setDirty(false);if(applySnapshot(cloud))setTimeout(()=>location.reload(),300);return}
      }
      const knownVersion=storedVersion();
      if(isDirty()&&knownVersion===remoteVersion){setStoredVersion(remoteVersion);await pushNow(false);return}
      if(knownVersion!==remoteVersion){
        try{localStorage.setItem(CONFLICT_BACKUP_KEY,JSON.stringify(state))}catch(_){ }
        setStoredVersion(remoteVersion);setDirty(false);if(applySnapshot(cloud)){toast('☁️ Newer account progress loaded');setTimeout(()=>location.reload(),300)}return;
      }
      setStoredVersion(remoteVersion);setDirty(false);try{localStorage.setItem(STAMP_KEY,String(Date.now()))}catch(_){}syncUI();
    }catch(e){console.error('Account reconcile failed',e);setStatus('warn','Could not read account save','The offline backup remains available. Account sync will retry automatically.')}
  }
  async function pullInPlace(showToast=false){
    if(!client||recoveryPending)return false;const session=await refreshSession();if(!session?.user)return false;
    try{const account=session.user.id,remote=await getRemote(),cloud=remote?.save_data;if(user?.id!==account||!cloud?.state)return false;setBound();setStoredVersion(remote.save_version||1);setDirty(false);pausePush(2600);state=clone(cloud.state);state.cloudV190=state.cloudV190||{};state.cloudV190.changedAt=Number(cloud.saved_at||Date.parse(remote.updated_at)||Date.now());localStorage.setItem('tcgRipperSave',JSON.stringify(state));if(cloud.prefs)localStorage.setItem('tcgPrefsV160',JSON.stringify(cloud.prefs));if(cloud.audio)localStorage.setItem('tcgAudioV68',JSON.stringify(cloud.audio));if(cloud.selectedSetId)localStorage.setItem('tcgCloudSelectedSetV190',cloud.selectedSetId);localStorage.setItem(STAMP_KEY,String(Date.now()));syncUI();try{stats()}catch(e){}try{updateProgressUI()}catch(e){}try{renderBinder()}catch(e){}try{renderSets()}catch(e){}try{renderMarketV57()}catch(e){}try{renderMarketHistoryV72()}catch(e){}try{renderProfile()}catch(e){}try{renderSlabVaultV52()}catch(e){}try{renderMasterV57()}catch(e){}if(showToast)toast('☁️ Live game state synced');return true}catch(e){console.error('Cloud in-place pull failed',e);return false}
  }
  function ensurePasswordRecoveryUI(){
    if(document.getElementById('v238PasswordRecovery'))return;
    const css=document.createElement('style');css.id='v238PasswordRecoveryStyle';css.textContent=`
#v238PasswordRecovery{position:fixed;inset:0;z-index:2147483200;background:rgba(11,16,26,.68);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:none;align-items:center;justify-content:center;padding:18px;font-family:system-ui,-apple-system,sans-serif}
#v238PasswordRecovery.show{display:flex}.v238ResetCard{width:min(460px,100%);padding:22px;border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.99),rgba(238,246,255,.96));box-shadow:0 24px 80px rgba(3,10,25,.28);color:#132038}.v238ResetCard h2{margin:0 0 8px;font-size:27px}.v238ResetCard p{margin:0 0 16px;color:#5b6679;font-weight:650;line-height:1.45}.v238ResetCard input{width:100%;box-sizing:border-box;border:1px solid rgba(35,56,88,.16);background:rgba(255,255,255,.86);border-radius:16px;padding:14px 15px;margin:6px 0;font:700 16px system-ui;color:#142039;outline:none}.v238ResetActions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.v238ResetActions button{border:0;border-radius:16px;padding:14px;font:850 13px system-ui;letter-spacing:.04em}.v238Primary{background:#14213a;color:white}.v238Secondary{background:#e8eef7;color:#26344d}.v238ResetMsg{min-height:20px;margin-top:10px!important;font-size:13px!important}
`;
    document.head.appendChild(css);
    const wrap=document.createElement('div');wrap.id='v238PasswordRecovery';wrap.innerHTML=`<div class="v238ResetCard"><h2>Reset password</h2><p>This changes only the login password. Your Binder, money, XP and cloud save stay attached to the same account.</p><input id="v238NewPassword" type="password" autocomplete="new-password" placeholder="New password (6+ characters)"><input id="v238NewPassword2" type="password" autocomplete="new-password" placeholder="Confirm new password"><div class="v238ResetActions"><button class="v238Secondary" id="v238ResetCancel">CANCEL</button><button class="v238Primary" id="v238ResetConfirm">SAVE NEW PASSWORD</button></div><p class="v238ResetMsg" id="v238ResetMsg"></p></div>`;
    document.body.appendChild(wrap);
    document.getElementById('v238ResetCancel')?.addEventListener('click',()=>wrap.classList.remove('show'));
    document.getElementById('v238ResetConfirm')?.addEventListener('click',async()=>{
      const a=document.getElementById('v238NewPassword')?.value||'',b=document.getElementById('v238NewPassword2')?.value||'',m=document.getElementById('v238ResetMsg');
      if(a.length<6){if(m)m.textContent='Use at least 6 characters.';return}if(a!==b){if(m)m.textContent='Passwords do not match.';return}
      const btn=document.getElementById('v238ResetConfirm');if(btn)btn.disabled=true;if(m)m.textContent='Updating password…';
      try{const {error}=await client.auth.updateUser({password:a});if(error)throw error;if(m)m.textContent='Password updated successfully.';toast('🔐 Password updated • your save is unchanged');setTimeout(()=>wrap.classList.remove('show'),1000)}catch(e){if(m)m.textContent=e?.message||'Could not update password.'}finally{if(btn)btn.disabled=false}
    });
  }
  function showPasswordRecovery(){ensurePasswordRecoveryUI();document.getElementById('v238PasswordRecovery')?.classList.add('show');setTimeout(()=>document.getElementById('v238NewPassword')?.focus(),120)}
  async function requestPasswordReset(){
    if(authBusy)return;if(!configured())return toast('Cloud backend is not configured yet.');
    const email=el('cloudEmailV190')?.value.trim()||'';if(!email)return toast('Enter the account email first.');authBusy=true;
    try{const redirectTo=location.origin+location.pathname;const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});if(error)throw error;toast('📧 Password reset email sent');setStatus('warn','Check your email','Open the password-reset email on this device, then choose a new password in the game.')}catch(e){toast(e?.message||'Could not send reset email')}finally{authBusy=false}
  }
  async function login(){
    if(authBusy)return;if(!configured())return toast('Cloud backend is not configured yet.');const email=el('cloudEmailV190')?.value.trim(),password=el('cloudPasswordV190')?.value||'';if(!email||password.length<6)return toast('Enter your email and a password of at least 6 characters.');authBusy=true;
    try{const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;if(!data?.session?.user)throw new Error('No authenticated session returned.');user=data.session.user;sessionState='ready';cloudVersion=null;setPendingEmail('');syncUI();toast('☁️ Logged in');await reconcile()}catch(e){user=null;const msg=String(e?.message||'Login failed');if(/email.*confirm|confirm.*email/i.test(msg)){setPendingEmail(email);syncUI();toast('Confirm your email first, then log in.')}else{syncUI();toast(msg)}}finally{authBusy=false}
  }
  async function signup(){
    if(authBusy)return;if(!configured())return toast('Cloud backend is not configured yet.');const email=el('cloudEmailV190')?.value.trim(),password=el('cloudPasswordV190')?.value||'';if(!email||password.length<6)return toast('Enter your email and a password of at least 6 characters.');authBusy=true;
    try{const {data,error}=await client.auth.signUp({email,password});if(error)throw error;if(data?.session?.user){user=data.session.user;cloudVersion=null;setPendingEmail('');setBound();setStoredVersion(null);setDirty(true);syncUI();toast('☁️ Account created and signed in');await pushNow(false,true)}else{user=null;setPendingEmail(email);syncUI();toast('📧 Account created • confirm the email, then log in.')}}catch(e){user=null;syncUI();toast(e?.message||'Could not create account')}finally{authBusy=false}
  }
  async function logout(){if(!client)return;try{await pushNow(false);const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;user=null;sessionState='ready';cloudVersion=null;recoveryPending=false;clearTimeout(sessionRetry);sessionRetry=null;syncUI();toast('Signed out • this device now has an offline-only copy')}catch(e){toast('Could not sign out')}}
  async function init(){
    // Bind dismissal/account controls before awaiting session recovery. A slow
    // mobile connection must never leave Settings as an unresponsive overlay.
    el('cloudLoginBtnV190')?.addEventListener('click',login);el('cloudSignupBtnV190')?.addEventListener('click',signup);el('cloudLogoutBtnV190')?.addEventListener('click',logout);el('cloudSyncBtnV190')?.addEventListener('click',()=>pushNow(true));const loginBox=el('cloudLoginV190');if(loginBox&&!document.getElementById('cloudForgotBtnV238')){const b=document.createElement('button');b.id='cloudForgotBtnV238';b.type='button';b.textContent='FORGOT PASSWORD';b.style.cssText='width:100%;margin-top:8px;border:0;border-radius:14px;padding:11px 12px;background:rgba(230,237,248,.88);color:#24324a;font:800 12px system-ui;letter-spacing:.04em';b.addEventListener('click',requestPasswordReset);loginBox.appendChild(b)}const signedBox=el('cloudSignedV190');if(signedBox&&!document.getElementById('cloudChangePasswordBtnV238')){const b=document.createElement('button');b.id='cloudChangePasswordBtnV238';b.type='button';b.textContent='CHANGE PASSWORD';b.style.cssText='width:100%;margin-top:8px;border:0;border-radius:14px;padding:11px 12px;background:rgba(230,237,248,.88);color:#24324a;font:800 12px system-ui;letter-spacing:.04em';b.addEventListener('click',showPasswordRecovery);signedBox.appendChild(b)}syncUI();

    if(!configured())return;
    try{
      client=(window.__tcgSupabaseClient ||= window.supabase.createClient(cfg().supabaseUrl,cfg().supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
      client.auth.onAuthStateChange((event,session)=>{
        const next=session?.user||null,changed=next?.id!==user?.id;
        // Only confirmed SDK session events clear the displayed account.
        if(next||event==='SIGNED_OUT'||event==='INITIAL_SESSION'){user=next;sessionState='ready';}
        if(changed)cloudVersion=null;
        if(user)setPendingEmail('');syncUI();
        if(event==='SIGNED_OUT'){clearTimeout(sessionRetry);sessionRetry=null;}
        if(event==='PASSWORD_RECOVERY'){setTimeout(showPasswordRecovery,50);return;}
        if(changed&&user)setTimeout(reconcile,100);
      });
      const resume=()=>{if(!recoveryPending)refreshSession().then(session=>{if(session?.user)reconcile();});};
      window.addEventListener('online',resume);
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='visible')resume();
        else if(user&&isDirty()&&!recoveryPending)pushNow(false);
      });
      window.addEventListener('pageshow',event=>{if(event.persisted)resume();});
      window.addEventListener('pagehide',()=>{if(user&&isDirty()&&!recoveryPending)pushNow(false);});
      setInterval(()=>{if(user&&isDirty()&&!syncBusy&&!recoveryPending)pushNow(false);},10000);
      await refreshSession();if(user)setTimeout(reconcile,500);
    }catch(e){sessionState='retry';syncUI();console.error('Account initialization failed',e);}
  }
  try{const baseSave=save;save=function(){markLocalChange();const r=baseSave.apply(this,arguments);queuePush();return r}}catch(e){console.warn('Cloud save wrapper not installed',e)}
  async function beginHubTransaction(){
    if(!user||recoveryPending)throw new Error('AUTH_REQUIRED');
    if(typeof busy!=='undefined'&&busy)throw new Error('Finish opening your current pack first.');
    const account=user.id;hubBarrier(true);
    try{
      if(hubHold)throw new Error('Retry the pending Trade Hub action first.');
      const deadline=Date.now()+8000;
      while(syncBusy&&Date.now()<deadline)await new Promise(r=>setTimeout(r,50));
      if(syncBusy||!await pushNow(false,true,true)||user?.id!==account)throw new Error('SYNC_REQUIRED');
      hubHold=true;clearTimeout(syncTimer);syncTimer=null;
      return cloudVersion??storedVersion();
    }catch(e){if(!hubHold)hubBarrier(false);throw e;}
  }
  const hubInert=new Map();
  function hubBarrier(on){
    document.documentElement.classList.toggle('hub-transaction-pending',on);
    if(on){for(const node of document.querySelectorAll('.screen:not(#earn):not(#settings),#earn .exchangeV154')){if(!hubInert.has(node))hubInert.set(node,node.inert);node.inert=true;}}
    else{for(const [node,value]of hubInert)node.inert=value;hubInert.clear();}
  }
  for(const type of ['click','submit','keydown','pointerdown'])document.addEventListener(type,e=>{
    if(document.documentElement.classList.contains('hub-transaction-pending')&&!e.target.closest?.('#tradeHub,.nav,#closeProfileSettingsV158,#closeSettingsShadeV158')){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  function holdHubTransaction(){hubHold=true;clearTimeout(syncTimer);syncTimer=null;hubBarrier(true);}
  function resetHubTransaction(){hubHold=false;hubBarrier(false);}
  async function syncHubSnapshot(version){
    if(!user||recoveryPending)return;
    if(hubHold){await finishHubTransaction();return;}
    if(!version||Number(version)<=Number(cloudVersion??storedVersion()))return;
    if(typeof busy!=='undefined'&&busy)return;
    // Never silently overwrite unsynced local play. The normal version-conflict
    // path preserves its backup and loads the newer account state.
    if(isDirty()){await pushNow(false,true,true);if(Number(version)>Number(cloudVersion??storedVersion()))throw new Error('SYNC_REQUIRED');return;}
    holdHubTransaction();await finishHubTransaction();
  }
  async function finishHubTransaction(){
    if(!hubHold)return;
    if(!await pullInPlace(false))throw Object.assign(new Error('Collection sync is pending. Reconnect before continuing.'),{uncertain:true});
    resetHubTransaction();
  }
  window.tcgCloudV192={beginHubTransaction,holdHubTransaction,finishHubTransaction,resetHubTransaction,syncHubSnapshot,get hubHeld(){return hubHold},push:()=>pushNow(true),pushSilent:()=>pushNow(false),reconcile,pullInPlace,pausePush,requestPasswordReset,get user(){return user},get saveVersion(){return cloudVersion??storedVersion()},get accountPrimary(){return !!user&&!recoveryPending},get recoveryPending(){return recoveryPending},configured,refreshSession};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();



/* ===== original script 34 id=v193-pack-selector-fix ===== */

(()=>{try{
  function isActuallyOpeningV195(){
    const stage=document.getElementById('stage'),pack=document.getElementById('pack');
    return !!(stage?.classList.contains('v91Cinematic')||stage?.classList.contains('v114TenRipping')||stage?.classList.contains('cardModeV89')||pack?.classList.contains('v91Rip')||(Array.isArray(pulls)&&pulls.length>0&&pack?.style.display==='none'));
  }
  function forcePackModeV195(count){
    const next=Number(count)===10?10:1;if(isActuallyOpeningV195())return false;
    busy=false;pulls=[];idx=0;v114BatchGroups=[];v114PackCount=next;
    const line=document.getElementById('v114TenLine'),stage=document.getElementById('stage');
    if(next===1&&line){line.innerHTML='';line.style.transform='translate(-50%,-50%)'}
    if(next===1)stage?.classList.remove('v114TenMode','v114TenRipping');
    resetPack();v114RenderMode();try{syncPackCreditV161()}catch(_e){}
    document.querySelectorAll('#v114PackMode button[data-count]').forEach(b=>b.classList.toggle('active',Number(b.dataset.count)===next));
    return true;
  }
  const old=document.getElementById('v114PackMode');
  if(old){
    /* Clone once to discard every legacy direct listener, then own the selector from one controller. */
    const fresh=old.cloneNode(true);old.replaceWith(fresh);
    fresh.addEventListener('pointerup',e=>{const b=e.target.closest('button[data-count]');if(!b)return;e.preventDefault();e.stopPropagation();forcePackModeV195(b.dataset.count)},{passive:false});
    fresh.addEventListener('click',e=>{const b=e.target.closest('button[data-count]');if(!b)return;e.preventDefault();e.stopPropagation();forcePackModeV195(b.dataset.count)});
  }
  window.forcePackModeV193=forcePackModeV195;window.forcePackModeV195=forcePackModeV195;
}catch(err){console.error('V195 pack selector controller',err)}})();



/* ===== original script 35 id=v194-smooth-adventure-theme ===== */

/* V194 — original slow/smooth creature-collecting adventure soundtrack.
   Uses Web Audio only; no copyrighted recording or melody is embedded. */
(()=>{
  const BPM=76;
  const BEAT=60/BPM;
  const BAR=BEAT*4;
  const PROG=[
    {root:261.63,chord:[261.63,329.63,392.00],bass:130.81}, // C
    {root:220.00,chord:[220.00,261.63,329.63],bass:110.00}, // Am
    {root:174.61,chord:[174.61,220.00,261.63],bass:87.31},  // F
    {root:196.00,chord:[196.00,246.94,293.66],bass:98.00}   // G
  ];
  const MELODY=[
    659.25,587.33,523.25,392.00,
    440.00,523.25,587.33,523.25,
    523.25,440.00,392.00,349.23,
    392.00,493.88,523.25,392.00
  ];
  const ALT=[
    523.25,659.25,783.99,659.25,
    587.33,523.25,440.00,523.25,
    440.00,523.25,659.25,587.33,
    493.88,587.33,659.25,523.25
  ];

  function smoothMusicNoteV194(freq,start,dur,vol=.03,type='sine',cutoff=1600){
    const c=audioV67?.ctx;if(!c||!audioV67.music)return;
    const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
    o.type=type;o.frequency.setValueAtTime(freq,start);
    f.type='lowpass';f.frequency.setValueAtTime(cutoff,start);f.Q.setValueAtTime(.3,start);
    const attack=Math.min(.18,dur*.28),release=Math.min(.72,dur*.42);
    g.gain.setValueAtTime(.0001,start);
    g.gain.linearRampToValueAtTime(vol,start+attack);
    g.gain.setValueAtTime(vol,start+Math.max(attack,dur-release));
    g.gain.exponentialRampToValueAtTime(.0001,start+dur);
    o.connect(f);f.connect(g);g.connect(audioV67.music);
    o.start(start);o.stop(start+dur+.05);
  }

  function padChordV194(notes,start,dur,vol=.015){
    notes.forEach((n,i)=>{
      smoothMusicNoteV194(n,start+i*.025,dur,vol,'sine',1150);
      smoothMusicNoteV194(n/2,start+i*.025,dur,vol*.34,'triangle',900);
    });
  }

  function pluckV194(freq,start,dur=.55,vol=.018){
    smoothMusicNoteV194(freq,start,dur,vol,'triangle',1850);
    smoothMusicNoteV194(freq*2,start+.012,dur*.7,vol*.22,'sine',2400);
  }

  function schedulePhraseV194(){
    const c=audioV67?.ctx;if(!c||c.state!=='running'||!audioV67.musicOn)return;
    const base=c.currentTime+.08;
    const phrase=audioV67._v194Phrase||0;
    const melody=phrase%2===0?MELODY:ALT;

    PROG.forEach((p,bar)=>{
      const t=base+bar*BAR;
      padChordV194(p.chord,t,BAR*.96,.0145);
      smoothMusicNoteV194(p.bass,t,BAR*.92,.018,'sine',720);
      smoothMusicNoteV194(p.bass*1.5,t+BEAT*2,BAR*.40,.008,'triangle',850);

      // soft arpeggio bed
      [0,1,2,1].forEach((ix,s)=>pluckV194(p.chord[ix]*2,t+s*BEAT,.64,.0105));

      // lead melody — deliberately spacious and legato
      for(let s=0;s<4;s++){
        const note=melody[bar*4+s];
        const nt=t+s*BEAT;
        smoothMusicNoteV194(note,nt,BEAT*.86,.0165,'sine',1750);
        if(s===0||s===2)smoothMusicNoteV194(note/2,nt+.025,BEAT*.72,.0045,'triangle',1150);
      }
    });
    audioV67._v194Phrase=phrase+1;
  }

  window.startMusicV67=function(){
    if(audioV67.timer)clearInterval(audioV67.timer);
    audioV67.timer=null;
    audioV67._v194Phrase=0;
    const phraseMs=Math.round(BAR*4*1000);
    const fire=()=>{try{schedulePhraseV194()}catch(_) {}};
    fire();
    audioV67.timer=setInterval(fire,phraseMs-120);
  };

  // Replace an already-running old loop safely.
  if(typeof audioV67!=='undefined'&&audioV67.timer){
    clearInterval(audioV67.timer);audioV67.timer=null;
    if(audioV67.ctx)startMusicV67();
  }

  // Update the settings copy to reflect the new soundtrack.
  const title=[...document.querySelectorAll('.settingTextV68 b')].find(x=>x.textContent.trim()==='Background Music');
  if(title){
    title.textContent='Adventure Theme';
    const sub=title.parentElement?.querySelector('span');
    if(sub)sub.textContent='Slow, smooth original monster-collecting ambience';
  }
  const ver=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version')?.querySelector('b');
  if(ver)ver.textContent='V195 AUDITED';
})();



/* ===== original script 36 id=v195-full-system-hardening ===== */

(()=>{try{
  window.renderStats=typeof stats==='function'?stats:window.renderStats;
  state.systemAuditV195=state.systemAuditV195||{};
  function testStorageV195(){try{const k='__v195_test__';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok}catch(_e){return false}}
  function runSystemAuditV195(){
    const checks=[];const add=(name,ok,detail,level='fail')=>checks.push({name,ok:!!ok,detail,level});
    add('Set catalog',SETS.length===32&&new Set(SETS.map(s=>s.id)).size===SETS.length,`${SETS.length} sets • ${new Set(SETS.map(s=>s.id)).size} unique`);
    add('Achievements',typeof ACHIEVEMENTS!=='undefined'&&new Set(ACHIEVEMENTS.map(x=>x[0])).size===ACHIEVEMENTS.length,`${ACHIEVEMENTS?.length||0} definitions`);
    add('Badges',typeof BADGE_DEFS!=='undefined'&&new Set(BADGE_DEFS.map(x=>x[0])).size===BADGE_DEFS.length,`${BADGE_DEFS?.length||0} definitions`);
    add('Save storage',testStorageV195(),'Local save storage readable + writable');
    add('Pack generator',typeof makePack==='function'&&typeof buildPools==='function','Single + 10-pack generators present');
    add('Pack selector',typeof window.forcePackModeV195==='function','Authoritative mobile selector installed');
    add('Master Sets',typeof masterProgressV58==='function'&&typeof setTotalsV57==='function','Binder • Bulk • grading • slabs • active listings tracked');
    add('Marketplace',typeof renderMarketV57==='function'&&typeof renderMarketBuyV58==='function','Buy / list / cancel / sales renderers present');
    add('Grading',typeof submitBinderCardV44==='function'&&typeof revealGradeV48==='function'&&typeof renderSlabVaultV52==='function','Submit → return → slab flow present');
    add('Trade network',typeof window.renderTradeBoardV154==='function'||typeof renderTradeBoardV154==='function','Trade board renderer present');
    add('Sealed collection',!!document.getElementById('sealedModalV161'),'Shop / vault / display modal present');
    add('God Packs',!!window.godPackStaticAuditV189?.complete,window.godPackStaticAuditV189?`${window.godPackStaticAuditV189.eligible}/${window.godPackStaticAuditV189.sets} sets • 1 in ${window.godPackStaticAuditV189.oneIn}`:'Audit unavailable');
    add('Card reachability',typeof window.runCardReachabilityAuditV188==='function','Full acquisition audit available');
    add('Cloud save guard',typeof window.tcgCloudV192==='object','Authenticated cloud runtime present', 'warn');
    const failed=checks.filter(x=>!x.ok&&x.level==='fail').length,warnings=checks.filter(x=>!x.ok&&x.level==='warn').length;
    const report={time:Date.now(),version:195,checks,failed,warnings,passed:checks.length-failed-warnings};
    state.systemAuditV195={time:report.time,failed,warnings,passed:report.passed,total:checks.length};window.systemAuditV195=report;return report;
  }
  window.runSystemAuditV195=runSystemAuditV195;
  function renderAuditV195(){const r=runSystemAuditV195(),score=document.getElementById('v195AuditScore'),grid=document.getElementById('v195AuditGrid');if(!score||!grid)return;score.innerHTML=`<b>${r.failed?'⚠ '+r.failed+' issue'+(r.failed===1?'':'s'):'✓ CORE SYSTEMS HEALTHY'}</b><div style="margin-top:4px;font-size:9px;color:#c9d7e6">${r.passed}/${r.checks.length} checks passed${r.warnings?' • '+r.warnings+' external warning':''}</div>`;grid.innerHTML=r.checks.map(x=>`<div class="v195AuditCheck ${x.ok?'':x.level}"><b>${x.ok?'✓':'⚠'} ${x.name}</b><span>${x.detail}</span></div>`).join('')}
  function mountHealthV195(){const data=document.querySelector('.settingsDataV158');if(!data||document.getElementById('v195HealthRow'))return;const d=document.createElement('div');d.id='v195HealthRow';d.className='v195HealthRow';d.innerHTML='<div><b>System Health</b><span>Run the V195 critical-system self-check</span></div><button type="button" class="v195HealthBtn" id="v195HealthBtn">VIEW AUDIT</button>';data.appendChild(d);document.getElementById('v195HealthBtn').onclick=()=>{renderAuditV195();document.getElementById('v195AuditModal').classList.add('show');document.getElementById('v195AuditModal').setAttribute('aria-hidden','false')}}
  document.getElementById('v195AuditClose').onclick=()=>{document.getElementById('v195AuditModal').classList.remove('show');document.getElementById('v195AuditModal').setAttribute('aria-hidden','true')};
  document.getElementById('v195AuditModal').addEventListener('click',e=>{if(e.target.id==='v195AuditModal')document.getElementById('v195AuditClose').click()});
  const oldSettings=typeof mountSettingsV163==='function'?mountSettingsV163:null;if(oldSettings)mountSettingsV163=function(){const r=oldSettings.apply(this,arguments);mountHealthV195();return r};
  mountHealthV195();
  /* Refresh complete Master Set totals in the background as catalogs become available. */
  setTimeout(()=>{try{window.primeUnlockedCatalogV188?.(true).then(()=>{try{renderSets();renderProfile()}catch(_e){};try{save()}catch(_e){}})}catch(_e){}},600);
  const ver=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version')?.querySelector('b');if(ver)ver.textContent='V195 AUDITED';
  runSystemAuditV195();
}catch(err){console.error('V195 hardening bootstrap',err)}})();



/* ===== original script 37 id=v196-mythic-promos-script ===== */

(()=>{
  if(window.__v196MythicsInstalled) return; window.__v196MythicsInstalled=true;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  state.mythicRewards=state.mythicRewards||{};
  const completedAchievementsV196=()=>ACHIEVEMENTS.filter(a=>state.achievements?.[a[0]]).length;
  const completedMastersV196=()=>SETS.filter(x=>{let p=masterProgressV58(x);return p.total>0&&p.n>=p.total}).length;
  const mythicDefsV196=[
    {id:'mythic_lv10',name:'Voltaris the Dawnscale',subtitle:'Sky Tempest Mythic Promo',icon:'⚡',hp:230,element:'Aether',artist:'Custom Collector Series',req:'Reach Level 10',lore:'A stormborne guardian awarded to collectors who push beyond the beginner ranks.',ability:'Static Crown — Once per day, this guardian amplifies every spark of progress.',move:'Aurora Discharge',colors:['#1d4ed8','#7c3aed','#facc15'],unlock:()=>levelFromXP(state.xp)>=10},
    {id:'mythic_lv20',name:'Prismara Celestide',subtitle:'Radiant Vault Mythic Promo',icon:'🌈',hp:260,element:'Prism',artist:'Custom Collector Series',req:'Reach Level 20',lore:'Its scales refract every era of the collection world into one perfect spectrum.',ability:'Spectrum Halo — Reflects every achievement back as prestige.',move:'Celestial Bloom',colors:['#0ea5e9','#8b5cf6','#f472b6'],unlock:()=>levelFromXP(state.xp)>=20},
    {id:'mythic_lv30',name:'Chronofang Apex',subtitle:'Time Rift Mythic Promo',icon:'⏳',hp:290,element:'Chrono',artist:'Custom Collector Series',req:'Reach Level 30',lore:'A legendary apex hunter said to stalk only the most seasoned collectors.',ability:'Time Archive — Stores every milestone inside its crystalline mane.',move:'Eon Fang',colors:['#0f172a','#2563eb','#22d3ee'],unlock:()=>levelFromXP(state.xp)>=30},
    {id:'mythic_lv38',name:'Solcrown Imperion',subtitle:'Crown Zenith Ascension Promo',icon:'👑',hp:320,element:'Solar',artist:'Custom Collector Series',req:'Reach Level 38',lore:'Reserved for true icons. Solcrown only appears when a collector becomes a name people remember.',ability:'Royal Ascension — The arena bends around its presence.',move:'Mythic Zenith',colors:['#7c2d12','#dc2626','#fbbf24'],unlock:()=>levelFromXP(state.xp)>=38},
    {id:'mythic_ach25',name:'Archivolt Oracle',subtitle:'Completion Path Mythic Promo',icon:'📜',hp:240,element:'Mind',artist:'Custom Collector Series',req:'Complete 25 achievements',lore:'Each ribbon in its wake records a challenge the collector has already conquered.',ability:'Lore Circuit — Knows what challenge comes next.',move:'Memory Surge',colors:['#4338ca','#8b5cf6','#f59e0b'],unlock:()=>completedAchievementsV196()>=25},
    {id:'mythic_ach50',name:'Nebulisk Prime',subtitle:'Mythic Achievement Promo',icon:'🌌',hp:300,element:'Nebula',artist:'Custom Collector Series',req:'Complete 50 achievements',lore:'A cosmic beast born from relentless consistency and hundreds of tiny wins.',ability:'Nebula Vault — Draws value from perseverance itself.',move:'Event Horizon Roar',colors:['#111827','#4f46e5','#ec4899'],unlock:()=>completedAchievementsV196()>=50},
    {id:'mythic_packs250',name:'Riftdrake Collector X',subtitle:'Pack Grinder Mythic Promo',icon:'📦',hp:255,element:'Drake',artist:'Custom Collector Series',req:'Open 250 packs',lore:'A fan-favourite drake that only appears to relentless rippers with cardboard dust on their hands.',ability:'Rip Sync — Thrives in the glow of tearing foil.',move:'Boxbreaker Talon',colors:['#14532d','#16a34a','#84cc16'],unlock:()=>Number(state.packs||0)>=250},
    {id:'mythic_masters3',name:'Vaultwyrm Omega',subtitle:'Master Set Mythic Promo',icon:'💠',hp:310,element:'Vault',artist:'Custom Collector Series',req:'Complete 3 Master Sets',lore:'The guardian of completed sets — calm, ancient and impossible to rush.',ability:'Vault Aura — Rewards true completion over luck.',move:'Omega Seal',colors:['#0f766e','#0891b2','#a855f7'],unlock:()=>completedMastersV196()>=3}
  ];
  function mythicCardImgV196(card){
    if(card.__img) return card.__img;
    const [c1,c2,c3]=card.colors;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="0.55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient><linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.0"/><stop offset="0.42" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="0.50" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="0.58" stop-color="#ffffff" stop-opacity="0.12"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.0"/></linearGradient><radialGradient id="orb" cx="35%" cy="28%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.18" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.0"/></radialGradient></defs><rect width="420" height="600" rx="28" fill="#edf6ff"/><rect x="10" y="10" width="400" height="580" rx="24" fill="url(#bg)"/><rect x="20" y="20" width="380" height="560" rx="20" fill="rgba(8,12,22,.18)" stroke="rgba(255,255,255,.35)"/><circle cx="138" cy="192" r="126" fill="url(#orb)"/><g opacity="0.28"><circle cx="304" cy="150" r="92" fill="#fff"/><circle cx="312" cy="152" r="78" fill="${c1}"/><circle cx="92" cy="462" r="132" fill="#fff"/><circle cx="92" cy="462" r="106" fill="${c3}"/></g><path d="M68 468c42-121 135-194 224-206 20 48 30 116 18 170-68 42-148 56-242 36z" fill="rgba(9,15,30,.18)"/><path d="M84 420c18-82 94-162 182-186 24 29 40 72 42 118-64 50-156 78-224 68z" fill="rgba(255,255,255,.15)"/><text x="34" y="60" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="rgba(255,255,255,.92)">MYTHIC EXCLUSIVE</text><text x="34" y="92" font-size="14" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="rgba(255,255,255,.82)">${card.subtitle.replace(/&/g,'&amp;')}</text><text x="34" y="522" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="#fff">${card.name.replace(/&/g,'&amp;')}</text><text x="34" y="548" font-size="16" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="rgba(255,255,255,.84)">${card.move.replace(/&/g,'&amp;')}</text><text x="356" y="66" text-anchor="end" font-size="34" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="#fff">${card.hp}</text><text x="356" y="88" text-anchor="end" font-size="13" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="rgba(255,255,255,.84)">HP</text><text x="210" y="295" text-anchor="middle" font-size="128" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${card.icon}</text><rect x="34" y="110" width="352" height="10" rx="5" fill="rgba(255,255,255,.2)"/><rect x="34" y="110" width="352" height="10" rx="5" fill="url(#foil)"/><rect x="36" y="562" width="348" height="1" fill="rgba(255,255,255,.22)"/></svg>`;
    card.__img='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg); return card.__img;
  }
  function mythicOwnedCountV196(){return mythicDefsV196.filter(c=>state.mythicRewards?.[c.id]).length}
  function ensureMythicUiV196(){
    const overview=document.querySelector('#profile [data-profile-panel-v160="overview"]');
    if(overview && !document.getElementById('mythicSectionV196')){
      const sec=document.createElement('section'); sec.className='profileSectionV158 mythicSectionV196'; sec.id='mythicSectionV196';
      sec.innerHTML=`<div class="mythicLeadV196"><div><small>EXCLUSIVE COLLECTABLES</small><h3>Mythic Promo Cards</h3></div><span>Custom original rewards for your biggest milestones</span></div><div class="mythicGridV196" id="mythicRewardGridV196"></div>`;
      const summary=overview.querySelector('.profileMiniSummaryV158');
      if(summary) overview.insertBefore(sec, summary); else overview.appendChild(sec);
    }
    const summary=document.querySelector('#profile .profileMiniSummaryV158');
    if(summary && !document.getElementById('profileMythicsV196')){
      summary.classList.add('v196HasMythics');
      const card=document.createElement('div'); card.className='mythicCountV196'; card.innerHTML='<small>MYTHICS</small><b id="profileMythicsV196">0 / 0</b>'; summary.appendChild(card);
    }
    if(!document.getElementById('mythicModalV196')){
      const modal=document.createElement('div');
      modal.id='mythicModalV196';
      modal.innerHTML='<div class="mythicModalCardV196"><button type="button" class="mythicCloseV196" aria-label="Close">×</button><div class="mythicModalGridV196"><div class="mythicLargeCardV196"><img id="mythicModalImgV196" alt=""></div><div class="mythicCopyV196"><small>MYTHIC EXCLUSIVE REWARD</small><h2 id="mythicModalNameV196">Mythic Promo</h2><p id="mythicModalLoreV196"></p><div class="mythicUnlockPillV196" id="mythicModalUnlockV196">Locked</div><div class="mythicAttrRowV196"><div><small>HP</small><b id="mythicModalHpV196">0</b></div><div><small>ELEMENT</small><b id="mythicModalElementV196">—</b></div><div><small>ARTIST</small><b id="mythicModalArtistV196">—</b></div></div><div class="mythicDetailBoxV196"><b>Signature Ability</b><span id="mythicModalAbilityV196"></span></div><div class="mythicDetailBoxV196"><b>How to Unlock</b><span id="mythicModalReqV196"></span></div><div class="mythicDetailBoxV196"><b>Reward Notes</b><span>This is an original exclusive collector reward. Later we can swap these with user-provided custom art if you want a more community-made look.</span></div></div></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click',e=>{if(e.target===modal || e.target.closest('.mythicCloseV196')) modal.classList.remove('show')});
    }
  }
  function openMythicModalV196(id){
    const card=mythicDefsV196.find(x=>x.id===id); const modal=document.getElementById('mythicModalV196'); if(!card||!modal) return;
    document.getElementById('mythicModalImgV196').src=mythicCardImgV196(card);
    document.getElementById('mythicModalNameV196').textContent=card.name;
    document.getElementById('mythicModalLoreV196').textContent=card.lore;
    document.getElementById('mythicModalUnlockV196').textContent=state.mythicRewards?.[card.id] ? `UNLOCKED • ${new Date(state.mythicRewards[card.id].at||Date.now()).toLocaleDateString()}` : 'LOCKED';
    document.getElementById('mythicModalHpV196').textContent=String(card.hp);
    document.getElementById('mythicModalElementV196').textContent=card.element;
    document.getElementById('mythicModalArtistV196').textContent=card.artist;
    document.getElementById('mythicModalAbilityV196').textContent=card.ability;
    document.getElementById('mythicModalReqV196').textContent=card.req;
    modal.classList.add('show');
  }
  function renderMythicsV196(){
    ensureMythicUiV196();
    const grid=document.getElementById('mythicRewardGridV196'); if(!grid) return;
    grid.innerHTML=mythicDefsV196.map(card=>{const owned=!!state.mythicRewards?.[card.id]; return `<button type="button" class="mythicCardV196 ${owned?'owned':'locked'}" data-mythic-id-v196="${card.id}"><div class="mythicSheenV196"></div>${owned?'':'<div class="mythicLockedOverlayV196">LOCKED</div>'}<div class="mythicTierPillV196"><i>✦</i> MYTHIC EXCLUSIVE</div><div class="mythicPreviewV196"><img src="${mythicCardImgV196(card)}" alt="${esc(card.name)}"></div><div class="mythicBodyV196"><b>${esc(card.name)}</b><small>${esc(card.subtitle)}</small><div class="mythicMetaV196"><span>${card.hp} HP</span><span>${esc(card.element)}</span><span>${owned?'Unlocked':esc(card.req)}</span></div></div></button>`}).join('');
    grid.querySelectorAll('[data-mythic-id-v196]').forEach(btn=>btn.addEventListener('click',()=>openMythicModalV196(btn.dataset.mythicIdV196)));
    const count=document.getElementById('profileMythicsV196'); if(count) count.textContent=`${mythicOwnedCountV196()} / ${mythicDefsV196.length}`;
  }
  function checkMythicRewardsV196(showToast=true){
    state.mythicRewards=state.mythicRewards||{};
    const unlocked=[];
    mythicDefsV196.forEach(card=>{
      if(card.unlock() && !state.mythicRewards[card.id]){state.mythicRewards[card.id]={at:Date.now(),name:card.name}; unlocked.push(card)}
    });
    if(unlocked.length && showToast && typeof toast==='function'){
      toast(`🌟 Mythic unlocked: ${unlocked[0].name}${unlocked.length>1?` +${unlocked.length-1} more`:''}`);
    }
    return unlocked;
  }
  window.mythicDefsV196=mythicDefsV196;
  window.renderMythicsV196=renderMythicsV196;
  window.checkMythicRewardsV196=checkMythicRewardsV196;window.mythicCardImgV196=mythicCardImgV196;window.openMythicModalV196=openMythicModalV196;
  const baseSave=save;
  save=function(){ try{checkMythicRewardsV196(true)}catch(_){}; return baseSave.apply(this,arguments); };
  const baseRenderProfile=renderProfile;
  renderProfile=function(){ const r=baseRenderProfile.apply(this,arguments); try{renderMythicsV196()}catch(_){} return r; };
  try{checkMythicRewardsV196(false)}catch(_){}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{try{ensureMythicUiV196();renderMythicsV196()}catch(_){}}); else {try{ensureMythicUiV196();renderMythicsV196()}catch(_){}}
})();



/* ===== original script 38 id=v197-level-reward-road-script ===== */

(()=>{
  if(window.__v197RewardRoadInstalled)return;window.__v197RewardRoadInstalled=true;
  state.levelRewardsV197=state.levelRewardsV197||{claimedCash:{}};
  state.levelRewardsV197.claimedCash=state.levelRewardsV197.claimedCash||{};
  const MAX_LEVEL_V197=50;
  const CASH_V197={5:10,8:15,10:20,12:20,15:35,18:40,20:50,25:75,30:100,35:150,38:250,40:175,45:250,50:500};
  const RANK_V197={1:'ROOKIE COLLECTOR',4:'PACK COLLECTOR',8:'FOIL HUNTER',15:'ELITE COLLECTOR',22:'MASTER COLLECTOR',30:'VAULT LEGEND',38:'TCG ICON'};
  const MYTHIC_LEVEL_V197={5:'sp_eevee',10:'sp_charmeleon',20:'sp_reshiram_ex',30:'sp_gyarados',38:'sp_machamp_ex'};
  const escV197=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function binderAtV197(lv){
    if(lv===1)return typeof BINDER_THEMES!=='undefined'?BINDER_THEMES.find(x=>x.id==='classic'):null;
    if(typeof BINDER_LEVEL_REWARDS==='undefined'||typeof BINDER_THEMES==='undefined')return null;
    const id=Object.keys(BINDER_LEVEL_REWARDS).find(k=>Number(BINDER_LEVEL_REWARDS[k])===Number(lv));
    return id?BINDER_THEMES.find(x=>x.id===id):null;
  }
  function mythicAtV197(lv){
    const id=MYTHIC_LEVEL_V197[lv];return id&&window.specialCardsV198?window.specialCardsV198.find(x=>x.id===id):null;
  }
  function setsAtV197(lv){return typeof SETS!=='undefined'?SETS.filter(s=>Number(s.unlock)===Number(lv)):[]}
  function cashClaimableV197(lv){return levelFromXP(state.xp)>=Number(lv)&&Number(CASH_V197[lv]||0)>0&&!state.levelRewardsV197.claimedCash[lv]}
  function claimCashV197(lv,quiet=false){
    lv=Number(lv);const amt=Number(CASH_V197[lv]||0);if(!amt||levelFromXP(state.xp)<lv||state.levelRewardsV197.claimedCash[lv])return 0;
    state.levelRewardsV197.claimedCash[lv]={at:Date.now(),amount:amt};state.coins=Math.round((Number(state.coins||0)+amt)*100)/100;
    if(!quiet){try{hitSound(3)}catch(_e){};try{navigator.vibrate?.([12,28,12])}catch(_e){};toast(`🎁 Level ${lv} reward claimed • +$${amt.toFixed(2)}`)}
    save();try{renderLevelRewardsV197()}catch(_e){};return amt;
  }
  function claimAllCashV197(){
    let total=0,count=0;Object.keys(CASH_V197).forEach(k=>{let lv=Number(k),amt=Number(CASH_V197[lv]||0);if(levelFromXP(state.xp)>=lv&&!state.levelRewardsV197.claimedCash[lv]){state.levelRewardsV197.claimedCash[lv]={at:Date.now(),amount:amt};state.coins=Math.round((Number(state.coins||0)+amt)*100)/100;total+=amt;count++}});
    if(!count)return toast('No level cash rewards are ready yet.');
    save();try{hitSound(4)}catch(_e){};try{navigator.vibrate?.([12,30,12,45,18])}catch(_e){};toast(`🎁 Claimed ${count} level rewards • +$${total.toFixed(2)}`);renderLevelRewardsV197();
  }
  function rewardCountReadyV197(){return Object.keys(CASH_V197).filter(k=>cashClaimableV197(Number(k))).length}
  function rewardTileSetV197(set,lv){
    const reached=levelFromXP(state.xp)>=lv;return `<button type="button" class="rewardTileV197 rewardSetV197" data-v197-set="${set.id}"><img src="${logo(set)}" alt="" onerror="this.style.display='none'"><div><small>SET UNLOCK</small><b>${escV197(set.name)}</b><span>${reached?'Unlocked and playable':'Preview requirements'}</span></div></button>`;
  }
  function rewardTileBinderV197(theme,lv){
    const owned=!!state.binderOwned?.includes(theme.id);return `<button type="button" class="rewardTileV197 rewardBinderV197" data-v197-binder="${theme.id}"><span class="rewardBinderIconV197">📘</span><small>${lv===1?'STARTER BINDER':'PRESTIGE BINDER'}</small><b>${escV197(theme.name)}</b><span>${owned?'Owned • tap to view':'Unlocks automatically at Level '+lv}</span></button>`;
  }
  function rewardTileMythicV197(card,lv){
    const owned=!!state.specialCollectionV198?.owned?.[card.id],img=card.art||'';return `<button type="button" class="rewardTileV197 rewardMythicV197" data-v198-special="${card.id}"><img src="${img}" alt="${escV197(card.name)}"><div><small>✦ ${escV197(card.rarity||'SPECIAL RARE').toUpperCase()}</small><b>${escV197(card.name)}</b><span>${escV197(card.subtitle||'Special Collection')}</span><em>${owned?'UNLOCKED':'PREVIEW • LEVEL '+lv}</em></div></button>`;
  }
  function rewardTileCashV197(lv){
    const amount=Number(CASH_V197[lv]||0),reached=levelFromXP(state.xp)>=lv,claimed=!!state.levelRewardsV197.claimedCash[lv];
    const cls=claimed?'claimed':reached?'ready':'locked',label=claimed?'✓ CLAIMED':reached?'CLAIM +$'+amount.toFixed(2):'🔒 LEVEL '+lv;
    return `<button type="button" class="rewardTileV197 rewardCashV197 ${cls}" data-v197-cash="${lv}" ${claimed||!reached?'aria-disabled="true"':''}><small>COLLECTOR CASH</small><b>$${amount.toFixed(2)} BONUS</b><span>${claimed?'Added to your balance':reached?'Ready now':'Reach this level to claim'}</span><strong>${label}</strong></button>`;
  }
  function rewardTileRankV197(lv){const rank=RANK_V197[lv];return `<div class="rewardTileV197 rewardRankV197"><small>RANK TITLE</small><b>${escV197(rank)}</b><span>${levelFromXP(state.xp)>=lv?'Rank earned':'Future collector rank'}</span></div>`}
  function renderLevelRewardsV197(){
    const root=document.getElementById('levelRewardsV197');if(!root)return;const current=levelFromXP(state.xp),ready=rewardCountReadyV197();
    const pct=Math.max(0,Math.min(100,((current-1)/(MAX_LEVEL_V197-1))*100));
    const progress=root.querySelector('#levelRoadFillV197');if(progress)progress.style.width=pct+'%';
    const badge=root.querySelector('#levelRoadCurrentV197');if(badge)badge.textContent='LV '+current;
    const meta=root.querySelector('#levelRoadMetaCopyV197');if(meta)meta.textContent=`${ready?ready+' cash reward'+(ready===1?'':'s')+' ready':'All reached cash rewards claimed'} • ${MAX_LEVEL_V197-current>0?(MAX_LEVEL_V197-current)+' levels to max':'MAX LEVEL REACHED'}`;
    const claim=root.querySelector('#levelRoadClaimAllV197');if(claim){claim.disabled=!ready;claim.textContent=ready?`CLAIM ${ready} REWARD${ready===1?'':'S'}`:'NO REWARDS READY'}
    const track=root.querySelector('#levelTrackV197');if(!track)return;
    track.innerHTML=Array.from({length:MAX_LEVEL_V197},(_,i)=>i+1).map(lv=>{
      const reached=current>=lv,cur=current===lv,sets=setsAtV197(lv),binder=binderAtV197(lv),mythic=mythicAtV197(lv),cash=CASH_V197[lv],rank=RANK_V197[lv];let tiles=[];
      sets.forEach(s=>tiles.push(rewardTileSetV197(s,lv)));if(binder)tiles.push(rewardTileBinderV197(binder,lv));if(mythic)tiles.push(rewardTileMythicV197(mythic,lv));if(cash)tiles.push(rewardTileCashV197(lv));if(rank)tiles.push(rewardTileRankV197(lv));
      if(!tiles.length)tiles.push(`<div class="rewardTileV197 rewardCheckpointV197"><small>LEVEL CHECKPOINT</small><b>Collector progression</b><span>Keep earning XP toward the next premium reward.</span></div>`);
      return `<article class="levelNodeV197 ${reached?'reached':'future'} ${cur?'current':''}" id="levelRowV197-${lv}" data-v197-level="${lv}"><div class="levelNodeTopV197"><div class="levelNodeLabelV197"><div class="levelBubbleV197">${lv}</div><div class="levelNodeCopyV197"><small>${cur?'YOUR CURRENT LEVEL':reached?'COMPLETED LEVEL':'FUTURE LEVEL'}</small><b>${rank||rankName(lv)}</b></div></div><span class="levelStateV197">${cur?'CURRENT':reached?'REACHED':'LOCKED'}</span></div><div class="levelRewardsGridV197">${tiles.join('')}</div></article>`;
    }).join('');
    track.querySelectorAll('[data-v197-cash]').forEach(b=>b.addEventListener('click',()=>{if(!b.hasAttribute('aria-disabled'))claimCashV197(b.dataset.v197Cash)}));
    track.querySelectorAll('[data-v197-set]').forEach(b=>b.addEventListener('click',()=>{const set=SETS.find(s=>s.id===b.dataset.v197Set);if(set)showSetRequirements(set)}));
    track.querySelectorAll('[data-v197-binder]').forEach(b=>b.addEventListener('click',()=>{try{openBinderShop();setTimeout(()=>{document.querySelector(`.binderTheme`);},60)}catch(_e){toast('Open Collection → Binder Boutique to view this binder.')}}));
    track.querySelectorAll('[data-v198-special]').forEach(b=>b.addEventListener('click',()=>{if(window.openSpecialCardV198)window.openSpecialCardV198(b.dataset.v198Special)}));
  }
  function ensureLevelRoadV197(){
    const panel=document.querySelector('#profile [data-profile-panel-v160="progress"]');if(!panel)return;
    if(!document.getElementById('levelRewardsV197')){
      const section=document.createElement('section');section.id='levelRewardsV197';section.className='levelRewardsV197';section.innerHTML=`<div class="levelRoadHeadV197"><div><small>LEVEL REWARDS</small><h2>Collector Journey</h2><p>Preview every upcoming set, prestige binder, cash bonus and Special Collection card before you reach it.</p></div><div class="levelRoadLevelV197"><small>CURRENT</small><b id="levelRoadCurrentV197">LV 1</b></div></div><div class="levelRoadProgressV197"><i id="levelRoadFillV197"></i></div><div class="levelRoadMetaV197"><span id="levelRoadMetaCopyV197">Loading rewards…</span><span>MAX • LV ${MAX_LEVEL_V197}</span></div><div class="levelRoadActionsV197"><button type="button" class="levelRoadJumpV197" id="levelRoadJumpV197">JUMP TO CURRENT</button><button type="button" class="levelRoadClaimAllV197" id="levelRoadClaimAllV197">NO REWARDS READY</button></div><div class="levelRoadLegendV197"><span>🎴 SET</span><span>📘 BINDER</span><span>✦ SPECIAL</span><span>💰 CASH</span><span>🏆 RANK</span></div><div class="levelTrackV197" id="levelTrackV197"></div>`;
      panel.insertBefore(section,panel.firstChild);
      const hero=panel.querySelector('.progressHeroV158');if(hero){const d=document.createElement('div');d.className='setRoadDividerV197';d.textContent='SET COMPLETION ROAD';hero.parentNode.insertBefore(d,hero)}
      section.querySelector('#levelRoadJumpV197').addEventListener('click',()=>document.getElementById('levelRowV197-'+levelFromXP(state.xp))?.scrollIntoView({behavior:'smooth',block:'center'}));
      section.querySelector('#levelRoadClaimAllV197').addEventListener('click',claimAllCashV197);
    }
    renderLevelRewardsV197();
  }
  window.renderLevelRewardsV197=renderLevelRewardsV197;window.claimAllCashV197=claimAllCashV197;
  // Keep the level road current whenever Profile redraws or XP changes.
  const prevRenderProfile=renderProfile;renderProfile=function(){const r=prevRenderProfile.apply(this,arguments);try{ensureLevelRoadV197();renderLevelRewardsV197()}catch(_e){}return r};
  const prevAddXP=addXP;addXP=function(n,why=''){const before=levelFromXP(state.xp),r=prevAddXP.apply(this,arguments),after=levelFromXP(state.xp);if(after>before){try{syncRewardBinders(true)}catch(_e){};try{renderLevelRewardsV197()}catch(_e){};if(CASH_V197[after])setTimeout(()=>toast(`🎁 Level ${after} has a cash reward waiting in Profile → Progress.`),900)}return r};
  // Make sure the user-facing version stays current even though the retained V195 audit module still exists internally.
  function syncVersionV197(){const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V197 REWARD ROAD'}
  const profile=document.getElementById('profile');profile?.addEventListener('click',e=>{const tab=e.target.closest('[data-profile-mode-v160="progress"]');if(tab)setTimeout(()=>{ensureLevelRoadV197();renderLevelRewardsV197()},20)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureLevelRoadV197();syncVersionV197()});else{ensureLevelRoadV197();syncVersionV197()}
})();

