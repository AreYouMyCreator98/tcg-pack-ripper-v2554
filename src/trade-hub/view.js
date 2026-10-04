import { TABS, TERMINAL, battleCost, money, rankProgress, escapeHtml as e, safeImage, filterListings, availableInventory, parsePrice, roomCode, errorMessage } from './model.js';
import { patchMarkup, createArtWarmer } from './render.js';
import { cinematicProfile } from '../animations/packs/cinematic-profile.js';
import { RANKS } from '../data/ranks.js';

const labels={market:'Marketplace',trades:'Trading',battles:'Pack battles',chat:'Global chat',ranked:'Ranked',activity:'Activity',shops:'Local shops'};
const empty=(title,detail='')=>`<div class="hub-empty"><strong>${e(title)}</strong><p>${e(detail)}</p></div>`;
const button=(action,text,attrs='')=>`<button type="button" data-hub-action="${action}" ${attrs}>${text}</button>`;
const art=(card,eager=false)=>safeImage(card?.thumb||card?.img)?`<img src="${e(safeImage(card.thumb||card.img))}" alt="${e(card.name)}" loading="${eager?'eager':'lazy'}" decoding="async" fetchpriority="${eager?'high':'auto'}" data-fallback="${e(safeImage(card.img))}" referrerpolicy="no-referrer">`:'<span class="hub-card-fallback" aria-hidden="true">✦</span>';
const options=(rows,selected)=>rows.map(r=>`<option value="${e(r.id??r.set_id)}" ${(r.id??r.set_id)===selected?'selected':''}>${e(r.name)}${r.qty?' ×'+r.qty:''}</option>`).join('');
const date=value=>new Date(value).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const avatar=value=>/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value||'')&&value.length<200000?value:'';
export const TRACKERS={wins:'Ranked wins',losses:'Ranked losses',ties:'Ranked ties',season_high:'Best RP',streak:'Win streak'};
const badgeName=id=>String(id).replace(/[_-]+/g,' ');
export const portrait=(p={},extra='')=>`<div class="hub-portrait ${extra}">${avatar(p.avatar)?`<img class="hub-avatar" src="${e(p.avatar)}" alt="${e(p.name)} avatar">`:`<span class="hub-initials" aria-label="${e(p.name)} avatar">${e((p.name||'Collector').slice(0,2).toUpperCase())}</span>`}${RANKS.some(r=>r.id===p.frame)?`<img class="hub-frame" src="assets/rank-frames/${e(p.frame)}.webp" alt="${e(p.frame)} frame">`:''}</div>`;
export const banner=p=>p?`<div class="hub-banner hub-banner-${e(['aurora','obsidian','gold','neon','crystal','ember'].includes(p.style)?p.style:'aurora')}">${portrait(p)}<div class="hub-banner-copy"><small>${e(p.title)}</small><h3>${e(p.name)}</h3><p>${rankProgress(p.rp).rank.name} · ${Number(p.rp)||0} RP</p><div class="hub-badges">${(p.badges||[]).slice(0,3).map(b=>`<span>✦ ${e(badgeName(b))}</span>`).join('')}</div>${p.show_record?`<dl class="hub-trackers">${(p.trackers||['wins','season_high','streak']).filter(id=>TRACKERS[id]).slice(0,3).map(id=>`<div><dt>${TRACKERS[id]}</dt><dd>${Number(p.stat_values?.[id]??p[id])||0}</dd></div>`).join('')}</dl>`:''}</div></div>`:empty('Waiting for a collector');
const workingLabel=action=>({chat_send:'Sending message…',profile:'Saving identity…',queue_join:'Finding a match…',battle_reveal:'Revealing card…',room_ready:'Confirming readiness…',listing_buy:'Completing purchase…',trade_offer:'Reserving your offer…'}[action]||'Updating…');

