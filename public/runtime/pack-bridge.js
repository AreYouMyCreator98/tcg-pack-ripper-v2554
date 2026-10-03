/* V253 — Pack engine compatibility bridge.
   This classic script intentionally runs after the legacy pack runtime so the
   modular ES layer can observe and control pack flow without duplicating the
   probability generator or reaching into global lexical state directly. */
(()=>{try{
  if(window.__tcgPackBridgeV253)return;
  window.__tcgPackBridgeV253=true;

  const cloneCard=c=>c?({
    id:c.id||'',name:c.name||'',number:c.number||c.localId||'',rarity:c.rarity||'Card',
    set:c.set||'',setId:c.setId||c._parentSetId||'',img:c.img||'',thumb:c.thumb||'',
    finish:c.finish||'',secret:!!c.secret,market:Number(c.market||0),emergency:!!c.emergency,
    subsetName:c._subsetName||'',parentSetId:c._parentSetId||'',parentSetName:c._parentSetName||''
  }):null;
  const cloneCards=a=>(Array.isArray(a)?a:[]).map(cloneCard).filter(Boolean);
  const emit=(name,detail={})=>{try{window.dispatchEvent(new CustomEvent(name,{detail}))}catch(_e){}};
  const cardTier=c=>{try{return Number(tier(c)||0)}catch(_e){return 0}};
  const routeOf=c=>{try{return isBulkCardV64(c)?'bulk':'binder'}catch(_e){return cardTier(c)<=1?'bulk':'binder'}};
  const selectedSet=()=>({id:sel?.id||'',name:sel?.name||'',series:sel?.series||''});
  const creditsFor=id=>Number(state?.sealedV161?.packCredits?.[id]||0);
  const starterRemaining=()=>Number(state?.starterV199?.remaining||0);

  function snapshot(){
    return {
      set:selectedSet(),mode:Number(v114PackCount)===10?10:1,index:Number(idx||0),total:Array.isArray(pulls)?pulls.length:0,
      busy:!!busy,cards:cloneCards(pulls),coins:Number(state?.coins||0),packsOpened:Number(state?.packs||0),
      starterRemaining:starterRemaining(),credits:creditsFor(sel?.id)
    };
  }

  let batchEvents=null;
  const rawBatch=v114MakeBatch;
  v114MakeBatch=async function(){
    if(batchEvents)return false;
    batchEvents=[];
    try{const ok=await rawBatch.apply(this,arguments);if(ok)for(const detail of batchEvents)emit('tcg:pack-generated',detail);return ok}
    finally{batchEvents=null}
  };
  const emitGenerated=detail=>{if(batchEvents)batchEvents.push(detail);else emit('tcg:pack-generated',detail)};
  const rawMakePack=makePack;
  makePack=async function(){
    const setBefore=selectedSet();
    const coinsBefore=Number(state?.coins||0),starterBefore=starterRemaining(),creditsBefore=creditsFor(setBefore.id),packsBefore=Number(state?.packs||0);
    const ok=await rawMakePack.apply(this,arguments);
    if(ok){
      const cards=cloneCards(pulls);
      emitGenerated({
        set:setBefore,cards,packNumber:Number(state?.packs||packsBefore+1),
        cashSpent:Math.max(0,coinsBefore-Number(state?.coins||0)),
        starterUsed:Math.max(0,starterBefore-starterRemaining()),
        creditsUsed:Math.max(0,creditsBefore-creditsFor(setBefore.id)),
        godPack:cards.some(c=>/god pack/i.test(String(c.finish||'')))
      });
    }
    return ok;
  };

  const rawShowBack=showBack;
  showBack=function(){
    const card=cloneCard(pulls?.[idx]);
    const detail={card,index:Number(idx||0),total:Array.isArray(pulls)?pulls.length:0,mode:Number(v114PackCount)===10?10:1,set:selectedSet()};
    emit('tcg:card-reveal-start',detail);
    const out=rawShowBack.apply(this,arguments);
    queueMicrotask(()=>emit('tcg:card-reveal',detail));
    return out;
  };

  const rawAutoCollect=autoCollectV74;
  autoCollectV74=function(c){
    const route=routeOf(c),wasOwned=!!(state?.binder?.[c?.id]||state?.bulkV64?.[c?.id]);
    const ok=rawAutoCollect.apply(this,arguments);
    if(ok)emit('tcg:card-collected',{card:cloneCard(c),route,wasNew:!wasOwned,index:Number(idx||0),mode:Number(v114PackCount)===10?10:1,auto:false});
    return ok;
  };

  const rawDecide=decide;
  decide=function(keep){
    if(window.decisionLock)return;
    const c=pulls?.[idx],route=keep?routeOf(c):'trash',wasOwned=!!(state?.binder?.[c?.id]||state?.bulkV64?.[c?.id]);
    const out=rawDecide.apply(this,arguments);
    if(c)emit('tcg:card-collected',{card:cloneCard(c),route,wasNew:!!keep&&!wasOwned,index:Number(idx||0),mode:Number(v114PackCount)===10?10:1,auto:false});
    return out;
  };

  const rawSummary=showPackSummaryV88;
  showPackSummaryV88=function(best){
    const detail={
      set:selectedSet(),mode:Number(v114PackCount)===10?10:1,cards:cloneCards(pulls),best:cloneCard(best),
      bulkCount:(pulls||[]).filter(c=>routeOf(c)==='bulk').length,
      binderCount:(pulls||[]).filter(c=>routeOf(c)==='binder').length
    };
    const out=rawSummary.apply(this,arguments);
    queueMicrotask(()=>emit('tcg:pack-summary',detail));
    return out;
  };

  let collectedRest=null,restIndices=new Set();
  function collectRemaining(){
    if(Number(v114PackCount)!==10||!busy||!Array.isArray(pulls)||!pulls.length)return {ok:false,reason:'not-active'};
    if(window.v74CollectLock||window.decisionLock||window.v128HeroPlaying)return {ok:false,reason:'locked'};
    const start=Math.max(0,Number(idx||0));
    let collected=0,binder=0,bulk=0,newCards=0;
    if(collectedRest!==pulls){collectedRest=pulls;restIndices=new Set()}
    const done=restIndices;
    window.v74CollectLock=true;
    try{
      for(let i=start;i<pulls.length;i++){
        const c=pulls[i];if(!c||done.has(i))continue;
        const wasOwned=!!(state?.binder?.[c.id]||state?.bulkV64?.[c.id]);
        try{awardChase(c)}catch(_e){}
        const route=routeOf(c);
        if(route==='bulk'){addToBulkV64(c);bulk++}else{addToBinderV64(c);binder++}
        done.add(i);
        if(!wasOwned)newCards++;
        collected++;
        emit('tcg:card-collected',{card:cloneCard(c),route,wasNew:!wasOwned,index:i,mode:10,auto:true});
      }
      idx=Math.max(0,pulls.length-1);
      try{save()}catch(_e){}
      try{window.v213FlushSave?.()}catch(_e){}
      try{renderSets?.()}catch(_e){}
      emit('tcg:pack-collect-rest',{collected,binder,bulk,newCards});
    }finally{
      window.v74CollectLock=false;window.decisionLock=false;
    }
    try{advance(false)}catch(error){console.error('[TCG] collectRemaining finish failed',error);return {ok:false,reason:'finish-failed',error:String(error?.message||error)}}
    return {ok:true,collected,binder,bulk,newCards};
  }

  function collectCurrent(){
    if(!busy||!pulls?.[idx]||window.decisionLock||window.v128HeroPlaying||Date.now()<Number(window.v124RareLockUntil||0)||document.getElementById('stack')?.dataset.faceReady!=='1')return false;
    if(!autoCollectV74(pulls[idx]))return false;
    setTimeout(()=>{window.v74CollectLock=false;advance(false)},220);
    return true;
  }

  function readPersistentStats(){
    const x=state?.packStatsV253||{};
    return {
      packsSinceSirPlus:Number(x.packsSinceSirPlus||0),packsSinceGod:Number(x.packsSinceGod||0),
      hitStreak:Number(x.hitStreak||0),bestHitStreak:Number(x.bestHitStreak||0),
      lifetimeGodPacks:Number(x.lifetimeGodPacks||0),lifetimeSirPlusPacks:Number(x.lifetimeSirPlusPacks||0)
    };
  }
  function writePersistentStats(next){
    state.packStatsV253={...readPersistentStats(),...(next||{})};
    try{save()}catch(_e){}
    return readPersistentStats();
  }

  window.TCG_PACK_LEGACY=Object.freeze({
    version:'0.253.2',snapshot,currentCard:()=>cloneCard(pulls?.[idx]),cards:()=>cloneCards(pulls),
    tier:cardTier,route:routeOf,collectRemaining,collectCurrent,readPersistentStats,writePersistentStats,
    begin:()=>{try{return beginRip()}catch(error){return Promise.reject(error)}},
    selectedSet,mode:()=>Number(v114PackCount)===10?10:1
  });
  emit('tcg:pack-bridge-ready',{version:'0.253.2'});
}catch(error){console.error('[TCG] V253 pack bridge failed',error)}})();
