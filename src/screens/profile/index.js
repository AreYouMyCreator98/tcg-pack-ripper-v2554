import {banner,TRACKERS} from '../../trade-hub/view.js';
import {escapeHtml as e} from '../../trade-hub/model.js';
import {STYLES,AVATARS,lookOf,restoreLook,pageSlice} from './model.js';

export function installProfileStudio(win=window,doc=document){
 if(win.tcgProfileStudio)return win.tcgProfileStudio;
 const root=doc.getElementById('profile'),bridge=win.tcgProfileStudioBridge;
 if(!root||!bridge)return;
 const $=id=>doc.getElementById(id);
 let data,draft,dirty=false,busy=false,section='overview',queued=false;
 const pages=new Map(),observers=[];
 const notice=text=>{$('profileStudioNotice').textContent=text;};
 function switchTab(mode,focus=false){
   if(!root.querySelector(`[data-profile-panel-v160="${mode}"]`))return;
   section=mode;
   root.querySelectorAll('[data-profile-mode-v160]').forEach(b=>{const on=b.dataset.profileModeV160===mode;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
   root.querySelectorAll('[data-profile-panel-v160]').forEach(p=>{const on=p.dataset.profilePanelV160===mode;p.classList.toggle('active',on);p.setAttribute('aria-hidden',String(!on));});
   if(mode==='customise')refresh();
 }
 function slot(id,node){if(node&&node.parentElement!==$(id))$(id).append(node);}
 function fold(node,title,subtitle=''){
   if(!node||node.parentElement?.classList.contains('studio-details'))return;
   const details=doc.createElement('details');details.className='studio-details';
   const summary=doc.createElement('summary');summary.textContent=title;
   if(subtitle){const span=doc.createElement('span');span.textContent=subtitle;summary.append(span);}
   node.before(details);details.append(summary,node);
 }
 function arrange(){
   const frames=$('profileFramesVaultWrapV228');
   if(frames){
     let target=$('profileFramesSlot');if(!target){target=doc.createElement('div');target.id='profileFramesSlot';root.querySelector('.studio-editor').append(target);fold(target,'Rank frames','Equip your earned season rewards');}
     slot('profileFramesSlot',frames);
     const grid=frames.querySelector('.frameVaultGridV228');if(grid){grid.id='profileFrameGrid';installPager('profileFrameGrid',4);}
   }
   slot('profileDailySlot',root.querySelector('#profileExtrasV221 .dailyCardV221'));
   slot('profileRankSlot',root.querySelector('#profileExtrasV221 .rankCardV221'));
   // Re-rendered legacy extras replace their contents. Keep exactly one current card.
   for(const id of ['profileDailySlot','profileRankSlot']){const el=$(id);while(el.children.length>1)el.firstElementChild.remove();}
   const hq=$('collectorHQV163');
   if(hq){
     slot('profileChallengesSlot',$('v163Daily')?.closest('.v163Card'));
     slot('profileMilestonesSlot',$('v163Milestones')?.closest('.v163Card'));
     slot('profileStatsSlot',hq);
     fold($('v163Intel')?.closest('.v163Card'),'Vault snapshot','Collection, market, slabs & sealed');
     fold($('v163Recent')?.closest('.v163Card'),'Recent activity','Your latest pack history');
   }
   // The controls retain their original listeners when moved into compact groups.
   for(const [id,title,subtitle] of [['badges','Badge vault','Earned & upcoming'],['achievementGrid','Achievements','Search, sort & pin your goals']]){
     const box=$(id)?.closest('.profileSectionV158');fold(box,title,subtitle);
   }
   const level=$('levelRewardsV197');
   if(level)level.querySelector('.levelRoadLegendV197')?.setAttribute('aria-label','Reward types');
   const road=$('unlockRoad');
   if(road&&!$('profileSetRoadGroup')){
     const box=doc.createElement('section');box.id='profileSetRoadGroup';
     const hero=root.querySelector('.progressHeroV158');(hero||road).before(box);if(hero)box.append(hero);box.append(road);
     fold(box,'Set completion','Unlock requirements & Master Sets');
     root.querySelector('.setRoadDividerV197')?.remove();
   }
   for(const [id,size] of [['achievementGrid',6],['badges',6],['unlockRoad',6],['levelTrackV197',3]])installPager(id,size);
   const search=$('v163AchSearch');if(search){search.setAttribute('aria-label','Search achievements');search.placeholder='Search achievements';}
   $('v163AchCategory')?.setAttribute('aria-label','Achievement category');$('v163AchSort')?.setAttribute('aria-label','Sort achievements');
 }
 function installPager(id,size){
   const grid=$(id);if(!grid)return;
   const previous=pages.get(id);if(previous&&previous.grid!==grid){previous.observer.disconnect();previous.nav.remove();pages.delete(id);}
   if(!pages.has(id)){
     const nav=doc.createElement('nav');nav.className='studio-pagination';nav.setAttribute('aria-label',({achievementGrid:'Achievements',badges:'Badges',unlockRoad:'Sets',levelTrackV197:'Levels',profileFrameGrid:'Rank frames'})[id]+' pages');
     nav.innerHTML=`<button type="button" data-page="-1">Previous</button><span role="status"></span><button type="button" data-page="1">Next</button>`;grid.after(nav);
     const entry={grid,nav,size,page:0,signature:''};pages.set(id,entry);
     nav.addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(!button)return;entry.page+=Number(button.dataset.page);paginate(id);});
     const observer=new win.MutationObserver(()=>paginate(id));observer.observe(grid,{childList:true});entry.observer=observer;observers.push(observer);
   }
   paginate(id);
 }
 function paginate(id){
   const entry=pages.get(id);if(!entry)return;
   const rows=[...entry.grid.children],signature=rows.map(n=>n.dataset.v197Level||n.dataset.profileSetV160||n.querySelector('[data-v163-pin]')?.dataset.v163Pin||n.querySelector('b')?.textContent||n.textContent).join('|');
   if(signature!==entry.signature){entry.signature=signature;entry.page=0;if(id==='levelTrackV197'){const current=rows.findIndex(n=>n.classList.contains('current'));if(current>=0)entry.page=Math.floor(current/entry.size);}}
   const p=pageSlice(rows.length,entry.page,entry.size);entry.page=p.page;
   rows.forEach((row,i)=>{const hidden=i<p.start||i>=p.end;if(row.hidden!==hidden)row.hidden=hidden;});
   entry.nav.hidden=rows.length<=entry.size;
   entry.nav.querySelector('span').textContent=`${p.start+1}–${p.end} of ${rows.length}`;
   entry.nav.querySelector('[data-page="-1"]').disabled=p.page===0;entry.nav.querySelector('[data-page="1"]').disabled=p.page===p.pages-1;
 }
 function renderSlots(){
   const focus=doc.activeElement?.id;
   for(const [id,key,options,label] of [['profileBadgeSlots','badges',data.badges,'Badge'],['profileTrackerSlots','trackers',Object.entries(TRACKERS).map(([id,name])=>({id,name})),'Tracker']]){
     $(id).innerHTML=Array.from({length:3},(_,i)=>`<label>${label} ${i+1}<select id="studio-${key}-${i}" data-studio-slot="${key}" data-slot="${i}"><option value="">Empty slot</option>${options.map(o=>`<option value="${e(o.id)}" ${draft[key][i]===o.id?'selected':''} ${draft[key].includes(o.id)&&draft[key][i]!==o.id?'disabled':''}>${e(o.name)}</option>`).join('')}</select></label>`).join('');
   }
   if(focus?.startsWith('studio-'))$(focus)?.focus();
 }
 function fill(){
   $('profileTitle').value=draft.title;$('profileShowRecord').checked=draft.show_record;renderSlots();
 }
 function preview(){
   const p={...data.profile,...draft};
   $('profileBannerPreview').innerHTML=banner(p);
   $('profileBannerSummary').innerHTML=banner(data.profile);
   let competitive=$('profileCompetitiveEdit');if(!competitive){competitive=doc.createElement('button');competitive.id='profileCompetitiveEdit';competitive.type='button';competitive.textContent='Competitive banner';competitive.addEventListener('click',()=>{doc.querySelector('.nav [data-s="earn"]')?.click();win.tcgLeague?.customize();});$('profileBannerSummary').after(competitive);}competitive.hidden=!win.tcgLeague?.controller.state.data?.enabled;

   let level=$('profileLevelSummary');if(!level){level=doc.createElement('p');level.id='profileLevelSummary';$('profileBannerSummary').after(level);}level.textContent=`${$('profileLevel').textContent} · ${$('xpText').textContent}`;
   $('profileDraftState').textContent=dirty?'Preview · not equipped':'Equipped';
   $('profilePreviewHint').textContent=data.online?'This is the card shown in trading and pack battles.':'Local collector card. Sign in to share an identity in multiplayer.';
   root.querySelectorAll('[data-studio-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studioStyle===draft.style)));
   $('profileEquip').disabled=busy||data.blocked||!dirty;$('profileDiscard').disabled=busy||!dirty;
   $('profileEquip').textContent=busy?'Equipping…':'Equip identity';
   root.querySelector('.studio-editor').inert=busy;
 }
 function renderLooks(){
   $('profileLooks').innerHTML=Array.from({length:3},(_,i)=>{const p=data.looks[i];return `<article><div><b>Look ${i+1}</b><small>${e(p?`${p.title||'Untitled'} · ${STYLES.find(([id])=>id===p.style)?.[1]||p.style}`:'Empty preset')}</small></div><button type="button" data-studio-load="${i}" ${p?'':'disabled'}>Load</button><button type="button" data-studio-save="${i}">${p?'Replace':'Save here'}</button></article>`;}).join('');
 }
 function refresh(){
   const next=bridge.snapshot(),changed=data&&data.account!==next.account;
   if(changed){dirty=false;busy=false;notice('');pages.forEach(p=>p.page=0);}
   data=next;if(!draft||changed||!dirty){draft=lookOf(data.profile);fill();}
   arrange();preview();renderLooks();
   $('profileTitleChips').innerHTML=['Collector','Chase Seeker','Vault Keeper','Pack Explorer',...(data.titles||[])].map(title=>`<button type="button" data-studio-title="${e(title.slice(0,28))}">${e(title)}</button>`).join('');
 }
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh();});}
 function change(){dirty=JSON.stringify(draft)!==JSON.stringify(lookOf(data.profile));notice('');preview();}
 async function equip(){
   if(busy)return;const owner=data.account;busy=true;preview();
   try{await bridge.equip(lookOf(draft),owner);if(bridge.snapshot().account!==owner)return;dirty=false;refresh();notice(data.online?'Identity equipped. Your multiplayer banner is updated.':'Identity equipped and saved.');}
   catch(error){if(bridge.snapshot().account===owner)notice(error.message||'Could not equip this look.');}
   finally{busy=false;schedule();}
 }
 function avatar(index){
   const [glyph,,colour]=AVATARS[index]||[];if(!glyph)return;
   const canvas=doc.createElement('canvas');canvas.width=canvas.height=240;const ctx=canvas.getContext('2d');
   const gradient=ctx.createLinearGradient(0,0,240,240);gradient.addColorStop(0,'#fffdf5');gradient.addColorStop(1,colour);ctx.fillStyle=gradient;ctx.fillRect(0,0,240,240);
   ctx.strokeStyle='#ffffffb0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(120,120,100,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#38334f';ctx.font='bold 116px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(glyph,120,126);
   bridge.avatar(canvas.toDataURL('image/png'),data.account);refresh();notice('Collector avatar equipped.');
 }
 function click(event){
   const b=event.target.closest('button');if(!b)return;
   try{
     if(b.dataset.profileModeV160){switchTab(b.dataset.profileModeV160);return;}
     if(b.dataset.studioTab){root.querySelector(`[data-profile-mode-v160="${b.dataset.studioTab}"]`)?.click();return;}
     if(b.dataset.studioStyle){draft.style=b.dataset.studioStyle;change();return;}
     if(b.dataset.studioTitle){draft.title=b.dataset.studioTitle;$('profileTitle').value=draft.title;change();return;}
     if(b.dataset.studioAvatar!==undefined){avatar(Number(b.dataset.studioAvatar));return;}
     if(b.dataset.studioSave!==undefined){bridge.saveLook(Number(b.dataset.studioSave),draft,data.account);data=bridge.snapshot();renderLooks();notice(`Look ${Number(b.dataset.studioSave)+1} saved.`);return;}
     if(b.dataset.studioLoad!==undefined){draft=restoreLook(data.looks[Number(b.dataset.studioLoad)],data.badges.map(b=>b.id));fill();change();notice('Look loaded into preview. Equip it when ready.');return;}
     if(b.id==='profileEquip'){equip();return;}
     if(b.id==='profileDiscard'){dirty=false;refresh();notice('Preview reset to your equipped look.');return;}
     if(b.id==='levelRoadJumpV197'){
       const p=pages.get('levelTrackV197');if(p){const i=[...p.grid.children].findIndex(n=>n.classList.contains('current'));p.page=Math.max(0,Math.floor(i/p.size));paginate('levelTrackV197');p.grid.querySelector('.current')?.scrollIntoView({block:'nearest',behavior:'auto'});}
     }
   }catch(error){notice(error.message);}
 }
 function input(event){
   if(event.target.id==='profileTitle'){draft.title=event.target.value;change();}
   if(event.target.id==='profileShowRecord'){draft.show_record=event.target.checked;change();}
   const key=event.target.dataset.studioSlot;
   if(key){draft[key]=[...root.querySelectorAll(`[data-studio-slot="${key}"]`)].map(s=>s.value).filter(Boolean);renderSlots();change();}
 }
 function keyboard(event){
   if(!event.target.matches('[role="tab"]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const tabs=[...root.querySelectorAll('[role="tab"]')],i=tabs.indexOf(event.target),n=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   tabs[n].click();tabs[n].focus();
 }
 $('profileStyleChoices').innerHTML=STYLES.map(([id,name])=>`<button type="button" data-studio-style="${id}" aria-pressed="false"><i class="hub-banner-${id}"></i>${name}</button>`).join('');
 $('profileTitleChips').innerHTML=['Collector','Chase Seeker','Vault Keeper','Pack Explorer'].map(title=>`<button type="button" data-studio-title="${title}">${title}</button>`).join('');
 $('profileAvatarChoices').innerHTML=AVATARS.map(([glyph,name,colour],i)=>`<button type="button" data-studio-avatar="${i}" aria-label="Use ${name} avatar" style="--avatar-tint:${colour}"><span aria-hidden="true">${glyph}</span><small>${name}</small></button>`).join('');
 root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('change',input);root.addEventListener('keydown',keyboard);
 win.addEventListener('tcg:profile-updated',schedule);
 const headingObserver=new win.MutationObserver(schedule);headingObserver.observe($('profileDisplayNameV227'),{childList:true});observers.push(headingObserver);
 const onNav=event=>{const nav=event.target.closest?.('.nav [data-s]');if(nav){doc.documentElement.classList.toggle('studio-profile-active',nav.dataset.s==='profile');if(nav.dataset.s==='profile'){schedule();}}};doc.addEventListener('click',onNav);
 const settings=$('settings');
 if(settings){
   settings.classList.add('studio-settings');settings.setAttribute('role','dialog');settings.setAttribute('aria-modal','true');settings.setAttribute('aria-label','Game settings');
   $('closeProfileSettingsV158').setAttribute('aria-label','Close settings');$('closeSettingsShadeV158').setAttribute('aria-label','Close settings backdrop');
   settings.querySelectorAll('.settingsGroupV158').forEach(group=>{const title=group.querySelector('.settingsGroupHeadV158 small')?.textContent||'Options';fold(group,title);if(group.id==='cloudAccountV190')group.parentElement.open=true;});
   // The shared settings overlay owns scrolling, focus and dismissal.

 }
 bridge.refresh();switchTab('overview');refresh();
 win.tcgProfileStudio={refresh,switchTab,dispose(){observers.forEach(o=>o.disconnect());win.removeEventListener('tcg:profile-updated',schedule);doc.removeEventListener('click',onNav);root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('change',input);root.removeEventListener('keydown',keyboard);}};
 return win.tcgProfileStudio;
}
