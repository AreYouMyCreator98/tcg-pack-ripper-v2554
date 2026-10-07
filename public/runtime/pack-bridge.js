/* V253 — Pack engine compatibility bridge.
   This classic script intentionally runs after the legacy pack runtime so the
   modular ES layer can observe and control pack flow without duplicating the
   probability generator or reaching into global lexical state directly. */
(()=>{try{
  if(window.__tcgPackBridgeV253)return;
  window.__tcgPackBridgeV253=true;

  const saveBeforeBatch=save;
  save=function(){if(window.tcgPackTransaction)return;return saveBeforeBatch.apply(this,arguments)};
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

  const ownsCardV260=id=>!!(state?.binder?.[id]||state?.bulkV64?.[id]||state?.gradingV44?.submissions?.some(c=>c.id===id)||state?.gradingV44?.graded?.some(c=>c.id===id)||state?.marketV57?.listings?.some(c=>(c.card?.id||c.slab?.id||c.id)===id)||state?.hubEscrowV256?.some(c=>(c.card?.id||c.id)===id));
  const rawAutoCollect=autoCollectV74;
  autoCollectV74=function(c){
    const route=routeOf(c),wasOwned=ownsCardV260(c?.id);
    const ok=rawAutoCollect.apply(this,arguments);
    if(ok)emit('tcg:card-collected',{card:cloneCard(c),route,wasNew:!wasOwned,index:Number(idx||0),mode:Number(v114PackCount)===10?10:1,auto:false});
    return ok;
  };

  const rawDecide=decide;
  decide=function(keep){
    keep=true; // V260: every revealed card is retained by the established route.
    if(window.decisionLock)return;
    const c=pulls?.[idx],route=keep?routeOf(c):'trash',wasOwned=ownsCardV260(c?.id);
    const out=rawDecide.call(this,true);
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
    busy=false;
    document.getElementById('v88Summary')?.remove();
    document.getElementById('stage')?.classList.remove('cardModeV89','v114TenMode','v114TenRipping','v91Cinematic','v91Flash');
    const wrap=document.createElement('div');wrap.id='v88Summary';wrap.className='v88Summary';
    const button=document.createElement('button');button.type='button';button.id='v117OpenAnother';button.textContent=detail.mode===10?'OPEN ANOTHER 10 PACKS':'OPEN ANOTHER PACK';
    button.onclick=()=>{wrap.remove();resetPack();applyPackArt();};wrap.append(button);document.getElementById('stage').append(wrap);
    const out=undefined;
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
        const wasOwned=ownsCardV260(c.id);
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
    if(!window.tcgPackTransaction)try{save()}catch(_e){}
    return readPersistentStats();
  }

  // V260.1: reuse the original probability/payment generator, but keep every
  // save wrapper behind one commit boundary. A reload before commit sees the
  // old complete save; after commit it sees payment + all cards + progression.
  const legacyBegin=beginRip;
  beginRip=async function(){
    if(busy||window.tcgPackTransaction||window.tcgCloudV192?.hubHeld)return false;
    if(Number(v114PackCount)!==10)return legacyBegin.apply(this,arguments);
    if(!canAffordPackV161(sel.id,10)){toast('You need enough cash or sealed pack credits for 10 packs.');return false;}
    busy=true;window.dispatchEvent(new CustomEvent('tcg:rip-state',{detail:'OPENING'}));
    const stage=document.getElementById('stage');stage.classList.add('v114TenRipping');
    document.getElementById('instruction').textContent='OPENING 10 PACKS…';
    const account=window.tcgCollectorBridge?.account(),started=performance.now(),timings={};
    let checkpoint=null;
    try{
      // Resolve data before touching payment; unavailable catalogs cost nothing.
      const pools=await buildPools();if(!pools?.all?.length)throw Error('Card data unavailable. Please retry.');
      checkpoint=JSON.parse(JSON.stringify(state));
      window.tcgPackTransaction={pools};emit('tcg:pack-transaction-start');
      const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
      await tick();let at=performance.now();
      if(!await v114MakeBatch())throw Error('Pack generation failed. No payment was kept.');
      timings.generation=performance.now()-at;await tick();at=performance.now();
      for(let start=0;start<pulls.length;start+=10){
        for(let i=start;i<Math.min(start+10,pulls.length);i++){
          const c=pulls[i],route=routeOf(c),wasOwned=ownsCardV260(c.id);
          awardChase(c);
          if(route==='bulk')addToBulkV64(c);else addToBinderV64(c);
          emit('tcg:card-collected',{card:cloneCard(c),route,wasNew:!wasOwned,index:i,mode:10,auto:true});
        }
        await tick();
      }
      timings.state=performance.now()-at;at=performance.now();
      for(const group of v114BatchGroups){v2601RewardPack(group);await tick();}
      state.history=state.history.slice(0,40);
      timings.progression=performance.now()-at;
      if(account!==window.tcgCollectorBridge?.account())throw Error('Account changed before the packs finished.');
      state.lastPackResultV2601={transactionId:'packs-'+Date.now()+'-'+state.packs,cards:cloneCards(pulls),set:selectedSet(),mode:10};
      at=performance.now();timings.renderAt=at;idx=pulls.length-1;showPackSummaryV88([...pulls].sort((a,b)=>tier(b)-tier(a))[0]);
      // Both summary listeners finish metadata before the single durable save.
      await Promise.resolve();await Promise.resolve();
      timings.render=performance.now()-at;
      window.tcgPackTransaction=null;at=performance.now();save();
      if(!localStorage.getItem('tcgRipperSave')?.includes(JSON.stringify(state.lastPackResultV2601.transactionId)))throw Error('Storage is full. Packs were not charged; free storage and retry.');
      timings.save=performance.now()-at;timings.total=performance.now()-started;
      if(new URLSearchParams(location.search).has('debug')){window.tcgTenPackTimings=timings;console.debug('10PACK',timings);}
      emit('tcg:pack-transaction-committed');emit('tcg:rip-state','COMPLETE');return true;
    }catch(error){
      if(checkpoint&&account===window.tcgCollectorBridge?.account())state=checkpoint;
      window.tcgPackTransaction=null;busy=false;resetPack();
      emit('tcg:pack-aborted');toast(error.message||'Could not open packs. No payment was kept.');return false;
    }finally{window.tcgPackTransaction=null;busy=false;}
  };
  const resetBeforeResults=resetPack;
  resetPack=function(){const result=document.getElementById('v88Summary');if(result){result.onclick=null;result.replaceChildren();}v114BatchGroups=[];collectedRest=null;restIndices.clear();delete state.lastPackResultV2601;const out=resetBeforeResults.apply(this,arguments);emit('tcg:rip-state','IDLE');return out;};
  function restoreResult(){
    const result=state.lastPackResultV2601;if(!result?.cards?.length)return;
    pulls=cloneCards(result.cards);v114PackCount=10;idx=pulls.length-1;
    // Re-render only: never generate, charge, collect or award XP on recovery.
    emit('tcg:pack-result-restored',result);
  }
  window.addEventListener('tcg:app-ready',restoreResult,{once:true});

  window.TCG_PACK_LEGACY=Object.freeze({
    version:'0.253.2',snapshot,currentCard:()=>cloneCard(pulls?.[idx]),cards:()=>cloneCards(pulls),
    tier:cardTier,route:routeOf,reset:()=>{resetPack();applyPackArt();save();},collectRemaining,collectCurrent,readPersistentStats,writePersistentStats,
    begin:()=>{try{return beginRip()}catch(error){return Promise.reject(error)}},
    selectedSet,mode:()=>Number(v114PackCount)===10?10:1
  });
  emit('tcg:pack-bridge-ready',{version:'0.253.2'});
}catch(error){console.error('[TCG] V253 pack bridge failed',error)}})();
