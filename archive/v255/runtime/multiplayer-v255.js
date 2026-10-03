/* V255 — Multiplayer Arena
   Additive layer over V220-V231 multiplayer:
   - ranked ready gate
   - animated VS battle banners
   - Profile-controlled battle banner cosmetics
   - server-backed ranked identity
   - realtime global chat + presence
*/
(()=>{try{
  if(window.__tcgMultiplayerArenaV255)return;
  window.__tcgMultiplayerArenaV255=true;

  const q=(s,r=document)=>r?.querySelector?.(s)||null;
  const qa=(s,r=document)=>[...(r?.querySelectorAll?.(s)||[])];
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const PROFILE_FIELDS='user_id,display_name,profile_frame_id,avatar_data,banner_title,banner_style,banner_badges,banner_show_record,ranked_rp,ranked_wins,ranked_losses,ranked_ties,ranked_streak,ranked_season_high,last_seen';
  const STYLE_IDS=['aurora','obsidian','gold','neon','crystal','ember'];
  const profileCache=new Map();
  const messageIds=new Set();
  let client=null,me=null,chatChannel=null,readyChannel=null,readyRoomId='',latestRoom=null,introPlaying=false,matchFoundPlaying=false,unread=0;
  let installTimer=null,readyPollBusy=false,lastReadyTapAt=0,lastSetCommitAt=0,setPointerStart=null,lastBattleRipTapAt=0;

  function mp(){return window.tcgMultiplayerV218||null}
  function toastV255(msg){try{window.toast?.(msg)}catch(_){console.log(msg)}}
  function errText(e){return String(e?.message||e||'Something went wrong').replace(/^.*?:\s*/,'').replaceAll('_',' ')}
  function badgeDefs(){try{return typeof BADGE_DEFS!=='undefined'?BADGE_DEFS:[]}catch(_){return []}}
  function badgeMeta(id){const d=badgeDefs().find(x=>x?.[0]===id);return d?{id:d[0],name:d[1]||id,desc:d[2]||'',icon:d[4]||'◆'}:{id,name:id,desc:'',icon:'◆'}}
  function earnedBadges(){return badgeDefs().filter(d=>state?.badges?.[d[0]]).map(d=>({id:d[0],name:d[1],icon:d[4]||'◆'}))}
  function cleanTitle(v){return String(v||'Collector').replace(/[<>]/g,'').trim().slice(0,28)||'Collector'}
  function frameAssets(){return window.tcgRankFrameAssetsV231||window.tcgProfileFramesV228?.FRAME_ASSETS_V228||{}}
  function initials(v){const a=String(v||'Collector').trim().split(/\s+/).filter(Boolean);return (a.length>1?(a[0][0]+a[a.length-1][0]):(a[0]||'C').slice(0,2)).toUpperCase()}
  function rankFor(rp){try{return window.tcgRankedV221?.currentRank?.(Number(rp||0))||{id:'rookie',name:'Rookie'}}catch(_){return {id:'rookie',name:'Rookie'}}}
  function fmtRecord(p){return `${Number(p?.ranked_wins||0)}W · ${Number(p?.ranked_losses||0)}L${Number(p?.ranked_ties||0)?` · ${Number(p.ranked_ties)}T`:''}`}

  function bannerState(){
    state.mpBannerV255=state.mpBannerV255||{};
    const b=state.mpBannerV255;
    if(!b.initialized){
      const earned=earnedBadges().slice(-3).map(x=>x.id);
      b.title='Collector';b.style='aurora';b.badges=earned;b.showRecord=true;b.initialized=true;
      try{save()}catch(_){}
    }
    b.title=cleanTitle(b.title);
    b.style=STYLE_IDS.includes(b.style)?b.style:'aurora';
    b.badges=Array.isArray(b.badges)?b.badges.filter(id=>state?.badges?.[id]).slice(0,3):[];
    b.showRecord=b.showRecord!==false;
    return b;
  }

  async function ensureContext(){
    client=mp()?.client||client;
    if(!client)return false;
    try{const {data}=await client.auth.getUser();me=data?.user||null}catch(_){me=null}
    return !!me;
  }

  function localProfile(){
    const b=bannerState(),p=state.profileV227||{},r=state.rankedV221||{},fs=state.profileFramesV228||{};
    return {
      user_id:me?.id||'',display_name:String(p.name||'Collector').trim()||'Collector',
      avatar_data:p.avatarData||'',profile_frame_id:fs.selected&&fs.owned?.[fs.selected]?fs.selected:null,
      banner_title:b.title,banner_style:b.style,banner_badges:[...b.badges],banner_show_record:b.showRecord,
      ranked_rp:Number(r.rp||0),ranked_wins:Number(r.wins||0),ranked_losses:Number(r.losses||0),ranked_ties:Number(r.ties||0),ranked_streak:Number(r.streak||0),ranked_season_high:Number(r.seasonHigh||0)
    };
  }

  function applyServerRank(p){
    if(!p)return false;
    state.rankedV221=state.rankedV221||{rp:0,wins:0,losses:0,ties:0,streak:0,processed:{},history:[],seasonHigh:0,lastResult:null};
    const r=state.rankedV221;
    const next={rp:Number(p.ranked_rp||0),wins:Number(p.ranked_wins||0),losses:Number(p.ranked_losses||0),ties:Number(p.ranked_ties||0),streak:Number(p.ranked_streak||0),seasonHigh:Number(p.ranked_season_high||0)};
    const changed=['rp','wins','losses','ties','streak','seasonHigh'].some(k=>Number(r[k]||0)!==Number(next[k]||0));
    if(changed){Object.assign(r,next);try{save()}catch(_){}}
    return changed;
  }

  async function syncMyProfile({quiet=true}={}){
    if(!await ensureContext())return null;
    const b=bannerState(),p=state.profileV227||{};
    try{
      try{await window.tcgMpIdentityV229?.syncMyFrame?.()}catch(_){}
      try{await client.rpc('mp_ensure_profile',{p_display_name:String(p.name||'Collector').trim().slice(0,24)||'Collector'})}catch(_){}
      const {data,error}=await client.rpc('mp_set_public_profile',{
        p_avatar_data:p.avatarData||null,
        p_banner_title:b.title,
        p_banner_style:b.style,
        p_banner_badges:b.badges,
        p_banner_show_record:b.showRecord
      });
      if(error)throw error;
      if(data){profileCache.set(data.user_id,data);applyServerRank(data)}
      if(!quiet)toastV255('✓ Battle banner saved');
      renderBannerPreview();
      return data;
    }catch(e){if(!quiet)toastV255(errText(e));else console.warn('[TCG] profile sync',e);return null}
  }

  async function refreshMyRank(){
    if(!await ensureContext())return null;
    try{const {data,error}=await client.from('mp_profiles').select(PROFILE_FIELDS).eq('user_id',me.id).single();if(error)throw error;profileCache.set(me.id,data);applyServerRank(data);renderBannerPreview();return data}catch(e){console.warn('[TCG] ranked profile refresh',e);return null}
  }

  async function fetchProfiles(ids,{force=false}={}){
    if(!await ensureContext())return {};
    const unique=[...new Set((ids||[]).filter(Boolean))];
    const wanted=force?unique:unique.filter(id=>!profileCache.has(id));
    if(wanted.length){
      const {data,error}=await client.from('mp_profiles').select(PROFILE_FIELDS).in('user_id',wanted);
      if(!error)(data||[]).forEach(p=>profileCache.set(p.user_id,p));
    }
    const out={};unique.forEach(id=>{out[id]=profileCache.get(id)||{user_id:id,display_name:'Collector',banner_title:'Collector',banner_style:'aurora',banner_badges:[]}});return out;
  }

  function avatarMarkup(p,cls=''){
    p=p||{};const frame=frameAssets()[p.profile_frame_id]||'';const name=p.display_name||'Collector';
    return `<div class="mpBannerAvatarV255 ${esc(cls)}">${p.avatar_data?`<img class="mpBannerPhotoV255" src="${esc(p.avatar_data)}" alt="${esc(name)}">`:`<span class="mpBannerInitialsV255">${esc(initials(name))}</span>`}${frame?`<img class="mpBannerFrameV255" src="${esc(frame)}" alt="">`:''}<i></i></div>`;
  }

  function badgeMarkup(ids,{compact=false}={}){
    const rows=(Array.isArray(ids)?ids:[]).slice(0,3).map(badgeMeta);
    if(!rows.length)return `<span class="mpBannerNoBadgeV255">NO BADGES EQUIPPED</span>`;
    return rows.map(x=>`<span class="mpBannerBadgeV255 ${compact?'compact':''}"><i>${esc(x.icon)}</i><b>${esc(x.name)}</b></span>`).join('');
  }

  function bannerCard(p,{side='left',label='',preview=false}={}){
    p=p||{};const rank=rankFor(p.ranked_rp),style=STYLE_IDS.includes(p.banner_style)?p.banner_style:'aurora';
    return `<div class="mpBattleBannerV255 style-${esc(style)} ${esc(side)} ${preview?'preview':''}">
      <div class="mpBannerSheenV255"></div>
      <div class="mpBannerTopV255"><small>${esc(label||p.banner_title||'COLLECTOR')}</small><span>${Math.round(Number(p.ranked_rp||0))} RP</span></div>
      <div class="mpBannerIdentityV255">${avatarMarkup(p)}<div><b>${esc(p.display_name||'Collector')}</b><em>${esc(p.banner_title||'Collector')}</em><strong>${esc(rank.name)}</strong></div></div>
      <div class="mpBannerBadgesV255">${badgeMarkup(p.banner_badges)}</div>
      ${p.banner_show_record!==false?`<div class="mpBannerRecordV255"><span>${esc(fmtRecord(p))}</span><b>${Number(p.ranked_streak||0)>1?`${Number(p.ranked_streak)} WIN STREAK`:'RANKED RECORD'}</b></div>`:''}
    </div>`;
  }

  /* ---------------- Profile banner editor ---------------- */
  function bannerEditorMarkup(){
    const b=bannerState(),earned=earnedBadges();
    return `<div class="mpBannerEditorHeadV255"><div><small>RANKED IDENTITY</small><h3>Battle Banner</h3><p>Choose what other collectors see when a ranked match begins.</p></div><span>APEX-STYLE INTRO</span></div>
      <div id="mpBannerPreviewV255"></div>
      <div class="mpBannerFieldsV255"><label><span>BANNER TITLE</span><input id="mpBannerTitleV255" maxlength="28" value="${esc(b.title)}" placeholder="Collector"></label><label class="record"><span>SHOW W / L RECORD</span><input id="mpBannerRecordToggleV255" type="checkbox" ${b.showRecord?'checked':''}></label></div>
      <div class="mpBannerSubheadV255"><b>BANNER STYLE</b><small>Pick your intro look</small></div><div class="mpBannerStylesV255">${STYLE_IDS.map(id=>`<button type="button" data-banner-style-v255="${id}" class="${b.style===id?'active':''}">${id.toUpperCase()}</button>`).join('')}</div>
      <div class="mpBannerSubheadV255"><b>SHOWCASE BADGES</b><small>Choose up to 3 earned badges</small></div><div class="mpBannerBadgePickerV255">${earned.length?earned.map(x=>`<button type="button" data-banner-badge-v255="${esc(x.id)}" class="${b.badges.includes(x.id)?'active':''}"><i>${esc(x.icon)}</i><span>${esc(x.name)}</span></button>`).join(''):'<span class="mpBannerNoEarnedV255">Earn badges to display them here.</span>'}</div>
      <div class="mpBannerEditorActionsV255"><small>Your current Profile picture and equipped season frame are used automatically.</small><button type="button" id="mpSaveBannerV255">SAVE BATTLE BANNER</button></div>`;
  }

  function mountBannerEditor({force=false}={}){
    const overview=q('#profile [data-profile-panel-v160="overview"]')||q('#profile');if(!overview)return null;
    let host=q('#mpBannerEditorV255');
    if(!host){
      host=document.createElement('section');host.id='mpBannerEditorV255';host.className='profileGlassSectionV227 mpBannerEditorV255';
      const anchor=q('#profileExtrasV221')||q('#careerGrid');if(anchor)anchor.insertAdjacentElement('afterend',host);else overview.appendChild(host);
      force=true;
    }
    if(force){host.innerHTML=bannerEditorMarkup();renderBannerPreview()}
    return host;
  }

  function renderBannerPreview(){
    const root=q('#mpBannerPreviewV255');if(!root)return;
    const title=q('#mpBannerTitleV255')?.value,b=bannerState();
    const p=localProfile();p.banner_title=cleanTitle(title===undefined?b.title:title);p.banner_style=b.style;p.banner_badges=[...b.badges];p.banner_show_record=q('#mpBannerRecordToggleV255')?.checked??b.showRecord;
    root.innerHTML=bannerCard(p,{side:'left',label:'YOUR RANKED BANNER',preview:true});
  }

  function saveBannerEditor(){
    const b=bannerState();b.title=cleanTitle(q('#mpBannerTitleV255')?.value||b.title);b.showRecord=!!q('#mpBannerRecordToggleV255')?.checked;
    try{save()}catch(_){};syncMyProfile({quiet:false});
  }

  /* ---------------- Global chat ---------------- */
  function mutedUsers(){try{return new Set(JSON.parse(localStorage.getItem('tcgGlobalChatMutedV255')||'[]'))}catch(_){return new Set()}}
  function saveMuted(s){try{localStorage.setItem('tcgGlobalChatMutedV255',JSON.stringify([...s]))}catch(_){}}
  function toggleMute(uid){if(!uid||uid===me?.id)return;const m=mutedUsers();m.has(uid)?m.delete(uid):m.add(uid);saveMuted(m);renderChatHistory();toastV255(m.has(uid)?'Player muted':'Player unmuted')}

  function mountChat(){
    const hub=q('#mpFriendsHubV218');if(!hub)return;
    let box=q('#mpGlobalChatV255');if(box)return box;
    box=document.createElement('section');box.id='mpGlobalChatV255';box.className='mpGlobalChatV255';box.innerHTML=`<button type="button" class="mpChatHeadV255" id="mpChatToggleV255"><span><i>🌐</i><span><small>GLOBAL CHAT</small><b>Collector Lobby</b></span></span><em><strong id="mpChatOnlineV255">0 ONLINE</strong><u id="mpChatUnreadV255" hidden>0</u><i class="mpChatChevronV255">⌄</i></em></button><div class="mpChatPanelV255"><div class="mpChatMessagesV255" id="mpChatMessagesV255"><div class="mpChatEmptyV255">Connecting to Global Chat…</div></div><div class="mpChatComposerV255"><input id="mpChatInputV255" maxlength="180" placeholder="Message collectors worldwide…" autocomplete="off"><button type="button" id="mpChatSendV255">SEND</button></div><div class="mpChatFootV255"><span>Realtime • 180 characters • tap MUTE on a message to hide that player</span><b id="mpChatCharV255">0/180</b></div></div>`;
    const anchor=q('.mpMatchActionsV226',hub);anchor?.insertAdjacentElement('afterend',box);if(!anchor)hub.appendChild(box);
    return box;
  }

  function timeLabel(ts){try{return new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}catch(_){return ''}}
  function chatRow(m,p){
    const mine=m.user_id===me?.id,muted=mutedUsers().has(m.user_id);if(muted)return '';
    return `<div class="mpChatMessageV255 ${mine?'mine':''}" data-chat-id-v255="${m.id}" data-chat-user-v255="${esc(m.user_id)}">${avatarMarkup(p,'chat')}<div class="mpChatCopyV255"><div><b>${esc(p?.display_name||'Collector')}</b><small>${esc(timeLabel(m.created_at))}</small>${!mine?`<button type="button" data-chat-mute-v255="${esc(m.user_id)}">MUTE</button>`:''}</div><p>${esc(m.message||'')}</p></div></div>`;
  }

  async function renderChatHistory(){
    const root=q('#mpChatMessagesV255');if(!root||!await ensureContext())return;
    const {data,error}=await client.from('mp_global_chat').select('id,user_id,message,created_at').order('created_at',{ascending:false}).limit(60);
    if(error){root.innerHTML=`<div class="mpChatEmptyV255">${esc(errText(error))}</div>`;return}
    const rows=(data||[]).slice().reverse(),profiles=await fetchProfiles(rows.map(x=>x.user_id));messageIds.clear();rows.forEach(x=>messageIds.add(String(x.id)));
    const html=rows.map(m=>chatRow(m,profiles[m.user_id])).filter(Boolean).join('');root.innerHTML=html||'<div class="mpChatEmptyV255">No messages yet. Start the global chat.</div>';root.scrollTop=root.scrollHeight;
  }

  async function appendChat(m){
    if(!m||messageIds.has(String(m.id)))return;messageIds.add(String(m.id));
    const root=q('#mpChatMessagesV255');if(!root)return;const profiles=await fetchProfiles([m.user_id]),html=chatRow(m,profiles[m.user_id]);if(!html)return;
    q('.mpChatEmptyV255',root)?.remove();root.insertAdjacentHTML('beforeend',html);root.scrollTop=root.scrollHeight;
    const box=q('#mpGlobalChatV255');if(!box?.classList.contains('open')&&m.user_id!==me?.id){unread++;const u=q('#mpChatUnreadV255');if(u){u.hidden=false;u.textContent=String(unread)}}
  }

  function updatePresence(){
    const el=q('#mpChatOnlineV255');if(!el||!chatChannel)return;try{const st=chatChannel.presenceState(),n=Object.keys(st||{}).length;el.textContent=`${n} ONLINE`}catch(_){el.textContent='ONLINE'}
  }

  async function startChat(){
    mountChat();if(!await ensureContext()){const r=q('#mpChatMessagesV255');if(r)r.innerHTML='<div class="mpChatEmptyV255">Sign in under Profile → Settings to use Global Chat.</div>';return}
    await renderChatHistory();if(chatChannel)return;
    chatChannel=client.channel('mp-global-chat-v255',{config:{presence:{key:me.id}}})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'mp_global_chat'},p=>appendChat(p.new).catch(()=>{}))
      .on('presence',{event:'sync'},updatePresence)
      .on('presence',{event:'join'},updatePresence)
      .on('presence',{event:'leave'},updatePresence)
      .subscribe(async status=>{if(status==='SUBSCRIBED'){try{await chatChannel.track({user_id:me.id,name:state.profileV227?.name||'Collector',at:new Date().toISOString()})}catch(_){}updatePresence()}});
  }

  async function sendChat(){
    if(!await ensureContext())return toastV255('Sign in first under Profile → Settings.');const inp=q('#mpChatInputV255'),msg=String(inp?.value||'').trim();if(!msg)return;
    const btn=q('#mpChatSendV255');if(btn)btn.disabled=true;try{const {error}=await client.rpc('mp_send_global_chat',{p_message:msg});if(error)throw error;if(inp){inp.value='';q('#mpChatCharV255').textContent='0/180'}}catch(e){toastV255(/CHAT RATE LIMIT/i.test(errText(e))?'Slow down a sec before sending again.':errText(e))}finally{if(btn)btn.disabled=false}
  }

  /* ---------------- Ranked ready gate + intro ---------------- */
  function legacyRoom(){return mp()?.battleRoom||null}
  function roomNow(){const r=legacyRoom();if(latestRoom?.id&&r?.id===latestRoom.id)return latestRoom;return r||latestRoom}
  function matchRoom(r){return !!(r&&r.room_type==='matchmaking'&&r.guest_id)}
  function bothReady(r){return !!(r?.host_ready&&r?.guest_ready)}
  function myReady(r){if(!r||!me)return false;return r.host_id===me.id?!!r.host_ready:!!r.guest_ready}
  function started(r){return Number(r?.host_progress||0)>0||Number(r?.guest_progress||0)>0||r?.host_score!=null||r?.guest_score!=null||r?.status==='playing'||r?.status==='completed'}
  function introKey(id){return `tcgBattleIntroV255:${id}`}
  function introSeen(id){try{return sessionStorage.getItem(introKey(id))==='1'}catch(_){return false}}
  function markIntro(id){try{sessionStorage.setItem(introKey(id),'1')}catch(_){} }

  function matchFoundKey(id){return `tcgMatchFoundV2551:${id}`}
  function matchFoundSeen(id){try{return sessionStorage.getItem(matchFoundKey(id))==='1'}catch(_){return false}}
  function markMatchFound(id){try{sessionStorage.setItem(matchFoundKey(id),'1')}catch(_){} }

  async function playMatchFound(r){
    if(matchFoundPlaying||matchFoundSeen(r?.id)||!matchRoom(r)||started(r))return;
    matchFoundPlaying=true;
    try{
      const myId=r.host_id===me?.id?r.host_id:r.guest_id,oppId=myId===r.host_id?r.guest_id:r.host_id;
      const legacyName=uid=>q(`.mpPlayerV218[data-mp-user-v229="${uid}"] b`)?.textContent||'Collector';
      let mine=profileCache.get(myId)||localProfile()||{display_name:legacyName(myId)},opp=profileCache.get(oppId)||{display_name:legacyName(oppId)};
      q('#mpMatchFoundV2551')?.remove();
      const o=document.createElement('div');o.id='mpMatchFoundV2551';o.className='mpMatchFoundV2551';
      const renderPlayers=()=>{const host=q('.mpMatchFoundPlayersV2551',o);if(host)host.innerHTML=`<div>${avatarMarkup(mine,'found')}<b>${esc(mine.display_name||'Collector')}</b></div><span><i></i>VS<i></i></span><div>${avatarMarkup(opp,'found')}<b>${esc(opp.display_name||'Collector')}</b></div>`};
      o.innerHTML=`<div class="mpMatchFoundBackdropV2551"></div><div class="mpMatchFoundPulseV2551"></div><div class="mpMatchFoundCoreV2551"><small>RANKED QUEUE</small><h2>MATCH FOUND</h2><div class="mpMatchFoundPlayersV2551"></div><strong>READY CHECK</strong></div>`;
      renderPlayers();document.body.appendChild(o);requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.add('show')));markMatchFound(r.id);
      try{navigator.vibrate?.([18,25,34])}catch(_){}
      fetchProfiles([r.host_id,r.guest_id],{force:true}).then(profiles=>{mine=profiles[myId]||mine;opp=profiles[oppId]||opp;renderPlayers()}).catch(()=>{});
      await sleep(1450);o.classList.add('lock');await sleep(520);o.classList.add('leave');await sleep(320);o.remove();
    }finally{matchFoundPlaying=false;setTimeout(()=>applyReadyUI(roomNow()||r),0)}
  }

  async function setBattleReady(next){
    const r=roomNow();if(!matchRoom(r)||started(r))return;
    if(Date.now()-lastReadyTapAt<420)return;lastReadyTapAt=Date.now();
    if(!await ensureContext())return toastV255('Sign in first.');
    const btn=q('#mpBattleReadyBtnV255');if(btn){btn.disabled=true;btn.textContent=next?'LOCKING IN…':'UNREADYING…'}
    await syncMyProfile({quiet:true});
    try{
      const {data,error}=await client.rpc('mp_set_battle_ready',{p_room_id:r.id,p_ready:!!next});if(error)throw error;
      latestRoom=data;applyReadyUI(data);
      setTimeout(()=>pollReadyRoom(true),120);
    }catch(e){toastV255(errText(e))}finally{const b=q('#mpBattleReadyBtnV255');if(b)b.disabled=false}
  }

  function miniReadyCard(p,label,isReady){return `<div class="mpReadyPlayerV255 ${isReady?'ready':''}">${avatarMarkup(p,'ready')}<div><small>${esc(label)}</small><b>${esc(p?.display_name||'Collector')}</b><span>${isReady?'● READY':'○ NOT READY'}</span></div></div>`}

  function wireReadyButton(){
    const btn=q('#mpBattleReadyBtnV255');if(!btn||btn.dataset.v2551ReadyWired==='1')return;
    btn.dataset.v2551ReadyWired='1';
    let localTap=0;
    const fire=e=>{
      if(e?.cancelable)e.preventDefault();e?.stopPropagation?.();
      const now=Date.now();if(now-localTap<520)return;localTap=now;
      const r=roomNow();setBattleReady(!myReady(r));
    };
    if(window.PointerEvent)btn.addEventListener('pointerup',fire,{passive:false});
    else btn.addEventListener('touchend',fire,{passive:false});
    btn.addEventListener('click',fire,{passive:false});
  }

  async function ensureReadyProfiles(r){const ids=[r.host_id,r.guest_id].filter(Boolean);await fetchProfiles(ids);if(roomNow()?.id===r.id)applyReadyUI(roomNow())}

  function updateLegacyReadyLabels(r){
    qa('.mpPlayerV218[data-mp-user-v229]').forEach(el=>{const uid=el.dataset.mpUserV229,ready=uid===r.host_id?!!r.host_ready:uid===r.guest_id?!!r.guest_ready:false;const s=q('.mpReadyV218',el);if(s&&!started(r)){s.classList.toggle('on',ready);s.textContent=ready?'● READY':'○ NOT READY'}});
    const head=q('.mpMatchRoomHeadV226');if(head&&!started(r)){const st=q('strong',head),copy=q('span',head);if(st)st.textContent=bothReady(r)?'BOTH READY':'READY UP';if(copy)copy.textContent=bothReady(r)?'Battle intro starting…':'Both players must ready before either pack can open.'}
  }

  function removeGate(){q('#mpBattleReadyGateV255')?.remove();q('#mpBodyV218')?.classList.remove('mpV255ReadyLocked')}

  function applyReadyUI(r){
    if(!r||!matchRoom(r)||r.status==='completed'){removeGate();q('#mpBodyV218')?.classList.remove('mpV255IntroLock');return}
    latestRoom=r;updateLegacyReadyLabels(r);ensureReadyWatch(r);
    if(started(r)){markIntro(r.id);removeGate();q('#mpBodyV218')?.classList.remove('mpV255IntroLock');return}
    const body=q('#mpBodyV218');if(!body)return;
    if(!matchFoundSeen(r.id)){
      body.classList.add('mpV255IntroLock');
      playMatchFound(r).catch(e=>{console.warn(e);markMatchFound(r.id);body.classList.remove('mpV255IntroLock')});
      if(bothReady(r))return;
    }
    if(bothReady(r)){
      removeGate();if(!introSeen(r.id)){body.classList.add('mpV255IntroLock');playBattleIntro(r).catch(e=>{console.warn(e);markIntro(r.id);body.classList.remove('mpV255IntroLock')})}else body.classList.remove('mpV255IntroLock');return;
    }
    body.classList.remove('mpV255IntroLock');body.classList.add('mpV255ReadyLocked');
    let gate=q('#mpBattleReadyGateV255');if(!gate){gate=document.createElement('div');gate.id='mpBattleReadyGateV255';gate.className='mpBattleReadyGateV255';const arena=q('.mpBattleArenaV220',body),pack=q('.mpBattlePackWrapV220',arena);if(arena)arena.insertBefore(gate,pack||null);else q('.mpBattleScoreV218',body)?.insertAdjacentElement('afterend',gate)??body.appendChild(gate)}
    const hp=profileCache.get(r.host_id)||{display_name:q(`.mpPlayerV218[data-mp-user-v229="${r.host_id}"] b`)?.textContent||'Collector'},gp=profileCache.get(r.guest_id)||{display_name:q(`.mpPlayerV218[data-mp-user-v229="${r.guest_id}"] b`)?.textContent||'Collector'};
    const mine=myReady(r),oppReady=r.host_id===me?.id?!!r.guest_ready:!!r.host_ready;
    gate.innerHTML=`<div class="mpReadyGateHeadV255"><small>RANKED MATCH FOUND</small><h3>Ready your battle banner</h3><p>Both collectors must lock in before either pack can open.</p></div><div class="mpReadyPlayersV255">${miniReadyCard(hp,r.host_id===me?.id?'YOU':'OPPONENT',!!r.host_ready)}<b>VS</b>${miniReadyCard(gp,r.guest_id===me?.id?'YOU':'OPPONENT',!!r.guest_ready)}</div><button type="button" class="mpBattleReadyBtnV255 ${mine?'on':''}" id="mpBattleReadyBtnV255">${mine?(oppReady?'BOTH READY':'READY ✓ • WAITING FOR OPPONENT'):'READY FOR BATTLE'}</button><small class="mpReadyHintV255">${mine?'Tap again to unready before your opponent locks in.':'Your current Profile photo, frame, badges and record will be shown.'}</small>`;
    wireReadyButton();
    if(!profileCache.has(r.host_id)||!profileCache.has(r.guest_id))ensureReadyProfiles(r).catch(()=>{});
  }

  async function playBattleIntro(r){
    if(introPlaying||introSeen(r.id)||!bothReady(r)||started(r))return;
    introPlaying=true;const body=q('#mpBodyV218');body?.classList.add('mpV255IntroLock');
    try{
      const profiles=await fetchProfiles([r.host_id,r.guest_id],{force:true});
      const myId=r.host_id===me?.id?r.host_id:r.guest_id,oppId=myId===r.host_id?r.guest_id:r.host_id;
      const mine=profiles[myId]||localProfile(),opp=profiles[oppId]||{display_name:'Collector',banner_title:'Collector',banner_style:'aurora',banner_badges:[]};
      q('#mpBattleIntroV255')?.remove();const o=document.createElement('div');o.id='mpBattleIntroV255';o.className='mpBattleIntroV255';o.innerHTML=`<div class="mpIntroBackdropV255"></div><div class="mpIntroStrikeV255"></div><div class="mpIntroArenaV255"><div class="mpIntroLabelV255">RANKED PACK BATTLE</div>${bannerCard(mine,{side:'left',label:'YOU'})}<div class="mpIntroVsV255"><span>VS</span><i></i></div>${bannerCard(opp,{side:'right',label:'OPPONENT'})}<div class="mpIntroStatusV255">BANNERS LOCKED</div></div>`;document.body.appendChild(o);requestAnimationFrame(()=>o.classList.add('show'));
      try{navigator.vibrate?.([18,28,24,40])}catch(_){}
      await sleep(1550);const st=q('.mpIntroStatusV255',o);if(st)st.textContent='BATTLE READY';
      await sleep(1200);o.classList.add('leave');await sleep(420);o.remove();markIntro(r.id);
    }finally{introPlaying=false;body?.classList.remove('mpV255IntroLock');applyReadyUI(roomNow()||r)}
  }

  function ensureReadyWatch(r){
    if(!client||!r?.id||readyRoomId===r.id)return;readyRoomId=r.id;latestRoom=r;try{if(readyChannel)client.removeChannel(readyChannel)}catch(_){}
    readyChannel=client.channel('battle-ready-v255-'+r.id).on('postgres_changes',{event:'UPDATE',schema:'public',table:'mp_battle_rooms',filter:'id=eq.'+r.id},p=>{latestRoom=p.new;applyReadyUI(p.new);if(p.new.status==='completed')setTimeout(refreshMyRank,250)}).subscribe();
  }

  function battleLocalCompat(id){try{return JSON.parse(localStorage.getItem(`tcgBattleRoomV220:${id}`)||'null')||{}}catch(_){return {}}}
  function saveBattleLocalCompat(id,x){try{localStorage.setItem(`tcgBattleRoomV220:${id}`,JSON.stringify(x))}catch(_){}}
  function setByIdV2553(id){try{return (typeof SETS!=='undefined'?SETS:[]).find(s=>s.id===id)||null}catch(_){return null}}
  function setPackArtV2553(s){try{return (typeof OFFICIAL_PACK_ART!=='undefined'&&OFFICIAL_PACK_ART?.[s.id]?.[0])||(typeof logo==='function'?logo(s):'')}catch(_){return ''}}
  function commitBattleSetV2553(btn,{announce=false}={}){
    const r=roomNow();if(!btn||!r||r.status==='completed')return false;
    if(myReady(r)){if(announce)toastV255('Unready before changing your battle set.');return false}
    const local=battleLocalCompat(r.id);if(local.generated){if(announce)toastV255('Battle pack already locked in.');return false}
    const setId=String(btn.dataset.battleSetV221||''),chosen=setByIdV2553(setId);if(!chosen)return false;
    try{if(typeof setUnlocked==='function'&&!setUnlocked(chosen)){if(announce)toastV255('That set is locked on this account.');return false}}catch(_){}
    local.chosenSetId=chosen.id;local.chosenSetName=chosen.name;saveBattleLocalCompat(r.id,local);lastSetCommitAt=Date.now();
    qa('[data-battle-set-v221]').forEach(x=>x.classList.toggle('active',x.dataset.battleSetV221===chosen.id));
    const head=q('.mpBattleSetHeadV221 b');if(head)head.textContent=chosen.name;const lock=q('.mpBattleSetLockV221 b');if(lock)lock.textContent=chosen.name;
    const sub=q('#mpSubV218');if(sub)sub.textContent=`${chosen.name} • 1 pack each`;
    const img=q('#mpBattlePackV220 img'),art=setPackArtV2553(chosen);if(img&&art){img.src=art;img.alt=`${chosen.name} Battle pack`;try{const warm=new Image();warm.decoding='async';warm.src=art}catch(_){}}
    try{navigator.vibrate?.(7)}catch(_){};return true
  }
  function setGestureStartV2553(e){const btn=e.target?.closest?.('[data-battle-set-v221]');if(!btn)return;const p=e.touches?.[0]||e;setPointerStart={btn,x:Number(p.clientX||0),y:Number(p.clientY||0),at:Date.now()}}
  function setGestureEndV2553(e){const start=setPointerStart;setPointerStart=null;if(!start?.btn?.isConnected)return;const p=e.changedTouches?.[0]||e,dx=Math.abs(Number(p.clientX||0)-start.x),dy=Math.abs(Number(p.clientY||0)-start.y);if(dx>16||dy>16||Date.now()-start.at>700)return;if(e.cancelable)e.preventDefault();e.stopPropagation?.();e.stopImmediatePropagation?.();commitBattleSetV2553(start.btn,{announce:true})}
  function mobileRipFallbackV2553(e){const btn=e.target?.closest?.('#mpBattleRipTapV220');if(!btn||e.type==='click')return;const r=roomNow();if(!matchRoom(r)||!bothReady(r)||!introSeen(r.id)||started(r))return;const now=Date.now();if(now-lastBattleRipTapAt<650)return;lastBattleRipTapAt=now;if(e.cancelable)e.preventDefault();e.stopPropagation?.();setTimeout(()=>btn.click(),0)}

  function guardBattleStart(e){
    const r=roomNow();if(!matchRoom(r)||started(r))return;
    const pack=e.target?.closest?.('#mpBattlePackV220,#mpBattleRipTapV220');
    if(pack&&(!bothReady(r)||!introSeen(r.id))){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();if(e.type==='click')toastV255(!bothReady(r)?'Both players must press READY first.':'Battle intro is starting…');return false}
    const setBtn=e.target?.closest?.('[data-battle-set-v221]');if(setBtn&&myReady(r)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();if(e.type==='click')toastV255('Unready before changing your battle set.');return false}
  }

  async function pollReadyRoom(force=false){
    const r=roomNow();if(readyPollBusy||!client||!matchRoom(r)||r.status==='completed'||r.status==='cancelled')return;
    if(!force&&started(r))return;
    readyPollBusy=true;
    try{
      const {data,error}=await client.from('mp_battle_rooms').select('*').eq('id',r.id).single();
      if(!error&&data){latestRoom=data;applyReadyUI(data)}
    }catch(_){ }finally{readyPollBusy=false}
  }

  function monitorBattle(){
    const r=legacyRoom();if(r?.id){if(latestRoom?.id!==r.id)latestRoom=r;ensureReadyWatch(roomNow());if(matchRoom(roomNow()))applyReadyUI(roomNow())}else{latestRoom=null;readyRoomId='';removeGate()}
  }

  /* ---------------- Event wiring ---------------- */
  document.addEventListener('pointerdown',e=>{guardBattleStart(e);setGestureStartV2553(e)},true);
  document.addEventListener('touchstart',e=>{guardBattleStart(e);setGestureStartV2553(e)},true);
  document.addEventListener('pointerup',e=>{if(e.target?.closest?.('[data-battle-set-v221]'))setGestureEndV2553(e);mobileRipFallbackV2553(e)},true);
  document.addEventListener('touchend',e=>{if(setPointerStart)setGestureEndV2553(e);mobileRipFallbackV2553(e)},true);
  document.addEventListener('click',async e=>{
    const setBtn=e.target.closest?.('[data-battle-set-v221]');if(setBtn){guardBattleStart(e);e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();if(Date.now()-lastSetCommitAt>550)commitBattleSetV2553(setBtn,{announce:true});return}
    if(e.target.closest('#mpBattlePackV220,#mpBattleRipTapV220'))guardBattleStart(e);
    const ready=e.target.closest?.('#mpBattleReadyBtnV255');if(ready&&ready.dataset.v2551ReadyWired!=='1'){const r=roomNow();return setBattleReady(!myReady(r))}
    if(e.target.closest('#mpChatToggleV255')){const box=q('#mpGlobalChatV255');box?.classList.toggle('open');if(box?.classList.contains('open')){unread=0;const u=q('#mpChatUnreadV255');if(u){u.hidden=true;u.textContent='0'}q('#mpChatMessagesV255')?.scrollTo?.({top:q('#mpChatMessagesV255').scrollHeight})}return}
    if(e.target.id==='mpChatSendV255')return sendChat();
    const mute=e.target.closest('[data-chat-mute-v255]');if(mute){toggleMute(mute.dataset.chatMuteV255);return}
    const style=e.target.closest('[data-banner-style-v255]');if(style){const b=bannerState();b.style=style.dataset.bannerStyleV255;qa('[data-banner-style-v255]').forEach(x=>x.classList.toggle('active',x.dataset.bannerStyleV255===b.style));renderBannerPreview();return}
    const badge=e.target.closest('[data-banner-badge-v255]');if(badge){const b=bannerState(),id=badge.dataset.bannerBadgeV255;if(b.badges.includes(id))b.badges=b.badges.filter(x=>x!==id);else if(b.badges.length<3)b.badges=[...b.badges,id];else return toastV255('Choose up to 3 showcase badges.');qa('[data-banner-badge-v255]').forEach(x=>x.classList.toggle('active',b.badges.includes(x.dataset.bannerBadgeV255)));renderBannerPreview();return}
    if(e.target.id==='mpSaveBannerV255')return saveBannerEditor();
    if(e.target.closest('#mpQuickMatchV226'))syncMyProfile({quiet:true});
    if(e.target.closest('[data-frame-apply-v228],#clearProfileFrameV228,#claimSeasonFramesV228,#profileSaveNameV227,#profileAvatarResetV227'))setTimeout(async()=>{await syncMyProfile({quiet:true});mountBannerEditor({force:true})},350);
  },true);
  document.addEventListener('input',e=>{if(e.target.id==='mpChatInputV255'){const c=q('#mpChatCharV255');if(c)c.textContent=`${e.target.value.length}/180`}if(e.target.id==='mpBannerTitleV255')renderBannerPreview()});
  document.addEventListener('change',e=>{if(e.target.id==='mpBannerRecordToggleV255')renderBannerPreview();if(e.target.id==='profileAvatarInputV227')setTimeout(async()=>{await syncMyProfile({quiet:true});mountBannerEditor({force:true})},900)});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='mpChatInputV255'){e.preventDefault();sendChat()}});

  const observer=new MutationObserver(()=>{clearTimeout(installTimer);installTimer=setTimeout(()=>{mountBannerEditor();mountChat();monitorBattle()},40)});
  observer.observe(document.documentElement,{childList:true,subtree:true});

  async function init(){
    for(let i=0;i<30&&!mp()?.client;i++)await sleep(100);
    if(!mp()?.client)return;
    await ensureContext();mountBannerEditor({force:true});mountChat();
    if(me){await syncMyProfile({quiet:true});await refreshMyRank();startChat().catch(()=>{})}
    monitorBattle();setInterval(monitorBattle,700);setInterval(()=>pollReadyRoom(false),850);
    client.auth.onAuthStateChange((_e,s)=>{me=s?.user||null;setTimeout(async()=>{mountChat();if(me){await syncMyProfile({quiet:true});await refreshMyRank();startChat().catch(()=>{})}else{try{if(chatChannel)client.removeChannel(chatChannel)}catch(_){}chatChannel=null}},100)});
  }

  window.tcgMultiplayerV255={syncMyProfile,refreshMyRank,setBattleReady,openChat(){mountChat()?.classList.add('open');startChat().catch(()=>{})},get currentRoom(){return roomNow()},get profileCache(){return profileCache}};
  init().catch(e=>console.error('[TCG] V255 multiplayer arena',e));
}catch(err){console.error('[TCG] V255 multiplayer arena boot',err)}})();
