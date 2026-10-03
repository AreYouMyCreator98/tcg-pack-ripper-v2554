export function installRipStudio(target=window,doc=document){
 if(target.tcgRipStudio)return target.tcgRipStudio;
 const root=doc.getElementById('rip'),bridge=target.TCG_PACK_LEGACY;if(!root||!bridge)return;
 const $=id=>doc.getElementById(id),stage=$('stage'),shelf=$('studioSetDrawer');let queued=false,opening=false;
 // An equivalent tap/keyboard route for the physical extraction gesture.
 const extract=$('v128Extract');
 if(extract&&!$('studioExtract')){
   const button=doc.createElement('button');button.id='studioExtract';button.type='button';button.textContent='Pull cards out';
   let press=null;
   button.addEventListener('pointerdown',event=>{press={x:event.clientX,y:event.clientY};event.stopPropagation();});
   const pullOut=()=>{
     if(!extract.classList.contains('on')||extract.classList.contains('go'))return;
     extract.classList.add('go');button.disabled=true;
     const token=Number(extract.dataset.token);
     setTimeout(()=>{extract.classList.remove('on','go');extract.querySelector('.v128Cards').style.transform='';extract.dataset.done='1';target.finishRip(token);button.disabled=false;},620);
   };
   button.addEventListener('pointerup',event=>{const start=press;press=null;if(start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<12)pullOut();});
   button.addEventListener('pointercancel',()=>{press=null;});
   button.addEventListener('click',pullOut);
   doc.body.appendChild(button);
 }
 const collect=doc.createElement('button');collect.id='studioCollect';collect.type='button';collect.textContent='Collect card →';collect.addEventListener('click',()=>bridge.collectCurrent?.());doc.body.appendChild(collect);
 const sync=()=>{
   const s=bridge.snapshot();
   $('studioSetName').textContent=s.set.name||'Choose your next discovery';
   $('studioSetSeries').textContent=({sv:'SCARLET & VIOLET',swsh:'SWORD & SHIELD',sm:'SUN & MOON',xy:'XY'})[s.set.series]||s.set.series||'THE PACK ROOM';
   $('studioPackCount').textContent=s.mode===10?'TEN PACK SESSION':'SINGLE PACK SESSION';
   $('studioOpenPack').textContent=s.mode===10?'Open 10 packs':'Open pack';
   $('studioPackPayment').textContent=s.starterRemaining>0?`${s.starterRemaining} starter packs available`:s.credits>0?`${s.credits} set credits available`:'Uses your in-game balance';
   const active=!!s.busy||opening;
   $('studioOpenPack').disabled=active||!!target.tcgCloudV192?.hubHeld||$('loading')?.classList.contains('show');
   $('studioChooseSet').disabled=active;root.classList.toggle('studio-opening',active);
   doc.body.classList.toggle('collector-pack-opening',active&&root.classList.contains('active'));
   doc.body.classList.toggle('collector-extract-open',!!extract?.classList.contains('on'));
   doc.body.classList.toggle('collector-card-open',active&&root.classList.contains('active')&&stage.classList.contains('cardModeV89'));
   doc.body.classList.toggle('collector-hero-open',!!$('v128Hero')?.classList.contains('on'));
   const art=$('packArt')?.getAttribute('src')||'';
   if(art&&$('studioPackBackdrop').getAttribute('src')!==art){$('studioPackBackdrop').src=art;doc.documentElement.style.setProperty('--studio-pack-art',`url(${JSON.stringify(art)})`);}
   const current=$('sets').querySelector('.set.selected');$('studioSetProgress').textContent=current?.querySelector('small')?.textContent||'Every expansion. Every discovery.';
   filter();
   for(const tile of $('sets').children){tile.tabIndex=0;tile.setAttribute('role','button');tile.setAttribute('aria-label',`${tile.querySelector('b')?.textContent||'Expansion'}${tile.classList.contains('locked')?' — locked, view requirements':''}`);}
 };
 const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;sync();});};
 function filter(){const q=$('studioSetSearch').value.trim().toLowerCase();let count=0;for(const tile of $('sets').children){const show=!q||tile.textContent.toLowerCase().includes(q);tile.hidden=!show;if(show)count++;}$('studioSetCount').textContent=`${count} expansions`;}
 function close(){shelf.hidden=true;$('studioChooseSet').setAttribute('aria-expanded','false');$('studioChooseSet').focus();}
 $('studioChooseSet').addEventListener('click',()=>{shelf.hidden=false;$('studioChooseSet').setAttribute('aria-expanded','true');$('studioSetSearch').focus();});
 $('studioCloseSets').addEventListener('click',close);$('studioSetShade').addEventListener('click',close);$('studioSetSearch').addEventListener('input',filter);
 shelf.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}if(event.key==='Tab'){const list=[...shelf.querySelectorAll('button,input,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);const first=list[0],last=list.at(-1);if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}}});
 $('sets').addEventListener('keydown',event=>{if(event.target.matches('.set')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.target.click();}});
 $('sets').addEventListener('click',event=>{if(event.target.closest('.set button')||event.target.closest('.set.locked'))close();},true);
 $('sets').addEventListener('click',event=>{const tile=event.target.closest('.set');if(tile&&!tile.classList.contains('locked'))close();schedule();});
 $('studioOpenPack').addEventListener('click',async()=>{if(opening||bridge.snapshot().busy||target.tcgCloudV192?.hubHeld)return;opening=true;sync();try{await bridge.begin();}catch(error){target.toast?.(error.message||'Could not open pack.');}finally{opening=false;schedule();}});
 const observer=new target.MutationObserver(schedule);observer.observe($('packArt'),{attributes:true,attributeFilter:['src']});observer.observe(stage,{attributes:true,attributeFilter:['class'],childList:true});observer.observe($('sets'),{childList:true});
 for(const node of [extract,$('v128Hero')].filter(Boolean))observer.observe(node,{attributes:true,attributeFilter:['class']});
 doc.addEventListener('click',event=>{if(event.target.closest('.nav,[data-count]'))schedule();});
 for(const event of ['tcg:card-reveal','tcg:pack-summary','tcg:pack-generated','tcg:app-ready'])target.addEventListener(event,schedule);
 sync();return target.tcgRipStudio={refresh:sync};
}
