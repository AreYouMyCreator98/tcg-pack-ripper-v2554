
/* ===== original script 69 id=v229-mp-rank-frames-script ===== */

(()=>{
 const animated=new Set(['platinum','diamond','master','apex']);
 function cleanName(v){return String(v||'Collector').replace(/[^a-zA-Z0-9 _.'-]/g,'').replace(/\s+/g,' ').trim().slice(0,24)||'Collector'}
 function initials(v){const a=cleanName(v).split(/\s+/).filter(Boolean);return (a.length>1?(a[0][0]+a[a.length-1][0]):(a[0]||'C').slice(0,2)).toUpperCase()}
 function assets(){return window.tcgProfileFramesV228?.FRAME_ASSETS_V228||{}}
 function cache(){window.tcgMpFrameCacheV229=window.tcgMpFrameCacheV229||{};return window.tcgMpFrameCacheV229}
 function frameId(userId){return cache()[userId]?.profile_frame_id||''}
 function avatarHTML(userId,name){const id=frameId(userId),src=assets()[id]||'',anim=animated.has(id);return `<span class="mpIdentityAvatarV229 ${id||''} ${anim?'animated':''}"><span>${initials(name)}</span><i class="mpIdentityAuraV229"></i>${src?`<i class="mpIdentityFrameV229" style="--mp-frame-img:url('${src}')"></i>`:''}</span>`}
 function decoratePlayers(root=document){root.querySelectorAll?.('.mpPlayerV218[data-mp-user-v229]').forEach(el=>{const uid=el.dataset.mpUserV229;if(!uid||el.querySelector('.mpIdentityAvatarV229'))return;const name=el.querySelector('b')?.textContent||'Collector';el.insertAdjacentHTML('afterbegin',avatarHTML(uid,name))})}
 function resultRow(room,side,names){const meId=side.isHost?room.host_id:room.guest_id,oppId=side.isHost?room.guest_id:room.host_id;if(!meId||!oppId)return '';return `<div class="mpBattleIdentityResultV229"><div class="side">${avatarHTML(meId,names?.[meId]||'Collector')}<div class="copy"><small>YOU</small><b>${cleanName(names?.[meId]||'Collector')}</b></div></div><div class="vs">VS</div><div class="side right"><div class="copy"><small>OPPONENT</small><b>${cleanName(names?.[oppId]||'Collector')}</b></div>${avatarHTML(oppId,names?.[oppId]||'Collector')}</div></div>`}
 async function syncMyFrame(){try{const c=window.tcgMultiplayerV218?.client;if(!c)return;const {data:u}=await c.auth.getUser();const uid=u?.user?.id;if(!uid)return;const fs=state.profileFramesV228||{},id=fs.selected&&fs.owned?.[fs.selected]?fs.selected:null;const {data,error}=await c.rpc('mp_set_profile_frame',{p_frame_id:id});if(error)throw error;cache()[uid]=data||{user_id:uid,display_name:state.profileV227?.name||'Collector',profile_frame_id:id};decoratePlayers(document)}catch(e){console.warn('frame sync',e)}}
 const obs=new MutationObserver(()=>decoratePlayers(document));obs.observe(document.documentElement,{childList:true,subtree:true});
 const oldEquip=window.tcgProfileFramesV228?.equipFrame;if(oldEquip&&!oldEquip.__v229){window.tcgProfileFramesV228.equipFrame=function(id){const out=oldEquip.apply(this,arguments);setTimeout(syncMyFrame,40);return out};window.tcgProfileFramesV228.equipFrame.__v229=true}
 const oldClear=window.tcgProfileFramesV228?.clearFrame;if(oldClear&&!oldClear.__v229){window.tcgProfileFramesV228.clearFrame=function(){const out=oldClear.apply(this,arguments);setTimeout(syncMyFrame,40);return out};window.tcgProfileFramesV228.clearFrame.__v229=true}
 document.addEventListener('click',e=>{if(e.target.closest('[data-frame-apply-v228],#clearProfileFrameV228,#claimSeasonFramesV228'))setTimeout(syncMyFrame,100)});
 setTimeout(()=>{decoratePlayers(document);syncMyFrame()},1200);
 window.tcgMpIdentityV229={avatarHTML,decoratePlayers,resultRow,syncMyFrame,frameId};
 const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V230 CLEAN FRAME CUTOUTS';
})();



/* ===== original script 70 id=v231-ranked-profile-frames-script ===== */

(()=>{
 function refreshRankedProfileV231(){try{if(typeof renderProfile==='function'&&document.querySelector('#profile.screen.active'))renderProfile();}catch(e){console.warn(e)}}
 setTimeout(refreshRankedProfileV231,850);
 document.addEventListener('click',e=>{if(e.target.closest('[data-profile-tab-v160="overview"]'))setTimeout(refreshRankedProfileV231,80)});
 const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V231 RANKED PROFILE FRAMES';
})();

