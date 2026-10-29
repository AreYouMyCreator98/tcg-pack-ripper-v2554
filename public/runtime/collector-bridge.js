/* Narrow access to classic lexical state; never retain it across cloud pulls. */
(()=>{
 let priceBackupPromise=null,priceBackupCheckedAt=0;
 const pendingPriceProbes=new Map();
 async function verifiedPriceBackup(){
  if(typeof document==='undefined'||typeof fetch==='undefined')return null;
  if(Date.now()-priceBackupCheckedAt>12*60*60*1000)priceBackupPromise=null;
  if(!priceBackupPromise){
   priceBackupCheckedAt=Date.now();
   priceBackupPromise=fetch(new URL('catalog/market-prices-usd.json',document.baseURI),{cache:'default'})
    .then(async response=>{if(!response.ok)throw Error('Price backup unavailable');const data=await response.json();if(data?.schema!==1||!data.cards||typeof data.cards!=='object')throw Error('Invalid price backup');return data.cards;})
    .catch(()=>{priceBackupPromise=null;return null;});
  }
  return priceBackupPromise;
 }
 function backupQuoteFor(card,records){
  if(!card?.id||!records||!Object.hasOwn(records,card.id))return null;
  // TCGplayer card-level quotes do not prove a 1st-edition vintage premium.
  if(card.id.startsWith('base1-')||card.firstEdition||/1st[ -]?edition/i.test(String(card.edition||'')))return null;
  const q=marketQuoteFromDetail({pricing:{tcgplayer:records[card.id]}},card.finish);
  return q?{...q,cached:true}:null;
 }
 function gameFallbackValue(card){
  if(String(card.id||'').startsWith('base1-')||card.firstEdition||/1st[ -]?edition/i.test(String(card.edition||'')))return 0;
  const other=[state.binder?.[card.id],state.bulkV64?.[card.id],...(state.gradingV44?.graded||[]),...(state.gradingV44?.submissions||[])];
  for(const entry of other){
   if(entry?.id!==card.id||(card.finish&&entry.finish&&entry.finish!==card.finish))continue;
   const value=Number(entry.market??entry.raw);
   if(Number.isFinite(value)&&value>.1)return value;
  }
  const rarity=String(card.rarity||'').toLowerCase();
  if(/hyper rare|secret rare|gold rare|rainbow/.test(rarity))return 48;
  if(/special illustration|shiny ultra/.test(rarity))return 26;
  if(/illustration rare|ultra rare|shiny rare|trainer gallery|galarian gallery/.test(rarity))return 11;
  if(/rare holo|radiant|vmax|vstar/.test(rarity))return 4;
  return 0;
 }
 function applyGameFallback(card){
  const amount=gameFallbackValue(card);
  if(!(amount>.1))return 0;
  let changed=0;
  for(const box of [state.binder,state.bulkV64]){
   const entry=box?.[card.id];if(!entry||(card.finish&&entry.finish&&entry.finish!==card.finish)||Number(entry.market||0)>.1)continue;
   entry.market=amount;entry.gameEstimateSourceV26410='Rarity-based game value';changed++;
  }
  for(const entry of [...(state.gradingV44?.graded||[]),...(state.gradingV44?.submissions||[])]){
   if(entry.id!==card.id||(card.finish&&entry.finish&&entry.finish!==card.finish)||Number(entry.raw||0)>.1)continue;
   entry.raw=amount;entry.gameEstimateSourceV26410='Rarity-based game value';changed++;
  }
  return changed;
 }
 function applyVerifiedPrice(card,quote,{missingOnly=false}={}){
  if(!quote?.amount||quote.currency!=='USD')return 0;
  let changed=0;
  for(const box of [state.binder,state.bulkV64]){
   const entry=box?.[card.id];if(!entry||(card.finish&&entry.finish&&entry.finish!==card.finish))continue;
   if(missingOnly&&Number(entry.market||0)>.1)continue;
   if(Number(entry.market)!==quote.amount||!entry.marketQuoteV262){entry.market=quote.amount;entry.marketQuoteV262=quote;delete entry.gameEstimateSourceV26410;changed++;}
  }
  for(const entry of [...(state.gradingV44?.graded||[]),...(state.gradingV44?.submissions||[])]){
   if(entry.id!==card.id||(card.finish&&entry.finish&&entry.finish!==card.finish))continue;
   if(missingOnly&&Number(entry.raw||0)>.1)continue;
   if(Number(entry.raw)!==quote.amount||!entry.marketQuoteV262){entry.raw=quote.amount;entry.marketQuoteV262=quote;delete entry.gameEstimateSourceV26410;changed++;}
  }
  return changed;
 }
 window.tcgCollectorBridge={
  state:()=>state,
  now:()=>window.tcgCollectorClock?.now()??Date.now(),
  account:()=>window.tcgCloudV192?.user?.id||'local',
  blocked:()=>!!(busy||window.tcgPackTransaction||window.tcgCloudV192?.hubHeld||window.tcgCloudV192?.recoveryPending||(window.tcgCloudV192?.user&&window.tcgCloudV192?.accountPrimary===false)),
  save:()=>save(),
  commit(next){const known=new Set((state.collectorV260?.journal||[]).map(e=>e.id));const events=(next.collectorV260?.journal||[]).filter(e=>!known.has(e.id));state=next;save();window.dispatchEvent(new CustomEvent('tcg:collector-updated',{detail:{events}}));},
  syncCosmetics(){
   const rewards=state.collectorV260?.masterRewards||{};
   if(state.badges?.legacy_dealer&&!BADGE_DEFS.some(b=>b[0]==='legacy_dealer'))BADGE_DEFS.push(['legacy_dealer','Legacy Dealer','Reached Shop Rep 10 before V260',()=>!!state.badges?.legacy_dealer,'◆']);
   for(const [key,earned]of Object.entries(state.collectorV260?.masterPlus||{})){if(!earned)continue;const split=key.lastIndexOf(':'),sid=key.slice(0,split),tier=key.slice(split+1),id='masterplus_'+sid+'_'+tier,set=SETS.find(s=>s.id===sid);if(set&&!BADGE_DEFS.some(b=>b[0]===id))BADGE_DEFS.push([id,set.name+' Master Set+',tier==='perfect'?'Every card graded 10':tier==='elite'?'Every card graded 8+':'Every card graded',()=>!!state.collectorV260?.masterPlus?.[key],'✦']);}
   for(const [key,earned]of Object.entries(rewards)){
    if(!earned)continue;const split=key.lastIndexOf(':'),sid=key.slice(0,split),milestone=Number(key.slice(split+1)),set=SETS.find(s=>s.id===sid);if(!set)continue;
    if(milestone===75){const id='master-'+sid;if(!BINDER_THEMES.some(t=>t.id===id))BINDER_THEMES.push({id,name:set.name+' Master',price:0,tag:'MASTER SET REWARD',c1:set.a,c2:set.b,a:'#e7dcff',label:'MASTER',poke:'151'});state.binderOwned=state.binderOwned||['classic'];if(!state.binderOwned.includes(id))state.binderOwned.push(id);}
    if(milestone>=50){const id='master_'+sid+'_'+milestone;if(!BADGE_DEFS.some(b=>b[0]===id))BADGE_DEFS.push([id,set.name+' '+milestone+'%',milestone===100?'Master Set trophy':'Master Set milestone',()=>!!state.collectorV260?.masterRewards?.[key],milestone===100?'🏆':'✦']);}
   }
  },
  sets:()=>SETS.map(s=>({...s,unlocked:setUnlocked(s),logo:logo(s)})),
  totals:()=>setTotalsV57(),
  catalog:async id=>{const s=SETS.find(s=>s.id===id);if(!s)return [];const d=await getSet(s);return (d?.cards||cache[id]?.cards||cache[id]?.base?.cards||[]).map(c=>({...c,setId:id,set:s.name,number:c.number||c.localId,img:c.img||(c.image?c.image+'/high.webp':''),thumb:c.thumb||(c.image?c.image+'/low.webp':'')}));},
  level:()=>levelFromXP(state.xp),
  sealedProduct:id=>window.tcgSealedLegacy?.product(id),
  sealedValue:()=>window.tcgSealedValue?.()||0,
  gradingTier:()=>state.gradingV44?.tierV56||'standard',
  canBinder:c=>!isRegularExV260(c),
  route:c=>isBulkCardV64(c)?'bulk':'binder',
  price:c=>sellPrice(c),slabValue:c=>gradedValueV56(c),
  savedMarketQuote(card){
   if(!card?.id)return null;
   const candidates=[state.binder?.[card.id],state.bulkV64?.[card.id],...(state.gradingV44?.graded||[]),...(state.gradingV44?.submissions||[])];
   for(const c of candidates){
    if(c?.id!==card.id||(card.finish&&c.finish&&c.finish!==card.finish))continue;
    const q=c.marketQuoteV262;
    if(q?.currency==='USD'&&Number.isFinite(q.amount)&&q.amount>0&&q.source)return {...q,cached:true};
   }
   return null;
  },
  async restoreMissingPrices(){
   const account=this.account(),records=await verifiedPriceBackup();
   if(this.account()!==account||this.blocked())return 0;
   let changed=0;
   for(const box of [state.binder,state.bulkV64])for(const entry of Object.values(box||{})){
    if(!entry?.id||Number(entry.market||0)>.1)continue;
    const quote=backupQuoteFor(entry,records);
    changed+=quote?applyVerifiedPrice(entry,quote,{missingOnly:true}):applyGameFallback(entry);
   }
   for(const entry of [...(state.gradingV44?.graded||[]),...(state.gradingV44?.submissions||[])]){
    if(!entry?.id||Number(entry.raw||0)>.1)continue;
    const quote=backupQuoteFor(entry,records);
    changed+=quote?applyVerifiedPrice(entry,quote,{missingOnly:true}):applyGameFallback(entry);
   }
   if(changed){this.save();this.refresh();}
   return changed;
  },
  async refreshMarket(card,{useBackupImmediately=false}={}){
   const original=state,account=this.account(),previous=detailCache[card.id],previousQuote=marketQuoteFromDetail(previous,card.finish);
   const saved=this.savedMarketQuote(card)||(previousQuote?{...previousQuote,cached:true}:null);
   const records=await verifiedPriceBackup();
   if(this.account()!==account)return null;
   const backup=backupQuoteFor(card,records),fallback=backup||saved;
   let repaired=0;
   if(backup&&!this.blocked())repaired=applyVerifiedPrice(card,backup);
   else if(!backup&&!this.blocked())repaired=applyGameFallback(card);
   if(repaired)this.save();
   if(this.blocked())return fallback;
   if(useBackupImmediately&&(fallback||repaired)){
    const key=card.id+'|'+String(card.finish||'');
    if(!pendingPriceProbes.has(key)){
     const task=this.refreshMarket(card).then(quote=>{
      if(quote&&!quote.cached&&typeof CustomEvent!=='undefined')window.dispatchEvent(new CustomEvent('tcg:market-quote-updated',{detail:{id:card.id,finish:card.finish,quote}}));
     }).catch(()=>{}).finally(()=>pendingPriceProbes.delete(key));
     pendingPriceProbes.set(key,task);
    }
    return fallback;
   }
   // A manual or on-open refresh must actually ask the provider, even when
   // artwork hydration cached an earlier quote. Keep that quote as fallback.
   if(previous)delete detailCache[card.id];
   const copy={...card};await hydrateCard(copy);
   const quote=marketQuoteFromDetail(detailCache[card.id],card.finish);
   if(this.account()!==account)return null;
   if(state!==original&&!state.binder?.[card.id]&&!state.bulkV64?.[card.id]&&
    !(state.gradingV44?.graded||[]).some(c=>c.id===card.id)&&!(state.gradingV44?.submissions||[]).some(c=>c.id===card.id))return null;
   if(detailCache[card.id]?.id!==card.id||!quote||this.blocked())return fallback;
   if(applyVerifiedPrice(card,quote))this.save();return quote;
  },
  condition:c=>conditionForGradingV161(c,'V260-'+c.id),
  refresh(){stats();updateProgressUI();if(document.getElementById('binder')?.classList.contains('active'))renderBinder();if(document.getElementById('bulk')?.classList.contains('active'))renderBulkV64();renderGradingV44();renderSlabVaultV52();},
  grade:id=>{selectedBinderCard=id;submitBinderCardV44();},
  list:id=>{selectedBinderCard=id;openMarketPickerV57(state.binder[id]);},
  bindInspector(fn){openBinderCard=id=>fn(state.binder[id],{source:'binder'});window.openBinderCard=openBinderCard;openBulkCardV64=id=>fn(state.bulkV64[id],{source:'bulk'});window.openBulkCardV64=openBulkCardV64;},
  toast:message=>toast(message),
  sound:name=>{try{sfxEventV70(name)}catch{}},
  day:()=>window.gameDayKeyV170?.()||'day-0',
  selectSet(id){
   if(this.blocked())return false;
   const set=SETS.find(s=>s.id===id);if(!set)return false;
   if(!setUnlocked(set)){showSetRequirements(set);return false;}
   const tile=[...document.querySelectorAll('#sets .set')].find(t=>t.dataset.setId===id);
   if(!tile)return false;tile.click();return sel.id===id;
  },
  affordable:count=>window.canAffordPackV161?.(sel.id,count)!==false,
  requirements:()=>showSetRequirements(sel),
  selectedSet:()=>sel.id
 };
})();
