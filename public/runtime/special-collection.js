(()=>{
  if(window.__v198SpecialInstalled)return;window.__v198SpecialInstalled=true;
  const SPECIAL_CARDS_V198=[{"id":"sp_eevee","name":"Eevee — Ink Circle","rarity":"Mythical Rare","group":"Level Reward","unlockType":"level","target":5,"subtitle":"Inkbound Evolution Promo","lore":"A quiet one-of-one reward for collectors beginning to see the collection as something bigger than packs.","art":"assets/specials/sp_eevee.webp"},{"id":"sp_charmeleon","name":"Charmeleon","rarity":"Mythical Rare","group":"Level Reward","unlockType":"level","target":10,"subtitle":"Flame Trail Promo","lore":"A milestone card for collectors who have moved past the opening stretch and built real momentum.","art":"assets/specials/sp_charmeleon.webp"},{"id":"sp_reshiram_ex","name":"Reshiram ex","rarity":"Mythical Rare","group":"Level Reward","unlockType":"level","target":20,"subtitle":"Scorching Sky Promo","lore":"Awarded when a collector reaches the point where progression starts to feel like a true long-term collection.","art":"assets/specials/sp_reshiram_ex.webp"},{"id":"sp_gyarados","name":"Gyarados","rarity":"Mythical Rare","group":"Level Reward","unlockType":"level","target":30,"subtitle":"Storm Surge Promo","lore":"A violent sea-born milestone reserved for collectors who have survived the long grind to elite status.","art":"assets/specials/sp_gyarados.webp"},{"id":"sp_machamp_ex","name":"Machamp ex","rarity":"Mythical Rare","group":"Level Reward","unlockType":"level","target":38,"subtitle":"Neon Impact Promo","lore":"A high-energy level reward marking the TCG Icon threshold.","art":"assets/specials/sp_machamp_ex.webp"},{"id":"sp_skeledirge_ex","name":"Skeledirge ex","rarity":"Mythical Rare","group":"Achievement Reward","unlockType":"achievements","target":25,"subtitle":"Passionate Singing Promo","lore":"A collector challenge reward for proving your progress across multiple systems instead of a single grind.","art":"assets/specials/sp_skeledirge_ex.webp"},{"id":"sp_mewtwo_sketch","name":"Mewtwo — Sketch Rare","rarity":"Mythical Rare","group":"Achievement Reward","unlockType":"achievements","target":50,"subtitle":"Concept Archive Promo","lore":"A stark archival card earned halfway through the achievement cabinet.","art":"assets/specials/sp_mewtwo_sketch.webp"},{"id":"sp_rune_rayquaza","name":"Ancient Rayquaza","rarity":"Mythical Rare","group":"Achievement Reward","unlockType":"achievements","target":75,"subtitle":"Runic Relic Promo","lore":"An ancient-styled reward hidden deep in the achievement path.","art":"assets/specials/sp_rune_rayquaza.webp"},{"id":"sp_mega_charizard_slash","name":"Mega Charizard X ex — Inferno Slash","rarity":"Mythical Rare","group":"Daily Streak","unlockType":"streak","target":7,"subtitle":"Seven-Day Flame Promo","lore":"A reward for showing up every day and keeping a full week of collector challenges alive.","art":"assets/specials/sp_mega_charizard_slash.webp"},{"id":"sp_mew_ex","name":"Mew ex","rarity":"Prismatic Rare","group":"Master Set Reward","unlockType":"masters","target":1,"subtitle":"Genesis Prism Promo","lore":"The first Master Set reward — a soft pastel prism for completing an expansion instead of merely chasing its biggest hit.","art":"assets/specials/sp_mew_ex.webp"},{"id":"sp_lugia_ex","name":"Lugia EX","rarity":"Prismatic Rare","group":"Master Set Reward","unlockType":"masters","target":3,"subtitle":"Deep Hurricane Prism","lore":"Three completed Master Sets open the vault for a legendary guardian of the collection.","art":"assets/specials/sp_lugia_ex.webp"},{"id":"sp_mega_arceus_ex","name":"Mega Arceus ex","rarity":"Prismatic Rare","group":"Master Set Reward","unlockType":"masters","target":5,"subtitle":"Creation Circle Prism","lore":"Five completed Master Sets earn one of the collection’s most prestigious permanent rewards.","art":"assets/specials/sp_mega_arceus_ex.webp"},{"id":"sp_umbreon_ex","name":"Umbreon ex","rarity":"Prismatic Rare","group":"God Pack Reward","unlockType":"godpacks","target":1,"subtitle":"Midnight Crystal Prism","lore":"The first God Pack you open permanently awakens this crystalline Umbreon in the Special Collection.","art":"assets/specials/sp_umbreon_ex.webp"},{"id":"sp_mega_rayquaza_ex","name":"Mega Rayquaza ex","rarity":"Prismatic Rare","group":"God Pack Reward","unlockType":"godpacks","target":3,"subtitle":"Primal Sky Prism","lore":"A three-God-Pack trophy with one of the strongest prismatic treatments in the vault.","art":"assets/specials/sp_mega_rayquaza_ex.webp"},{"id":"sp_mega_charizard_blue","name":"Mega Charizard X ex — Blue Lightning","rarity":"Prismatic Rare","group":"God Pack Reward","unlockType":"godpacks","target":5,"subtitle":"Blue Inferno Prism","lore":"Five God Packs unlock the blue-flame centerpiece of the God Pack reward line.","art":"assets/specials/sp_mega_charizard_blue.webp"},{"id":"sp_dark_charizard_vstar","name":"Dark Charizard VSTAR","rarity":"Prismatic Rare","group":"Pack Milestone","unlockType":"packs","target":500,"subtitle":"Shadow Flame Prism","lore":"A pure endurance reward for collectors who have torn through five hundred packs.","art":"assets/specials/sp_dark_charizard_vstar.webp"},{"id":"sp_ashgreninja_lucario","name":"Ash-Greninja & Mega Lucario ex","rarity":"Prismatic Rare","group":"Trade Career","unlockType":"trades","target":25,"subtitle":"Tag Team Neon Prism","lore":"A trading-career trophy for collectors who build the collection through negotiation as well as ripping.","art":"assets/specials/sp_ashgreninja_lucario.webp"},{"id":"sp_reshiram_forte","name":"Reshiram Forte","rarity":"Prismatic Rare","group":"Daily Streak","unlockType":"streak","target":14,"subtitle":"Vermillion Forte Prism","lore":"Two uninterrupted weeks of completed daily boards unlock this radiant Forte card.","art":"assets/specials/sp_reshiram_forte.webp"},{"id":"sp_mewtwo_rocket","name":"Mewtwo ex — Rocket Shadow","rarity":"Prismatic Rare","group":"Grading Vault","unlockType":"grade10","target":10,"subtitle":"Black Lab Prism","lore":"A dark grading trophy reserved for a vault holding ten perfect Grade 10 slabs.","art":"assets/specials/sp_mewtwo_rocket.webp"}];
  window.specialCardsV198=SPECIAL_CARDS_V198;
  state.specialCollectionV198=state.specialCollectionV198||{owned:{},vaultSpent:0,vaultHistory:[]};
  state.specialCollectionV198.owned=state.specialCollectionV198.owned||{};
  state.specialCollectionV198.vaultHistory=state.specialCollectionV198.vaultHistory||[];
  state.specialStatsV198=state.specialStatsV198||{godPacks:0,godBySet:{}};
  state.specialStatsV198.godBySet=state.specialStatsV198.godBySet||{};
  let filterV198='all',unlockQueueV198=[],unlockShowingV198=false,checkingV198=false;
  const iosSpecialV217=(()=>{try{return /iP(hone|ad|od)/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}catch(_e){return false}})();
  const specialBatchSizeV217=iosSpecialV217?4:8;
  let specialShownV217=specialBatchSizeV217;
  const escV198=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const completedAchievementsV198=()=>{try{updateBadges()}catch(_e){}return ACHIEVEMENTS.filter(a=>state.achievements?.[a[0]]).length};
  const masterCountV198=()=>SETS.filter(s=>{try{let p=masterProgressV58(s);return p.total>0&&p.n>=p.total}catch(_e){return false}}).length;
  const tradeCountV198=()=>Number(state.tradeV154?.count||0);
  const streakV198=()=>Number(state.polishV163?.daily?.streak||0);
  const grade10V198=()=>Number((state.gradingV44?.graded||[]).filter(x=>Number(x.grade||0)>=10).length);
  const godPacksV198=()=>Number(state.specialStatsV198?.godPacks||0);
  function metricV198(card){
    switch(card.unlockType){
      case 'level': return levelFromXP(state.xp);
      case 'achievements': return completedAchievementsV198();
      case 'masters': return masterCountV198();
      case 'godpacks': return godPacksV198();
      case 'packs': return Number(state.packs||0);
      case 'trades': return tradeCountV198();
      case 'streak': return streakV198();
      case 'grade10': return grade10V198();
      default:return 0;
    }
  }
  function unlockTextV198(card){
    const n=Number(card.target||0);
    return {level:`Reach Collector Level ${n}`,achievements:`Complete ${n} achievements`,masters:`Complete ${n} Master Set${n===1?'':'s'}`,godpacks:`Pull ${n} God Pack${n===1?'':'s'}`,packs:`Open ${n} packs`,trades:`Complete ${n} collector trades`,streak:`Reach a ${n}-day Daily Challenge streak`,grade10:`Own ${n} Grade 10 slabs`}[card.unlockType]||'Special unlock';
  }
  function progressV198(card){const v=metricV198(card),t=Math.max(1,Number(card.target||1));return {value:v,target:t,pct:Math.max(0,Math.min(100,v/t*100))}}
  function isOwnedV198(id){return !!state.specialCollectionV198?.owned?.[id]}
  function awardV198(card,via,queue=true){
    if(!card||isOwnedV198(card.id))return false;
    state.specialCollectionV198.owned[card.id]={at:Date.now(),via:via||unlockTextV198(card),rarity:card.rarity};
    if(queue)unlockQueueV198.push(card);
    return true;
  }
  function checkSpecialUnlocksV198(queue=true){
    if(checkingV198)return 0;checkingV198=true;let n=0;
    try{SPECIAL_CARDS_V198.forEach(c=>{if(!isOwnedV198(c.id)&&metricV198(c)>=Number(c.target||0)){if(awardV198(c,unlockTextV198(c),queue))n++}})}finally{checkingV198=false}
    if(n&&queue)setTimeout(showNextUnlockV198,160);return n;
  }
  function ownedCountV198(rarity=''){return SPECIAL_CARDS_V198.filter(c=>(!rarity||c.rarity===rarity)&&isOwnedV198(c.id)).length}
  function vaultEarnedV198(){return Math.floor(Number(state.packs||0)/250)+Math.floor(godPacksV198()/2)}
  function vaultAvailableV198(){return Math.max(0,vaultEarnedV198()-Number(state.specialCollectionV198.vaultSpent||0))}
  function openVaultV198(){
    checkSpecialUnlocksV198(false);const pool=SPECIAL_CARDS_V198.filter(c=>c.rarity==='Prismatic Rare'&&!isOwnedV198(c.id));
    if(vaultAvailableV198()<1)return toast('No Prismatic Vault keys ready. Earn 1 per 250 packs or every 2 God Packs.');
    if(!pool.length)return toast('Every Prismatic Rare is already in your Special Collection.');
    state.specialCollectionV198.vaultSpent=Number(state.specialCollectionV198.vaultSpent||0)+1;
    const card=pool[Math.floor(Math.random()*pool.length)];awardV198(card,'Prismatic Vault bonus drop',true);state.specialCollectionV198.vaultHistory.unshift({id:card.id,time:Date.now()});state.specialCollectionV198.vaultHistory=state.specialCollectionV198.vaultHistory.slice(0,30);
    try{localStorage.setItem('tcgRipperSave',JSON.stringify(state))}catch(_e){};try{stats();updateProgressUI()}catch(_e){};renderSpecialCollectionV198();setTimeout(showNextUnlockV198,120);
  }
  function fxMarkupV198(){return '<span class="specialFoilV198"></span><span class="specialDamascusV198"></span><span class="specialSparkV198"></span><span class="specialLightV198"></span>'}
  function tileV198(card){
    const owned=isOwnedV198(card.id),p=progressV198(card),rar=card.rarity==='Prismatic Rare'?'prismatic':'mythical';
    return `<button type="button" class="specialTileV198 ${rar} ${owned?'owned':'locked'}" data-special-card-v198="${card.id}"><span class="specialRarityChipV198">${escV198(card.rarity).toUpperCase()}</span><span class="specialLockChipV198">${owned?'OWNED':'LOCKED'}</span><div class="specialCardFrameV198"><img data-v217-special-img="${card.id}" loading="lazy" decoding="async" alt="${escV198(card.name)}">${fxMarkupV198()}</div><div class="specialTileBodyV198"><b>${escV198(card.name)}</b><small>${escV198(card.group)} • ${escV198(card.subtitle)}</small><div class="specialTileProgressV198"><span>${owned?(state.specialCollectionV198.owned[card.id]?.via||'Unlocked'):unlockTextV198(card)}</span><strong>${owned?'✓':`${Math.min(p.value,p.target)}/${p.target}`}</strong></div><div class="specialMiniTrackV198"><i style="width:${owned?100:p.pct}%"></i></div></div></button>`;
  }
  function hydrateSpecialImagesV217(root){
    if(!root||!root.closest('.specialsPanelV198.active'))return;
    const imgs=[...root.querySelectorAll('img[data-v217-special-img]:not([src])')];
    imgs.forEach((img,i)=>{
      const id=img.dataset.v217SpecialImg,card=SPECIAL_CARDS_V198.find(c=>c.id===id);if(!card)return;
      setTimeout(()=>{try{if(!img.isConnected||!img.closest('.specialsPanelV198.active'))return;img.src=card.art}catch(_e){}},iosSpecialV217?i*85:i*24);
    });
  }
  function releaseSpecialImagesV217(){
    if(!iosSpecialV217)return;
    document.querySelectorAll('#specialGridV198 img[data-v217-special-img]').forEach(img=>{try{img.removeAttribute('src')}catch(_e){}});
  }
  function filteredCardsV198(){if(filterV198==='duplicates')return [];return SPECIAL_CARDS_V198.filter(c=>filterV198==='all'||filterV198==='mythical'&&c.rarity==='Mythical Rare'||filterV198==='prismatic'&&c.rarity==='Prismatic Rare'||filterV198==='promos'||filterV198==='owned'&&isOwnedV198(c.id)||filterV198==='locked'&&!isOwnedV198(c.id))}
  function ensureBinderSpecialsV198(){
    const binder=document.getElementById('binder'),tabs=binder?.querySelector('.binderModeTabsV147');if(!binder||!tabs)return;
    if(!tabs.querySelector('[data-binder-mode="specials"]')){const b=document.createElement('button');b.type='button';b.dataset.binderMode='specials';b.textContent='SPECIALS';tabs.appendChild(b);b.addEventListener('click',()=>{window.setBinderModeV147?.('specials');renderSpecialCollectionV198()})}
    if(!document.getElementById('specialsPanelV198')){
      const panel=document.createElement('div');panel.id='specialsPanelV198';panel.className='binderModeV147 specialsPanelV198';panel.dataset.binderPanel='specials';
      panel.innerHTML=`<section class="specialHeroV198"><div class="specialHeroTopV198"><div class="specialHeroCopyV198"><small>SPECIAL COLLECTION</small><h2>Mythical & Prismatic Vault</h2><p>Nineteen user-selected custom cards live outside the normal set checklist. Earn them through levels, achievements, Master Sets, God Packs, streaks, trades and grading — or hit a rare Prismatic Vault bonus route.</p></div><div class="specialHeroCountV198"><small>COLLECTED</small><b id="specialCountV198">0 / 19</b></div></div><div class="specialProgressV198"><i id="specialFillV198"></i></div><div class="specialStatsV198"><div><small>MYTHICAL</small><b id="specialMythicalV198">0 / 9</b></div><div><small>PRISMATIC</small><b id="specialPrismaticV198">0 / 10</b></div><div><small>GOD PACKS</small><b id="specialGodPacksV198">0</b></div></div></section><section class="prismaticVaultV198"><div class="prismaticVaultHeadV198"><div><small>BONUS ACQUISITION ROUTE</small><h3>Prismatic Vault</h3></div><span class="prismaticVaultKeyV198" id="specialVaultKeysV198">0 KEYS</span></div><p>Every 250 packs opened or every 2 God Packs grants a Vault key. A key unlocks one random unowned Prismatic Rare — an alternate path alongside each card’s dedicated challenge.</p><button type="button" id="specialOpenVaultV198">OPEN PRISMATIC VAULT</button></section><div class="specialFiltersV198" id="specialFiltersV198"><button class="active" data-special-filter-v198="all">ALL</button><button data-special-filter-v198="sets">SETS</button><button data-special-filter-v198="mythical">MYTHICAL</button><button data-special-filter-v198="prismatic">PRISMATIC</button><button data-special-filter-v198="promos">PROMOS</button><button data-special-filter-v198="owned">OWNED</button><button data-special-filter-v198="locked">LOCKED</button><button data-special-filter-v198="duplicates">DUPLICATES</button></div><div class="specialGridV198" id="specialGridV198"></div>`;
      const filterSheet=binder.querySelector('.binderFilterSheetV147');binder.insertBefore(panel,filterSheet||null);
      panel.querySelector('#specialOpenVaultV198').addEventListener('click',openVaultV198);
      panel.querySelector('#specialFiltersV198').addEventListener('click',e=>{const b=e.target.closest('[data-special-filter-v198]');if(!b)return;filterV198=b.dataset.specialFilterV198;specialShownV217=specialBatchSizeV217;if(filterV198==='sets'){window.setBinderModeV147?.('binder');return}renderSpecialCollectionV198()});
      panel.querySelector('#specialGridV198').addEventListener('click',e=>{const more=e.target.closest('[data-special-more-v217]');if(more){specialShownV217+=specialBatchSizeV217;renderSpecialCollectionV198();return}const b=e.target.closest('[data-special-card-v198]');if(b)openSpecialCardV198(b.dataset.specialCardV198)});
    }
  }
  function ensureProfileSpecialSummaryV198(){
    const summary=document.querySelector('#profile .profileMiniSummaryV158');if(summary&&!document.getElementById('profileSpecialsV198')){const d=document.createElement('div');d.className='specialSummaryCardV198';d.innerHTML='<small>SPECIAL CARDS</small><b id="profileSpecialsV198">0 / 19</b>';summary.appendChild(d);summary.style.gridTemplateColumns='repeat(2,minmax(0,1fr))'}
  }
  function renderSpecialCollectionV198(){
    checkSpecialUnlocksV198(false);ensureBinderSpecialsV198();ensureProfileSpecialSummaryV198();
    const cards=filteredCardsV198(),grid=document.getElementById('specialGridV198');
    if(grid){
      const shown=cards.slice(0,Math.max(specialBatchSizeV217,specialShownV217));
      const left=Math.max(0,cards.length-shown.length);
      grid.innerHTML=cards.length?
        shown.map(tileV198).join('')+(left?`<button type="button" class="specialMoreV217" data-special-more-v217><b>LOAD ${Math.min(specialBatchSizeV217,left)} MORE</b><span>${left} cards remaining</span></button>`:''):
        `<div class="specialEmptyV198">${filterV198==='duplicates'?'Special rewards are one-of-one collectibles, so duplicates cannot occur.':'No cards match this filter.'}</div>`;
      requestAnimationFrame(()=>hydrateSpecialImagesV217(grid));
    }
    document.querySelectorAll('[data-special-filter-v198]').forEach(b=>b.classList.toggle('active',b.dataset.specialFilterV198===filterV198));
    const all=ownedCountV198(),my=ownedCountV198('Mythical Rare'),pr=ownedCountV198('Prismatic Rare');
    const set=(id,v)=>{const x=document.getElementById(id);if(x)x.textContent=v};set('specialCountV198',`${all} / ${SPECIAL_CARDS_V198.length}`);set('specialMythicalV198',`${my} / ${SPECIAL_CARDS_V198.filter(c=>c.rarity==='Mythical Rare').length}`);set('specialPrismaticV198',`${pr} / ${SPECIAL_CARDS_V198.filter(c=>c.rarity==='Prismatic Rare').length}`);set('specialGodPacksV198',String(godPacksV198()));set('specialVaultKeysV198',`${vaultAvailableV198()} KEY${vaultAvailableV198()===1?'':'S'}`);set('profileSpecialsV198',`${all} / ${SPECIAL_CARDS_V198.length}`);const fill=document.getElementById('specialFillV198');if(fill)fill.style.width=(all/SPECIAL_CARDS_V198.length*100)+'%';const vb=document.getElementById('specialOpenVaultV198');if(vb)vb.disabled=vaultAvailableV198()<1||!SPECIAL_CARDS_V198.some(c=>c.rarity==='Prismatic Rare'&&!isOwnedV198(c.id));
  }
  function ensureInspectV198(){
    if(document.getElementById('specialInspectV198'))return;
    const m=document.createElement('div');m.id='specialInspectV198';m.innerHTML='<div class="specialInspectSheetV198"><button type="button" class="specialInspectCloseV198">×</button><div class="specialInspectGridV198"><div class="specialInspectCardV198" id="specialInspectTiltV198"><div class="specialCardFrameV198" id="specialInspectFrameV198"><img id="specialInspectImgV198" alt=""><span class="specialFoilV198"></span><span class="specialDamascusV198"></span><span class="specialSparkV198"></span><span class="specialLightV198"></span></div></div><div class="specialInspectCopyV198"><span class="specialInspectEyebrowV198" id="specialInspectRarityV198">SPECIAL RARE</span><h2 id="specialInspectNameV198"></h2><p id="specialInspectLoreV198"></p><div class="specialInspectStatusV198" id="specialInspectStatusV198"></div><div class="specialInspectBoxV198"><small>HOW TO UNLOCK</small><b id="specialInspectUnlockV198"></b><div class="specialInspectProgressV198"><i id="specialInspectProgressV198"></i></div><p id="specialInspectProgressCopyV198"></p></div><div class="specialInspectBoxV198"><small>COLLECTION CLASS</small><b id="specialInspectGroupV198"></b><p id="specialInspectViaV198"></p></div><div class="specialInspectNoteV198">Special cards are permanent one-of-one collection rewards. They do not replace normal set checklist cards and cannot be sold as bulk by mistake.</div></div></div></div>';document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.specialInspectCloseV198'))m.classList.remove('show')});
    const tilt=m.querySelector('#specialInspectTiltV198');tilt.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=tilt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.setProperty('--ry',(x*11)+'deg');tilt.style.setProperty('--rx',(-y*9)+'deg')});tilt.addEventListener('pointerleave',()=>{tilt.style.setProperty('--ry','0deg');tilt.style.setProperty('--rx','0deg')});
  }
  function openSpecialCardV198(id){
    const card=SPECIAL_CARDS_V198.find(c=>c.id===id);if(!card)return;ensureInspectV198();const m=document.getElementById('specialInspectV198'),p=progressV198(card),owned=isOwnedV198(card.id),frame=document.getElementById('specialInspectFrameV198');frame.parentElement.classList.toggle('prismatic',card.rarity==='Prismatic Rare');frame.parentElement.classList.toggle('mythical',card.rarity==='Mythical Rare');document.getElementById('specialInspectImgV198').src=card.art;document.getElementById('specialInspectNameV198').textContent=card.name;document.getElementById('specialInspectRarityV198').textContent=card.rarity.toUpperCase();document.getElementById('specialInspectLoreV198').textContent=card.lore;document.getElementById('specialInspectUnlockV198').textContent=unlockTextV198(card);document.getElementById('specialInspectProgressV198').style.width=(owned?100:p.pct)+'%';document.getElementById('specialInspectProgressCopyV198').textContent=owned?'Requirement completed — this card is permanently in your Special Collection.':`${Math.min(p.value,p.target)} / ${p.target} complete`;document.getElementById('specialInspectGroupV198').textContent=`${card.group} • ${card.subtitle}`;document.getElementById('specialInspectViaV198').textContent=owned?`Unlocked via: ${state.specialCollectionV198.owned[card.id]?.via||unlockTextV198(card)}`:'Locked — the artwork remains previewable before you earn it.';document.getElementById('specialInspectStatusV198').innerHTML=`<span class="${owned?'owned':''}">${owned?'✓ OWNED':'🔒 LOCKED'}</span><span>${escV198(card.rarity)}</span><span>${escV198(card.group)}</span>`;m.classList.add('show');
  }
  window.openSpecialCardV198=openSpecialCardV198;
  function ensureUnlockV198(){if(document.getElementById('specialUnlockV198'))return;const m=document.createElement('div');m.id='specialUnlockV198';m.innerHTML='<div class="specialUnlockBurstV198"></div><div class="specialUnlockContentV198"><small id="specialUnlockRarityV198">SPECIAL CARD UNLOCKED</small><div class="specialCardFrameV198"><img id="specialUnlockImgV198" alt=""><span class="specialFoilV198"></span><span class="specialDamascusV198"></span><span class="specialSparkV198"></span><span class="specialLightV198"></span></div><h2 id="specialUnlockNameV198"></h2><p id="specialUnlockViaV198"></p><button type="button" id="specialUnlockDoneV198">ADD TO SPECIAL COLLECTION</button></div>';document.body.appendChild(m);document.getElementById('specialUnlockDoneV198').onclick=()=>{m.classList.remove('show');unlockShowingV198=false;renderSpecialCollectionV198();setTimeout(showNextUnlockV198,120)}}
  function showNextUnlockV198(){if(unlockShowingV198||!unlockQueueV198.length)return;ensureUnlockV198();const card=unlockQueueV198.shift();unlockShowingV198=true;const uc=document.querySelector('#specialUnlockV198 .specialUnlockContentV198');uc?.classList.toggle('prismatic',card.rarity==='Prismatic Rare');uc?.classList.toggle('mythical',card.rarity==='Mythical Rare');document.getElementById('specialUnlockRarityV198').textContent=card.rarity.toUpperCase()+' • UNLOCKED';document.getElementById('specialUnlockImgV198').src=card.art;document.getElementById('specialUnlockNameV198').textContent=card.name;document.getElementById('specialUnlockViaV198').textContent=state.specialCollectionV198.owned[card.id]?.via||unlockTextV198(card);document.getElementById('specialUnlockV198').classList.add('show');try{hitSound?.(5);navigator.vibrate?.([20,35,20,60,35])}catch(_e){}}
  window.showNextUnlockV198=showNextUnlockV198;
  // Keep unlock state current on every normal save without causing recursive saves.
  const prevSaveV198=save;save=function(){const n=checkSpecialUnlocksV198(true),r=prevSaveV198.apply(this,arguments);if(n)setTimeout(showNextUnlockV198,180);try{renderSpecialCollectionV198()}catch(_e){}return r};
  const prevRenderProfileV198=renderProfile;renderProfile=function(){const r=prevRenderProfileV198.apply(this,arguments);try{renderSpecialCollectionV198()}catch(_e){}return r};
  // If V197 redraws its Level Road before Special Cards are present, redraw once now with the V198 database.
  function syncV198(){
    const retro=checkSpecialUnlocksV198(false);if(retro){try{localStorage.setItem('tcgRipperSave',JSON.stringify(state))}catch(_e){}}ensureBinderSpecialsV198();ensureProfileSpecialSummaryV198();ensureInspectV198();renderSpecialCollectionV198();try{window.renderLevelRewardsV197?.()}catch(_e){}
    const row=[...document.querySelectorAll('.settingsDataLineV158')].find(x=>x.querySelector('span')?.textContent.trim()==='Game Version');if(row?.querySelector('b'))row.querySelector('b').textContent='V200 PHONE COMPAT';
    const road=document.querySelector('#levelRewardsV197 .levelRoadHeadV197 p');if(road)road.textContent='Preview every upcoming set, prestige binder, cash bonus and Special Collection card before you reach it.';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncV198);else syncV198();
})();
