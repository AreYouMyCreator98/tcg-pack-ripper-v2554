
/* ===== original script 40 id=v198-special-health-script ===== */

(()=>{try{
 const oldRun=window.runSystemAuditV195;if(typeof oldRun==='function')window.runSystemAuditV195=function(){const r=oldRun();try{const cards=window.specialCardsV198||[],owned=state.specialCollectionV198?.owned||{},missing=cards.filter(c=>!c.art||!(String(c.art).startsWith('data:image/')||String(c.art).startsWith('assets/specials/')));r.checks.push({name:'Special Collection',ok:cards.length===19&&missing.length===0,detail:`${cards.length}/19 cards • ${Object.keys(owned).length} owned • art assets ${missing.length?'incomplete':'ready'}`,level:'fail'});r.checks.push({name:'Special rarities',ok:cards.filter(c=>c.rarity==='Mythical Rare').length===9&&cards.filter(c=>c.rarity==='Prismatic Rare').length===10,detail:'9 Mythical Rare • 10 Prismatic Rare',level:'fail'});r.failed=r.checks.filter(x=>!x.ok&&x.level!=='warn').length;r.warnings=r.checks.filter(x=>!x.ok&&x.level==='warn').length;r.passed=r.checks.length-r.failed-r.warnings}catch(_e){}return r};
 const oldWhats=window.mountWhatsNewV163;if(typeof oldWhats==='function')window.mountWhatsNewV163=function(){const x=oldWhats.apply(this,arguments);const card=document.querySelector('#v163WhatsNew .v163WhatsCard');if(card&&!document.getElementById('v198WhatsSpecial')){const d=document.createElement('div');d.id='v198WhatsSpecial';d.style.cssText='margin:12px 0;padding:13px;border:1px solid #8b5cf655;border-radius:16px;background:#8b5cf612;color:#dcd4ff;font:800 10px/1.5 system-ui';d.innerHTML='<b style="display:block;color:#fff;margin-bottom:5px">V198 • SPECIAL COLLECTION</b>19 user-supplied custom cards embedded offline • 9 Mythical Rare • 10 Prismatic Rare • level/achievement/Master Set/God Pack/streak/trade/grading unlocks • Prismatic Vault bonus route • full locked previews • animated rainbow, light, sparkle and damascus foil effects.';card.insertBefore(d,card.querySelector('button'))}return x}
}catch(err){console.error('V198 health bootstrap',err)}})();



/* ===== original script 41 id=v199-starter-boost-script ===== */

(()=>{
 try{
  if(window.__v199StarterInstalled)return;window.__v199StarterInstalled=true;
  const starter=()=>state.starterV199||{};
  const freeLeft=()=>Math.max(0,Number(starter().remaining||0));
  const sealedCredits=setId=>Number(state.sealedV161?.packCredits?.[setId]||0);
  const originalCanAfford=window.canAffordPackV161;
  const originalPay=window.payForPackV161;
  window.canAffordPackV161=function(setId,count=1){count=Math.max(1,Number(count)||1);const free=Math.min(count,freeLeft()),remain=count-free,credits=Math.min(remain,sealedCredits(setId)),cash=Math.max(0,remain-credits)*8;return Number(state.coins||0)+1e-9>=cash};
  window.payForPackV161=function(setId){
    if(starter().eligible&&freeLeft()>0){starter().remaining=Math.max(0,freeLeft()-1);starter().used=Number(starter().used||0)+1;if(starter().remaining<=0&&!starter().tutorialShown)starter().tutorialPending=true;setTimeout(syncStarterV199,0);return}
    return originalPay?originalPay(setId):undefined;
  };
  function costTextV199(count){
    const free=Math.min(count,freeLeft()),remain=count-free,credits=Math.min(remain,sealedCredits(sel?.id)),paid=Math.max(0,remain-credits);
    if(free===count&&count===10)return 'FREE STARTER 10';if(free===count&&count===1)return `FREE • ${freeLeft()} LEFT`;
    const parts=[];if(free)parts.push(`${free} FREE`);if(credits)parts.push(`${credits} CREDIT`);if(paid)parts.push(`$${(paid*8).toFixed(2)}`);return parts.join(' + ')||`$${(count*8).toFixed(2)}`;
  }
  function syncStarterV199(){
    let banner=document.getElementById('starterBonusV199');
    if(!banner){const mode=document.getElementById('v114PackMode');if(mode){banner=document.createElement('div');banner.id='starterBonusV199';banner.className='starterBonusV199';banner.innerHTML='<div class="starterBonusTopV199"><div><small>NEW COLLECTOR BONUS</small><b>Your first 10 packs are on us.</b></div><div class="starterFreePillV199"><strong id="starterFreeLeftV199">10</strong> FREE LEFT</div></div><div class="starterBonusMetaV199"><div><small>HIT ODDS</small><b>1.5× BOOST</b></div><div><small>GUARANTEED</small><b>2 SIR+</b></div><div><small>STARTING CASH</small><b>$80 KEPT</b></div></div><div class="starterBonusBarV199"><i id="starterBonusFillV199"></i></div>';mode.parentNode.insertBefore(banner,mode)}}
    const left=freeLeft(),s=starter();if(banner)banner.classList.toggle('show',!!(s.eligible&&left>0));
    const leftEl=document.getElementById('starterFreeLeftV199');if(leftEl)leftEl.textContent=String(left);
    const fill=document.getElementById('starterBonusFillV199');if(fill)fill.style.width=`${Math.max(0,Math.min(100,(Number(s.used||0)/10)*100))}%`;
    const cost=document.getElementById('v114Cost');if(cost){cost.textContent=costTextV199(v114PackCount);cost.classList.toggle('v199FreeCost',left>0)}
    const instr=document.getElementById('instruction');if(instr&&!busy&&left>0){if(v114PackCount===10&&left>=10)instr.textContent='10 FREE STARTER PACKS • 50% HIT BOOST • 2 SIR+ GUARANTEED';else if(v114PackCount===1)instr.textContent=`FREE STARTER PACK • ${left} LEFT • 50% HIT BOOST`;else instr.textContent=`${Math.min(v114PackCount,left)} FREE STARTER PACKS • THEN NORMAL PRICING`}
  }
  window.syncStarterV199=syncStarterV199;
  function ensureGuideV199(){
    if(document.getElementById('starterGuideV199'))return;
    const m=document.createElement('div');m.id='starterGuideV199';m.innerHTML='<div class="starterGuideCardV199"><span class="starterGuideEyebrowV199">STARTER BONUS COMPLETE</span><h2>Now build your collection.</h2><p>Your 10 free boosted packs are finished and your original $80 is still yours. From here, normal pack prices and the full economy take over.</p><div class="starterGuideGridV199"><div class="starterGuideStepV199"><i>🎴</i><b>Rip Packs</b><span>Normal boosters cost $8 each or $80 for 10. Sealed pack credits can also pay for packs.</span></div><div class="starterGuideStepV199"><i>🗃️</i><b>Sell Bulk</b><span>Cheap pulls route to the Bulk Tub. Go to Trade → Sell → Sell Bulk to turn them into cash.</span></div><div class="starterGuideStepV199"><i>📘</i><b>Sell Binder Hits</b><span>List valuable Binder cards through Trade → Sell → Create Listing. Completed sales add cash back to your balance.</span></div><div class="starterGuideStepV199"><i>🧪</i><b>Grade Big Cards</b><span>Submit stronger pulls for grading, then keep the slab or list the graded card for sale.</span></div><div class="starterGuideStepV199"><i>🎁</i><b>Claim Level Rewards</b><span>Profile → Progress contains one-time cash rewards, set unlocks, binders and Special Collection rewards.</span></div><div class="starterGuideStepV199"><i>✦</i><b>Chase Specials</b><span>Mythical Rare and Prismatic Rare cards come from levels, achievements, Master Sets, God Packs, streaks and other collector milestones.</span></div></div><div class="starterGuideTipV199"><b>Best early loop:</b> open packs → sell bulk → list valuable duplicates → keep some cash aside → reinvest. Your first 10 packs gave you inventory without touching the $80 starting balance.</div><div class="starterGuideActionsV199"><button type="button" class="primary" id="starterGuideDoneV199">GOT IT — START COLLECTING</button><button type="button" class="ghost" id="starterGuideProfileV199">VIEW PROGRESS</button></div></div>';
    document.body.appendChild(m);document.getElementById('starterGuideDoneV199').onclick=()=>closeGuideV199();document.getElementById('starterGuideProfileV199').onclick=()=>{closeGuideV199();document.querySelector('.nav button[data-s="profile"]')?.click();setTimeout(()=>document.querySelector('[data-profile-mode-v160="progress"]')?.click(),120)};
  }
  function closeGuideV199(){const m=document.getElementById('starterGuideV199');m?.classList.remove('show');starter().tutorialShown=true;starter().tutorialPending=false;try{save()}catch(_e){try{localStorage.setItem('tcgRipperSave',JSON.stringify(state))}catch(__){}}}
  function showGuideV199(){if(starter().tutorialShown)return;ensureGuideV199();starter().tutorialPending=false;document.getElementById('starterGuideV199')?.classList.add('show');try{localStorage.setItem('tcgRipperSave',JSON.stringify(state))}catch(_e){}}
  window.showStarterGuideV199=showGuideV199;
  const oldReset=resetPack;resetPack=function(){const r=oldReset.apply(this,arguments);setTimeout(syncStarterV199,80);return r};
  const oldRenderMode=v114RenderMode;v114RenderMode=function(){const r=oldRenderMode.apply(this,arguments);setTimeout(syncStarterV199,0);return r};
  const oldSummary=showPackSummaryV88;showPackSummaryV88=function(){const r=oldSummary.apply(this,arguments);if(starter().tutorialPending&&!starter().tutorialShown)setTimeout(showGuideV199,850);return r};
  document.getElementById('v114PackMode')?.addEventListener('click',()=>setTimeout(syncStarterV199,80));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{syncStarterV199();if(starter().tutorialPending&&!starter().tutorialShown)setTimeout(showGuideV199,900)});else{syncStarterV199();if(starter().tutorialPending&&!starter().tutorialShown)setTimeout(showGuideV199,900)}
  // Extend the built-in health check without changing V195 internals.
  const audit=window.runSystemAuditV195;if(typeof audit==='function')window.runSystemAuditV195=function(){const r=audit();try{const s=starter(),valid=Number(s.total||0)===10&&Number(s.remaining||0)>=0&&Number(s.remaining||0)<=10;r.checks.push({name:'Starter bonus',ok:valid,detail:`${s.remaining||0}/10 free packs left • 1.5× hit boost • ${s.guaranteedHighAwarded||0}/2 guaranteed SIR+ awarded`,level:'fail'});r.failed=r.checks.filter(x=>!x.ok&&x.level!=='warn').length;r.warnings=r.checks.filter(x=>!x.ok&&x.level==='warn').length;r.passed=r.checks.length-r.failed-r.warnings}catch(_e){}return r};
  const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V199 STARTER BOOST';
 }catch(err){console.error('V199 starter bonus bootstrap',err)}
})();



