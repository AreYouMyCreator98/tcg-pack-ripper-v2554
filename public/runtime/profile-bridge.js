/* Profile presentation and cosmetics share existing saves and ranked authority. */
(()=>{
 if(window.tcgProfileStudioBridge)return;
 const styles=['aurora','obsidian','gold','neon','crystal','ember'];
 const trackers=['wins','losses','ties','season_high','streak'];
 const account=()=>window.tcgCloudV192?.user?.id||'local';
 const blocked=()=>!!(window.tcgCloudV192?.hubHeld||window.tcgCloudV192?.recoveryPending);
 const announce=()=>window.dispatchEvent(new CustomEvent('tcg:profile-updated'));
 const clean=(v,max)=>String(v??'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,max);
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
     return {account:account(),blocked:blocked(),online:account()!=='local',connected:!!online,profile:{...(online||local),...competitive,frame,avatar:p.avatarData!==undefined?p.avatarData:(online?.avatar||'')},titles:[...(state.collectorV260?.titles||[]),...(state.collectorV260?.legacy?.title?[state.collectorV260.legacy.title]:[])],badges:earned().map(id=>({id,name:BADGE_DEFS.find(b=>b[0]===id)?.[1]||id.replace(/[_-]/g,' ')})),looks:s.looks||[],level:levelFromXP(state.xp)};
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
   avatar(data,owner){guard(owner);if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data||'')||data.length>190000)throw new Error('Choose a supported profile picture.');state.profileV227={...state.profileV227,avatarData:data,avatarUpdatedAt:Date.now()};persist();},
   refresh(){renderProfile();return api.snapshot();}
 };
 window.tcgProfileStudioBridge=api;
 const previous=renderProfile;
 renderProfile=function(){const result=previous.apply(this,arguments);announce();return result;};
 // The old photo/name editor remains a supported path into the same preview.
 const identity=window.tcgProfileV227?.renderIdentity;
 if(identity)window.tcgProfileV227.renderIdentity=function(){const result=identity.apply(this,arguments);announce();return result;};
 const avatarImage=document.getElementById('profileAvatarImgV227');
 if(avatarImage)new MutationObserver(announce).observe(avatarImage,{attributes:true,attributeFilter:['src','hidden']});
 document.addEventListener('click',event=>{if(event.target.closest?.('#clearProfileFrameV228,#claimSeasonFramesV228,[data-frame-apply-v228]'))announce();});
})();
