
/* ===== original script 71 id=v232-binder-image-reliability-script ===== */

(()=>{
 const ua=String(navigator.userAgent||'');
 const APPLE_ART_V234=/iPhone|iPad|iPod/i.test(ua)||/FBAN|FBAV|FBIOS|Messenger/i.test(ua);
 const queue=[];let active=0;const MAX_ACTIVE=APPLE_ART_V234?2:3;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const uniq=a=>[...new Set(a.filter(Boolean))];
 const PTCG_SET_V234={
  'sv04.5':'sv4pt5','sv08':'sv8','sv03':'sv3','sv02':'sv2','sv01':'sv1','sv07':'sv7','sv06.5':'sv6pt5','sv06':'sv6','sv05':'sv5','sv04':'sv4','sv03.5':'sv3pt5','sv09':'sv9','sv10':'sv10',
  'swsh12.5':'swsh12pt5','swsh4.5':'swsh45','swsh12':'swsh12','swsh11':'swsh11','swsh10':'swsh10','swsh9':'swsh9','swsh8':'swsh8','swsh7':'swsh7','swsh6':'swsh6','swsh5':'swsh5','swsh4':'swsh4','swsh3':'swsh3','swsh2':'swsh2','swsh1':'swsh1',
  'sm12':'sm12','sm11.5':'sm115','sm9':'sm9','xy12':'xy12','xy6':'xy6',
  'swsh12.5gg':'swsh12pt5gg','swsh4.5sv':'swsh45sv','swsh9.5tg':'swsh9tg','swsh9tg':'swsh9tg','swsh10.5tg':'swsh10tg','swsh10tg':'swsh10tg','swsh11.5tg':'swsh11tg','swsh11tg':'swsh11tg','swsh12.5tg':'swsh12tg','swsh12tg':'swsh12tg'
 };
 function cleanUrl(u){return String(u||'').trim().replace(/[?&]_art_retry=[^&]+/g,'').replace(/[?&]$/,'').replace(/\.(high|low)\.(webp|png|jpg)(?=$|\?)/i,'/$1.$2')}
 function isCardBackUrl(u){u=cleanUrl(u).toLowerCase();return !u||/\/back(?:\.|\/|$)/.test(u)||/pokemon[-_ ]?back/.test(u)||/card[-_ ]?back/.test(u)||u.includes('/base1/back.png')}
 function validArtUrl(u){u=cleanUrl(u);return !!u&&!isCardBackUrl(u)}
 function tcgBase(u){u=cleanUrl(u).split('?')[0];const m=u.match(/^(https:\/\/assets\.tcgdex\.net\/.+?)\/(?:high|low)\.(?:webp|png|jpg)$/i);if(m)return m[1];if(/^https:\/\/assets\.tcgdex\.net\//i.test(u)&&!/\.(?:webp|png|jpg)$/i.test(u))return u.replace(/\/$/,'');return''}
 function tcgVariant(u,q,ext='webp'){const b=tcgBase(u);return b?`${b}/${q}.${ext}`:cleanUrl(u)}
 function mappedSet(c){const raw=String(c?._subsetId||c?.setId||c?._parentSetId||'');return PTCG_SET_V234[raw]||PTCG_SET_V234[String(c?._parentSetId||'')]||''}
 function mappedNumber(c){let n=String(c?.number||c?.localId||'').trim();if(!n&&c?.id){const s=String(c.id),i=s.lastIndexOf('-');if(i>=0)n=s.slice(i+1)}return n}
 function pokemonCdn(c,high=false){const s=mappedSet(c),n=mappedNumber(c);if(!s||!n)return'';return `https://images.pokemontcg.io/${encodeURIComponent(s)}/${encodeURIComponent(n)}${high?'_hires':''}.png`}
 function candidates(c,preferHigh=false){
   const roots=uniq([cleanUrl(c?._artGoodV232),cleanUrl(c?.thumb),cleanUrl(c?.img)].filter(validArtUrl));
   const lowWebp=uniq(roots.map(u=>tcgVariant(u,'low','webp'))),lowPng=uniq(roots.map(u=>tcgVariant(u,'low','png'))),lowJpg=uniq(roots.map(u=>tcgVariant(u,'low','jpg')));
   const highWebp=uniq(roots.map(u=>tcgVariant(u,'high','webp'))),highPng=uniq(roots.map(u=>tcgVariant(u,'high','png'))),highJpg=uniq(roots.map(u=>tcgVariant(u,'high','jpg')));
   const altLow=pokemonCdn(c,false),altHigh=pokemonCdn(c,true);
   if(APPLE_ART_V234)return preferHigh?uniq([altHigh,...highPng,...highJpg,...highWebp,altLow,...lowPng,...lowJpg,...lowWebp]):uniq([altLow,...lowPng,...lowJpg,...lowWebp,altHigh,...highPng,...highJpg,...highWebp]);
   return preferHigh?uniq([...highWebp,...highPng,altHigh,...highJpg,...lowWebp,...lowPng,altLow,...lowJpg]):uniq([...lowWebp,...lowPng,altLow,...lowJpg,...highWebp,...highPng,altHigh,...highJpg]);
 }
 const repairPromisesV236=new Map();
 function normText(s){return String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'')}
 function actualSetIds(c){
   const out=[];const add=v=>{v=String(v||'').trim();if(v&&!out.includes(v))out.push(v)};
   add(c?._subsetId);if(c?.id){const s=String(c.id),i=s.lastIndexOf('-');if(i>0)add(s.slice(0,i))}add(c?.setId);add(c?._parentSetId);
   try{add(masterResolveSetV66Early(c))}catch(_){}
   return out;
 }
 function actualNumber(c){let n=String(c?.number||c?.localId||'').trim();if(!n&&c?.id){const s=String(c.id),i=s.lastIndexOf('-');if(i>=0)n=s.slice(i+1)}return n}
 function applyRecoveredDetail(c,x,keepParent=true){
   if(!c||!x)return false;const parent=c._parentSetId,parentName=c._parentSetName,subset=c._subsetId;
   if(x.name)c.name=x.name;if(x.localId)c.number=x.localId;if(x.rarity)c.rarity=x.rarity;
   if(x.set?.id&&!parent)c.setId=x.set.id;if(x.set?.name&&!parent)c.set=x.set.name;
   if(parent){c.setId=parent;c.set=parentName||c.set;c._parentSetId=parent;c._subsetId=subset||x.set?.id||c._subsetId}
   if(x.image){c.thumb=asset(x.image,'low');c.img=asset(x.image,'high');c._artGoodV232=c.thumb;return true}
   return false;
 }
 async function recoverFrontArtworkV236(c){
   if(!c)return false;const key=String(c.id||c.name||'')+'|'+actualNumber(c);
   if(repairPromisesV236.has(key))return repairPromisesV236.get(key);
   const task=(async()=>{
     // Poisoned fallbacks from older builds must never survive as "good" artwork.
     if(isCardBackUrl(c._artGoodV232))delete c._artGoodV232;if(isCardBackUrl(c.thumb))c.thumb='';if(isCardBackUrl(c.img))c.img='';
     const ids=[];const addId=v=>{v=String(v||'').trim();if(v&&!ids.includes(v))ids.push(v)};addId(c.id);
     const num=actualNumber(c),setIds=actualSetIds(c);for(const sid of setIds)if(num)addId(`${sid}-${num}`);
     for(const id of ids){
       try{const rr=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(id)}`,6500);if(!rr.ok)continue;const x=await rr.json();if(x?.image&&applyRecoveredDetail(c,x)){try{save()}catch(_){}return true}}catch(_){}
     }
     // Old/offline-created cards can have an ID that never existed. Recover them from the actual set catalog.
     const wantName=normText(c.name),wantNum=normText(num);
     for(const sid of setIds){
       try{
         const rr=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(sid)}`,7500);if(!rr.ok)continue;const set=await rr.json();const cards=Array.isArray(set?.cards)?set.cards:[];
         let hit=cards.find(x=>wantNum&&normText(x.localId)===wantNum);
         if(!hit&&wantName)hit=cards.find(x=>normText(x.name)===wantName);
         if(!hit?.id)continue;
         let detail=hit;
         try{const dr=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(hit.id)}`,6500);if(dr.ok)detail=await dr.json()}catch(_){}
         if(detail?.image&&applyRecoveredDetail(c,detail)){c.id=c.id||hit.id;try{save()}catch(_){}return true}
         if(hit?.image){c.thumb=asset(hit.image,'low');c.img=asset(hit.image,'high');c._artGoodV232=c.thumb;try{save()}catch(_){}return true}
       }catch(_){}
     }
     return false;
   })().finally(()=>repairPromisesV236.delete(key));
   repairPromisesV236.set(key,task);return task;
 }
 function runQueue(){while(active<MAX_ACTIVE&&queue.length){const job=queue.shift();active++;job.fn().then(job.resolve,job.reject).finally(()=>{active--;runQueue()})}}
 function queued(fn){return new Promise((resolve,reject)=>{queue.push({fn,resolve,reject});runQueue()})}
 function cacheBust(url,n){if(!n)return url;try{const u=new URL(url,location.href);u.searchParams.set('_art_retry',String(Date.now()).slice(-7)+n);return u.href}catch(_){return url+(url.includes('?')?'&':'?')+'_art_retry='+Date.now()+n}}
 function probe(url,attempt=0,timeout=6500){return queued(()=>new Promise((resolve,reject)=>{let done=false,timer=null,im=new Image();const finish=(ok)=>{if(done)return;done=true;clearTimeout(timer);im.onload=im.onerror=null;ok?resolve(url):reject(new Error('image failed'))};im.decoding='async';im.referrerPolicy='no-referrer';im.onload=()=>finish(true);im.onerror=()=>finish(false);timer=setTimeout(()=>finish(false),timeout);im.src=cacheBust(url,attempt)}))}
 async function firstWorking(urls,attempt=0){let last=null;for(const u of urls){try{return await probe(u,attempt)}catch(e){last=e}}throw last||new Error('No artwork URL')}
 async function refreshCardUrls(c){if(!c?.id)return c;try{await hydrateCard(c)}catch(_){}return c}
 async function loadReliable(img,c,{preferHigh=false,context='binder',force=false}={}){
   if(!img||!c)return false;
   const token=String(Date.now())+Math.random();img.dataset.artTokenV232=token;
   const holder=context==='inspect'?document.getElementById('inspect3d'):img.closest('.slot');
   if(context==='inspect'){holder?.classList.add('inspectArtPendingV232');holder?.querySelector('.inspectArtFailedV232')?.remove()}else{holder?.classList.remove('cardArtReadyV232','cardArtFailedV232');holder?.classList.add('cardArtPendingV232');holder?.querySelector('.binderArtRetryV232')?.remove()}
   img.removeAttribute('src');img.onerror=null;
   let urls=candidates(c,preferHigh),working='';if(!urls.length){await recoverFrontArtworkV236(c);urls=candidates(c,preferHigh)}
   for(let pass=0;pass<3&&!working;pass++){
     try{working=await firstWorking(urls,pass)}catch(_){
       if(pass===0){await refreshCardUrls(c);if(!candidates(c,preferHigh).length||isCardBackUrl(c?._artGoodV232)||isCardBackUrl(c?.thumb)||isCardBackUrl(c?.img))await recoverFrontArtworkV236(c);else await recoverFrontArtworkV236(c);urls=candidates(c,preferHigh)}
       if(pass<2)await wait(pass?900:320);
     }
   }
   if(img.dataset.artTokenV232!==token)return false;
   if(working&&!isCardBackUrl(working)){
     c._artGoodV232=working.replace(/[?&]_art_retry=[^&]+/,'').replace(/[?&]$/,'');
     img.src=working;img.alt=c.name||'Card';
     if(context==='inspect')holder?.classList.remove('inspectArtPendingV232');
     else{holder?.classList.remove('cardArtPendingV232','cardArtFailedV232');holder?.classList.add('cardArtReadyV232')}
     // Once a reliable low-res image is on screen, quietly upgrade through the high-res fallback list.
     if(!preferHigh){const hiList=candidates(c,true).filter(u=>u&&u!==working).slice(0,7);if(hiList.length)setTimeout(async()=>{try{const goodHi=await firstWorking(hiList,0);if(img.isConnected&&img.dataset.artTokenV232===token){img.src=goodHi;c._artGoodV232=goodHi}}catch(_){}},APPLE_ART_V234?650:220)}
     return true;
   }
   if(!force){try{const repaired=await recoverFrontArtworkV236(c);if(repaired){const retryUrls=candidates(c,preferHigh);if(retryUrls.length){try{const retryWorking=await firstWorking(retryUrls,0);if(retryWorking&&!isCardBackUrl(retryWorking)&&img.dataset.artTokenV232===token){c._artGoodV232=retryWorking;img.src=retryWorking;img.alt=c.name||'Card';if(context==='inspect')holder?.classList.remove('inspectArtPendingV232');else{holder?.classList.remove('cardArtPendingV232','cardArtFailedV232');holder?.classList.add('cardArtReadyV232')}try{save()}catch(_){}return true}}catch(_){}}}}catch(_){}}
   if(context==='inspect'){
     holder?.classList.remove('inspectArtPendingV232');
     if(holder&&!holder.querySelector('.inspectArtFailedV232')){const b=document.createElement('button');b.type='button';b.className='inspectArtFailedV232';b.innerHTML='<span><b>Artwork didn’t load</b><br>Tap to retry</span>';b.onclick=()=>loadReliable(img,c,{preferHigh:true,context:'inspect',force:true});holder.appendChild(b)}
   }else if(holder){
     holder.classList.remove('cardArtPendingV232');holder.classList.add('cardArtFailedV232');
     const b=document.createElement('button');b.type='button';b.className='binderArtRetryV232';b.innerHTML='<span><b>ARTWORK RETRY</b>Tap to reload</span>';b.onclick=e=>{e.stopPropagation();loadReliable(img,c,{preferHigh:false,context:'binder',force:true})};holder.appendChild(b)
   }
   return false;
 }
 // Never delete a legitimate owned card because an artwork/API request failed.
 window.repairBinderImage=async function(img,id){const c=state.binder?.[id];if(c)await loadReliable(img,c,{preferHigh:false,context:'binder',force:true})};
 const oldOpen=openBinderCard;
 openBinderCard=async function(id){
   const c=state.binder?.[id];if(!c)return;
   selectedBinderCard=id;const inspect=document.getElementById('inspect3d'),fx=effectClass(c);inspect.className='inspect3d'+(fx?' cardFx '+fx:'');
   const ii=document.getElementById('inspectImg');ii?.removeAttribute('src');
   document.getElementById('inspectName').textContent=c.name||'Card';
   document.getElementById('inspectInfo').textContent=`${c.set||''} • #${c.number||''} • ${c.rarity||'Card'}${c.finish?' • '+c.finish:''} • ${c.qty} ${c.qty===1?'copy':'copies'}`;
   document.getElementById('sellValue').textContent='Loading market value…';document.getElementById('cardModal').classList.add('show');
   if(typeof syncGradeLaunchV147==='function')syncGradeLaunchV147();
   if(fx){try{if(tier(c)>=2){hitSound(Math.min(5,tier(c)));navigator.vibrate?.(tier(c)>=4?[18,25,35]:[12,18,22])}else holoSound()}catch(_){}}
   loadReliable(ii,c,{preferHigh:true,context:'inspect'});
   try{await hydrateCard(c)}catch(_){}
   if(selectedBinderCard===id){if(state.binder?.[id])state.binder[id].market=c.market;try{save()}catch(_){};loadReliable(ii,c,{preferHigh:true,context:'inspect'});document.getElementById('sellValue').textContent=`Market sell value: $${sellPrice(c).toFixed(2)} each`}
 };
 renderBinder=function(anim=false){
   if(document.getElementById('rip')?.classList.contains('active')&&!document.getElementById('binder')?.classList.contains('active'))return;
   applyBinderTheme();const arr=binderCards(),pages=Math.max(1,Math.ceil(arr.length/CARDS_PER_PAGE));binderPageNo=Math.max(0,Math.min(binderPageNo,pages-1));
   document.getElementById('binderStat').textContent=`${arr.length} unique • ${arr.reduce((n,c)=>n+(c.qty||0),0)} total cards`;
   try{if(typeof renderBinderShelfV147==='function')renderBinderShelfV147()}catch(_){}
   document.getElementById('pageLabel').textContent=`Page ${binderPageNo+1} / ${pages}`;document.getElementById('prevPage').disabled=binderPageNo===0;document.getElementById('nextPage').disabled=binderPageNo>=pages-1;
   const g=document.getElementById('binderGrid');g.innerHTML='';const page=arr.slice(binderPageNo*CARDS_PER_PAGE,(binderPageNo+1)*CARDS_PER_PAGE);
   page.forEach(c=>{const d=document.createElement('div'),fx=effectClass(c);d.dataset.cardId=c.id;d.className='slot cardArtPendingV232'+(fx?' cardFx '+fx:'');d.innerHTML=`<img class="binderArtV232" decoding="async" alt="${String(c.name||'Card').replace(/"/g,'&quot;')}"><span class="rarity-stars" aria-hidden="true"></span><span class="qty">${Math.max(1,Number(c.qty||1))}x</span>`;d.onclick=()=>openBinderCard(c.id);g.appendChild(d);const im=d.querySelector('img');loadReliable(im,c,{preferHigh:false,context:'binder'}).catch(()=>{})});
   for(let i=page.length;i<CARDS_PER_PAGE;i++){const d=document.createElement('div');d.className='slot emptySlot';d.style.opacity='.12';g.appendChild(d)}
   if(anim){g.classList.remove('page-arrive-next','page-arrive-prev');void g.offsetWidth;g.classList.add(anim==='prev'?'page-arrive-prev':'page-arrive-next');setTimeout(()=>g.classList.remove('page-arrive-next','page-arrive-prev'),620)}
 };
 function retryVisible(){document.querySelectorAll('#binder .slot.cardArtFailedV232').forEach(slot=>{const id=slot.dataset.cardId,c=state.binder?.[id],img=slot.querySelector('img');if(c&&img)loadReliable(img,c,{preferHigh:false,context:'binder',force:true}).catch(()=>{})});if(document.getElementById('cardModal')?.classList.contains('show')&&selectedBinderCard){const c=state.binder?.[selectedBinderCard],img=document.getElementById('inspectImg');if(c&&img)loadReliable(img,c,{preferHigh:true,context:'inspect',force:true}).catch(()=>{})}}
 window.addEventListener('online',()=>setTimeout(retryVisible,250));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(retryVisible,350)});
 window.tcgCardArtV232={loadReliable,retryVisible,candidates,recoverFrontArtworkV236,apple:APPLE_ART_V234};window.tcgCardArtV234=window.tcgCardArtV232;window.tcgCardArtV236=window.tcgCardArtV232;
 try{if(document.getElementById('binder')?.classList.contains('active'))renderBinder()}catch(_){}
 const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V236 BINDER FRONT ART SELF-REPAIR';
})();



/* ===== original script 72 id=v239-binder-art-cache-script ===== */

(()=>{
  const VERSION='V241';
  const DB_NAME='tcgBinderArtworkV239',STORE='art';
  const PROXY='https://ddeuwrnfmdgvizkrjhii.supabase.co/functions/v1/card-art-v239';
  const ua=String(navigator.userAgent||'');
  const APPLE=/iPhone|iPad|iPod|FBAN|FBAV|FBIOS|Messenger/i.test(ua);
  const CONCURRENCY=APPLE?4:7;
  const lowMem=new Map(),highMem=new Map(),inflight=new Map();
  let dbPromise=null,prepPromise=null,preparedSig='',ready=false,failedCards=[];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}
  function isBack(u){u=String(u||'').toLowerCase();return !u||/\/back(?:\.|\/|$)/.test(u)||/pokemon[-_ ]?back/.test(u)||/card[-_ ]?back/.test(u)||u.includes('/base1/back.png')}
  function cleanSrc(u){u=String(u||'').trim().replace(/[?&]_art_retry=[^&]+/g,'').replace(/[?&]$/,'');return isBack(u)?'':u}
  function setId(c){
    let s=String(c?._subsetId||'').trim();if(s)return s;
    if(c?.id){const x=String(c.id),i=x.lastIndexOf('-');if(i>0){s=x.slice(0,i);if(s)return s}}
    s=String(c?.setId||c?._parentSetId||'').trim();if(s)return s;
    try{return String(masterResolveSetV66Early(c)||'')}catch(_){return''}
  }
  function num(c){let n=String(c?.number||c?.localId||'').trim();if(!n&&c?.id){const s=String(c.id),i=s.lastIndexOf('-');if(i>=0)n=s.slice(i+1)}return n}
  function identity(c){return [String(c?.id||''),setId(c),num(c),String(c?.name||'')].join('|')}
  function cacheKey(c,size='low'){return 'v239|'+size+'|'+identity(c)}
  function proxyUrl(c,size='low',deep=false){
    const u=new URL(PROXY);const add=(k,v)=>{v=String(v||'').trim();if(v)u.searchParams.set(k,v)};
    add('id',c?.id);add('set',setId(c));add('setName',c?.set);add('number',num(c));add('name',c?.name);add('size',size);
    const src=cleanSrc(size==='high'?(c?.img||c?._artGoodV232||c?.thumb):(c?.thumb||c?._artGoodV232||c?.img));
    if(src)add('src',src);
    if(deep)u.searchParams.set('deep','1');
    return u.href;
  }
  function openDB(){
    if(dbPromise)return dbPromise;dbPromise=new Promise((res,rej)=>{try{const q=indexedDB.open(DB_NAME,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE)};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}catch(e){rej(e)}});return dbPromise
  }
  async function dbGet(key){try{const db=await openDB();return await new Promise((res,rej)=>{const q=db.transaction(STORE).objectStore(STORE).get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}catch(_){return null}}
  async function dbPut(key,blob){try{const db=await openDB();await new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).put(blob,key);q.onsuccess=()=>res();q.onerror=()=>rej(q.error)});return true}catch(_){return false}}
  async function dbDel(key){try{const db=await openDB();await new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).delete(key);q.onsuccess=()=>res();q.onerror=()=>rej(q.error)})}catch(_){}}
  function validBlob(b){return b instanceof Blob&&b.size>1000&&String(b.type||'').startsWith('image/')}
  function memMap(size){return size==='high'?highMem:lowMem}
  async function cachedUrl(c,size='low'){
    const key=cacheKey(c,size),mem=memMap(size);if(mem.has(key))return mem.get(key);
    const old=await dbGet(key);if(!validBlob(old))return '';
    const url=URL.createObjectURL(old);mem.set(key,url);return url;
  }
  async function fetchBlob(c,size='low',force=false){
    const key=cacheKey(c,size),mem=memMap(size);if(!force){const local=await cachedUrl(c,size);if(local)return local}if(!force&&inflight.has(key))return inflight.get(key);
    const task=(async()=>{
      if(force)await dbDel(key);
      let last=null;
      for(let attempt=0;attempt<2;attempt++){
        const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),attempt?18000:12000);
        try{
          const r=await fetch(proxyUrl(c,size,attempt>0),{mode:'cors',cache:attempt?'reload':'force-cache',signal:ctl.signal});
          if(!r.ok)throw new Error('Artwork server '+r.status);const blob=await r.blob();if(!validBlob(blob))throw new Error('Invalid artwork response');
          await dbPut(key,blob);const old=mem.get(key);if(old)try{URL.revokeObjectURL(old)}catch(_){}const url=URL.createObjectURL(blob);mem.set(key,url);return url;
        }catch(e){last=e;if(attempt===0)await sleep(300)}finally{clearTimeout(timer)}
      }
      throw last||new Error('Artwork unavailable');
    })();inflight.set(key,task);try{return await task}finally{if(inflight.get(key)===task)inflight.delete(key)}
  }
  function allCards(){return Object.values(state?.binder||{}).filter(c=>c&&Number(c.qty||0)>0)}
  function signature(cards=allCards()){return cards.map(identity).sort().join('~')}
  function ensureOverlay(){
    let o=document.getElementById('v239ArtBoot');if(o)return o;o=document.createElement('div');o.id='v239ArtBoot';o.innerHTML=`<div class="v239ArtCard"><small>COLLECTION ARTWORK</small><h2>Preparing your Binder</h2><p>Verifying every owned card front and caching only the artwork this device is missing.</p><div class="v239ArtProgress"><i id="v239ArtBar"></i></div><div class="v239ArtMeta"><span id="v239ArtCount">0 / 0 cached</span><span id="v239ArtPct">0%</span></div><div class="v239ArtCurrent" id="v239ArtCurrent">Checking saved artwork…</div><div class="v239ArtActions" id="v239ArtActions"><button class="v239Retry" id="v239ArtRetry">RETRY MISSING</button><button class="v239Offline" id="v239ArtOffline">CONTINUE TO GAME</button></div></div>`;document.body.appendChild(o);document.getElementById('v239ArtRetry').onclick=()=>{o.classList.add('show');document.getElementById('v239ArtActions').classList.remove('show');prepareAll({show:true,forceFailed:true}).catch(()=>{})};document.getElementById('v239ArtOffline').onclick=()=>o.classList.remove('show');return o
  }
  function progress(success,total,name,show){if(!show)return;const o=ensureOverlay();o.classList.add('show');const pct=total?Math.round(success/total*100):100;const b=document.getElementById('v239ArtBar'),c=document.getElementById('v239ArtCount'),p=document.getElementById('v239ArtPct'),n=document.getElementById('v239ArtCurrent');if(b)b.style.width=pct+'%';if(c)c.textContent=`${success} / ${total} cached`;if(p)p.textContent=pct+'%';if(n)n.textContent=name||'Binder artwork ready'}
  async function scanLocal(cards,onStep=()=>{}){
    let next=0,checked=0,success=0;const missing=[];async function worker(){while(true){const i=next++;if(i>=cards.length)return;const c=cards[i];let ok=false;try{ok=!!(await cachedUrl(c,'low'))}catch(_){}if(ok)success++;else missing.push(c);checked++;onStep({checked,success,c,ok})}}await Promise.all(Array.from({length:Math.min(10,Math.max(1,cards.length))},worker));return{missing,success}
  }
  async function runPool(cards,force=false,onDone=()=>{}){
    let next=0,done=0;const fails=[];async function worker(){while(true){const i=next++;if(i>=cards.length)return;const c=cards[i];let ok=true;try{await fetchBlob(c,'low',force)}catch(e){ok=false;fails.push(c)}finally{done++;onDone(done,c,ok)}}}await Promise.all(Array.from({length:Math.min(CONCURRENCY,Math.max(1,cards.length))},worker));return fails
  }
  async function prepareAll({show=true,forceFailed=false}={}){
    const cards=allCards(),sig=signature(cards);if(!cards.length){ready=true;preparedSig=sig;failedCards=[];return true}if(prepPromise)return prepPromise;if(ready&&preparedSig===sig&&!forceFailed)return !failedCards.length;
    prepPromise=(async()=>{
      const o=ensureOverlay();document.getElementById('v239ArtActions')?.classList.remove('show');
      progress(0,cards.length,'Checking local artwork cache…',show);
      let local=await scanLocal(cards,({success,c})=>progress(success,cards.length,`Checking cache: ${c?.name||'Card'}`,show));
      let success=local.success,missing=local.missing;
      if(forceFailed&&failedCards.length){const wanted=new Set(failedCards.map(identity));missing=cards.filter(c=>wanted.has(identity(c)));success=cards.length-missing.length;progress(success,cards.length,`Retrying only ${missing.length} missing card${missing.length===1?'':'s'}…`,show)}
      if(missing.length){
        const before=success;let completedSuccess=0;
        let fails=await runPool(missing,false,(n,c,ok)=>{if(ok)completedSuccess++;progress(before+completedSuccess,cards.length,`Caching ${c?.name||'Card'} • ${n}/${missing.length} missing checked`,show)});
        success=cards.length-fails.length;
        if(fails.length){
          progress(success,cards.length,`Deep repair: ${fails.length} card${fails.length===1?'':'s'} still missing`,show);
          await sleep(250);
          let repaired=0;const beforeDeep=success;
          fails=await runPool(fails,true,(n,c,ok)=>{if(ok)repaired++;progress(beforeDeep+repaired,cards.length,`Deep repair ${n}: ${c?.name||'Card'}`,show)});
          success=cards.length-fails.length;
        }
        failedCards=fails;
      }else failedCards=[];
      preparedSig=sig;ready=true;
      if(!failedCards.length){progress(cards.length,cards.length,'Binder artwork ready',show);setTimeout(()=>o.classList.remove('show'),350)}else if(show){progress(cards.length-failedCards.length,cards.length,`${failedCards.length} card${failedCards.length===1?'':'s'} still unresolved — retry only these`,true);document.getElementById('v239ArtActions')?.classList.add('show')}
      return !failedCards.length;
    })().finally(()=>{prepPromise=null});return prepPromise
  }
  async function setImgFromCache(img,c,size='low'){
    if(!img||!c)return false;try{const url=await fetchBlob(c,size,false);if(!img.isConnected)return false;img.onerror=async()=>{img.onerror=null;try{const fresh=await fetchBlob(c,size,true);if(img.isConnected)img.src=fresh}catch(_){}};img.src=url;img.alt=c.name||'Card';return true}catch(_){return false}
  }
  renderBinder=function(anim=false){
    if(document.getElementById('rip')?.classList.contains('active')&&!document.getElementById('binder')?.classList.contains('active'))return;
    const cards=allCards(),sig=signature(cards);if(preparedSig!==sig||!ready)prepareAll({show:true}).then(()=>{if(document.getElementById('binder')?.classList.contains('active'))renderBinder(anim)}).catch(()=>{});
    applyBinderTheme();const arr=binderCards(),pages=Math.max(1,Math.ceil(arr.length/CARDS_PER_PAGE));binderPageNo=Math.max(0,Math.min(binderPageNo,pages-1));document.getElementById('binderStat').textContent=`${arr.length} unique • ${arr.reduce((n,c)=>n+(c.qty||0),0)} total cards`;try{if(typeof renderBinderShelfV147==='function')renderBinderShelfV147()}catch(_){}document.getElementById('pageLabel').textContent=`Page ${binderPageNo+1} / ${pages}`;document.getElementById('prevPage').disabled=binderPageNo===0;document.getElementById('nextPage').disabled=binderPageNo>=pages-1;
    const g=document.getElementById('binderGrid');g.innerHTML='';const page=arr.slice(binderPageNo*CARDS_PER_PAGE,(binderPageNo+1)*CARDS_PER_PAGE);
    page.forEach(c=>{const d=document.createElement('div'),fx=effectClass(c);d.dataset.cardId=c.id;d.className='slot v239ArtPending'+(fx?' cardFx '+fx:'');d.innerHTML=`<img class="binderArtV239" decoding="async" alt="${esc(c.name||'Card')}"><span class="rarity-stars" aria-hidden="true"></span><span class="qty">${Math.max(1,Number(c.qty||1))}x</span>`;d.onclick=()=>openBinderCard(c.id);g.appendChild(d);const im=d.querySelector('img');setImgFromCache(im,c,'low').then(ok=>{if(!d.isConnected)return;d.classList.remove('v239ArtPending');if(!ok){const x=document.createElement('div');x.className='v239ArtStatus';x.innerHTML='<span><b>ARTWORK PENDING</b>Retrying this card only</span>';d.appendChild(x);fetchBlob(c,'low',true).then(url=>{if(im.isConnected){im.src=url;x.remove()}}).catch(()=>{})}})});
    for(let i=page.length;i<CARDS_PER_PAGE;i++){const d=document.createElement('div');d.className='slot emptySlot';d.style.opacity='.12';g.appendChild(d)}if(anim){g.classList.remove('page-arrive-next','page-arrive-prev');void g.offsetWidth;g.classList.add(anim==='prev'?'page-arrive-prev':'page-arrive-next');setTimeout(()=>g.classList.remove('page-arrive-next','page-arrive-prev'),620)}
  };
  openBinderCard=async function(id){
    const c=state.binder?.[id];if(!c)return;selectedBinderCard=id;const inspect=document.getElementById('inspect3d'),fx=effectClass(c);inspect.className='inspect3d'+(fx?' cardFx '+fx:'');const ii=document.getElementById('inspectImg');if(ii){ii.removeAttribute('src');ii.onerror=null}document.getElementById('inspectName').textContent=c.name||'Card';document.getElementById('inspectInfo').textContent=`${c.set||''} • #${c.number||''} • ${c.rarity||'Card'}${c.finish?' • '+c.finish:''} • ${c.qty} ${c.qty===1?'copy':'copies'}`;document.getElementById('sellValue').textContent='Loading market value…';document.getElementById('cardModal').classList.add('show');if(typeof syncGradeLaunchV147==='function')syncGradeLaunchV147();if(fx){try{if(tier(c)>=2){hitSound(Math.min(5,tier(c)));navigator.vibrate?.(tier(c)>=4?[18,25,35]:[12,18,22])}else holoSound()}catch(_){} }
    await setImgFromCache(ii,c,'low');fetchBlob(c,'high',false).then(url=>{if(selectedBinderCard===id&&ii?.isConnected)ii.src=url}).catch(()=>{});try{await hydrateCard(c)}catch(_){}if(selectedBinderCard===id){if(state.binder?.[id])state.binder[id].market=c.market;try{save()}catch(_){}document.getElementById('sellValue').textContent=`Market sell value: $${sellPrice(c).toFixed(2)} each`}
  };
  window.repairBinderImage=async function(img,id){const c=state.binder?.[id];if(!c)return false;try{const url=await fetchBlob(c,'low',true);if(img?.isConnected)img.src=url;return true}catch(_){return false}};
  window.tcgBinderArtV239={prepareAll,fetchBlob,proxyUrl,get ready(){return ready},get failed(){return failedCards.slice()}};window.tcgBinderArtV241=window.tcgBinderArtV239;
  window.addEventListener('online',()=>setTimeout(()=>{if(failedCards.length)prepareAll({show:false,forceFailed:true}).catch(()=>{})},250));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&failedCards.length)setTimeout(()=>prepareAll({show:false,forceFailed:true}).catch(()=>{}),300)});
  /* V245: Binder artwork preparation is user-triggered on Binder open, never during game boot. */
  try{const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V241 TARGETED BINDER ART CACHE'}catch(_){}
})();