export class HubView {
  constructor(root,controller,{shops=null,clipboard=globalThis.navigator?.clipboard}={}) {
    Object.assign(this,{root,controller,shops,clipboard});
    this.warmArt=createArtWarmer(root.ownerDocument.defaultView?.Image);this.lastRevealTap=0;
    this.tab='market';this.query='';this.sort='newest';this.own=false;this.roomId=null;this.drafts={};this.selected=new Set();this.offerDirty=false;this.confirm=null;this.unread=0;this.lastChatId=0;
    this.onClick=this.onClick.bind(this);this.onInput=this.onInput.bind(this);this.onSubmit=this.onSubmit.bind(this);
    root.addEventListener('click',this.onClick);root.addEventListener('input',this.onInput);root.addEventListener('change',this.onInput);root.addEventListener('submit',this.onSubmit);
    this.onImageError=event=>{if(event.target.tagName!=='IMG')return;const alternate=event.target.dataset.fallback;if(alternate&&alternate!==event.target.getAttribute('src')){event.target.dataset.fallback='';event.target.src=alternate;return;}if(event.target.classList.contains('hub-frame')){event.target.remove();return;}const fallback=root.ownerDocument.createElement('span');fallback.className=event.target.classList.contains('hub-avatar')?'hub-initials':'hub-card-fallback';fallback.textContent='✦';fallback.setAttribute('aria-label',event.target.alt||'Card art unavailable');event.target.replaceWith(fallback);};root.addEventListener('error',this.onImageError,true);
  }
  room() {const rows=this.controller.state.data?.rooms||[];const selected=rows.find(r=>r.id===this.roomId),active=rows.find(r=>!TERMINAL.has(r.status));return active&&(!selected||TERMINAL.has(selected.status))?active:selected||active;}
  render(state=this.controller.state) {
    if(this.lastAccount!==this.controller.uid){this.lastAccount=this.controller.uid;this.drafts={};this.selected.clear();this.offerDirty=false;this.confirm=null;this.roomId=null;this.unread=0;this.lastChatId=0;this.notice='';try{this.muted=this.controller.storage?.getItem('tcg-hub-chat-muted:'+this.controller.uid)==='true';}catch{this.muted=false;}}
    const data=state.data,uid=data?.user_id,foregroundBusy=state.busy&&!state.background;
    const fresh=(data?.chat||[]).filter(m=>m.id>this.lastChatId&&m.user_id!==uid);
    if(this.lastChatId&&this.tab!=='chat'&&!this.muted)this.unread+=fresh.length;
    this.lastChatId=Math.max(this.lastChatId,...(data?.chat||[]).map(m=>Number(m.id)));
    const active=this.root.ownerDocument.activeElement;
    const focus=active?.closest?.('[data-hub-root]')?{name:active.name,start:active.selectionStart,end:active.selectionEnd}:null;
    const scroll=this.root.querySelector('.hub-messages')?.scrollTop;
    const oldRoom=this.roomId,room=this.room();
    if(room&&oldRoom!==room.id){this.roomId=room.id;this.offerDirty=false;this.selected=new Set();}
    if(room&&!this.offerDirty)this.selected=new Set((room.host_id===uid?room.host_offer:room.guest_offer||[]).map(c=>c.id));
    const rank=rankProgress(data?.profile?.rp);
    const liveRoom=data?.rooms?.find(r=>!TERMINAL.has(r.status));
    const matchAlert=liveRoom?.ranked&&liveRoom.guest_id&&this.tab!=='battles'?`<aside class="hub-match-alert" role="status"><strong>${liveRoom.status==='playing'?'Your battle is in progress':'Match found — confirm you are ready'}</strong>${button('resume-room','Open battle',`data-id="${e(liveRoom.id)}"`)}</aside>`:'';
    this.root.setAttribute('data-hub-root','');
    this.root.dataset.battlePlaying=String(this.tab==='battles'&&room?.status==='playing');
    patchMarkup(this.root,`<header class="hub-header"><div><span class="hub-eyebrow">COLLECTOR EXCHANGE / 256</span><h1>Trade Hub<span>+</span></h1><p>Your collection. A whole world of collectors.</p></div><div class="hub-status"><span class="hub-connection ${state.status==='connected'?'on':''}">${e(state.status.replaceAll('-',' '))}</span><strong>${data?money(data.coins):'Play together'}</strong><small>${data?`${e(rank.rank.name)} · ${rank.rp} RP`:'Local shops available offline'}</small></div></header>
    <nav class="hub-tabs" aria-label="Trade Hub">${TABS.map(t=>`<button type="button" data-hub-tab="${t}" aria-current="${this.tab===t?'page':'false'}" class="${this.tab===t?'active':''}">${labels[t]}${t==='chat'&&this.unread?` <span class="hub-unread">${this.unread}</span>`:''}</button>`).join('')}</nav>
    <div class="hub-notice" role="status" aria-live="polite">${e(state.error||this.notice||'')}${this.controller.pending&&!state.busy?button('retry','Retry pending action'):''}${state.status==='offline'?button('refresh','Reconnect'):''}</div>
    ${foregroundBusy?`<div class="hub-working" role="status">${workingLabel(state.action)}</div>`:''}
    ${matchAlert}<div class="hub-content" ${foregroundBusy?'aria-busy="true"':''}>${this.tab==='shops'?'<div class="hub-section-title"><h2>Collector district</h2><p>Singles, local listings, daily swaps, auctions, dealers and sealed products.</p></div>':!data?empty(state.status==='signed-out'?'Meet your next collector':'Connecting to Trade Hub',state.status==='signed-out'?'Sign in through Profile → Settings for the marketplace, multiplayer, chat and ranked. Your local collection is safe.':'Your collection stays unchanged while we connect.')+button('account','Open Profile')+button('refresh','Try connection again'):this.panel(data,room)}</div>`);
    if(this.shops)this.shops.hidden=this.tab!=='shops';
    if(foregroundBusy)for(const b of this.root.querySelectorAll('.hub-content button,.hub-content input,.hub-content select,.hub-content textarea'))b.disabled=true;
    if(room?.status==='playing'){const at=this.controller.revealProgress?.(room)??this.controller.serverProgress?.(room)??0;this.warmArt(room.my_cards.slice(at,at+4).map(c=>safeImage(c.thumb||c.img)));}
    if(focus?.name){const input=[...this.root.querySelectorAll('[name]')].find(x=>x.name===focus.name);input?.focus();if(typeof input?.setSelectionRange==='function'&&focus.start!==null)try{input.setSelectionRange(focus.start,focus.end);}catch{}}
    const messages=this.root.querySelector('.hub-messages');if(messages)messages.scrollTop=scroll??messages.scrollHeight;
  }
  panel(d,r) {
    if(this.tab==='market')return this.market(d);
    if(this.tab==='trades'||this.tab==='battles')return this.rooms(d,r);
    if(this.tab==='chat')return this.chat(d);
    if(this.tab==='ranked')return this.ranked(d);
    return `<div class="hub-section-title"><h2>Collection activity</h2><p>Confirmed purchases, trades and battle results.</p></div>${d.activity.length?'<ol class="hub-activity">'+d.activity.map(a=>`<li><time>${e(date(a.created_at))}</time><div><strong>${e(a.kind.replaceAll('_',' '))}</strong><p>${e(a.detail.name||a.detail.result||a.detail.reason||'')}${a.detail.price!==undefined?' · '+money(a.detail.price):''}${a.detail.delta!==undefined?' · '+(a.detail.delta>=0?'+':'')+a.detail.delta+' RP':''}${a.detail.received?' · '+a.detail.received+' cards received':''}</p></div></li>`).join('')+'</ol>':empty('Your story starts here','Completed exchanges will appear here.')}`;
  }
  market(d) {
    const rows=filterListings(d.listings,this.query,this.sort,this.own,d.user_id);
    return `<div class="hub-section-title"><div><h2>The marketplace</h2><p>Buy and sell cards using your game balance. Listed cards are held until sold or cancelled.</p></div>${button('refresh','↻ Refresh')}</div>
    <div class="hub-market-layout"><div><div class="hub-filters"><label>Find a card<input name="search" type="search" value="${e(this.query)}" placeholder="Card, set or collector"></label><label>Sort<select name="sort">${['newest','price-low','price-high'].map(x=>`<option value="${x}" ${x===this.sort?'selected':''}>${{newest:'Newest first','price-low':'Price: low to high','price-high':'Price: high to low'}[x]}</option>`).join('')}</select></label><label class="hub-check"><input name="own" type="checkbox" ${this.own?'checked':''}>My listings</label></div>
    ${this.confirm?`<section class="hub-confirm" role="alertdialog" aria-label="Confirm purchase"><h3>Buy ${e(this.confirm.card.name)}?</h3><p>${money(this.confirm.price)} will be paid to ${e(this.confirm.seller_name)}. One card will join your Binder.</p>${button('confirm-buy','Confirm purchase')}${button('dismiss','Keep browsing')}</section>`:''}
    <div class="hub-card-grid">${rows.length?rows.map(l=>`<article class="hub-listing">${art(l.card)}<div><small>${e(l.card.set)}</small><h3>${e(l.card.name)}</h3><p>${e(l.seller_name)}</p><strong>${money(l.price)}</strong>${button(l.seller_id===d.user_id?'cancel-listing':'buy',l.seller_id===d.user_id?'Return to Binder':'Buy card',`data-id="${e(l.id)}"`)}</div></article>`).join(''):empty('No listings found','Try another search or list a card from your Binder.')}</div><small>Showing up to 200 latest active listings.</small></div>
    <aside class="hub-compose"><span class="hub-eyebrow">FROM YOUR BINDER</span><h3>List a card</h3><p>One copy is held safely while your listing is active.</p><form data-hub-form="listing"><label>Card<select required name="card_id"><option value="">Choose a card</option>${options(d.inventory,this.drafts.card_id)}</select></label><label>Asking price<input name="price" inputmode="decimal" placeholder="8.00" value="${e(this.drafts.price||'')}" required></label><button type="submit" ${d.inventory.length?'':'disabled'}>Create listing</button></form><p class="hub-footnote">30 active listings per collector. Cancel an unsold listing to return its card.</p></aside></div>`;
  }
  rooms(d,r) {
    const kind=this.tab==='trades'?'trade':'battle';
    const active=d.rooms.some(room=>!TERMINAL.has(room.status));
    const canRank=(d.ranked_sets||d.sets).some(set=>battleCost(d,set.set_id)===null||battleCost(d,set.set_id)<=d.coins);
    const rankCostNote=canRank?'Each pack uses a starter pack, a credit for the chosen set, or $8 in-game cash. Both collectors must be able to open their pack.':'You need $8 in-game cash, a starter pack, or a credit for one of the five ranked sets before searching.';
    const entry=`<div class="hub-section-title"><h2>${kind==='trade'?'Make a deal':'Enter the arena'}</h2><p>${kind==='trade'?'Up to six cards each. Review, confirm, exchange.':'One or three packs each. Rarity decides the winner.'}</p></div><div class="hub-entry-grid">${kind==='battle'?`<section class="hub-feature"><span class="hub-eyebrow">RANKED / ONE PACK</span><h3>Find your rival</h3><p>Match by RP. Both players confirm before opening. Ranked randomly selects Paldean Fates, Crown Zenith, Shining Fates, Surging Sparks or Obsidian Flames. Both players use the same set and rarity odds. No starter boost.</p><p class="hub-cost">${rankCostNote}</p>${button('queue','Find ranked match',active||!canRank?'disabled':'')}</section>`:''}<section class="hub-compose"><h3>${kind==='trade'?'Private trade':'Private battle'}</h3>${kind==='battle'?`<label>Battle set<select name="set_id">${options(d.sets,this.drafts.set_id)}</select></label><label>Packs per player<select name="pack_count"><option value="1">1 pack</option><option value="3" ${this.drafts.pack_count==='3'?'selected':''}>3 packs</option></select></label><p>Up to $8 per pack; starter packs and sealed credits are used first. Pulled cards are kept.</p>`:'<p>Invite a collector with your room code. Cards move into a reserved offer until exchanged or returned.</p>'}${button('create','Create room',`data-kind="${kind}" ${active?'disabled':''}`)}</section><section class="hub-compose"><h3>Have an invite?</h3><form data-hub-form="join"><label>Room code<input name="code" maxlength="8" minlength="8" value="${e(this.drafts.code||'')}" placeholder="8-character code" required></label><button type="submit" ${active?'disabled':''}>Join room</button></form></section></div>`;
    return (r&&!TERMINAL.has(r.status)?this.roomPanel(d,r)+`<details class="hub-new-room"><summary>Room options</summary>${entry}</details>`:entry+(r?this.roomPanel(d,r):''))+`<div class="hub-room-history"><h3>Recent rooms</h3>${d.rooms.filter(x=>x.kind===kind).map(x=>button('open-room',`${e(x.ranked?'Ranked':x.kind)} · ${e(x.status)} · ${e(x.code)}`,`data-id="${e(x.id)}"`)).join('')||'<p>No rooms yet.</p>'}</div>`;
  }
  roomPanel(d,r) {
    const host=r.host_id===d.user_id,mine=host?r.host_ready:r.guest_ready,progress=this.controller.revealProgress?.(r)??(host?r.host_progress:r.guest_progress),opponentProgress=host?r.guest_progress:r.host_progress;
    const closed=TERMINAL.has(r.status);
    const cost=battleCost(d,r.my_set,r.pack_count),canPay=cost===null||cost<=d.coins;
    const costNote=cost===null?'Each pack uses a starter pack, a sealed credit, or $8 in-game cash.':cost===0?'Your starter packs or set credits cover this battle.':`Your pack cost: ${money(cost)} in-game cash. ${canPay?'You have enough.':'You do not have enough. Leave this room and earn cash or get pack credits before trying again.'}`;
    let content='';
    if(r.kind==='trade') {
      const cards=availableInventory(d.inventory,closed?null:r,d.user_id);
      content=`<div class="hub-offers">${[[r.host_name,r.host_offer,r.host_ready],[r.guest_name||'Waiting for collector',r.guest_offer,r.guest_ready]].map(([name,offer,ready])=>`<section><h3>${e(name)} <small>${ready?'Confirmed':'Reviewing'}</small></h3><div class="hub-offer-cards">${offer.map(c=>`<div>${art(c)}<span>${e(c.name)}</span></div>`).join('')||'<p>No cards offered</p>'}</div></section>`).join('')}</div>${!closed?`<form data-hub-form="offer"><fieldset><legend>Your offer · ${this.selected.size}/6 cards</legend><div class="hub-inventory">${cards.map(c=>`<label class="hub-select-card">${art(c)}<span>${e(c.name)}</span><input name="offer" value="${e(c.id)}" type="checkbox" ${this.selected.has(c.id)?'checked':''}></label>`).join('')||'<p>Add cards to your Binder to make an offer.</p>'}</div></fieldset><button type="submit">Save offer</button></form><p>Any offer change clears both confirmations. Review the exact cards above before confirming.</p>${button('ready',mine?'Withdraw confirmation':'Confirm this exchange',`${!r.guest_id||this.offerDirty?'disabled':''}`)}`:''}`;
    } else if(r.status==='playing') {
      const card=r.my_cards[progress];
      content=`<div class="hub-battle-stage"><div><span class="hub-eyebrow">YOUR PACK / ${Math.min(progress+1,r.my_cards.length)} OF ${r.my_cards.length}</span>${card?`<div class="hub-reveal hub-reveal-${cinematicProfile(card).effect}" data-reveal-key="${e(r.id)}:${progress}">${art(card,true)}<h3>${e(card.name)}</h3><p>${e(card.rarity)}</p></div>${button('reveal',progress===r.my_cards.length-1?'Finish my pack':'Keep card & reveal next')}`:empty('Your pack is complete',(this.controller.serverProgress?.(r)??progress)<progress?'Sending your reveals… You can stay on this page.':'Waiting for your opponent to finish.')}</div><aside><h3>${e(host?r.guest_name:r.host_name)}</h3><progress max="${r.pack_count*10}" value="${opponentProgress}"></progress><p>${opponentProgress}/${r.pack_count*10} cards revealed</p><p>Opponent cards and scores stay hidden until the result. Your cards are already saved.</p><p>Leaving now counts as a forfeit.</p></aside></div>`;
    } else if(r.status==='completed') {
      const delta=host?r.host_delta:r.guest_delta;
      content=`<div class="hub-result"><span class="hub-eyebrow">${e(r.reason||'FINAL RESULT')}</span><h3>${r.winner_id===null?'A shared victory':r.winner_id===d.user_id?'Victory is yours':'A worthy battle'}</h3><div class="hub-score">${host?r.host_score:r.guest_score}<span>—</span>${host?r.guest_score:r.host_score}</div><p>${r.ranked?`${delta>=0?'+':''}${delta||0} RP · recorded once`:'Private battle · rank unchanged'}</p><div class="hub-recap">${r.opponent_cards.map(c=>`<div>${art(c)}<span>${e(c.name)}</span></div>`).join('')}</div>${button('rematch','Create private rematch')}</div>`;
    } else if(!closed) {
      content=`<div class="hub-ready-grid"><div><h3>${e(r.host_name)}</h3><span>${r.host_ready?'Ready':r.ranked?'Not ready':'Choosing set'}</span></div><strong>VS</strong><div><h3>${e(r.guest_name||'Finding opponent…')}</h3><span>${r.guest_ready?'Ready':'Not ready'}</span></div></div><label>Your battle set<select name="room_set" ${mine||r.ranked?'disabled':''}>${options(r.ranked?(d.ranked_sets||d.sets):d.sets,r.my_set)}</select></label><p>Both players confirm before packs are charged and generated. Both keep their cards.</p><p class="hub-cost" role="status">${costNote}</p>${button('ready',mine?'Unready':'Ready to battle',!r.guest_id||(!mine&&!canPay)?'disabled':'')}`;
    }
    return `<section class="hub-room"><header><div><span class="hub-eyebrow">${e(r.kind)} / ${e(r.status)}</span><h2>${r.ranked?(r.status==='waiting'?'Finding an opponent':r.status==='ready'?'Match found':'Ranked arena'):`Room ${e(r.code)}`}</h2></div>${!r.ranked?button('copy','Copy invite code'):''}${!closed?button('cancel-room',r.status==='playing'?'Forfeit battle':'Leave room'):''}</header>${r.kind==='battle'&&!closed&&r.status!=='playing'?`<div class="hub-room-actions">${content}</div>`:''}${r.status==='playing'?'<details class="hub-battle-identities"><summary>Battle identities</summary>':''}<div class="hub-versus">${banner(r.host_profile)}<b>VS</b>${banner(r.guest_profile)}</div>${r.status==='playing'?'</details>':''}${closed&&r.status!=='completed'?empty('Room '+r.status,'Any reserved trade cards have been returned.'):r.kind==='battle'&&!closed&&r.status!=='playing'?'':content}${this.confirm==='leave'?`<div class="hub-confirm" role="alertdialog" aria-label="Leave room"><p>${r.status==='playing'?'Forfeit this battle? Your opponent wins and ranked points will be updated.':'End this room for both collectors? Reserved cards will be returned.'}</p>${button('confirm-leave','Leave room')}${button('dismiss','Stay')}</div>`:''}</section>`;
  }
  chat(d) {
    return `<div class="hub-section-title"><div><h2>Collector lounge</h2><p>${d.online} recently active collectors · 180 characters per message</p></div></div><div class="hub-chat-layout"><section><div class="hub-messages" role="log" aria-label="Global chat">${[...d.chat].reverse().map(m=>`<article class="hub-message ${m.user_id===d.user_id?'mine':''}"><header>${portrait(d.chat_profiles?.[m.user_id]||m.profile||{name:m.name})}<strong>${e(m.name)}</strong><time>${e(date(m.created_at))}</time></header><p>${e(m.message)}</p>${m.user_id!==d.user_id?`<div>${button('block','Block',`data-id="${e(m.user_id)}"`)}${button('report','Report',`data-id="${m.id}"`)}</div>`:''}</article>`).join('')||empty('Say hello','Start a conversation with other collectors.')}</div><form data-hub-form="chat" class="hub-chat-form"><label>Message<input name="message" maxlength="180" value="${e(this.drafts.message||'')}" placeholder="Share a pull or find a trading partner" required autocomplete="off"></label><button type="submit">Send</button></form></section><aside class="hub-compose"><h3>Your lobby</h3>${button('mute',this.muted?'Enable chat alerts':'Mute chat alerts')}<p>Be kind. Never share passwords or account recovery codes.</p><h4>Blocked collectors</h4>${d.blocked.map(uid=>button('unblock',`Unblock ${e(uid.slice(0,8))}`,`data-id="${e(uid)}"`)).join('')||'<p>No blocked collectors.</p>'}${typeof this.confirm==='object'&&this.confirm?.report?`<form data-hub-form="report"><label>Reason<textarea name="reason" minlength="3" maxlength="300" required>${e(this.drafts.reason||'')}</textarea></label><button type="submit">Submit report</button>${button('dismiss','Cancel')}</form>`:''}</aside></div>`;
  }
  ranked(d) {
    const p=d.profile,rank=rankProgress(p.rp);
    return `<section class="hub-rank-hero"><div><span class="hub-eyebrow">RANKED PACK BATTLES</span><h2>${e(rank.rank.name)}</h2><strong>${rank.rp} RP</strong><p>${p.wins} wins · ${p.losses} losses · ${p.ties} ties</p><progress max="100" value="${rank.percent}"></progress><p>${rank.next?`${rank.next.minRp-rank.rp} RP to ${e(rank.next.name)}`:'Top rank achieved'} · Best ${p.season_high} RP</p></div>${portrait({...p,frame:rank.rank.id},'hub-rank-portrait')}</section>
    <ol class="hub-ladder">${RANKS.map(r=>`<li class="${r.id===rank.rank.id?'active':''}"><strong>${e(r.name)}</strong><span>${r.minRp} RP</span></li>`).join('')}</ol><p>Win +30 RP, up to +12 for a streak. Tie +8. Loss −6 / −9 / −12 by rank, never below zero. Private matches do not affect rank.</p>
    <div class="hub-market-layout"><section><h3>Leaderboard</h3><table class="hub-leaderboard"><thead><tr><th>Place</th><th>Collector</th><th>RP</th><th>Record</th></tr></thead><tbody>${d.leaderboard.map((p,i)=>`<tr class="${p.user_id===d.user_id?'you':''}"><td>${i+1}</td><td>${e(p.name)}</td><td>${p.rp}</td><td>${p.wins===null?'Hidden':`${p.wins}W ${p.losses}L`}</td></tr>`).join('')}</tbody></table></section><aside class="hub-compose hub-identity"><h3>Your battle identity</h3><p>The banner your opponents see. Preview changes instantly; save to publish them.</p><div class="hub-identity-preview" aria-label="Battle identity preview">${banner(this.draftProfile(p))}</div><form data-hub-form="profile"><label>Collector name<input name="name" minlength="2" maxlength="24" required value="${e(this.drafts.name??p.name)}"></label><label>Title<input name="title" maxlength="28" value="${e(this.drafts.title??p.title)}"></label><label>Banner style<select name="style">${options(['aurora','obsidian','gold','neon','crystal','ember'].map(id=>({id,name:id})),this.drafts.style??p.style)}</select></label><label class="hub-check"><input type="checkbox" name="show_record" ${(this.drafts.show_record??p.show_record)?'checked':''}>Show my battle record</label><fieldset><legend>Showcase up to three earned badges</legend>${(d.available_badges||[]).map(id=>`<label class="hub-check"><input type="checkbox" name="badge" value="${e(id)}" ${(this.drafts.badges??p.badges??[]).includes(id)?'checked':''}>${e(badgeName(id))}</label>`).join('')||'<p>Earn badges by building your collection.</p>'}</fieldset><fieldset><legend>Choose up to three stat trackers</legend>${Object.entries(TRACKERS).map(([id,label])=>`<label class="hub-check"><input type="checkbox" name="tracker" value="${id}" ${(this.drafts.trackers??p.trackers??['wins','season_high','streak']).includes(id)?'checked':''}>${label}</label>`).join('')}</fieldset><p>Stats update from your ranked results. Avatar and earned frames are set in Profile.</p><button type="submit">Save identity</button></form></aside></div>`;
  }
  draftProfile(profile=this.controller.state.data?.profile) {
    return {...profile,...Object.fromEntries(['name','title','style','badges','show_record','trackers'].filter(k=>this.drafts[k]!==undefined).map(k=>[k,this.drafts[k]]))};
  }
  previewIdentity() {
    const preview=this.root.querySelector('.hub-identity-preview');
    if(preview)preview.innerHTML=banner(this.draftProfile());
  }
  onInput(event) {
    const el=event.target,name=el.name;if(!name)return;
    if(name==='search'){this.query=el.value;this.render();return;}
    if(name==='sort'){this.sort=el.value;this.render();return;}
    if(name==='own'){this.own=el.checked;this.render();return;}
    if(name==='offer'){
      if(el.checked&&this.selected.size>=6){el.checked=false;this.notice='Choose up to six cards.';return;}
      el.checked?this.selected.add(el.value):this.selected.delete(el.value);this.offerDirty=true;this.render();return;
    }
    if(name==='badge'||name==='tracker'){
      const selected=[...this.root.querySelectorAll(`[name="${name}"]:checked`)];
      if(selected.length>3)el.checked=false;
      this.drafts[name==='badge'?'badges':'trackers']=[...this.root.querySelectorAll(`[name="${name}"]:checked`)].map(x=>x.value);
      this.previewIdentity();return;
    }
    if(name==='show_record'){this.drafts.show_record=el.checked;this.previewIdentity();return;}
    this.drafts[name]=el.value;
    if(el.closest('[data-hub-form="profile"]'))this.previewIdentity();
    if(name==='room_set'&&event.type==='change')this.run('battle_set',{id:this.room().id,set_id:el.value});
  }
  async run(action,payload) {
    try {
      const result=await this.controller.command(action,payload);
      if(result?.room_id)this.roomId=result.room_id;
      this.confirm=null;this.notice=({profile:'Battle identity saved.',listing_create:'Card listed.',listing_buy:'Card added to your Binder.',listing_cancel:'Card returned to your Binder.',trade_offer:'Offer saved. Both collectors must confirm.',chat_report:'Report submitted.'})[action]||'';
      if(action==='profile')for(const key of ['name','title','style','badges','show_record','trackers'])delete this.drafts[key];
      if(action==='trade_offer')this.offerDirty=false;
      if(action==='chat_send')this.drafts.message='';
      this.render();return result;
    } catch(error){this.notice=errorMessage(error);this.render();}
  }
  async onClick(event) {
    const tab=event.target.closest('[data-hub-tab]');
    if(tab){this.tab=tab.dataset.hubTab;this.confirm=null;this.notice='';if(this.tab==='chat')this.unread=0;this.render();return;}
    const b=event.target.closest('[data-hub-action]');if(!b||b.disabled)return;
    const a=b.dataset.hubAction,d=this.controller.state.data,r=this.room();
    if(a==='refresh'){await this.controller.refresh();return;}
    if(a==='account'){this.root.ownerDocument.querySelector('.nav [data-s="profile"]')?.click();return;}
    if(a==='retry'){try{await this.controller.retry();}catch{}this.render();return;}
    if(a==='dismiss'){this.confirm=null;this.render();return;}
    if(a==='buy'){this.confirm=d.listings.find(l=>l.id===b.dataset.id);this.render();return;}
    if(a==='confirm-buy')return this.run('listing_buy',{id:this.confirm.id,price:this.confirm.price});
    if(a==='cancel-listing')return this.run('listing_cancel',{id:b.dataset.id});
    if(a==='create'||a==='rematch')return this.run('room_create',{kind:a==='rematch'?'battle':b.dataset.kind,set_id:this.drafts.set_id||d.sets[0]?.set_id,pack_count:Number(this.drafts.pack_count||1)});
    if(a==='queue')return this.run('queue_join',{set_id:this.drafts.set_id||d.sets[0]?.set_id});
    if(a==='resume-room'){this.tab='battles';this.roomId=b.dataset.id;this.notice='';this.render();return;}
    if(a==='open-room'){this.roomId=b.dataset.id;this.offerDirty=false;this.selected.clear();this.render();return;}
    if(a==='cancel-room'){this.confirm='leave';this.render();return;}
    if(a==='confirm-leave')return this.run('room_cancel',{id:r.id});
    if(a==='ready'&&!this.offerDirty)return this.run('room_ready',{id:r.id,revision:r.revision,ready:!(r.host_id===d.user_id?r.host_ready:r.guest_ready)});
    if(a==='reveal'){if(Date.now()-this.lastRevealTap<180)return;this.lastRevealTap=Date.now();try{this.controller.reveal(r);}catch(error){this.notice=errorMessage(error);this.render();}return;}
    if(a==='copy'){try{await this.clipboard.writeText(r.code);this.notice='Invite code copied.';}catch{this.notice=`Invite code: ${r.code}`;}this.render();return;}
    if(a==='block'||a==='unblock')return this.run(a,{user_id:b.dataset.id});
    if(a==='report'){this.confirm={report:b.dataset.id};this.render();}
    if(a==='mute'){this.muted=!this.muted;this.unread=0;try{this.controller.storage?.setItem('tcg-hub-chat-muted:'+this.controller.uid,String(this.muted));}catch{}this.render();}
  }
  async onSubmit(event) {
    const form=event.target.closest('[data-hub-form]');if(!form)return;event.preventDefault();
    const get=name=>form.querySelector(`[name="${name}"]`)?.value;
    try {
      switch(form.dataset.hubForm){
        case 'listing':return await this.run('listing_create',{card_id:get('card_id'),price:parsePrice(get('price'))});
        case 'join':return await this.run('room_join',{code:roomCode(get('code'))});
        case 'offer':return await this.run('trade_offer',{id:this.room().id,revision:this.room().revision,cards:[...this.selected]});
        case 'chat':return await this.run('chat_send',{message:get('message').trim()});
        case 'report':return await this.run('chat_report',{id:Number(this.confirm.report),reason:get('reason').trim()});
        case 'profile':return await this.run('profile',{name:get('name'),title:get('title'),style:get('style'),show_record:form.querySelector('[name="show_record"]').checked,badges:[...form.querySelectorAll('[name="badge"]:checked')].map(x=>x.value),trackers:[...form.querySelectorAll('[name="tracker"]:checked')].map(x=>x.value)});
      }
    } catch(error){this.notice=errorMessage(error);this.render();}
  }
  dispose(){this.root.removeEventListener('click',this.onClick);this.root.removeEventListener('input',this.onInput);this.root.removeEventListener('change',this.onInput);this.root.removeEventListener('submit',this.onSubmit);this.root.removeEventListener('error',this.onImageError,true);}
}