/* ===== original script 42 id=v200-phone-compat-script ===== */

(()=>{try{
 if(window.__v200PhoneCompat)return;window.__v200PhoneCompat=true;
 const isLocal=location.protocol==='file:'||location.protocol==='content:'||location.protocol==='blob:';
 function escV200(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 function fallbackPackV200(set){
  set=set||window.sel||{};const a=set.a||'#5b55d9',b=set.b||'#243650',name=escV200(set.name||'Booster Pack');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1120" viewBox="0 0 720 1120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><radialGradient id="r"><stop stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><pattern id="p" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width="13" height="56" fill="#fff" opacity=".07"/></pattern></defs><rect width="720" height="1120" rx="42" fill="url(#g)"/><rect width="720" height="1120" rx="42" fill="url(#p)"/><circle cx="585" cy="190" r="240" fill="url(#r)"/><path d="M0 110 Q360 35 720 110M0 1010 Q360 1085 720 1010" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="18"/><rect x="54" y="112" width="612" height="82" rx="28" fill="#0b1422" fill-opacity=".48" stroke="#fff" stroke-opacity=".28"/><text x="360" y="165" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="34" fill="#fff">TCG PACK RIPPER+</text><text x="360" y="488" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="54" fill="#fff">${name}</text><text x="360" y="545" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="24" fill="#fff" opacity=".76">BOOSTER PACK</text><path d="M360 632 l44 72 84 18-58 63 9 85-79-35-79 35 9-85-58-63 84-18z" fill="#fff" opacity=".16"/><text x="360" y="946" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="19" fill="#fff" opacity=".72">LOCAL FALLBACK ART</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 }
 function applyFallbackV200(){
  const pack=document.getElementById('pack'),im=document.getElementById('packArt');if(!pack||!im)return;
  pack.classList.add('v200PackFallback');pack.style.setProperty('--v200a',sel?.a||'#5b55d9');pack.style.setProperty('--v200b',sel?.b||'#243650');
  im.onerror=null;im.onload=null;im.src=fallbackPackV200(sel);im.style.display='block';im.style.opacity='1';
  const msg=document.getElementById('fallbackPackMsg');if(msg)msg.textContent='';
 }
 const baseApply=typeof applyPackArt==='function'?applyPackArt:null;
 if(baseApply){applyPackArt=async function(){
   let finished=false;try{await baseApply.apply(this,arguments)}catch(_e){}
   const im=document.getElementById('packArt'),pack=document.getElementById('pack');
   const check=()=>{if(!im||!pack)return;if(pack.classList.contains('artFallback')||!im.complete||!im.naturalWidth)applyFallbackV200();else pack.classList.remove('v200PackFallback')};
   setTimeout(check,isLocal?900:2600);return finished;
 }}
 function ensureNoticeV200(){
  if(!isLocal)return;let n=document.getElementById('v200LocalNotice');if(n)return n;
  n=document.createElement('div');n.id='v200LocalNotice';n.innerHTML='<i>i</i><div><b>LOCAL PHONE FILE MODE</b><span>V200 can recover the starter save and uses built-in pack art if a phone blocks remote artwork. Real card data still needs internet access.</span></div><button type="button">HIDE</button>';
  document.body.appendChild(n);n.querySelector('button').onclick=()=>n.classList.remove('show');return n;
 }
 function syncFreshV200(){
  /* Recovery for the exact V199 failure mode: unplayed/partial local save showed $0. */
  const noProgress=typeof hasMeaningfulProgressV200==='function'?!hasMeaningfulProgressV200(state):Number(state.packs||0)===0;
  if(noProgress&&(!state.starterV199||Number(state.starterV199.used||0)===0)){
    state.coins=80;state.starterV199={eligible:true,total:10,remaining:10,used:0,hitBoost:1.5,guaranteedHighAwarded:0,tutorialShown:false,tutorialPending:false,startedAt:state.starterV199?.startedAt||Date.now(),freshRecoveryV200:true};
    try{save()}catch(_e){};try{syncStarterV199?.()}catch(_e){}
  }
  try{stats()}catch(_e){}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{syncFreshV200();if(isLocal){ensureNoticeV200()?.classList.add('show');setTimeout(()=>{try{applyPackArt()}catch(_e){applyFallbackV200()}},120)}});else{syncFreshV200();if(isLocal){ensureNoticeV200()?.classList.add('show');setTimeout(()=>{try{applyPackArt()}catch(_e){applyFallbackV200()}},120)}}
 const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V200 PHONE COMPAT';
}catch(err){console.error('V200 phone compatibility',err)}})();



/* ===== original script 43 id=v201-android-pack-selector-script ===== */

(()=>{try{
  if(window.__v201PackSelectorInstalled)return;window.__v201PackSelectorInstalled=true;
  const old=document.getElementById('v114PackMode');if(!old)return;
  /* Remove the stack of historical selector listeners and own this control from one final controller. */
  const mode=old.cloneNode(true);old.replaceWith(mode);
  mode.querySelectorAll('button[data-count]').forEach(b=>{b.type='button';b.setAttribute('role','button');b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false')});
  let lockUntil=0;
  function activelyOpeningV201(){
    const stage=document.getElementById('stage'),pack=document.getElementById('pack');
    return !!(stage?.classList.contains('cardModeV89')||stage?.classList.contains('v91Cinematic')||stage?.classList.contains('v114TenRipping')||pack?.classList.contains('v91Rip'));
  }
  function paintV201(next){
    mode.querySelectorAll('button[data-count]').forEach(b=>{
      const on=Number(b.dataset.count)===next;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  function chooseV201(raw){
    const next=Number(raw)===10?10:1;
    if(activelyOpeningV201())return false;
    /* A sealed, visible pack is a safe idle state even if an older controller left busy stale. */
    try{busy=false;pulls=[];idx=0;v114BatchGroups=[];v114PackCount=next}catch(_e){}
    paintV201(next);
    try{resetPack()}catch(_e){try{v114RenderMode()}catch(__){}}
    try{v114RenderMode()}catch(_e){}
    try{syncPackCreditV161()}catch(_e){}
    try{syncStarterV199()}catch(_e){}
    requestAnimationFrame(()=>paintV201(next));
    setTimeout(()=>paintV201(next),80);
    return true;
  }
  function take(e){
    const b=e.target?.closest?.('button[data-count]');if(!b)return;
    if(e.cancelable)e.preventDefault();e.stopPropagation();
    const now=Date.now();if(now<lockUntil)return;lockUntil=now+140;
    chooseV201(b.dataset.count);
  }
  /* Android sometimes loses pointerup after a composited transform; switch on pointerdown instead. */
  mode.addEventListener('pointerdown',take,{capture:true,passive:false});
  mode.addEventListener('touchend',take,{capture:true,passive:false});
  mode.addEventListener('click',take,{capture:true,passive:false});
  window.forcePackModeV201=chooseV201;
  window.forcePackModeV195=chooseV201;
  window.forcePackModeV193=chooseV201;
  const syncPos=()=>{try{paintV201(Number(v114PackCount)===10?10:1)}catch(_e){}};
  window.addEventListener('resize',syncPos,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(syncPos,80),{passive:true});
  syncPos();
  const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
  if(row?.querySelector('b'))row.querySelector('b').textContent='V201 ANDROID SELECTOR FIX';
}catch(err){console.error('V201 Android pack selector fix',err)}})();



/* ===== original script 44 id=v202-universal-pack-selector-script ===== */

(()=>{try{
  if(window.__v202PackSelectorInstalled)return;window.__v202PackSelectorInstalled=true;

  function installV202(){
    const source=document.getElementById('v114PackMode');if(!source)return;
    /* Clone one final time to remove every historical V114/V161/V171/V175/V193/V201
       direct listener. V202 is now the only direct owner of this control. */
    const marker=document.createComment('v202-pack-selector-home');
    source.parentNode?.insertBefore(marker,source);
    const mode=source.cloneNode(true);source.replaceWith(mode);
    mode.dataset.controller='v202';
    mode.querySelectorAll('button[data-count]').forEach(b=>{
      b.type='button';
      b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false');
      b.tabIndex=0;
    });

    const coarse=()=>{
      try{return matchMedia('(pointer:coarse)').matches||matchMedia('(any-pointer:coarse)').matches||innerWidth<=900}catch(_e){return innerWidth<=900}
    };
    function isRevealActive(){
      const stage=document.getElementById('stage');
      return !!(stage?.classList.contains('cardModeV89')||stage?.classList.contains('v91Cinematic')||stage?.classList.contains('v114TenRipping')||document.body.classList.contains('v129Cards')||document.body.classList.contains('v129Summary'));
    }
    function paint(next){
      mode.querySelectorAll('button[data-count]').forEach(b=>{
        const on=Number(b.dataset.count)===next;
        b.classList.toggle('active',on);
        b.setAttribute('aria-pressed',on?'true':'false');
      });
    }
    function current(){try{return Number(v114PackCount)===10?10:1}catch(_e){return 1}}
    function choose(raw,feedback=true){
      const next=Number(raw)===10?10:1;
      if(isRevealActive())return false;
      paint(next); // visual response must be immediate, before any legacy render work.
      try{busy=false}catch(_e){}
      try{pulls=[];idx=0;v114BatchGroups=[];v114PackCount=next}catch(_e){}
      try{
        const line=document.getElementById('v114TenLine'),stage=document.getElementById('stage');
        if(next===1&&line){line.innerHTML='';line.style.transform='translate(-50%,-50%)'}
        if(next===1)stage?.classList.remove('v114TenMode','v114TenRipping');
      }catch(_e){}
      try{resetPack()}catch(_e){}
      try{v114RenderMode()}catch(_e){}
      try{syncPackCreditV161()}catch(_e){}
      try{syncStarterV199()}catch(_e){}
      paint(next);
      requestAnimationFrame(()=>paint(next));
      setTimeout(()=>paint(next),40);
      setTimeout(()=>paint(next),180);
      if(feedback){try{navigator.vibrate?.(7)}catch(_e){}}
      return true;
    }

    let lastAt=0,lastValue=0;
    function eventButton(e){
      let b=e.target?.closest?.('button[data-count]');
      if(b&&mode.contains(b))return b;
      /* Fallback: the entire left/right half of the pill is also a hit target. */
      const r=mode.getBoundingClientRect();
      const p=e.touches?.[0]||e.changedTouches?.[0]||e;
      const x=Number(p?.clientX);
      if(Number.isFinite(x)&&x>=r.left&&x<=r.right){
        return mode.querySelector(`button[data-count="${x<r.left+r.width/2?1:10}"]`);
      }
      return null;
    }
    function take(e){
      const b=eventButton(e);if(!b)return;
      const next=Number(b.dataset.count)===10?10:1;
      const now=Date.now();
      if(now-lastAt<330&&lastValue===next){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation?.();return}
      lastAt=now;lastValue=next;
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation?.();e.stopPropagation?.();
      choose(next,true);
      try{b.blur()}catch(_e){}
    }

    /* Use the earliest reliable mobile event and keep click as a desktop/accessibility fallback. */
    if(window.PointerEvent)mode.addEventListener('pointerdown',take,{capture:true,passive:false});
    mode.addEventListener('touchstart',take,{capture:true,passive:false});
    mode.addEventListener('mousedown',e=>{if(e.pointerType)return;take(e)},{capture:true,passive:false});
    mode.addEventListener('click',take,{capture:true,passive:false});
    mode.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      const b=e.target?.closest?.('button[data-count]');if(!b)return;
      e.preventDefault();choose(b.dataset.count,true);
    },true);

    function place(){
      if(coarse()){
        if(mode.parentNode!==document.body)document.body.appendChild(mode);
        mode.classList.add('v202PackSelectorPortal');
      }else{
        mode.classList.remove('v202PackSelectorPortal');
        if(marker.parentNode&&mode.parentNode!==marker.parentNode)marker.parentNode.insertBefore(mode,marker.nextSibling);
      }
      syncVisible();
    }
    function syncVisible(){
      const rip=document.getElementById('rip');
      const visible=!!(rip?.classList.contains('active')&&!isRevealActive());
      document.body.classList.toggle('v202PackSelectorVisible',visible);
      paint(current());
    }
    function hitTest(){
      if(!mode.classList.contains('v202PackSelectorPortal')||!document.body.classList.contains('v202PackSelectorVisible'))return;
      const bs=[...mode.querySelectorAll('button[data-count]')];
      let ok=true;
      for(const b of bs){
        const r=b.getBoundingClientRect();if(!r.width||!r.height)continue;
        const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
        if(!(hit===b||b.contains(hit))){ok=false;break}
      }
      mode.dataset.hitTest=ok?'pass':'repair';
      if(!ok){
        /* Self-heal any newly created stacking context/overlay by re-appending at the end of body. */
        document.body.appendChild(mode);mode.style.zIndex='2147483646';
      }
    }

    window.forcePackModeV202=choose;
    window.forcePackModeV201=choose;
    window.forcePackModeV195=choose;
    window.forcePackModeV193=choose;

    const stage=document.getElementById('stage'),rip=document.getElementById('rip');
    if(stage)new MutationObserver(()=>{syncVisible();setTimeout(hitTest,0)}).observe(stage,{attributes:true,attributeFilter:['class']});
    if(rip)new MutationObserver(()=>{syncVisible();setTimeout(hitTest,0)}).observe(rip,{attributes:true,attributeFilter:['class']});
    const viewportSync=()=>{place();requestAnimationFrame(hitTest);setTimeout(hitTest,120)};
    window.addEventListener('resize',viewportSync,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(viewportSync,80),{passive:true});
    window.visualViewport?.addEventListener('resize',viewportSync,{passive:true});
    window.visualViewport?.addEventListener('scroll',()=>setTimeout(hitTest,0),{passive:true});

    place();paint(current());requestAnimationFrame(hitTest);setTimeout(hitTest,180);
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b'))row.querySelector('b').textContent='V202 UNIVERSAL SELECTOR';
  }

  /* V199's DOMContentLoaded listener creates the starter banner beside the original control.
     Install after it has run, then portal only the selector itself. */
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installV202,0),{once:true});
  else setTimeout(installV202,0);
}catch(err){console.error('V202 universal pack selector',err)}})();



/* ===== original script 45 id=v203-glass-selector-cleanup-script ===== */

(()=>{try{
  if(window.__v203GlassSelectorCleanup)return;window.__v203GlassSelectorCleanup=true;

  function removeNotice(){
    try{document.getElementById('v200LocalNotice')?.remove()}catch(_e){}
  }

  function syncBootSplash(){
    const splash=document.getElementById('bootSplashV104');
    const active=!!(splash && !splash.classList.contains('hide') && splash.isConnected);
    document.body.classList.toggle('v203BootSplashActive',active);
    if(!active) document.body.classList.remove('v203BootSplashActive');
  }

  function watchBootSplash(){
    syncBootSplash();
    const splash=document.getElementById('bootSplashV104');
    if(splash){
      new MutationObserver(syncBootSplash).observe(splash,{attributes:true,attributeFilter:['class']});
    }
    new MutationObserver(()=>{syncBootSplash();removeNotice()}).observe(document.body,{childList:true,subtree:true});
    setTimeout(syncBootSplash,300);
    setTimeout(syncBootSplash,1200);
    setTimeout(syncBootSplash,2100);
    setTimeout(syncBootSplash,2800);
  }

  function polishSelector(){
    const mode=document.getElementById('v114PackMode');
    if(!mode)return;
    mode.setAttribute('data-style','v203-glass');
    if(mode.classList.contains('v202PackSelectorPortal')) mode.style.willChange='transform,opacity';
  }

  function versionStamp(){
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b')) row.querySelector('b').textContent='V203 GLASS SELECTOR CLEANUP';
  }

  function initV203(){
    removeNotice();
    watchBootSplash();
    polishSelector();
    versionStamp();
    setTimeout(()=>{removeNotice();polishSelector();syncBootSplash()},0);
    setTimeout(()=>{removeNotice();polishSelector();syncBootSplash()},120);
    setTimeout(()=>{removeNotice();polishSelector();syncBootSplash()},500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initV203,{once:true});
  else initV203();
}catch(err){console.error('V203 glass selector cleanup',err)}})();



/* ===== original script 46 id=v204-opaque-glass-pill-script ===== */

(()=>{try{
  if(window.__v204OpaqueGlassPill)return;window.__v204OpaqueGlassPill=true;
  function stamp(){
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b')) row.querySelector('b').textContent='V204 OPAQUE GLASS PILL';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',stamp,{once:true});
  else stamp();
}catch(err){console.error('V204 opaque glass pill',err)}})();



/* ===== original script 47 id=v205-pearlescent-selector-script ===== */

(()=>{try{
  if(window.__v205PearlescentSelector)return;window.__v205PearlescentSelector=true;
  const stamp=()=>{
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b'))row.querySelector('b').textContent='V205 PEARLESCENT SELECTOR';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stamp,{once:true});else stamp();
}catch(err){console.error('V205 pearlescent selector',err)}})();



/* ===== original script 48 id=v206-pack-stage-cleanup-script ===== */

(()=>{try{
  if(window.__v206PackStageCleanup)return;window.__v206PackStageCleanup=true;
  const stamp=()=>{
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b')) row.querySelector('b').textContent='V206 PACK STAGE CLEANUP';
  };
  const syncTearRail=()=>{
    const pack=document.getElementById('pack');
    const guide=document.querySelector('#pack .tearGuide');
    const knob=document.getElementById('tear');
    if(!pack||!guide||!knob)return;
    const h=pack.getBoundingClientRect().height||0;
    if(!h)return;
    const cutPx=h*0.132;
    guide.style.top=cutPx+'px';
    knob.style.top=(cutPx-18)+'px';
  };
  const init=()=>{stamp();syncTearRail();};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.addEventListener('resize',syncTearRail,{passive:true});
}catch(err){console.error('V206 pack stage cleanup',err)}})();



/* ===== original script 49 id=v207-seamless-pack-script ===== */

(()=>{try{
  if(window.__v207SeamlessPack)return;window.__v207SeamlessPack=true;
  const CUT=.132;
  function sync(){
    const pack=document.getElementById('pack'),guide=document.querySelector('#pack .tearGuide'),knob=document.getElementById('tear');
    if(!pack||!guide||!knob)return;
    const h=pack.getBoundingClientRect().height;
    if(!h)return;
    const y=h*CUT;
    guide.style.setProperty('top',y+'px','important');
    knob.style.setProperty('top',(y-17)+'px','important');
  }
  function stamp(){
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b'))row.querySelector('b').textContent='V207 SEAMLESS PACK';
  }
  const init=()=>{stamp();sync();setTimeout(sync,50);setTimeout(sync,400)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('resize',sync,{passive:true});
  window.visualViewport?.addEventListener('resize',sync,{passive:true});
}catch(err){console.error('V207 seamless pack',err)}})();



/* ===== original script 50 id=v208-clean-pack-script ===== */

(()=>{try{
  if(window.__v208CleanPack)return; window.__v208CleanPack=true;
  const CUT=0.132;
  function stamp(){
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b')) row.querySelector('b').textContent='V208 CLEAN CUT PACK';
  }
  function sync(){
    const pack=document.getElementById('pack');
    const guide=document.querySelector('#pack .tearGuide');
    const knob=document.getElementById('tear');
    if(!pack||!guide||!knob) return;
    const h=pack.getBoundingClientRect().height||0;
    if(!h) return;
    const y=h*CUT;
    guide.style.setProperty('top',y+'px','important');
    knob.style.setProperty('top',(y-19)+'px','important');
    if(!(typeof drag!=='undefined' && drag)){
      knob.style.left='-18px';
      pack.style.setProperty('--v208-drag-ry','0deg');
      pack.style.setProperty('--v208-drag-rx','0deg');
      pack.style.setProperty('--v208-lift','0px');
    }
  }
  function travel(){
    const pack=document.getElementById('pack');
    const rect=pack?.getBoundingClientRect();
    if(!rect) return 205;
    return Math.max(160, rect.width-6);
  }
  down = window.down = function(e){
    let a=audio(); if(a&&a.state==='suspended') a.resume();
    if(busy) return;
    drag=true;
    let q=xy(e); startX=q.x; startY=q.y;
    const tear=document.getElementById('tear'), pack=document.getElementById('pack');
    tear?.classList.remove('pulse');
    pack?.classList.add('v91Grab');
    pack?.style.setProperty('--v208-lift','-1px'); pack?.style.setProperty('--v211-cut-width','0%');
    v142StartTear();
    if(e.cancelable) e.preventDefault();
  };
  move = window.move = function(e){
    if(!drag||busy) return;
    let q=xy(e), dx=q.x-startX, dy=q.y-startY, p=0;
    const pack=document.getElementById('pack'), tear=document.getElementById('tear');
    const tr=travel();
    if(openStyle===0) p=Math.max(0,Math.min(1,dx/tr));
    else if(openStyle===1) p=Math.max(0,Math.min(1,-dy/150));
    else p=Math.max(0,Math.min(1,(dx-dy)/260));
    document.getElementById('prog').style.width=(p*100)+'%'; if(pack)pack.style.setProperty('--v211-cut-width',(p*100)+'%');
    if(pack){
      pack.style.setProperty('--v208-drag-ry',`${Math.max(-7,Math.min(7,dx*.035))}deg`);
      pack.style.setProperty('--v208-drag-rx',`${Math.max(-5,Math.min(5,-dy*.028))}deg`);
      pack.style.setProperty('--v208-lift',`${-(1+p*2.5).toFixed(2)}px`);
    }
    if(openStyle===0){
      if(tear) tear.style.setProperty('left',(-18 + p*tr)+'px','important');
      v142SetTear(p);
    }else if(openStyle===1){
      if(tear) tear.style.transform=`translateY(${-p*125}px) rotate(${-p*25}deg)`;
      document.getElementById('foilTop').style.transform=`translateY(${-p*25}px) rotateX(${p*28}deg)`;
    }else{
      if(tear) tear.style.transform=`translate(${p*175}px,${-p*80}px) rotate(${p*35}deg)`;
      document.getElementById('foilTop').style.transform=`translate(${p*12}px,${-p*12}px) rotate(${p*5}deg)`;
    }
    if(e.cancelable) e.preventDefault();
    if(p>=.97){
      drag=false;
      if(pack){
        pack.style.setProperty('--v208-drag-ry','0deg');
        pack.style.setProperty('--v208-drag-rx','0deg');
        pack.style.setProperty('--v208-lift','-2px');
      }
      v142SetTear(1); v142CommitTear(); beginRip();
    }
  };
  up = window.up = function(){
    if(!drag) return;
    drag=false;
    const tear=document.getElementById('tear'), pack=document.getElementById('pack');
    if(tear){ tear.style.setProperty('left','-18px','important'); tear.style.transform=''; tear.classList.add('pulse'); }
    document.getElementById('prog').style.width='0';
    document.getElementById('foilTop').style.transform='';
    if(pack){
      pack.classList.remove('v91Grab');
      pack.style.setProperty('--v208-drag-ry','0deg');
      pack.style.setProperty('--v208-drag-rx','0deg');
      pack.style.setProperty('--v208-lift','0px');
      pack.style.setProperty('--v211-cut-width','0%');
      pack.style.transform='';
    }
    v142CancelTear();
  };
  const init=()=>{stamp();sync();setTimeout(sync,60);setTimeout(sync,420)};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.addEventListener('resize',sync,{passive:true});
  window.visualViewport?.addEventListener('resize',sync,{passive:true});
}catch(err){console.error('V208 clean pack',err)}})();



/* ===== original script 51 id=v209-premium-rip-polish-script ===== */

(()=>{try{
  if(window.__v209PremiumRipPolish)return;window.__v209PremiumRipPolish=true;
  const stamp=()=>{
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b'))row.querySelector('b').textContent='V209 PREMIUM RIP POLISH';
    const meta=document.querySelector('meta[name="tcg-cloud-build"]');
    if(meta)meta.setAttribute('content','V209-premium-rip-polish');
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stamp,{once:true});else stamp();
}catch(err){console.error('V209 premium rip polish',err)}})();



/* ===== original script 52 id=v210-boot-stability-script ===== */

(()=>{try{
 if(window.__v210BootStability)return;window.__v210BootStability=true;
 function dismissBoot(){const s=document.getElementById('bootSplashV104');if(!s)return;s.classList.add('hide','v210ForceGone');s.style.pointerEvents='none';setTimeout(()=>{try{s.remove()}catch(_e){}},80)}
 function syncPackGeometry(){try{const pack=document.getElementById('pack'),guide=document.querySelector('#pack .tearGuide'),knob=document.getElementById('tear');if(!pack||!guide||!knob)return;const h=pack.getBoundingClientRect().height||0;if(!h)return;const y=h*.132;guide.style.setProperty('top',y+'px','important');knob.style.setProperty('top',(y-18)+'px','important')}catch(_e){}}
 function stamp(){try{const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V210 BOOT STABILITY FIX';const meta=document.querySelector('meta[name="tcg-cloud-build"]');if(meta)meta.setAttribute('content','V210-boot-stability-fix')}catch(_e){}}
 function init(){stamp();syncPackGeometry();setTimeout(syncPackGeometry,120);setTimeout(syncPackGeometry,600);setTimeout(dismissBoot,1900);setTimeout(dismissBoot,2600)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('load',()=>setTimeout(dismissBoot,350),{once:true});
 window.addEventListener('resize',syncPackGeometry,{passive:true});
 window.visualViewport?.addEventListener('resize',syncPackGeometry,{passive:true});
 document.addEventListener('pointerdown',e=>{if(e.target?.closest?.('#bootSplashV104'))dismissBoot()},{capture:true,passive:true});
}catch(err){console.error('V210 boot stability',err)}})();



/* ===== original script 53 id=v211-pack-only-slider-script ===== */

(()=>{try{
  if(window.__v211PackOnlySlider)return;window.__v211PackOnlySlider=true;
  function stamp(){
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b'))row.querySelector('b').textContent='V211 PACK-ONLY SLIDER FIX';
    const meta=document.querySelector('meta[name="tcg-cloud-build"]');
    if(meta)meta.setAttribute('content','V211-pack-only-slider-fix');
  }
  function resetVisual(){
    const pack=document.getElementById('pack'),tear=document.getElementById('tear');
    if(pack)pack.style.setProperty('--v211-cut-width','0%');
    if(tear && !(typeof drag!=='undefined'&&drag))tear.style.setProperty('left','-18px','important');
  }
  const init=()=>{stamp();resetVisual();setTimeout(resetVisual,100);setTimeout(resetVisual,500)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('resize',resetVisual,{passive:true});
  window.visualViewport?.addEventListener('resize',resetVisual,{passive:true});
}catch(err){console.error('V211 pack-only slider',err)}})();



/* ===== original script 54 id=v212-pack-shine-tenpack-script ===== */

(()=>{try{
  if(window.__v212PackShineTenPack)return;
  window.__v212PackShineTenPack=true;

  function ensureSheen(){
    const pack=document.getElementById('pack');
    if(!pack)return;
    let sheen=pack.querySelector(':scope > .v212PackSheen');
    if(!sheen){
      sheen=document.createElement('div');
      sheen.className='v212PackSheen';
      sheen.setAttribute('aria-hidden','true');
      const gesture=pack.querySelector('#packGesture');
      if(gesture)pack.insertBefore(sheen,gesture);
      else pack.appendChild(sheen);
    }
  }

  function refreshTenFan(){
    try{
      if(typeof v114PackCount==='undefined'||v114PackCount!==10)return;
      const line=document.getElementById('v114TenLine');
      const main=document.getElementById('packArt');
      if(!line||!main)return;
      const src=main.currentSrc||main.src||'';
      line.querySelectorAll('.v114MiniPack img').forEach(img=>{
        if(src&&img.src!==src)img.src=src;
        img.style.visibility='visible';
        img.style.opacity='1';
      });
    }catch(_e){}
  }

  function stamp(){
    const row=[...document.querySelectorAll('.settingsDataLineV158')]
      .find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
    if(row?.querySelector('b'))row.querySelector('b').textContent='V212 PACK SHINE + TEN PACK';
    const meta=document.querySelector('meta[name="tcg-cloud-build"]');
    if(meta)meta.setAttribute('content','V212-pack-shine-ten-pack');
  }

  const init=()=>{
    ensureSheen();
    stamp();
    refreshTenFan();
    setTimeout(ensureSheen,100);
    setTimeout(refreshTenFan,140);
    setTimeout(refreshTenFan,550);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  document.getElementById('packArt')?.addEventListener('load',()=>setTimeout(refreshTenFan,0));
  document.getElementById('v114PackMode')?.addEventListener('pointerdown',()=>setTimeout(refreshTenFan,60),true);
  document.getElementById('sets')?.addEventListener('click',()=>[80,260,700].forEach(ms=>setTimeout(refreshTenFan,ms)),true);
}catch(err){console.error('V212 pack shine + ten-pack',err)}})();



/* ===== original script 55 id=v213-performance-script ===== */

(()=>{try{
 if(window.__v213Performance)return;window.__v213Performance=true;

 /* Warm the two hosts used constantly by the rip screen. */
 ['https://assets.tcgdex.net','https://api.tcgdex.net','https://images.sealeddex.com'].forEach(h=>{
   if(document.head.querySelector(`link[data-v213-preconnect="${h}"]`))return;
   const l=document.createElement('link');l.rel='preconnect';l.href=h;l.crossOrigin='anonymous';l.dataset.v213Preconnect=h;document.head.appendChild(l);
 });

 const seenImages=new Set();
 function preloadImg(src,priority='auto'){
   if(!src||seenImages.has(src))return;
   seenImages.add(src);
   const im=new Image();im.decoding='async';try{im.fetchPriority=priority}catch(_e){}im.src=src;
 }
 window.v213PreloadImg=preloadImg;

 function idle(fn,timeout=700){
   if('requestIdleCallback' in window)return requestIdleCallback(fn,{timeout});
   return setTimeout(fn,Math.min(timeout,220));
 }

 /* Pack art: begin the remote request immediately instead of waiting for IndexedDB first. */
 const oldApplyPackArt=applyPackArt;
 applyPackArt=async function(){
   const target=sel, p=document.getElementById('pack'), im=document.getElementById('packArt');
   if(!target||!p||!im)return oldApplyPackArt?.apply(this,arguments);
   const url=(OFFICIAL_PACK_ART[target.id]||[])[0]||'';
   packArtTry=0;p.classList.remove('artFallback');p.classList.add('officialPack');im.style.display='block';
   if(!url){p.classList.remove('officialPack');p.classList.add('artFallback');return}
   preloadImg(url,'high');
   let settled=false;
   const showRemote=()=>{if(sel.id!==target.id||settled)return;settled=true;im.onerror=()=>{im.onerror=null;p.classList.remove('officialPack');p.classList.add('artFallback')};im.onload=()=>{im.onload=null;idle(()=>cachePack(target.id,url),1300);try{window.refreshTenFanV212?.()}catch(_e){}};im.src=url};
   getCachedPack(target.id).then(blob=>{
     if(sel.id!==target.id||settled)return;
     if(blob){settled=true;if(packObjectURL){try{URL.revokeObjectURL(packObjectURL)}catch(_e){}}packObjectURL=URL.createObjectURL(blob);im.onerror=null;im.onload=()=>{try{window.refreshTenFanV212?.()}catch(_e){}};im.src=packObjectURL}
     else showRemote();
   }).catch(showRemote);
   /* Do not leave the pack blank while a slow IndexedDB transaction is deciding. */
   setTimeout(showRemote,45);
 };

 function preloadNearbyPacks(){
   try{
     const i=SETS.findIndex(s=>s.id===sel.id);
     [i-1,i+1,i+2].map(n=>SETS[n]).filter(s=>s&&setUnlocked(s)).forEach(s=>preloadImg((OFFICIAL_PACK_ART[s.id]||[])[0]));
   }catch(_e){}
 }

 /* Smart pack warming: no 40 card-detail calls during a 10-pack generation. */
 warmPack=function(out){
   out=Array.isArray(out)?out:[];
   if(!out.length)return out;
   const ten=(typeof v114PackCount!=='undefined'&&v114PackCount===10);
   /* v114MakeBatch calls makePack ten times. Skip the ten temporary 10-card warmups. */
   if(ten&&out.length===10)return out;
   const limit=ten?Math.min(16,out.length):Math.min(10,out.length);
   for(let i=0;i<limit;i++)preloadImg(out[i]?.thumb||out[i]?.img,i<4?'high':'auto');
   /* Detail/pricing requests are background work now, prioritising hits only. */
   idle(()=>{
     out.slice(0,ten?8:5).filter(c=>c&&(tier(c)>=2||c.secret)).forEach((c,i)=>setTimeout(()=>hydrateCard(c).catch(()=>{}),i*80));
   },900);
   return out;
 };

 function preloadWindow(from,count=7){
   for(let j=from;j<Math.min(pulls.length,from+count);j++){
     const c=pulls[j];if(!c)continue;
     preloadImg(c.thumb||c.img,j<from+3?'high':'auto');
     if(j<from+2&&(tier(c)>=2||c.secret))idle(()=>hydrateCard(c).catch(()=>{}),800);
   }
 }

 /* Reveal immediately from the set checklist thumbnail. Card-detail hydration can finish later. */
 showBack=function(autoReveal=false){
   const c=pulls[idx],img=document.getElementById('cardImg'),st=document.getElementById('stack');if(!c||!img||!st)return;
   st.className='cardStack show faceVisible flipped';st.style.transform='';st.style.opacity='1';st.dataset.faceReady='0';
   document.getElementById('stage').className='stage cardModeV89';document.getElementById('rarityBanner')?.classList.remove('show');document.getElementById('meta')?.classList.remove('show','hitDecision','flowOut');
   const counter=document.getElementById('counter');if(counter)counter.textContent=v114PackCount===10?`${Math.floor(idx/10)+1} / 10`:`${idx+1} / ${pulls.length}`;
   const instr=document.getElementById('instruction');if(instr)instr.textContent=v114PackCount===10?'Swipe through all 100 cards':'Swipe the card away to continue';
   const chip=document.getElementById('v74RouteChip');if(chip){chip.classList.remove('show');chip.textContent=''};

   const immediate=c.thumb||c.img||'';
   let fxDone=false;
   const runFx=()=>{if(fxDone)return;fxDone=true;st.dataset.faceReady='1';requestAnimationFrame(()=>{if(typeof v128PlayHero==='function'&&v128PlayHero(c)){try{sfxV67('card')}catch(_e){}}else applyRevealEffects(c,st)})};
   img.onload=runFx;img.onerror=runFx;
   if(immediate){if(img.src!==immediate)img.src=immediate;if(img.complete&&img.naturalWidth)runFx()}else runFx();

   const bulk=isBulkCardV64(c);if(chip){chip.textContent=bulk?'🗃️ AUTO → BULK TUB':'📘 AUTO → BINDER';chip.classList.add('show');setTimeout(()=>chip.classList.remove('show'),650)}
   preloadWindow(idx+1,8);
   updatePeekLayersV76();

   /* High-res/detail data upgrades quietly and never block the swipe. */
   idle(async()=>{
     try{
       await hydrateCard(c);
       if(!pulls[idx]||pulls[idx].id!==c.id)return;
       const hi=c.img||'';if(!hi||hi===img.src)return;
       const up=new Image();up.decoding='async';up.onload=()=>{if(pulls[idx]?.id===c.id)img.src=hi};up.src=hi;
     }catch(_e){}
   },1100);
 };

 /* Collection saves are debounced; expensive hidden-screen rerenders are not done on every single swipe. */
 let saveTimer=0,dirty=false;
 function scheduleSave(){dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,420)}
 function flushSave(){clearTimeout(saveTimer);saveTimer=0;if(!dirty)return;dirty=false;try{save()}catch(_e){}}
 window.v213FlushSave=flushSave;

 autoCollectV74=function(c){
   if(!c||window.v74CollectLock)return false;window.v74CollectLock=true;awardChase(c);
   if(isBulkCardV64(c)){addToBulkV64(c);try{sfxEventV70('bulkDrop')}catch(_e){}}
   else{addToBinderV64(c);try{sfxEventV70('binder')}catch(_e){}}
   scheduleSave();return true;
 };

 const oldDecide=decide;
 decide=function(keep){
   if(!keep)return oldDecide.apply(this,arguments);
   if(window.decisionLock)return;const c=pulls[idx];if(!c)return;window.decisionLock=true;awardChase(c);
   if(isBulkCardV64(c)){addToBulkV64(c);try{sfxEventV70('bulkDrop')}catch(_e){}}else{addToBinderV64(c);try{sfxEventV70('binder')}catch(_e){}}
   scheduleSave();const st=document.getElementById('stack');document.getElementById('meta')?.classList.add('flowOut');st?.classList.add('decisionOutKeep');
   if(navigator.vibrate)navigator.vibrate(8);setTimeout(()=>{window.decisionLock=false;document.getElementById('meta')?.classList.remove('flowOut','hitDecision');advance(true)},110);
 };

 /* Don't build image-heavy hidden screens while a pack is being ripped. */
 const rawRenderBinder=renderBinder;
 renderBinder=function(){
   if(document.getElementById('rip')?.classList.contains('active')&&!document.getElementById('binder')?.classList.contains('active'))return;
   return rawRenderBinder.apply(this,arguments);
 };
 const rawRenderBulk=window.renderBulkV64;
 if(typeof rawRenderBulk==='function')window.renderBulkV64=function(){
   if(document.getElementById('rip')?.classList.contains('active')&&!document.getElementById('bulk')?.classList.contains('active'))return;
   return rawRenderBulk.apply(this,arguments);
 };
 const rawRenderMaster=window.renderMasterV57;
 if(typeof rawRenderMaster==='function')window.renderMasterV57=function(){if(document.getElementById('rip')?.classList.contains('active')&&busy)return;return rawRenderMaster.apply(this,arguments)};
 const rawRenderMarket=window.renderMarketV57;
 if(typeof rawRenderMarket==='function')window.renderMarketV57=function(){if(document.getElementById('rip')?.classList.contains('active')&&busy)return;return rawRenderMarket.apply(this,arguments)};

 const rawSummary=showPackSummaryV88;
 showPackSummaryV88=function(best){flushSave();const r=rawSummary.apply(this,arguments);idle(()=>{try{renderSets()}catch(_e){}},700);return r};

 /* 10-pack generation: suppress repeated full save work; flush once after the batch exists. */
 const rawSave=save,rawBatch=v114MakeBatch;
 let batchSaving=false;
 save=function(){if(batchSaving){dirty=true;return}return rawSave.apply(this,arguments)};
 v114MakeBatch=async function(){batchSaving=true;try{return await rawBatch.apply(this,arguments)}finally{batchSaving=false;dirty=true;flushSave()}};

 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});
 window.addEventListener('pagehide',flushSave,{capture:true});

 function stamp(){
   const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
   if(row?.querySelector('b'))row.querySelector('b').textContent='V213 PERFORMANCE BOOST';
   const meta=document.querySelector('meta[name="tcg-cloud-build"]');if(meta)meta.setAttribute('content','V213-performance-boost');
 }
 const init=()=>{stamp();preloadNearbyPacks();setTimeout(preloadNearbyPacks,900)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 document.getElementById('sets')?.addEventListener('click',()=>setTimeout(preloadNearbyPacks,180),true);
}catch(err){console.error('V213 performance boost',err)}})();



/* ===== original script 56 id=v214-exact-hit-art-script ===== */

(()=>{try{
  if(window.__v214ExactHitArt)return;window.__v214ExactHitArt=true;
  const hero=document.getElementById('v128Hero');
  const heroImg=document.getElementById('v128HeroImg');
  const rare=document.getElementById('v128HeroRare');
  const meta=document.getElementById('v128HeroMeta');
  if(!hero||!heroImg)return;

  let revealSerial=0;
  let closeTimer=0,infoTimer=0;
  const transparent='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const cardKey=c=>`${c?.id||''}|${c?.set||''}|${c?.number||''}|${c?.name||''}`;

  function cleanHero(){
    clearTimeout(closeTimer);clearTimeout(infoTimer);
    hero.className='';
    hero.removeAttribute('data-card-key');
    document.body.classList.remove('v128Hero');
    window.v128HeroPlaying=false;
  }

  function launchExact(c,t,serial,src){
    if(serial!==revealSerial||!window.v128HeroPlaying)return;
    const key=cardKey(c);
    if(hero.dataset.cardKey!==key)return;
    let r=String(c.rarity||'SPECIAL HIT').toUpperCase();
    if(rare)rare.textContent=r;
    if(meta)meta.textContent=`${c.name} · #${c.number}${c.market>0?' · $'+Number(c.market).toFixed(2):''}`;
    hero.className='on'+(t>=5||c.secret?' chase v145Hyper':'');
    document.body.classList.add('v128Hero');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(serial!==revealSerial||hero.dataset.cardKey!==key)return;
      hero.classList.add('play');
      try{hitSound(Math.min(5,t))}catch(_e){}
      try{navigator.vibrate?.(t>=5?[24,45,38,55,70]:[18,28,30])}catch(_e){}
    }));
    infoTimer=setTimeout(()=>{if(serial===revealSerial&&hero.dataset.cardKey===key)hero.classList.add('info')},900);
    closeTimer=setTimeout(()=>{
      if(serial!==revealSerial||hero.dataset.cardKey!==key)return;
      cleanHero();
      try{updateAudioV68()}catch(_e){}
    },2200);
  }

  window.v128PlayHero=function(c){
    if(!c||window.v128HeroPlaying)return false;
    const t=typeof tier==='function'?tier(c):0;
    if(t<3&&!c.secret)return false;

    const src=String(c.img||c.thumb||'');
    if(!src)return false; // never reuse whatever happened to be in the hero image

    window.v128HeroPlaying=true;
    window.v124RareLockUntil=Date.now()+2600;
    const serial=++revealSerial;
    const key=cardKey(c);
    hero.dataset.cardKey=key;
    hero.className='v214Preparing';
    document.body.classList.remove('v128Hero');

    /* Blank the actual hero element first so stale pixels can never flash. */
    try{heroImg.removeAttribute('src')}catch(_e){}
    heroImg.src=transparent;

    const pre=new Image();
    pre.decoding='async';
    let settled=false;
    const ready=async()=>{
      if(settled)return;settled=true;
      if(serial!==revealSerial||hero.dataset.cardKey!==key)return;
      try{if(pre.decode)await pre.decode()}catch(_e){}
      if(serial!==revealSerial||hero.dataset.cardKey!==key)return;
      heroImg.src=src;
      heroImg.dataset.cardKey=key;
      /* Wait one paint with the exact new bitmap assigned before exposing the cinematic. */
      requestAnimationFrame(()=>requestAnimationFrame(()=>launchExact(c,t,serial,src)));
    };
    pre.onload=ready;
    pre.onerror=()=>{
      if(settled)return;settled=true;
      /* If the high image fails, try the thumbnail only if it is a different URL. */
      const fallback=String(c.thumb||'');
      if(fallback&&fallback!==src&&serial===revealSerial){
        const fb=new Image();fb.decoding='async';fb.onload=async()=>{
          if(serial!==revealSerial||hero.dataset.cardKey!==key)return;
          try{if(fb.decode)await fb.decode()}catch(_e){}
          heroImg.src=fallback;heroImg.dataset.cardKey=key;
          requestAnimationFrame(()=>requestAnimationFrame(()=>launchExact(c,t,serial,fallback)));
        };
        fb.onerror=()=>{if(serial===revealSerial)cleanHero()};
        fb.src=fallback;
      }else if(serial===revealSerial)cleanHero();
    };
    pre.src=src;
    return true;
  };

  /* Clear any stale cinematic if a new pack/reset forcibly changes scenes. */
  const stage=document.getElementById('stage');
  if(stage)new MutationObserver(()=>{
    if(window.v128HeroPlaying&&stage.classList.contains('v91Cinematic')){
      revealSerial++;cleanHero();
    }
  }).observe(stage,{attributes:true,attributeFilter:['class']});

  const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
  if(row?.querySelector('b'))row.querySelector('b').textContent='V214 EXACT HIT ART';
  const metaBuild=document.querySelector('meta[name="tcg-cloud-build"]');
  if(metaBuild)metaBuild.setAttribute('content','V214-exact-hit-art');
}catch(err){console.error('V214 exact hit art',err)}})();



/* ===== original script 57 id=v215-instant-set-switch-script ===== */

(()=>{try{
 if(window.__v215InstantSetSwitch)return;window.__v215InstantSetSwitch=true;

 const packWarm=new Map();
 const logoWarm=new Set();
 let switchSerial=0;
 let warmAllStarted=false;

 function packUrlFor(s){return s?((OFFICIAL_PACK_ART[s.id]||[])[0]||''):''}
 function warmImage(url,priority='auto'){
   if(!url)return Promise.resolve(false);
   if(packWarm.has(url))return packWarm.get(url).promise;
   let resolve;
   const promise=new Promise(r=>resolve=r);
   const im=new Image();
   try{im.decoding='async';im.fetchPriority=priority}catch(_e){}
   const entry={im,promise,ready:false,ok:false};packWarm.set(url,entry);
   const done=ok=>{entry.ready=true;entry.ok=ok;resolve(ok)};
   im.onload=()=>done(true);im.onerror=()=>done(false);im.src=url;
   if(im.complete&&im.naturalWidth)done(true);
   return promise;
 }
 function warmLogo(s){
   if(!s)return;const u=logo(s);if(!u||logoWarm.has(u))return;logoWarm.add(u);
   const im=new Image();im.decoding='async';im.src=u;
 }
 function warmSet(s,priority='auto'){
   if(!s||!setUnlocked(s))return;
   warmImage(packUrlFor(s),priority);warmLogo(s);
 }
 function orderedSets(){
   return [...SETS].map((s,i)=>({s,i})).sort((a,b)=>(Number(a.s.unlock||99)-Number(b.s.unlock||99))||(a.i-b.i)).map(x=>x.s);
 }
 function warmAround(s){
   const a=orderedSets(),i=a.findIndex(x=>x.id===s?.id);if(i<0)return;
   [0,-1,1,-2,2,-3,3].forEach((off,n)=>{const x=a[i+off];if(x)warmSet(x,n<3?'high':'auto')});
 }
 function warmAllUnlocked(){
   if(warmAllStarted)return;warmAllStarted=true;
   const a=orderedSets().filter(s=>setUnlocked(s));let i=0;
   const next=()=>{if(i>=a.length)return;warmSet(a[i++]);setTimeout(next,90)};
   setTimeout(next,350);
 }

 function paintTenFan(url){
   if(!url)return;
   document.querySelectorAll('#v114TenLine .v114MiniPack img').forEach(img=>{
     if(img.getAttribute('src')!==url)img.src=url;
     img.style.visibility='visible';img.style.opacity='1';
   });
 }

 /* Perceived-instant art swap: keep the old booster on screen while the new image finishes. */
 const previousApply=applyPackArt;
 applyPackArt=function(){
   const target=sel,pack=document.getElementById('pack'),img=document.getElementById('packArt');
   if(!target||!pack||!img)return previousApply?.apply(this,arguments);
   const url=packUrlFor(target),token=++switchSerial,setId=target.id;
   if(!url)return previousApply?.apply(this,arguments);
   pack.dataset.packArtSet=setId;pack.classList.add('officialPack','v215SetChanging');pack.classList.remove('artFallback');
   img.style.display='block';
   warmSet(target,'high');warmAround(target);
   const commit=()=>{
     if(token!==switchSerial||sel?.id!==setId)return;
     const entry=packWarm.get(url);
     if(entry&&!entry.ok&&entry.ready){pack.classList.remove('v215SetChanging');previousApply?.call(window);return}
     img.onerror=()=>{if(token!==switchSerial)return;pack.classList.remove('v215SetChanging');previousApply?.call(window)};
     img.onload=()=>{
       if(token!==switchSerial||sel?.id!==setId)return;
       pack.classList.remove('v215SetChanging');
       img.classList.remove('v215SetPop');void img.offsetWidth;img.classList.add('v215SetPop');
       paintTenFan(url);
       setTimeout(()=>img.classList.remove('v215SetPop'),190);
     };
     if(img.currentSrc===url||img.src===url){pack.classList.remove('v215SetChanging');paintTenFan(url);return}
     img.src=url;
     if(img.complete&&img.naturalWidth)img.onload?.();
   };
   const e=packWarm.get(url);
   if(e?.ready&&e.ok){commit();return Promise.resolve()}
   /* If browser cache already has it, this usually resolves in the same frame. */
   warmImage(url,'high').then(()=>commit());
   /* Do not leave an old image dimmed if the network is genuinely slow. */
   setTimeout(()=>{if(token===switchSerial)pack.classList.remove('v215SetChanging')},260);
   return Promise.resolve();
 };

 function setTileSelected(tile,s){
   const rail=document.getElementById('sets');if(!rail)return;
   rail.querySelectorAll('.set.selected').forEach(x=>{if(x!==tile)x.classList.remove('selected')});
   tile.classList.add('selected','v215SetTap','v215SelectedFlash');
   setTimeout(()=>tile.classList.remove('v215SetTap','v215SelectedFlash'),210);
   /* Centre quickly without waiting for the browser's long smooth-scroll animation. */
   const rr=rail.getBoundingClientRect(),tr=tile.getBoundingClientRect();
   const delta=(tr.left+tr.width/2)-(rr.left+rr.width/2);
   if(Math.abs(delta)>2)rail.scrollBy({left:delta,behavior:'auto'});
 }
 function backgroundWarmCards(s){
   const run=()=>{try{getSet(s).catch(()=>{})}catch(_e){}};
   if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:700});else setTimeout(run,160);
 }
 function fastSelect(s,tile){
   if(!s||busy)return;
   if(!setUnlocked(s)){showSetRequirements(s);return}
   if(sel?.id===s.id){setTileSelected(tile,s);warmAround(s);return}
   sel=s;
   setTileSelected(tile,s);
   /* resetPack is local-only and cheap; run immediately so the UI never feels stuck. */
   resetPack();
   applyPackArt();
   warmAround(s);
   backgroundWarmCards(s);
   try{navigator.vibrate?.(6)}catch(_e){}
 }

 /* Intercept before the legacy tile onclick, which rebuilds every set card + Master progress. */
 const rail=document.getElementById('sets');
 if(rail){
   rail.addEventListener('click',e=>{
     const tile=e.target.closest('.set[data-set-id]');
     if(!tile||e.target.closest('.setReqBtn'))return;
     const s=SETS.find(x=>x.id===tile.dataset.setId);if(!s)return;
     e.preventDefault();e.stopImmediatePropagation();
     fastSelect(s,tile);
   },true);
   rail.addEventListener('pointerdown',e=>{
     const tile=e.target.closest('.set[data-set-id]');if(!tile)return;
     const s=SETS.find(x=>x.id===tile.dataset.setId);if(s)warmSet(s,'high');
   },{capture:true,passive:true});
   let scrollTimer=0;
   rail.addEventListener('scroll',()=>{
     clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{
       const rr=rail.getBoundingClientRect();
       [...rail.querySelectorAll('.set[data-set-id]')].filter(t=>{const r=t.getBoundingClientRect();return r.right>rr.left-130&&r.left<rr.right+130}).forEach(t=>{
         const s=SETS.find(x=>x.id===t.dataset.setId);if(s)warmSet(s);
       });
     },60);
   },{passive:true});
 }

 function stamp(){
   const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
   if(row?.querySelector('b'))row.querySelector('b').textContent='V215 INSTANT SET SWITCH';
   const meta=document.querySelector('meta[name="tcg-cloud-build"]');if(meta)meta.setAttribute('content','V215-instant-set-switch');
 }
 function init(){stamp();warmAround(sel);warmAllUnlocked();setTimeout(()=>warmAround(sel),120)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}catch(err){console.error('V215 instant set switch',err)}})();



/* ===== original script 58 id=v216-economy-hotfix-script ===== */

(()=>{try{
  if(window.__v216EconomyHotfix)return;
  window.__v216EconomyHotfix=true;

  const MAX_RATIO_V216=1.25;
  const RESET_PARAM_V216='economyfix';
  const RESET_TARGET_V216=400;

  function liveMarketV216(c){
    try{
      if(!c)return .1;
      if(c.sourceType==='slab'||c.kind==='slab'){
        const j=c.sourceRef||c.slab||c;
        if(typeof gradedValueV56==='function')return Math.max(.1,Number(gradedValueV56(j)||.1));
      }
      const raw=c.sourceRef||c.card||c;
      if(typeof sellPrice==='function')return Math.max(.1,Number(sellPrice(raw)||raw.market||.1));
      return Math.max(.1,Number(raw.market||.1));
    }catch(_e){return Math.max(.1,Number(c?.market||.1))}
  }
  function maxAskV216(c){return Math.max(.1,Math.round(liveMarketV216(c)*MAX_RATIO_V216*100)/100)}

  /* Replace the old sale curve. Above 125% of live value: impossible to sell. */
  marketScoreV57=function(l){
    const market=Math.max(.1,Number(l?.market||.1));
    const ratio=Number(l?.ask||0)/market;
    if(ratio>MAX_RATIO_V216)return 0;
    if(ratio<=.80)return .66;
    if(ratio<=.90)return .50;
    if(ratio<=1.00)return .31;
    if(ratio<=1.08)return .14;
    if(ratio<=1.15)return .060;
    if(ratio<=1.20)return .020;
    return .004;
  };

  /* Enforce the cap at the actual listing action, not only in the UI. */
  const originalCreateListingV216=createListingV57;
  createListingV57=function(){
    const c=marketPickV57;
    if(!c)return originalCreateListingV216();
    const input=document.getElementById('marketPriceV57');
    const ask=Math.max(.1,Number(input?.value||0));
    const market=liveMarketV216(c),cap=maxAskV216(c);
    if(ask>cap+0.0001){
      if(input){input.value=cap.toFixed(2);input.max=cap.toFixed(2)}
      toast(`Max ask is $${cap.toFixed(2)} — 125% of live market ($${market.toFixed(2)}).`);
      try{navigator.vibrate?.([12,35,12])}catch(_e){}
      return;
    }
    return originalCreateListingV216();
  };

  function syncListingLimitV216(){
    try{
      const input=document.getElementById('marketPriceV57');
      const c=marketPickV57;
      if(!input||!c)return;
      const market=liveMarketV216(c),cap=maxAskV216(c);
      input.max=cap.toFixed(2);
      let note=document.querySelector('.marketPriceBlockV156 .v216MarketLimit');
      if(!note){
        note=document.createElement('small');
        note.className='v216MarketLimit';
        document.querySelector('.marketPriceBlockV156')?.appendChild(note);
      }
      if(note)note.innerHTML=`Live market <strong>$${market.toFixed(2)}</strong> • max ask <strong>$${cap.toFixed(2)}</strong>`;
    }catch(_e){}
  }

  /* Clamp any old exploit listings so they cannot pay out later. */
  function migrateListingsV216(){
    let changed=0;
    const a=state?.marketV57?.listings||[];
    for(const l of a){
      const base=Math.max(.1,Number(l.market||.1));
      const cap=Math.round(base*MAX_RATIO_V216*100)/100;
      if(Number(l.ask||0)>cap){l.ask=cap;l.economyAdjustedV216=true;changed++}
    }
    if(changed){try{save()}catch(_e){localStorage.setItem('tcgRipperSave',JSON.stringify(state))}}
    return changed;
  }

  /* Targeted reset: only a player who opens ?economyfix=400 receives it, once. */
  function applyTargetedResetV216(){
    let params;
    try{params=new URLSearchParams(location.search)}catch(_e){return false}
    if(params.get(RESET_PARAM_V216)!==String(RESET_TARGET_V216))return false;
    state.economyV216=state.economyV216||{};
    if(state.economyV216.targetedReset400Applied)return false;
    const before=Number(state.coins||0);
    state.coins=RESET_TARGET_V216;
    state.economyV216.targetedReset400Applied=true;
    state.economyV216.targetedReset400At=Date.now();
    state.economyV216.targetedResetPreviousBalance=before;
    migrateListingsV216();
    try{save()}catch(_e){localStorage.setItem('tcgRipperSave',JSON.stringify(state))}
    setTimeout(()=>toast(`Economy correction applied • balance reset to $${RESET_TARGET_V216.toFixed(2)}`),450);
    try{
      params.delete(RESET_PARAM_V216);
      const clean=location.pathname+(params.toString()?`?${params}`:'')+location.hash;
      history.replaceState(null,'',clean);
    }catch(_e){}
    return true;
  }

  function stampV216(){
    try{
      const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
      if(row?.querySelector('b'))row.querySelector('b').textContent='V216 ECONOMY HOTFIX';
      const meta=document.querySelector('meta[name="tcg-cloud-build"]');
      if(meta)meta.setAttribute('content','V216-economy-hotfix');
    }catch(_e){}
  }

  function initV216(){
    stampV216();
    migrateListingsV216();
    applyTargetedResetV216();
    syncListingLimitV216();
    setTimeout(syncListingLimitV216,80);
    setTimeout(syncListingLimitV216,350);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#marketCreateV57,[data-market-card-index-v157],[data-market-source-v157]'))setTimeout(syncListingLimitV216,0);
  },true);
  document.addEventListener('input',e=>{
    if(e.target?.id==='marketPriceV57'){
      syncListingLimitV216();
      const cap=Number(e.target.max||0);
      if(cap&&Number(e.target.value)>cap)e.target.setCustomValidity(`Maximum asking price is $${cap.toFixed(2)}`);
      else e.target.setCustomValidity('');
    }
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initV216,{once:true});
  else initV216();
}catch(err){console.error('V216 economy hotfix',err)}})();



/* ===== original script 59 id=v217-ios-specials-script ===== */

(()=>{try{
 if(window.__v217IOSSpecials)return;window.__v217IOSSpecials=true;
 const ua=navigator.userAgent||'';
 const ios=/iP(hone|ad|od)/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(ios)document.documentElement.classList.add('v217IOSSpecialLite');
 const base=window.setBinderModeV147;
 if(typeof base==='function')window.setBinderModeV147=function(mode){
   const r=base.apply(this,arguments);
   if(mode==='specials'){
     setTimeout(()=>{try{window.scrollTo(0,0)}catch(_e){}},0);
   }else if(ios){
     setTimeout(()=>{try{document.querySelectorAll('#specialGridV198 img[data-v217-special-img]').forEach(img=>img.removeAttribute('src'))}catch(_e){}},120);
   }
   return r;
 };
 const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');
 if(row?.querySelector('b'))row.querySelector('b').textContent='V217 IOS SPECIALS STABILITY';
 const meta=document.querySelector('meta[name="tcg-cloud-build"]');if(meta)meta.setAttribute('content','V217-ios-specials-stability');
}catch(err){console.error('V217 iOS Specials stability',err)}})();