/* ===== original script 73 id=v240-rank-frame-img-fix-script ===== */

(()=>{
  const IDS=['rookie','bronze','silver','gold','platinum','diamond','master','apex'];
  let scheduled=false;
  function assets(){return window.tcgRankFrameAssetsV231||window.tcgProfileFramesV228?.FRAME_ASSETS_V228||{}}
  function cleanId(v){v=String(v||'').trim().toLowerCase();return IDS.includes(v)?v:''}
  function putImg(host,id){
    id=cleanId(id);const src=assets()[id];if(!host||!src)return false;
    try{host.style.removeProperty('--frame-image');host.style.backgroundImage='none'}catch(_){}
    let im=host.querySelector(':scope > img.rankFrameImgV240');
    if(!im){im=document.createElement('img');im.className='rankFrameImgV240';im.alt=id+' rank frame';im.decoding='async';im.draggable=false;host.appendChild(im)}
    if(im.getAttribute('data-rank-id')!==id||im.getAttribute('src')!==src){im.setAttribute('data-rank-id',id);im.src=src}
    return true;
  }
  function hydrateVault(){
    const vault=document.getElementById('profileFramesVaultV228');if(!vault)return;
    vault.querySelectorAll('.frameGridCardV228').forEach(card=>{
      const name=card.querySelector('.frameMetaV228 strong')?.textContent||'';
      const id=cleanId(name);const host=card.querySelector('.miniFrameV228');if(id&&host)putImg(host,id);
    });
    const fs=state?.profileFramesV228||{};const sel=cleanId(fs.selected);
    const badge=vault.querySelector('.frameClaimBadgeV228 .miniFrameV228');if(sel&&badge)putImg(badge,sel);
  }
  function hydrateAvatar(){
    const fs=state?.profileFramesV228||{};const sel=cleanId(fs.selected);const btn=document.getElementById('profileAvatarBtnV227');if(!btn)return;
    const host=btn.querySelector('.profileFrameImageV228');
    if(sel&&fs.owned?.[sel]&&host){putImg(host,sel)}else if(host){host.querySelectorAll('img.rankFrameImgV240').forEach(x=>x.remove())}
  }
  function hydrate(){scheduled=false;try{hydrateVault();hydrateAvatar()}catch(e){console.warn('V240 rank frame img hydration',e)}}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(hydrate)}
  function installObserver(){
    if(!document.body)return;
    const mo=new MutationObserver(muts=>{for(const m of muts){if(m.type!=='childList'||!m.addedNodes.length)continue;for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.id==='profileFramesVaultWrapV228'||n.id==='profileFramesVaultV228'||n.id==='profileAvatarBtnV227'||n.querySelector?.('#profileFramesVaultV228,.profileFrameImageV228')){schedule();return}}}});
    mo.observe(document.body,{childList:true,subtree:true});window.tcgRankFrameObserverV240=mo;
  }
  function wrapPublic(){
    const api=window.tcgProfileFramesV228;if(!api||api.__v240Wrapped)return;
    ['renderFrameVault','applyAvatarFrame','equipFrame','clearFrame','claimSeasonFrames'].forEach(k=>{const old=api[k];if(typeof old!=='function'||old.__v240)return;api[k]=function(){const out=old.apply(this,arguments);setTimeout(schedule,0);return out};api[k].__v240=true});api.__v240Wrapped=true;
  }
  function boot(){wrapPublic();installObserver();schedule();setTimeout(()=>{wrapPublic();schedule()},500);setTimeout(schedule,1400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.tcgRankFramesV240={hydrate:schedule};
  try{const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V240 RANK FRAME RENDER FIX'}catch(_){}
})();



/* ===== original script 74 id=v245-boot-isolation-script ===== */

(()=>{try{
 const stamp=()=>{try{const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V245 SAFE BOOT + ON-DEMAND BINDER ART';const meta=document.querySelector('meta[name="tcg-cloud-build"]');if(meta)meta.setAttribute('content','V245-safe-boot')}catch(_){}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stamp,{once:true});else stamp();
}catch(_){}})();

