import {adjacentUnlocked,seriesLabel,selectedProgress,profileImage} from './silver-model.js';
const paths={ball:'M3 12h6m6 0h6M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',crown:'m3 6 4 4 5-7 5 7 4-4-3 13H6L3 6Zm4 16h10',user:'M4 21v-2a8 8 0 0 1 16 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',info:'M7 3h10v18H7V3Zm4 7h2v7m-1-11v1',star:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',cards:'m6 3 13 2-2 17-13-2L6 3Zm-3 3L1 19',gift:'M3 9h18v4H3V9Zm2 4v8h14v-8M12 9v12m0-12C2 10 4 0 9 4l3 5Zm0 0c10 1 8-9 3-5l-3 5Z',rates:'M4 20v-6h3v6H4Zm7 0V9h3v11h-3Zm7 0V3h3v17h-3Z'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
export function installSilverShell(win=window,doc=document){
 if(win.tcgSilverShell)return win.tcgSilverShell;
 const $=id=>doc.getElementById(id),root=$('rip'),bridge=win.tcgCollectorBridge;
 if(!root||!bridge)return;
 const make=(tag,cls,html)=>{const n=doc.createElement(tag);n.className=cls;n.innerHTML=html;return n;};
 const header=make('header','silver-header',`<div class="silver-brand">${icon('crown')}<div><small>TCG</small><b>PACK RIPPER+</b><span>COLLECT · OPEN · COMPLETE</span></div></div><div class="silver-account"><div><small>CASH</small><b id="silverCash"></b></div><div><small>COLLECTOR</small><b id="silverLevel"></b></div><button id="silverProfile" aria-label="Open your Profile">${icon('user')}<img id="silverAvatar" alt="Your avatar" hidden><img id="silverFrame" alt="Equipped rank frame" hidden></button></div>`);
 doc.querySelector('.app').prepend(header);$('silverProfile').onclick=()=>win.tcgNavigation.go('profile');
 const hero=make('div','silver-hero','<small id="silverSeries"></small><h1 id="silverTitle"></h1><p>ONE PACK. INFINITE POSSIBILITY.</p>');
 const tools=doc.querySelector('.rip-studio-tools');tools.classList.add('silver-tools');
 $('openPullRates').innerHTML=icon('rates')+'<span>PULL RATES</span>'+icon('right');
 root.prepend(tools);root.prepend(hero);
 const selection=doc.querySelector('.rip-studio-selection');const logo=make('div','silver-set-logo','<img id="silverSetLogo" alt="Selected set logo" decoding="async">');selection.prepend(logo);
 $('studioChooseSet').textContent='Change set ↗';
 const stage=$('stage');const artStatus=make('div','silver-art-status','<b>ARTWORK UNAVAILABLE</b><small>Artwork unavailable. Pack opening still works.</small>');$('pack').append(artStatus);const packArt=$('packArt');const artState=()=>root.classList.toggle('silver-art-missing',!packArt.complete||!packArt.naturalWidth);packArt.addEventListener('load',artState);packArt.addEventListener('error',artState);artState();for(const [direction,name]of [[-1,'left'],[1,'right']]){const b=make('button','silver-arrow silver-'+name,icon(name));b.id='silver-'+name;b.type='button';b.setAttribute('aria-label',(direction<0?'Previous':'Next')+' unlocked set');b.onclick=()=>{const next=adjacentUnlocked(bridge.sets(),bridge.selectedSet(),direction);if(next)bridge.selectSet(next);};stage.append(b);}
 const mode=make('div','silver-mode','');mode.id='v261Mode';doc.querySelector('.layout').after(mode);mode.append($('v114PackMode'));$('v114PackMode').classList.remove('v202PackSelectorPortal');
 const quick=make('div','silver-quick',[['info','SET INFO','View details'],['star','CHASE CARDS','See top pulls'],['cards','MASTER SET','Progress'],['gift','SEALED','Your collection']].map(([i,title,sub],n)=>`<button type="button" data-silver-action="${n}">${icon(i)}<b>${title}</b><small id="silverQuick${n}">${sub}</small></button>`).join(''));mode.after(quick);
 // Reuse the existing guide, requirements, collection and sealed flows.
 quick.onclick=e=>{const b=e.target.closest('[data-silver-action]');if(!b)return;const action=Number(b.dataset.silverAction);if(action===0)openInfo();if(action===1){const tile=[...$('sets').children].find(t=>t.dataset.setId===bridge.selectedSet());tile?.querySelector('.setInfoIconV186')?.click();}if(action===2){win.tcgNavigation.go('collection','master');win.tcgCollector.collection.openSet(bridge.selectedSet());}if(action===3){win.tcgNavigation.go('collection','sealed');$('collectorOpenSealed').click();}};
 const info=make('dialog','silver-info','<form method="dialog"><button aria-label="Close set information">×</button></form><div id="silverInfoBody"></div><div class="collector-actions"><button id="silverRequirements">UNLOCK REQUIREMENTS</button><button id="silverRates">PULL RATES</button></div>');doc.body.append(info);
 $('silverRequirements').onclick=()=>{info.close();bridge.requirements();};$('silverRates').onclick=()=>{info.close();$('openPullRates').click();};info.onclick=e=>{if(e.target===info)info.close();};
 function openInfo(){const s=bridge.sets().find(s=>s.id===bridge.selectedSet()),t=bridge.totals()[s.id];const box=$('silverInfoBody');box.replaceChildren();const title=doc.createElement('h2');title.textContent=s.name;box.append(title);for(const [label,value] of [['SERIES',seriesLabel(s.series)],['MASTER SET',selectedProgress(bridge.totals(),s.id)],['OWNED / REQUIRED',(t?.owned.size||0)+' / '+(t?.total||'Checklist loading')],['OPENING COST',$('v114Cost').textContent],['AVAILABILITY',s.unlocked?'Unlocked':'Locked']]){const row=doc.createElement('p');const b=doc.createElement('b');b.textContent=label+' · ';row.append(b,doc.createTextNode(value));box.append(row);}const note=doc.createElement('p');note.textContent='Pull Rates contains the selected set’s rarity and God Pack odds. Chase Cards shows its available hits and values.';box.append(note);info.showModal();}
 function text(id,value){const n=$(id);if(n&&n.textContent!==String(value))n.textContent=value;}
 let cachedSet='',progressDirty=true;
 function sync(){
  const set=bridge.sets().find(s=>s.id===bridge.selectedSet());if(!set)return;
  const pack=win.TCG_PACK_LEGACY.snapshot(),state=bridge.state();
  text('silverCash',new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(state.coins||0)));text('silverLevel','LV '+bridge.level());
  text('silverTitle',set.name);artStatus.querySelector('b').textContent=set.name;artState();text('silverSeries',seriesLabel(set.series));text('studioSetSeries',seriesLabel(set.series));
  if($('silverSetLogo').getAttribute('src')!==set.logo)$('silverSetLogo').src=set.logo;
  if(progressDirty||cachedSet!==set.id){text('silverQuick2',selectedProgress(bridge.totals(),set.id));progressDirty=false;cachedSet=set.id;}
  text('silverQuick1',(state.collectorV260?.chases||[]).filter(c=>c.setId===set.id).length+' / 3 pinned');
  const identity=win.tcgProfileStudioBridge?.snapshot(),src=profileImage(identity),avatar=$('silverAvatar');avatar.hidden=!src||avatar.dataset.failedSrc===src;if(src&&avatar.getAttribute('src')!==src)avatar.src=src;
  const frame=$('silverFrame'),frameId=identity?.profile?.frame,frameSrc=(win.tcgRankFrameAssetsV231||win.tcgProfileFramesV228?.FRAME_ASSETS_V228||{})[frameId];frame.hidden=!frameSrc;if(frameSrc&&frame.getAttribute('src')!==frameSrc)frame.src=frameSrc;
  const busy=bridge.blocked()||root.dataset.ripState!=='IDLE';$('silver-left').disabled=busy;$('silver-right').disabled=busy;
  const affordable=bridge.affordable(pack.mode);$('studioOpenPack').disabled=busy||!affordable||$('loading')?.classList.contains('show');if(!affordable)text('studioOpenPack','Insufficient balance');
 }
 let queued=false;function schedule(){if(queued)return;queued=true;win.requestAnimationFrame(()=>{queued=false;sync();});}
 for(const e of ['tcg:set-selected','tcg:collector-updated','tcg:pack-summary','tcg:pack-result-restored','tcg:navigation','tcg:hub-updated','tcg:app-ready'])win.addEventListener(e,()=>{progressDirty=true;schedule();});
 for(const e of ['tcg:profile-updated','tcg:rip-state'])win.addEventListener(e,schedule);
 const observer=new MutationObserver(schedule);for(const id of ['coins','headerLevel','v114Cost'])if($(id))observer.observe($(id),{childList:true,subtree:true,characterData:true});observer.observe(root,{attributes:true,attributeFilter:['data-rip-state']});
 $('silverAvatar').onerror=()=>{$('silverAvatar').dataset.failedSrc=$('silverAvatar').getAttribute('src');$('silverAvatar').hidden=true;};
 const versionRow=[...doc.querySelectorAll('.settingsDataLineV158')].find(row=>row.querySelector('span')?.textContent.trim()==='Game Version');if(versionRow?.querySelector('b'))versionRow.querySelector('b').textContent='V261 · DARK SILVER';
 sync();return win.tcgSilverShell={refresh:()=>{progressDirty=true;sync();}};
}
