/* Narrow access to classic lexical state; never retain it across cloud pulls. */
(()=>{
 window.tcgCollectorBridge={
  state:()=>state,
  now:()=>window.tcgCollectorClock?.now()??Date.now(),
  account:()=>window.tcgCloudV192?.user?.id||'local',
  blocked:()=>!!(busy||window.tcgPackTransaction||window.tcgCloudV192?.hubHeld||window.tcgCloudV192?.recoveryPending),
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
  sealedValue:()=>window.tcgSealedValue?.()||0,
  gradingTier:()=>state.gradingV44?.tierV56||'standard',
  canBinder:c=>!isRegularExV260(c),
  route:c=>isBulkCardV64(c)?'bulk':'binder',
  price:c=>sellPrice(c),slabValue:c=>gradedValueV56(c),
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
