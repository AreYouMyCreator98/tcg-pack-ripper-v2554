/* Profile presentation and cosmetics share existing saves and ranked authority. */
(()=>{
 if(window.tcgProfileStudioBridge)return;
 const styles=['aurora','obsidian','gold','neon','crystal','ember'];
 const trackers=['wins','losses','ties','season_high','streak'];
 const account=()=>window.tcgCloudV192?.user?.id||'local';
 const blocked=()=>!!(window.tcgCloudV192?.hubHeld||window.tcgCloudV192?.recoveryPending);
 const announce=()=>window.dispatchEvent(new CustomEvent('tcg:profile-updated'));
 const clean=(v,max)=>String(v??'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,max);
 const showcaseKey=value=>value?.kind==='slab'?`slab:${value.uid}`:`${value?.kind}:${value?.id}`;
 const slabKey=card=>String(card?.uid||(card?.cert?'cert:'+card.cert:''));
 function showcaseCard(value){
   if(!value||!['raw','slab','special'].includes(value.kind))return null;
   if(value.kind==='special'){
     if(!state.specialCollectionV198?.owned?.[value.id])return null;
     const special=(window.specialCardsV198||[]).find(c=>c.id===value.id);
     return special?{kind:'special',id:value.id,card:{...special,img:special.art,thumb:special.art},name:special.name,set:'Special Collection',rarity:special.rarity||'',grade:null}:null;
   }
   if(value.kind==='raw'){
     const card=state.binder?.[value.id]&&Number(state.binder[value.id].qty)>0?state.binder[value.id]:state.bulkV64?.[value.id]&&Number(state.bulkV64[value.id].qty)>0?state.bulkV64[value.id]:null;
     return card?{kind:'raw',id:value.id,card:{...card,id:value.id},name:card.name||value.id,set:card.set||card.setId||'',rarity:card.rarity||'',grade:null}:null;
   }
   const card=(state.gradingV44?.graded||[]).find(c=>slabKey(c)===value.uid);
   return card?{kind:'slab',uid:value.uid,id:card.id,card,name:card.name||card.id,set:card.set||card.setId||'',rarity:card.rarity||'',grade:Number(card.grade)||0}:null;
 }
 function selections(){const saved=store().showcase;return Array.from({length:5},(_,i)=>{const value=Array.isArray(saved)?saved[i]:null;return value&&['raw','slab','special'].includes(value.kind)?{kind:value.kind,...(value.kind==='slab'?{uid:String(value.uid||'')}:{id:String(value.id||'')})}:null;});}
 function options(){
   const raw=new Map();for(const box of [state.binder,state.bulkV64])for(const [id,card] of Object.entries(box||{}))if(card&&Number(card.qty)>0&&!raw.has(id))raw.set(id,{kind:'raw',id,card:{...card,id},name:card.name||id,set:card.set||card.setId||'',rarity:card.rarity||'',grade:null});
   const slabs=(state.gradingV44?.graded||[]).filter(c=>slabKey(c)).map(c=>({kind:'slab',uid:slabKey(c),id:c.id,card:c,name:c.name||c.id,set:c.set||c.setId||'',rarity:c.rarity||'',grade:Number(c.grade)||0}));
   const specials=(window.specialCardsV198||[]).filter(c=>state.specialCollectionV198?.owned?.[c.id]).map(c=>({kind:'special',id:c.id,card:{...c,img:c.art,thumb:c.art},name:c.name,set:'Special Collection',rarity:c.rarity||'',grade:null}));
   return [...slabs,...specials,...raw.values()].sort((a,b)=>Number(b.grade||0)-Number(a.grade||0)||Number(b.card.market||b.card.raw||0)-Number(a.card.market||a.card.raw||0)||String(a.name).localeCompare(String(b.name)));
 }
 function hub(){const h=window.tcgTradeHub?.controller;return h?.uid===account()?h:null;}
 function store(){const s=state.profileStudioV257;return s?.account===account()?s:{account:account(),looks:[]};}
 function earned(){return hub()?.state.data?.available_badges||Object.keys(state.badges||{}).filter(id=>state.badges[id]);}
 function cosmetic(input){
   if(!styles.includes(input?.style))throw new Error('Choose a banner finish.');
   const badges=input.badges,stats=input.trackers;
   if(!Array.isArray(badges)||badges.length>3||new Set(badges).size!==badges.length||badges.some(id=>!earned().includes(id)))throw new Error('Choose up to three different earned badges.');
   if(!Array.isArray(stats)||stats.length>3||new Set(stats).size!==stats.length||stats.some(id=>!trackers.includes(id)))throw new Error('Choose up to three different stat trackers.');
   return {title:clean(input.title,28),style:input.style,badges:[...badges],trackers:[...stats],show_record:input.show_record!==false};
 }
 function guard(owner){if(owner!==account())throw new Error('The account changed. Reopen your profile.');if(blocked())throw new Error('Your collection is syncing. Try again when it finishes.');}
 function persist(){save();window.tcgProfileV227?.renderIdentity?.();announce();}
 const api={
   snapshot(){
     const h=hub(),s=store(),r=state.rankedV221||{},p=state.profileV227||{};
     const online=h?.state.data?.profile;
     const league=window.tcgLeague?.controller?.state.data;
     const competitive=league?.enabled&&league.user_id===account()?{competitive:true,banner:league.profile?.league_banner,league_stats:league.profile?.league_stats,rp:league.profile?.rp,wins:league.profile?.wins,losses:league.profile?.losses,ties:league.profile?.ties,streak:league.profile?.streak,season_high:league.profile?.season_high,highest:league.profile?.highest}:{};
     const rp=Number(r.rp)||0,rank=window.tcgRankedV221?.currentRank?.(rp);
     const local={name:p.name||'Collector',avatar:p.avatarData||'',rp,wins:r.wins||0,losses:r.losses||0,ties:r.ties||0,streak:r.streak||0,season_high:r.seasonHigh||0,frame:rank?.id==='rookie'?null:rank?.id,title:'Collector',style:'aurora',badges:[],trackers:['wins','season_high','streak'],show_record:true,...s.identity};
     const frames=state.profileFramesV228,frame=frames?(frames.selected&&frames.owned?.[frames.selected]?frames.selected:null):online?.frame||null;
     return {account:account(),blocked:blocked(),online:account()!=='local',connected:!!online,profile:{...(online||local),...competitive,frame,avatar:p.avatarData!==undefined?p.avatarData:(online?.avatar||'')},titles:[...(state.collectorV260?.titles||[]),...(state.collectorV260?.legacy?.title?[state.collectorV260.legacy.title]:[])],badges:earned().map(id=>({id,name:BADGE_DEFS.find(b=>b[0]===id)?.[1]||id.replace(/[_-]/g,' ')})),looks:s.looks||[],showcase:selections().map(choice=>choice?{...choice,owned:showcaseCard(choice)}:null),level:levelFromXP(state.xp)};
   },
   async equip(input,owner){
     guard(owner);const value=cosmetic(input),h=hub();
     if(owner!=='local'){
       if(!h?.state.data?.profile)throw new Error('Connect your account before equipping a public identity.');
       const result=await h.command('profile',{...value,name:h.state.data.profile.name});
       guard(owner);if(!result?.profile)throw new Error('The account changed before the identity was saved.');
     }
     state.profileStudioV257={...store(),identity:value};persist();return api.snapshot();
   },
   saveLook(slot,input,owner){guard(owner);if(!Number.isInteger(slot)||slot<0||slot>2)throw new Error('Choose a saved look slot.');const value=cosmetic(input),s=store(),looks=[...s.looks];looks[slot]=value;state.profileStudioV257={...s,looks};persist();},
   showcaseCandidates(){return options();},
   showcaseSlot(slot,choice,owner){
     guard(owner);if(!Number.isInteger(slot)||slot<0||slot>=5)throw new Error('Choose one of the five showcase slots.');
     let value=null;
     if(choice!==null){
       if(!choice||!['raw','slab','special'].includes(choice.kind))throw new Error('Choose a card from your collection.');
       value=choice.kind==='slab'?{kind:'slab',uid:String(choice.uid||'')}:{kind:choice.kind,id:String(choice.id||'')};
       if(!showcaseCard(value))throw new Error('That card is no longer in your collection.');
       if(selections().some((saved,i)=>i!==slot&&saved&&showcaseKey(saved)===showcaseKey(value)))throw new Error('This card is already on display.');
     }
     const showcase=selections();showcase[slot]=value;state.profileStudioV257={...store(),showcase};persist();return api.snapshot();
   },
   avatar(data,owner){guard(owner);if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data||'')||data.length>190000)throw new Error('Choose a supported profile picture.');state.profileV227={...state.profileV227,avatarData:data,avatarUpdatedAt:Date.now()};persist();},
   refresh(){renderProfile();return api.snapshot();}
 };
 window.tcgProfileStudioBridge=api;
 // Profile composes badges, achievements, unlock roads and Master Sets. These
 // read the same collection many times synchronously. Reuse their reads only
 // within one render; never retain ownership/value results across actions.
 let collectionReads=null;
 function withCollectionReads(render){
   if(collectionReads)return render();
   collectionReads=new Map();try{return render();}finally{collectionReads=null;}
 }
 function memoCollectionRead(key,read){
   if(!collectionReads)return read();
   if(!collectionReads.has(key))collectionReads.set(key,read());
   return collectionReads.get(key);
 }
 const readHit=hasCollectedHit,readBinderTotal=binderTotal,readMaxValue=maxCardValue,readMasterTotals=setTotalsV57;
 hasCollectedHit=function(h){return memoCollectionRead('hit:'+JSON.stringify([h.setId,h.card]),()=>readHit(h,collectionReads?memoCollectionRead('hit-index',collectedHitIndexV262):undefined));};
 binderTotal=function(){return memoCollectionRead('binder-total',()=>readBinderTotal());};
 maxCardValue=function(){return memoCollectionRead('max-value',()=>readMaxValue());};
 setTotalsV57=function(){return memoCollectionRead('master-totals',()=>readMasterTotals());};
 const previous=renderProfile;
 renderProfile=function(){return withCollectionReads(()=>{const result=previous.apply(this,arguments);announce();return result;});};
 // The old photo/name editor remains a supported path into the same preview.
 const identity=window.tcgProfileV227?.renderIdentity;
 if(identity)window.tcgProfileV227.renderIdentity=function(){const result=identity.apply(this,arguments);announce();return result;};
 const avatarImage=document.getElementById('profileAvatarImgV227');
 if(avatarImage)new MutationObserver(announce).observe(avatarImage,{attributes:true,attributeFilter:['src','hidden']});
 document.addEventListener('click',event=>{if(event.target.closest?.('#clearProfileFrameV228,#claimSeasonFramesV228,[data-frame-apply-v228]'))announce();});
})();
