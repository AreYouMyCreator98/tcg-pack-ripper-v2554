
/* ===== original script 1 id=none ===== */

window.TCG_CLOUD_CONFIG = window.TCG_CLOUD_CONFIG || {
  supabaseUrl: 'https://ddeuwrnfmdgvizkrjhii.supabase.co',
  supabaseAnonKey: 'sb_publishable_eNodlzqHgnlbMVof6faOIA_FfSuSx2_'
};



/* ===== original script 2 id=v155-runtime-compat-shim ===== */

(()=>{
 const ids=['sortJob','counterJob','rescueJob','sellBulkOne','priceJob','sleeveJob','memoryJob','deliveryJob'];
 for(const id of ids){if(!document.getElementById(id)){const b=document.createElement('button');b.id=id;b.hidden=true;document.body.appendChild(b)}}
})();



/* ===== original script 3 id=none ===== */

const SETS=[
{id:'sv04.5',name:'Paldean Fates',series:'sv',a:'#c9efff',b:'#496ee0',unlock:1},
{id:'swsh12.5',name:'Crown Zenith',series:'swsh',a:'#d7bd80',b:'#273e64',unlock:1},
{id:'swsh4.5',name:'Shining Fates',series:'swsh',a:'#e9f7ff',b:'#7459b8',unlock:1},
{id:'sv08',name:'Surging Sparks',series:'sv',a:'#ffd43b',b:'#1699ae',unlock:2},
{id:'sv03',name:'Obsidian Flames',series:'sv',a:'#ff713b',b:'#4b3c7a',unlock:3},
{id:'sv02',name:'Paldea Evolved',series:'sv',a:'#d9d66b',b:'#5d63a8',unlock:4},
{id:'sv01',name:'Scarlet & Violet',series:'sv',a:'#df485d',b:'#7056c9',unlock:5},
{id:'sv07',name:'Stellar Crown',series:'sv',a:'#50b4e8',b:'#7c4cc9',unlock:6},
{id:'sv06.5',name:'Shrouded Fable',series:'sv',a:'#45345e',b:'#c63d5a',unlock:7},
{id:'sv06',name:'Twilight Masquerade',series:'sv',a:'#68a65a',b:'#77477e',unlock:8},
{id:'sv05',name:'Temporal Forces',series:'sv',a:'#e05d5d',b:'#436bb4',unlock:9},
{id:'sv04',name:'Paradox Rift',series:'sv',a:'#e75b45',b:'#6350a9',unlock:10},
{id:'sv03.5',name:'151',series:'sv',a:'#efc847',b:'#703080',unlock:11},
{id:'sv09',name:'Journey Together',series:'sv',a:'#ffcf58',b:'#4186c7',unlock:12},
{id:'sv10',name:'Destined Rivals',series:'sv',a:'#cc3030',b:'#45244f',unlock:13},
{id:'swsh12',name:'Silver Tempest',series:'swsh',a:'#c8d5ea',b:'#5971a8',unlock:14},
{id:'swsh11',name:'Lost Origin',series:'swsh',a:'#d5bd4c',b:'#693d83',unlock:15},
{id:'swsh10',name:'Astral Radiance',series:'swsh',a:'#df554e',b:'#315a9e',unlock:16},
{id:'swsh9',name:'Brilliant Stars',series:'swsh',a:'#f0c34c',b:'#5367ad',unlock:17},
{id:'swsh8',name:'Fusion Strike',series:'swsh',a:'#ed4d9b',b:'#6644ae',unlock:18},
{id:'swsh7',name:'Evolving Skies',series:'swsh',a:'#6cb7e9',b:'#584a9a',unlock:19},
{id:'swsh6',name:'Chilling Reign',series:'swsh',a:'#88cfe0',b:'#513c87',unlock:20},
{id:'swsh5',name:'Battle Styles',series:'swsh',a:'#df514a',b:'#3563ad',unlock:21},
{id:'swsh4',name:'Vivid Voltage',series:'swsh',a:'#f2d340',b:'#8155a6',unlock:22},
{id:'swsh3',name:'Darkness Ablaze',series:'swsh',a:'#ef693d',b:'#3b3b65',unlock:23},
{id:'swsh2',name:'Rebel Clash',series:'swsh',a:'#dc4258',b:'#31718a',unlock:24},
{id:'swsh1',name:'Sword & Shield',series:'swsh',a:'#3d82bc',b:'#d94858',unlock:25},
{id:'sm12',name:'Cosmic Eclipse',series:'sm',a:'#e7b447',b:'#59499a',unlock:27},
{id:'sm11.5',name:'Hidden Fates',series:'sm',a:'#4f70b5',b:'#d8a740',unlock:29},
{id:'sm9',name:'Team Up',series:'sm',a:'#d74c4d',b:'#2e7694',unlock:31},
{id:'xy12',name:'XY Evolutions',series:'xy',a:'#df4a3f',b:'#4e74b7',unlock:34},
{id:'xy6',name:'Roaring Skies',series:'xy',a:'#5e9cc4',b:'#426b58',unlock:38}];
const CHASE_CARDS={
'sv04.5':['Mew ex','Charizard ex'],'swsh12.5':['Giratina VSTAR'],'swsh4.5':['Charizard VMAX'],'sv08':['Pikachu ex'],'sv03':['Charizard ex'],'sv02':['Magikarp'],'sv01':['Miriam'],'sv07':['Terapagos ex'],'sv06.5':['Cassiopeia'],'sv06':['Greninja ex'],'sv05':['Iron Crown ex','Walking Wake ex'],'sv04':['Roaring Moon ex'],'sv03.5':['Charizard ex'],'sv09':["Lillie's Clefairy ex"],'sv10':["Team Rocket's Mewtwo ex"],'swsh12':['Lugia V'],'swsh11':['Giratina V'],'swsh10':['Machamp V'],'swsh9':['Charizard V'],'swsh8':['Gengar VMAX'],'swsh7':['Umbreon VMAX'],'swsh6':['Blaziken VMAX','Galarian Moltres V'],'swsh5':['Tyranitar V'],'swsh4':['Pikachu VMAX'],'swsh3':['Charizard VMAX'],'swsh2':['Boss’s Orders','Boss\'s Orders','Sonia'],'swsh1':['Marnie'],'sm12':['Charizard & Braixen-GX','Rosa'],'sm11.5':['Charizard-GX','Charizard GX'],'sm9':['Latias & Latios-GX','Latias & Latios GX'],'xy12':['Charizard'],'xy6':['Rayquaza-EX','Rayquaza EX']};
function isChaseCard(c){let names=CHASE_CARDS[c.setId]||[];return names.some(n=>String(c.name||'').toLowerCase()===n.toLowerCase())&&(tier(c)>=3||c.secret)}
function awardChase(c){if(!isChaseCard(c)||state.chaseBadges[c.setId])return false;state.chaseBadges[c.setId]={name:c.name,time:Date.now()};addXP(40,'chase');let before=new Set(state.binderOwned||[]);syncRewardBinders(false);let earned=(state.binderOwned||[]).filter(x=>!before.has(x));save();let d=document.createElement('div');d.className='chaseToast';let extra=earned.length?`<span style="display:block;margin-top:7px;color:#e8c9ff">🔓 PRESTIGE BINDER UNLOCKED: ${BINDER_THEMES.find(t=>t.id===earned[0])?.name||'Binder'}</span>`:'';d.innerHTML=`<div style="font-size:44px">🏆✨</div><b>CHASE CARD BADGE EARNED!</b><span>${c.set} • ${c.name}</span>${extra}`;document.body.appendChild(d);hitSound(5);if(navigator.vibrate)navigator.vibrate([40,40,80,40,120]);setTimeout(()=>d.remove(),4200);return true}

const OFFICIAL_PACK_ART={"sv10":["https://images.sealeddex.com/images/expansions/destined-rivals/SV10_Booster_Cynthia_Garchomp.webp"],"sv09":["https://images.sealeddex.com/images/expansions/journey-together/journey-together-pack-0.webp"],"sv08":["https://images.sealeddex.com/images/expansions/surging-sparks/SV8_Booster_Pikachu.webp"],"sv07":["https://images.sealeddex.com/images/expansions/stellar-crown/SV7_Booster_Terapagos.webp"],"sv06.5":["https://images.sealeddex.com/images/expansions/shrouded-fable/shrouded-fable-pack-0.webp"],"sv06":["https://images.sealeddex.com/images/expansions/twilight-masquerade/SV6_Booster_Sinistcha.webp"],"sv05":["https://images.sealeddex.com/images/expansions/temporal-forces/SV5_Booster_Walking_Wake.webp"],"sv04.5":["https://images.sealeddex.com/images/expansions/paldean-fates/paldean-fates-pack-0.webp"],"sv04":["https://images.sealeddex.com/images/expansions/paradox-rift/SV4_Booster_Garchomp.webp"],"sv03.5":["https://images.sealeddex.com/images/expansions/151/151-pack-0.webp"],"sv03":["https://images.sealeddex.com/images/expansions/obsidian-flames/SV3_Booster_Revavroom.webp"],"sv02":["https://images.sealeddex.com/images/expansions/paldea-evolved/SV2_Booster_Ting-Lu.webp"],"sv01":["https://images.sealeddex.com/images/expansions/scarlet-and-violet/scarlet-and-violet-pack-0.webp"],"swsh12.5":["https://images.sealeddex.com/images/expansions/crown-zenith/crown-zenith-pack-0.webp"],"swsh12":["https://images.sealeddex.com/images/expansions/silver-tempest/SWSH12_Booster_Regidrago.webp"],"swsh11":["https://images.sealeddex.com/images/expansions/lost-origin/lost-origin-pack-0.webp"],"swsh10":["https://images.sealeddex.com/images/expansions/astral-radiance/astral-radiance-pack-0.webp"],"swsh9":["https://images.sealeddex.com/images/expansions/brilliant-stars/SWSH9_Booster_Whimsicott.webp"],"swsh8":["https://images.sealeddex.com/images/expansions/fusion-strike/SWSH8_Booster_Boltund.webp"],"swsh7":["https://images.sealeddex.com/images/expansions/evolving-skies/evolving-skies-pack-0.webp"],"swsh6":["https://images.sealeddex.com/images/expansions/chilling-reign/chilling-reign-pack-0.webp"],"swsh5":["https://images.sealeddex.com/images/expansions/battle-styles/battle-styles-pack-0.webp"],"swsh4.5":["https://images.sealeddex.com/images/expansions/shining-fates/shining-fates-pack-0.webp"],"swsh4":["https://images.sealeddex.com/images/expansions/vivid-voltage/SWSH4_Booster_Zarude.webp"],"swsh3":["https://images.sealeddex.com/images/expansions/darkness-ablaze/darkness-ablaze-pack-0.webp"],"swsh2":["https://images.sealeddex.com/images/expansions/rebel-clash/rebel-clash-pack-0.webp"],"swsh1":["https://images.sealeddex.com/images/expansions/sword-and-shield/sword-and-shield-pack-0.webp"],"sm12":["https://images.sealeddex.com/images/expansions/cosmic-eclipse/SM12_Booster_Cleffa_Igglybuff_Togepi.webp"],"sm11.5":["https://images.sealeddex.com/images/expansions/hidden-fates/Hidden_Fates_Booster_Mew.webp"],"sm9":["https://images.sealeddex.com/images/expansions/team-up/SM9_Booster_Eevee_Snorlax.webp"],"xy12":["https://images.sealeddex.com/images/expansions/evolutions/XY12_Booster_Raichu.webp"],"xy6":["https://images.sealeddex.com/images/expansions/roaring-skies/XY6_Booster_Gallade.webp"]};
let packArtTry=0;
const PACK_CACHE_DB='tcgPackArtCacheV31HD';
function openPackDB(){return new Promise((res,rej)=>{try{let q=indexedDB.open(PACK_CACHE_DB,1);q.onupgradeneeded=()=>q.result.createObjectStore('art');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}catch(e){rej(e)}})}
async function getCachedPack(id){try{let db=await openPackDB();return await new Promise((res,rej)=>{let q=db.transaction('art').objectStore('art').get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}catch{return null}}
async function cachePack(id,url){try{let r=await fetch(url,{mode:'cors',cache:'force-cache'});if(!r.ok)return null;let b=await r.blob();let db=await openPackDB();await new Promise((res,rej)=>{let q=db.transaction('art','readwrite').objectStore('art').put(b,id);q.onsuccess=()=>res();q.onerror=()=>rej(q.error)});return b}catch{return null}}
let packObjectURL='';
async function applyPackArt(){let p=$('#pack'),im=$('#packArt'),arr=OFFICIAL_PACK_ART[sel.id]||[];packArtTry=0;if(packObjectURL){URL.revokeObjectURL(packObjectURL);packObjectURL=''};p.classList.remove('artFallback');p.classList.add('officialPack');im.style.display='block';let requestedSetId=sel.id;let cached=await getCachedPack(requestedSetId);if(sel.id!==requestedSetId)return;if(cached){packObjectURL=URL.createObjectURL(cached);im.onerror=null;im.src=packObjectURL;return}let url=arr[0];if(!url){p.classList.remove('officialPack');p.classList.add('artFallback');return}im.onerror=()=>{im.onerror=null;p.classList.remove('officialPack');p.classList.add('artFallback')};im.onload=()=>{im.onload=null;cachePack(requestedSetId,url)};im.src=url}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
try{const v147save=localStorage.getItem('tcgRipperSave');if(v147save&&!localStorage.getItem('tcgRipperSaveV147Backup'))localStorage.setItem('tcgRipperSaveV147Backup',v147save)}catch(e){}
let old=null;
let storageLimitedV200=false;
try{const rawV200=localStorage.getItem('tcgRipperSave');old=rawV200?JSON.parse(rawV200):null}catch(e){old=null;storageLimitedV200=true}
function hasMeaningfulProgressV200(o){
 if(!o||typeof o!=='object')return false;
 const qty=obj=>Object.values(obj||{}).some(x=>Number((x?.qty??x)||0)>0);
 return Number(o.packs||0)>0||Number(o.hits||0)>0||Number(o.xp||0)>0||
  (o.history||[]).length>0||qty(o.binder)||qty(o.bulkV64)||
  (o.gradingV44?.submissions||[]).length>0||(o.gradingV44?.graded||[]).length>0||
  (o.marketV57?.listings||[]).length>0||Number(o.marketV57?.sold||0)>0||
  Number(o.tradeV154?.count||0)>0||qty(o.sealedV161?.inventory)||
  Number(o.shopV84?.deals||0)>0||Number(o.shopV84?.rep||0)>0||
  Object.keys(o.specialCollectionV198?.owned||{}).length>0;
}
/* V200: iPhone/Files can leave an empty or partial save object behind. Treat a truly
   unplayed shell as a fresh game, while established saves keep all progress. */
const newGameV199=!hasMeaningfulProgressV200(old);
let state=(newGameV199?{}:old)||{};
if(newGameV199){state.coins=80;state.packs=0;state.hits=0;state.binder={};state.history=[]}
else if(!Number.isFinite(Number(state.coins)))state.coins=0;
state.history=state.history||[];state.binder=state.binder||{};state.bulkV64=state.bulkV64||{};state.trashed=state.trashed||0;state.jobs=state.jobs||{rescue:0,sort:0,counter:0};state.xp=Number(state.xp||0);state.badges=state.badges||{};state.miniStats=state.miniStats||{price:0,sleeve:0,memory:0,delivery:0};state.achievements=state.achievements||{};state.chaseBadges=state.chaseBadges||{};state.jobCareer=state.jobCareer||{earnings:0,perfect:0,orders:0};state.earnV83=state.earnV83||{played:{},streak:0,contract:[],claimed:false};state.shopV84=state.shopV84||{rep:0,deals:0,profit:0,visits:0,ledger:[]};state.binderOwned=state.binderOwned||['classic'];state.binderTheme=state.binderTheme||'classic';
if(newGameV199){
 state.starterV199={eligible:true,total:10,remaining:10,used:0,hitBoost:1.5,guaranteedHighAwarded:0,tutorialShown:false,tutorialPending:false,startedAt:Date.now(),freshRecoveryV200:!!old};
}else{
 state.starterV199=state.starterV199||{eligible:false,total:10,remaining:0,used:10,hitBoost:1,guaranteedHighAwarded:0,tutorialShown:true,tutorialPending:false,migrated:true};
}
let sel=SETS.find(s=>s.unlock===1)||SETS[0],cache={},pulls=[],idx=0,busy=false,drag=false,startX=0,startY=0,openStyle=0;let v114PackCount=1,v114BatchGroups=[];
function save(){try{localStorage.setItem('tcgRipperSave',JSON.stringify(state))}catch(e){storageLimitedV200=true}stats();updateProgressUI()}function stats(){$('#coins').textContent=Number(state.coins||0).toFixed(2);$('#packs').textContent=state.packs;$('#hits').textContent=state.hits;let bc=document.getElementById('binderCashV147');if(bc)bc.textContent=Number(state.coins||0).toFixed(2);let ec=document.getElementById('earnCashV153');if(ec)ec.textContent='$'+Number(state.coins||0).toFixed(2)}
function asset(u,quality='high'){if(!u)return'';return u+'/'+quality+'.webp'}function logo(s){return `https://assets.tcgdex.net/en/${s.series}/${s.id}/logo.png`}
const MEGA_SET_REQUIREMENTS={
 'sm12':{label:'MEGA RARE SET',xp:52000,badges:['elite','hit50'],hits:[{setId:'swsh7',card:'Umbreon VMAX'}]},
 'sm11.5':{label:'MEGA RARE SET',xp:60000,badges:['elite','vault'],hits:[{setId:'sv03.5',card:'Charizard ex'},{setId:'swsh4.5',card:'Charizard VMAX'}]},
 'sm9':{label:'LEGENDARY SET',xp:68000,badges:['master','hit50'],hits:[{setId:'swsh8',card:'Gengar VMAX'},{setId:'swsh11',card:'Giratina V'}]},
 'xy12':{label:'LEGACY VAULT',xp:76000,badges:['master','vault'],hits:[{setId:'sv03',card:'Charizard ex'},{setId:'swsh9',card:'Charizard V'}]},
 'xy6':{label:'ULTIMATE VAULT',xp:83655,badges:['icon','hit100','vault'],hits:[{setId:'swsh7',card:'Umbreon VMAX'},{setId:'swsh12',card:'Lugia V'},{setId:'swsh11',card:'Giratina V'}]}
};
function badgeDef(id){return BADGE_DEFS.find(x=>x[0]===id)}
function hasCollectedHit(h){let sn=SETS.find(x=>x.id===h.setId)?.name||h.setId;return [...Object.values(state.binder||{}),...(state.hubEscrowV256||[])].some(c=>c&&(c.setId===h.setId||c.set===sn)&&String(c.name||'').replaceAll('’',String.fromCharCode(39)).replaceAll('＆','&').toLowerCase()===String(h.card).toLowerCase())||!!(state.chaseBadges?.[h.setId]&&String(state.chaseBadges[h.setId].name||'').toLowerCase()===String(h.card).toLowerCase())}
const requirementAuditCache={};
async function auditRequirementHit(h){
 const key=h.setId+'|'+String(h.card).toLowerCase();
 if(key in requirementAuditCache)return requirementAuditCache[key];
 if(!SETS.some(s=>s.id===h.setId))return requirementAuditCache[key]=false;
 const ids=[h.setId,...(window.SUBSET_CONFIG_V187?.[h.setId]||[]).flatMap(group=>group.ids||[])];
 const results=await Promise.all([...new Set(ids)].map(async id=>{
  try{const response=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(id)}`,6000);if(!response.ok)return null;const data=await response.json();return (data.cards||[]).some(c=>String(c.name||'').toLowerCase()===String(h.card||'').toLowerCase())}catch{return null}
 }));
 const result=results.includes(true)?true:results.every(value=>value===false)?false:null;
 if(result!==null)requirementAuditCache[key]=result;
 return result;
}
async function auditAllProgressionTargets(){let hits=Object.values(MEGA_SET_REQUIREMENTS).flatMap(x=>x.hits||[]),unique=[...new Map(hits.map(h=>[h.setId+'|'+h.card.toLowerCase(),h])).values()];let results=await Promise.all(unique.map(async h=>({h,ok:await auditRequirementHit(h)})));let bad=results.filter(x=>x.ok===false);if(bad.length)console.error('ANTI-SOFTLOCK AUDIT FAILED',JSON.stringify(bad));else console.info('ANTI-SOFTLOCK AUDIT',results.length,'required hits verified or awaiting network');return {total:results.length,bad}}
function setRequirementState(s){let m=MEGA_SET_REQUIREMENTS[s.id],items=[];let baseXP=m?.xp??xpFloor(Number(s.unlock||1));items.push({type:'xp',name:'Collector XP',detail:`Reach ${baseXP.toLocaleString()} total XP`,value:Math.min(Number(state.xp||0),baseXP),target:baseXP,done:Number(state.xp||0)>=baseXP});if(m){for(let id of m.badges||[]){let b=badgeDef(id),done=!!state.badges?.[id]||(b?!!b[3]():false);items.push({type:'badge',name:`Badge: ${b?.[1]||id}`,detail:b?.[2]||'Earn the required badge',value:done?1:0,target:1,done})}for(let h of m.hits||[]){let sn=SETS.find(x=>x.id===h.setId)?.name||h.setId,done=hasCollectedHit(h);items.push({type:'hit',name:`Pull ${h.card}`,detail:`Required hit • Open ${sn} packs`,value:done?1:0,target:1,done})}}return {mega:!!m,label:m?.label||'SET PROGRESSION',items,done:items.every(x=>x.done)}}
function showSetRequirements(s){updateBadges();let r=setRequirementState(s),mp=masterProgressV58(s);$('#reqMegaLabel').textContent=r.label;$('#reqSetName').textContent=s.name;$('#reqSetSub').textContent=r.mega?'Complete every requirement below to unlock this prestige expansion.':'Track the requirements below and your live Master Set progress.';let reqLogo=document.getElementById('reqSetLogoV185');if(reqLogo){reqLogo.src=logo(s)||'';reqLogo.style.display=reqLogo.src?'block':'none'};let reqHTML=r.items.map(x=>{let pc=x.target?Math.min(100,x.value/x.target*100):0;let val=x.type==='xp'?`${Math.floor(x.value).toLocaleString()} / ${x.target.toLocaleString()} XP`:x.done?'COMPLETE':'INCOMPLETE';return `<div class="reqItem ${x.done?'done':''}"><div class="reqItemHead"><span>${x.done?'✓':'🔒'} ${x.name}</span><strong>${val}</strong></div><small>${x.detail}</small><div class="reqTrack"><i style="width:${pc}%"></i></div></div>`}).join('');let masterText=mp.total?`${mp.n} / ${mp.total} cards`:`${mp.n} cards owned`;let pct=mp.total?mp.p:0;let milestones=[25,50,75,100].map(v=>`<span class="${pct>=v?'hit':''}">${pct>=v?'✓ ':''}${v}%</span>`).join('');let masterHTML=`<div class="reqMasterV98"><div class="reqMasterHeadV98"><div><span>MASTER SET</span><b>${masterText}</b></div><strong>${mp.total?pct.toFixed(1)+'%':'LOADING'}</strong></div><div class="reqMasterTrackV98"><i style="width:${pct}%"></i></div><div class="reqMasterMilestonesV98">${milestones}</div><small>Tracks cards currently held across your collection. Selling a card can reduce this progress.</small></div>`;$('#reqList').innerHTML=reqHTML+masterHTML;$('#reqStatus').className='reqStatus '+(r.done?'ready':'');$('#reqStatus').textContent=r.done?'✓ ALL REQUIREMENTS COMPLETE — SET UNLOCKED':`${r.items.filter(x=>x.done).length} / ${r.items.length} REQUIREMENTS COMPLETE`;$('#setReqModal').classList.add('show')}
function xpFloor(lv){return Math.max(0,(lv-1)*(lv-1)*80)}
function xpCeil(lv){return lv*lv*80}
function levelFromXP(xp){let lv=1;while(lv<50&&Number(xp||0)>=xpCeil(lv))lv++;return lv}
function rankName(lv){if(lv>=38)return 'TCG ICON';if(lv>=30)return 'VAULT LEGEND';if(lv>=22)return 'MASTER COLLECTOR';if(lv>=15)return 'ELITE COLLECTOR';if(lv>=8)return 'FOIL HUNTER';if(lv>=4)return 'PACK COLLECTOR';return 'ROOKIE COLLECTOR'}
function setUnlocked(s){return setRequirementState(s).done}
function updateProgressUI(){let lv=levelFromXP(state.xp),lo=xpFloor(lv),hi=xpCeil(lv),pct=Math.max(0,Math.min(100,(state.xp-lo)/(hi-lo)*100));let a=$('#headerRank'),b=$('#headerLevel'),c=$('#miniXPFill'),d=$('#xpNextV104');if(a)a.textContent=rankName(lv);if(b)b.textContent='LV '+lv;if(c)c.style.width=pct+'%';if(d)d.textContent=Math.max(0,Math.ceil(hi-Number(state.xp||0))).toLocaleString()+' XP TO NEXT'}
function addXP(n,why=''){let before=levelFromXP(state.xp);state.xp=Number(state.xp||0)+Math.max(0,Number(n)||0);let after=levelFromXP(state.xp);updateProgressUI();if(after>before){toast(`⚡ LEVEL UP! Level ${after} • ${rankName(after)}`);renderSets()}save()}
function renderSets(){let g=$('#sets');g.innerHTML='';[...SETS].map((s,i)=>({s,i})).sort((a,b)=>(Number(a.s.unlock||99)-Number(b.s.unlock||99))||(a.i-b.i)).map(x=>x.s).forEach(s=>{let unlocked=setUnlocked(s),req=setRequirementState(s),d=document.createElement('div');d.className='set '+(unlocked?'unlocked':'locked')+(s.id===sel.id?' selected':'');d.dataset.setId=s.id;d.style.background=`linear-gradient(145deg,${s.a}33,${s.b}55,#101722)`;let era=s.series==='sv'?'Scarlet & Violet':s.series==='swsh'?'Sword & Shield':s.series==='sm'?'Sun & Moon':'XY';let mega=req.mega?`<span class="setMegaTag">✦ ${req.label}</span>`:'';let mp=masterProgressV58(s);d.innerHTML=`${mega}<img src="${logo(s)}" onerror="this.style.display='none';this.closest('.set')?.classList.add('logoMissingV95')"><div class="setMasterV58"><div class="smTop"><span>MASTER SET</span><span>${mp.total?mp.n+'/'+mp.total:(mp.n?mp.n+' owned':'0')}</span></div><div class="smBar"><i style="width:${mp.p}%"></i></div></div><b>${s.name}</b><small>${era}</small>${unlocked?`<span class="setOpen">✓ UNLOCKED</span>`:`<div class="setLock">🔒 LOCKED</div>`}<button class="setReqBtn setReqBtn">${unlocked?'VIEW SET REQUIREMENTS':'🔒 SET REQUIREMENTS'}</button>`;d.querySelector('.setReqBtn').onclick=e=>{e.stopPropagation();showSetRequirements(s)};d.onclick=()=>{if(busy)return;if(!setUnlocked(s)){showSetRequirements(s);return}sel=s;renderSets();applyPackArt();resetPack();setTimeout(()=>buildPools(),80)};g.appendChild(d)});requestAnimationFrame(()=>{const a=g.querySelector('.set.selected');if(a)a.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})})}
function resetPack(){v142CancelTear();ripToken++;busy=false;pulls=[];idx=0;let p=$('#pack');p.classList.remove('ripping','rip0','rip1','rip2','v91Rip','v91Grab');p.style.display='block';p.style.opacity='1';p.style.transform='';document.getElementById('v88Summary')?.remove();document.getElementById('v90InsideCards')?.classList.remove('show','v91Emerge');$('#stage').classList.remove('cardModeV89');$('#foil').style.opacity='1';$('#foil').style.transform='';$('#foilTop').style.opacity='1';$('#foilTop').style.transform='';p.style.setProperty('--a',sel.a);p.style.setProperty('--b',sel.b);$('#foilTop').style.setProperty('--a',sel.a);$('#foilTop').style.setProperty('--b',sel.b);$('#logo').src=logo(sel);$('#packTitle').textContent=sel.name.toUpperCase();$('#tear').style.left='-5px';$('#tear').style.transform='';$('#tear').classList.add('pulse');$('#prog').style.width='0';$('#stack').className='cardStack';$('#stack').style.display='none';['v76Under1','v76Under2'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});$('#stage').style.removeProperty('--peekX');$('#stage').style.removeProperty('--peekY');$('#stage').style.removeProperty('--peekRX');$('#stage').style.removeProperty('--peekRY');$('#counter').style.display='none';$('#meta').classList.remove('show');$('#rarityBanner').classList.remove('show');$('#stage').className='stage';openStyle=0;$('#pack').dataset.open=openStyle;$('#tear').textContent=openStyle===0?'➜':openStyle===1?'↑':'↗';let gesture='DRAG SEAL RIGHT';$('#packGestureHint').textContent=gesture;$('#instruction').textContent=(v114PackCount===10?'$80.00 • swipe across all 10 packs':'$8.00 per pack • drag the foil seam to open');v114RenderMode()}
function emergencySet(set){
  /* Offline/network failsafe: keep packs playable even if TCGdex is temporarily unreachable.
     Uses predictable TCGdex asset paths; live card metadata hydrates again automatically when service returns. */
  const max=220, cards=[];
  for(let n=1;n<=max;n++){
    let id=`${set.id}-${n}`, base=`https://assets.tcgdex.net/en/${set.series}/${set.id}/${n}`;
    cards.push({id,name:`${set.name} #${n}`,number:String(n),img:base+'/high.webp',thumb:base+'/low.webp',
      rarity:'Card',set:set.name,setId:set.id,secret:false,emergency:true});
  }
  return {cards,official:max,emergency:true};
}
async function fetchWithTimeout(url,ms=2200){
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),ms);
  try{return await fetch(url,{signal:ctl.signal,cache:'default'})}finally{clearTimeout(tm)}
}
async function getSet(target=sel){
  target=target||sel;
  if(cache[target.id]?.base&&!cache[target.id].base.emergency)return cache[target.id].base;
  let lastErr=null;
  for(let attempt=0;attempt<2;attempt++){
    try{
      let r=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(target.id)}`,attempt?8500:6000);
      if(!r.ok)throw Error('set '+r.status);
      let j=await r.json(),official=j.cardCount?.official||j.cardCount?.total||9999;
      let cards=(j.cards||[]).filter(c=>c.image&&c.id.startsWith(target.id+'-')).map(c=>({
        id:c.id,name:c.name,number:c.localId,img:asset(c.image,'high'),thumb:asset(c.image,'low'),
        rarity:c.rarity||'',set:target.name,setId:target.id,secret:(parseInt(c.localId)||0)>official
      }));
      if(!cards.length)throw Error('empty set');
      cache[target.id]=cache[target.id]||{};cache[target.id].base={cards,official};
      state.masterTotalsV66=state.masterTotalsV66||{};state.masterTotalsV66[target.id]=official;
      if(target.id===sel.id)applyPackArt();
      return cache[target.id].base;
    }catch(e){lastErr=e;if(attempt===0)await new Promise(r=>setTimeout(r,180))}
  }
  cache[target.id]=cache[target.id]||{};
  if(cache[target.id].base?.cards?.length)return cache[target.id].base;
  cache[target.id].base=emergencySet(target);
  if(target.id===sel.id)toast('Card server is slow — backup cards loaded. Retrying live data automatically.');
  return cache[target.id].base;
}
const detailCache={};
function marketFromDetail(x,finish=''){let p=x?.pricing?.tcgplayer||{},f=(finish||'').toLowerCase(),v;if(f.includes('reverse'))v=p['reverse-holofoil'];else if(f.includes('holo')||f.includes('foil'))v=p.holofoil||p.normal;else v=p.normal||p.holofoil;let n=v?.marketPrice??v?.midPrice??v?.lowPrice; if(!(n>0)){let cm=x?.pricing?.cardmarket;n=(f.includes('holo')?(cm?.['trend-holo']??cm?.['avg-holo']??cm?.['low-holo']):(cm?.trend??cm?.avg??cm?.low));}return Math.max(.10,Math.round((Number(n)||.10)*100)/100)}
async function hydrateCard(c){
 if(!c)return c;
 const sid=c.setId||masterResolveSetV66Early(c);
 if(sid){c.setId=sid;c.set=c.set||SETS.find(x=>x.id===sid)?.name||''}
 if(detailCache[c.id]){
   let x=detailCache[c.id];Object.assign(c,{name:x.name||c.name,number:x.localId||c.number,rarity:x.rarity||c.rarity||'Card',variants:x.variants||c.variants,market:marketFromDetail(x,c.finish)});
   if(x.image){c.img=asset(x.image,'high');c.thumb=asset(x.image,'low')}return c
 }
 for(let attempt=0;attempt<2;attempt++){
   try{
     let rr=await fetchWithTimeout(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(c.id)}`,attempt?7000:4500);
     if(rr.ok){
       let x=await rr.json();detailCache[c.id]=x;
       c.name=x.name||c.name;c.number=x.localId||c.number;c.rarity=x.rarity||c.rarity||'Card';c.variants=x.variants;c.market=marketFromDetail(x,c.finish);
       c.setId=x.set?.id||c.setId||sid;c.set=x.set?.name||c.set||SETS.find(z=>z.id===c.setId)?.name||'';
       if(x.image){c.img=asset(x.image,'high');c.thumb=asset(x.image,'low')}
       c.emergency=false;return c
     }
   }catch(e){}
   if(attempt===0)await new Promise(r=>setTimeout(r,120))
 }
 if(!(c.market>0))c.market=.10;
 return c
}
function masterResolveSetV66Early(c){let id=c?.id||'';if(c?.setId)return c.setId;if(c?.set){let st=SETS.find(x=>x.name===c.set);if(st)return st.id}let st=SETS.find(x=>id===x.id||id.startsWith(x.id+'-'));return st?.id||''}
function warmPack(out){out.forEach((c,i)=>{let im=new Image();im.decoding='async';im.src=c.thumb;if(i<4)setTimeout(()=>hydrateCard(c),i*70)});return out}
function tier(c){let r=(c?.rarity||'').toLowerCase().trim(),n=(c?.name||'').toLowerCase().trim(),f=(c?.finish||'').toLowerCase().trim(),x=`${r} ${n} ${f}`;if(c?.secret||/hyper|secret|rainbow|rare rainbow|rare secret|gold rare/.test(x))return 5;if(/special illustration|shiny ultra/.test(x))return 4;if(/illustration|shiny rare|rare shiny|ultra rare|amazing|radiant|trainer gallery|galarian gallery|rare holo vmax|holo rare vmax|rare holo vstar|holo rare vstar|\bvmax\b|\bvstar\b/.test(x))return 3;if(/double rare|ace spec|rare holo gx|holo rare gx|rare holo v|holo rare v|\bex\b|\bgx\b|(?:^|\s)v(?:$|\s)/.test(x))return 2;if(/rare|holo|reverse/.test(x))return 1;return Math.max(0,Math.min(5,Number(c?.tier||0)))}
function pick(a){return a[Math.floor(Math.random()*a.length)]}function unique(a,used){let p=a.filter(c=>!used.has(c.id));let c=pick(p.length?p:a);if(c)used.add(c.id);return c}
const poolCache={};
async function rarityPool(set,rarity){let key=set.id+'|'+rarity;if(poolCache[key])return poolCache[key];try{let url=`https://api.tcgdex.net/v2/en/cards?set.id=eq:${encodeURIComponent(set.id)}&rarity=eq:${encodeURIComponent(rarity)}`;let r=await fetch(url);if(!r.ok)return[];let a=await r.json();let out=a.filter(c=>c.image&&c.id.startsWith(set.id+'-')).map(c=>({id:c.id,name:c.name,number:c.localId,img:asset(c.image,'high'),thumb:asset(c.image,'low'),rarity,set:set.name,setId:set.id}));poolCache[key]=out;return out}catch{return[]}}
async function buildPools(){
 let base=await getSet();if(!base)return null;if(base.emergency){let all=base.cards;return {base,all,common:all,uncommon:all,rare:all,hits:all,big:all}};
 // TCGdex uses exact rarity labels. Keep era pools explicit so older sets do not inherit SWSH-only labels.
 const ERA_RARITIES={
  sv:['Common','Uncommon','Rare','Double rare','Illustration rare','Ultra Rare','Special illustration rare','Hyper rare','ACE SPEC Rare','Shiny rare','Shiny Ultra Rare'],
  swsh:['Common','Uncommon','Rare','Holo Rare','Holo Rare V','Holo Rare VMAX','Holo Rare VSTAR','Amazing Rare','Radiant Rare','Ultra Rare','Secret Rare','Shiny rare','Shiny rare V','Shiny rare VMAX','Full Art Trainer'],
  sm:['Common','Uncommon','Rare','Rare Holo','Ultra Rare','Secret Rare','Prism Star'],
  xy:['Common','Uncommon','Rare','Rare Holo','Ultra Rare','Secret Rare']
 };
 let names=ERA_RARITIES[sel.series]||ERA_RARITIES.xy;
 let lists=await Promise.all(names.map(r=>rarityPool(sel,r)));
 let P={all:base.cards,names};names.forEach((n,i)=>P[n]=lists[i]);
 P.common=P.Common||[];P.uncommon=P.Uncommon||[];
 P.rare=[...(P.Rare||[]),...(P['Holo Rare']||[]),...(P['Rare Holo']||[])];
 P.big=names.slice(3).flatMap(n=>P[n]||[]);
 // Every card in the selected set remains in P.all. The wildcard route in makePack gives every checklist card a non-zero pull chance.
 return P
}
function weighted(groups){let x=Math.random(),sum=0;for(let [w,a] of groups){sum+=w;if(x<sum&&a?.length)return pick(a)}for(let [,a] of groups)if(a?.length)return pick(a);return null}
function addWildcard(out,u,P,chance=.012){if(Math.random()>=chance||!P.all?.length)return false;let c=unique(P.all,u);if(!c)return false;out.push({...c,finish:'Wildcard hit'});return true}
const GOD_PACK_RATE=0.001;
const SIM_PULL_RATES={
 sv:{wildcard:.012,rows:[['Illustration Rare • reverse slot',.055,2],['Ultra Rare • reverse slot',.018,2],['Special Illustration Rare • reverse slot',.009,2],['Hyper Rare • reverse slot',.003,2],['Double Rare • final slot',.17,1],['Ultra Rare • final slot',.055,1],['Illustration Rare • final slot',.035,1],['Special Illustration Rare • final slot',.025,1],['Hyper Rare • final slot',.01,1],['ACE SPEC Rare • final slot',.005,1]]},
 swsh:{wildcard:.012,rows:[['Holo Rare',.18,1],['Holo Rare V',.09,1],['Holo Rare VMAX',.035,1],['Holo Rare VSTAR',.02,1],['Radiant Rare',.02,1],['Amazing Rare',.02,1],['Ultra Rare',.012,1],['Secret Rare',.008,1],['Shiny Rare VMAX',.005,1]]},
 sm:{wildcard:.015,rows:[['Rare Holo',.16,1],['Ultra Rare',.075,1],['Secret Rare',.025,1],['Prism Star',.01,1]]},
 xy:{wildcard:.015,rows:[['Rare Holo',.16,1],['Ultra Rare',.075,1],['Secret Rare',.025,1]]}
};
function pct(v){return (v*100).toFixed(v<.01?2:1).replace(/\.0$/,'')+'%'}
function oneIn(v){return v>0?'1 in '+Math.round(1/v).toLocaleString():'—'}
function showPullRates(){let cfg=SIM_PULL_RATES[sel.series]||SIM_PULL_RATES.xy;$('#ratesSetName').textContent=sel.name+' • '+(sel.series==='sv'?'Scarlet & Violet':sel.series==='swsh'?'Sword & Shield':sel.series==='sm'?'Sun & Moon':'XY')+' era';let rows=cfg.rows.map(([n,r,slots])=>{let pack=1-Math.pow(1-r,slots);return `<div class="rateRow"><div class="rateLine"><span>${n}</span><span>${pct(r)} per ${slots>1?'eligible slot':'pack slot'}</span></div><div class="rateBar"><i style="width:${Math.min(100,r*100)}%"></i></div>${slots>1?`<div class="rateNote">Across both reverse slots: ~${pct(pack)} chance before wildcard/God Pack override.</div>`:''}</div>`}).join('');$('#ratesBody').innerHTML=`<div class="rateHero"><div class="rateLine"><span>🌟 GOD PACK</span><b>${pct(GOD_PACK_RATE)} • ${oneIn(GOD_PACK_RATE)}</b></div><div class="rateNote">Hard-coded and checked against the pack generator. A God Pack replaces the normal pack with 10 cards drawn from the selected expansion's complete hit pool, including supported Gallery/Vault subsets.</div></div>${rows}<div class="rateRow"><div class="rateLine"><span>🃏 Checklist Wildcard</span><span>${pct(cfg.wildcard)} • ${oneIn(cfg.wildcard)}</span></div><div class="rateBar"><i style="width:${cfg.wildcard*100}%"></i></div><div class="rateNote">Anti-softlock route: can select any card in the selected set checklist. This means exact total rarity odds vary slightly with each set's rarity composition.</div></div><p class="rateNote"><b>Simulator rates, not official Pokémon odds.</b> Pokémon publishes pack structure but does not publish exact rarity pull ratios for physical English booster packs. These numbers are generated directly from this game's current probability constants, so this screen stays aligned with the code.</p>`;$('#ratesModal').classList.add('show')}
function makeGodPack(P,u){
 let parent=(typeof sel!=='undefined'&&sel)||null;
 let subsetHits=(P?.subsetsV187||[]).flatMap(g=>(g?.cards||[]).map(c=>({...c,setId:parent?.id||c.setId,set:parent?.name||c.set,secret:true,_subsetName:g.name||c._subsetName,_subsetRate:Number(g.rate||c._subsetRate||0),_parentSetId:parent?.id||c._parentSetId,_parentSetName:parent?.name||c._parentSetName,finish:`🌟 GOD PACK${g.name?' • '+g.name:''}`})));
 let allHits=[...(P?.big||[]),...subsetHits].filter(Boolean),seen=new Set(),hits=[];
 for(const c of allHits){if(c?.id&&!seen.has(c.id)){seen.add(c.id);hits.push(c)}}
 let fallback=[...(P?.rare||[]),...(P?.all||[])].filter(Boolean);
 let pool=hits.length>=10?hits:[...hits,...fallback],out=[];
 while(out.length<10&&pool.length){let c=unique(pool,u);if(!c)break;let sub=!!c._subsetName;out.push({...c,setId:sub&&parent?parent.id:c.setId,set:sub&&parent?parent.name:c.set,secret:sub?true:c.secret,finish:c.finish&&String(c.finish).startsWith('🌟 GOD PACK')?c.finish:'🌟 GOD PACK',_parentSetId:sub&&parent?parent.id:c._parentSetId,_parentSetName:sub&&parent?parent.name:c._parentSetName});}
 while(out.length<10){let c=unique(P?.all||fallback,u);if(!c)break;out.push({...c,finish:'🌟 GOD PACK'});}
 return out
}
function starterActiveV199(){return !!(state.starterV199?.eligible&&Number(state.starterV199.remaining||0)>0)}
function weightedStarterV199(groups){
 const valid=(groups||[]).filter(([w,p])=>Number(w)>0&&p?.length);if(!valid.length)return null;
 let total=valid.reduce((n,[w])=>n+Number(w),0);if(total<=0)return null;let x=Math.random()*total;
 for(const [w,p] of valid){x-=Number(w);if(x<=0)return pick(p)}return pick(valid[valid.length-1][1]);
}
function starterHighPoolV199(P){
 const all=[...(P?.all||[]),...(P?.big||[]),...((P?.subsetsV187||[]).flatMap(g=>g?.cards||[]))].filter(Boolean),seen=new Set();
 const clean=all.filter(c=>{if(!c?.id||seen.has(c.id))return false;seen.add(c.id);return true});
 let top=clean.filter(c=>tier(c)>=4||/special illustration|hyper|secret|rainbow|gold|shiny ultra/i.test(String(c.rarity||'')));
 if(!top.length){const best=Math.max(0,...clean.map(c=>tier(c)));top=clean.filter(c=>tier(c)===best&&best>=3)}
 return top;
}
function forceStarterHighV199(out,P,u,packNo){
 const pool=starterHighPoolV199(P).filter(c=>!u.has(c.id));if(!pool.length)return false;
 const c=unique(pool,u)||pick(pool);if(!c)return false;
 const normalized={...c,setId:c._parentSetId||c.setId||sel.id,set:c._parentSetName||c.set||sel.name,secret:true,finish:`🎁 STARTER GUARANTEED SIR+ • PACK ${packNo}`};
 let ix=out.reduce((best,x,i)=>tier(x)<tier(out[best]||{})?i:best,0);if(ix<0||ix>=out.length)ix=Math.max(0,out.length-1);out[ix]=normalized;
 state.starterV199.guaranteedHighAwarded=Number(state.starterV199.guaranteedHighAwarded||0)+1;return true;
}
async function makePack(){
 if(!canAffordPackV161(sel.id,1)){toast('Not enough money, starter packs or sealed pack credits for a pack.');resetPack();return false}
 const starter=starterActiveV199(),starterPackNo=starter?Number(state.starterV199.used||0)+1:0,boost=starter?1.5:1;
 let P=await buildPools();if(!P||!Array.isArray(P.all)||!P.all.some(c=>c?.id)){toast('Card data unavailable. Please retry when online.');resetPack();return false}
 let u=new Set(),out=[],isGod=Math.random()<GOD_PACK_RATE,add=(pool,finish)=>{let c=unique(pool?.length?pool:P.all,u);if(c){c={...c};if(finish)c.finish=finish;out.push(c)}};
 if(isGod){state.specialStatsV198=state.specialStatsV198||{godPacks:0,godBySet:{}};state.specialStatsV198.godPacks=Number(state.specialStatsV198.godPacks||0)+1;state.specialStatsV198.godBySet=state.specialStatsV198.godBySet||{};state.specialStatsV198.godBySet[sel.id]=Number(state.specialStatsV198.godBySet[sel.id]||0)+1;out=makeGodPack(P,u);setTimeout(()=>{toast('🌟 GOD PACK! 1 IN 1,000!');if(navigator.vibrate)navigator.vibrate([60,40,100,40,160])},850)}
 else if(sel.series==='sv'){
  for(let i=0;i<4;i++)add(P.common);for(let i=0;i<3;i++)add(P.uncommon);
  for(let i=0;i<2;i++){
   let upgrade;
   if(starter){const h=[.055,.018,.009,.003].map(x=>x*boost),base=Math.max(0,1-h.reduce((a,b)=>a+b,0));upgrade=weightedStarterV199([[h[0],P['Illustration rare']],[h[1],P['Ultra Rare']],[h[2],P['Special illustration rare']],[h[3],P['Hyper rare']],[base,[...(P.common||[]),...(P.uncommon||[]),...(P.rare||[])]]])}
   else upgrade=weighted([[.055,P['Illustration rare']],[.018,P['Ultra Rare']],[.009,P['Special illustration rare']],[.003,P['Hyper rare']],[.915,[...(P.common||[]),...(P.uncommon||[]),...(P.rare||[])]]]);
   if(upgrade){upgrade={...upgrade,finish:'Reverse Foil'};if(/Illustration|Ultra|Hyper/i.test(upgrade.rarity||''))upgrade.finish=starter?'Starter Boost Hit Foil':'Hit Foil';if(!u.has(upgrade.id)){u.add(upgrade.id);out.push(upgrade)}else add([...(P.common||[]),...(P.uncommon||[])],'Reverse Foil')}
  }
  if(!addWildcard(out,u,P,.012*boost)){
   let rare;
   if(starter){const h=[.17,.055,.035,.025,.01,.005].map(x=>x*boost),base=Math.max(0,1-h.reduce((a,b)=>a+b,0));rare=weightedStarterV199([[base,P.rare],[h[0],P['Double rare']],[h[1],P['Ultra Rare']],[h[2],P['Illustration rare']],[h[3],P['Special illustration rare']],[h[4],P['Hyper rare']],[h[5],P['ACE SPEC Rare']]])}
   else rare=weighted([[.70,P.rare],[.17,P['Double rare']],[.055,P['Ultra Rare']],[.035,P['Illustration rare']],[.025,P['Special illustration rare']],[.01,P['Hyper rare']],[.005,P['ACE SPEC Rare']]]);
   if(rare&&!u.has(rare.id)){u.add(rare.id);out.push({...rare,finish:starter?'Starter Boost • Holo / Rare+':'Holo / Rare+'})}else add(P.rare.length?P.rare:P.big,'Holo / Rare+')
  }
 }else if(sel.series==='swsh'){
  for(let i=0;i<5;i++)add(P.common);for(let i=0;i<3;i++)add(P.uncommon);
  let subset=false;
  if(starter&&P?.subsetsV187?.length){const oldRates=P.subsetsV187.map(g=>g.rate);P.subsetsV187.forEach(g=>g.rate=Math.min(1,Number(g.rate||0)*boost));subset=maybeSubsetHitV187(P,out,u,sel);P.subsetsV187.forEach((g,i)=>g.rate=oldRates[i])}else subset=maybeSubsetHitV187(P,out,u,sel);
  if(!subset)add([...(P.common||[]),...(P.uncommon||[]),...(P.rare||[])],'Reverse Foil');
  if(!addWildcard(out,u,P,.012*boost)){
   let rare;
   if(starter){const hw=[.18,.09,.035,.02,.02,.02,.012,.008,.005].map(x=>x*boost),base=Math.max(0,1-hw.reduce((a,b)=>a+b,0));rare=weightedStarterV199([[base,P.rare],[hw[0],P['Holo Rare']],[hw[1],P['Holo Rare V']],[hw[2],P['Holo Rare VMAX']],[hw[3],P['Holo Rare VSTAR']],[hw[4],P['Radiant Rare']],[hw[5],P['Amazing Rare']],[hw[6],P['Ultra Rare']],[hw[7],P['Secret Rare']],[hw[8],P['Shiny rare VMAX']]])}
   else rare=weighted([[.61,P.rare],[.18,P['Holo Rare']],[.09,P['Holo Rare V']],[.035,P['Holo Rare VMAX']],[.02,P['Holo Rare VSTAR']],[.02,P['Radiant Rare']],[.02,P['Amazing Rare']],[.012,P['Ultra Rare']],[.008,P['Secret Rare']],[.005,P['Shiny rare VMAX']]]);
   if(rare&&!u.has(rare.id)){u.add(rare.id);out.push({...rare,finish:starter?'Starter Boost • Rare slot':'Rare slot'})}else add(P.rare.length?P.rare:P.big,'Rare slot')
  }
 }else{
  for(let i=0;i<5;i++)add(P.common);for(let i=0;i<3;i++)add(P.uncommon);
  let subset=false;
  if(starter&&P?.subsetsV187?.length){const oldRates=P.subsetsV187.map(g=>g.rate);P.subsetsV187.forEach(g=>g.rate=Math.min(1,Number(g.rate||0)*boost));subset=maybeSubsetHitV187(P,out,u,sel);P.subsetsV187.forEach((g,i)=>g.rate=oldRates[i])}else subset=maybeSubsetHitV187(P,out,u,sel);
  if(!subset)add([...(P.common||[]),...(P.uncommon||[]),...(P.rare||[])],'Reverse Foil');
  if(!addWildcard(out,u,P,.015*boost)){
   let rare;
   if(starter){const holo=[...(P['Rare Holo']||[]),...(P['Holo Rare']||[])],hw=[.16,.075,.025,.01].map(x=>x*boost),base=Math.max(0,1-hw.reduce((a,b)=>a+b,0));rare=weightedStarterV199([[base,P.rare],[hw[0],holo],[hw[1],P['Ultra Rare']],[hw[2],P['Secret Rare']],[hw[3],P['Prism Star']]])}
   else rare=weighted([[.72,P.rare],[.16,P['Rare Holo']],[.16,P['Holo Rare']],[.075,P['Ultra Rare']],[.025,P['Secret Rare']],[.01,P['Prism Star']]]);
   if(rare&&!u.has(rare.id)){u.add(rare.id);out.push({...rare,finish:starter?'Starter Boost • Rare slot':'Rare slot'})}else add(P.rare.length?P.rare:P.big,'Rare slot')
  }
 }
 if(out.length!==10){for(let fill=0;out.length<10&&fill<10;fill++)add(P.all);out=out.slice(0,10)}
 if(out.length!==10||out.some(c=>!c?.id)){resetPack();return false}
 if(starter&&(starterPackNo===5||starterPackNo===10))forceStarterHighV199(out,P,u,starterPackNo);
 payForPackV161(sel.id);pulls=out;state.packs++;
 if(state.gradingV44){state.gradingV44.openedForGrading=Number(state.gradingV44.openedForGrading||0)+1;if(typeof renderGradingV44==='function')setTimeout(renderGradingV44,0)}
 save();warmPack(pulls);return true
}
function v114RenderMode(){
 const stage=document.getElementById('stage'),line=document.getElementById('v114TenLine'),cost=document.getElementById('v114Cost');if(!stage||!line)return;
 stage.classList.toggle('v114TenMode',v114PackCount===10&&!busy);stage.classList.remove('v114TenRipping');
 if(cost)cost.textContent=v114PackCount===10?'$80.00':'$8.00';
 document.querySelectorAll('#v114PackMode button').forEach(b=>b.classList.toggle('active',Number(b.dataset.count)===v114PackCount));
 if(v114PackCount===10){let art=document.getElementById('packArt')?.src||'';line.innerHTML=Array.from({length:10},(_,i)=>`<div class="v114MiniPack" style="--i:${i}"><img src="${art}" alt=""></div>`).join('')+'<div class="v114TenHint">SWIPE RIGHT TO RIP ALL 10</div>';}
 else line.innerHTML='';
}
async function v114MakeBatch(){
 if(!canAffordPackV161(sel.id,10)){toast('You need enough cash or sealed pack credits for 10 packs.');resetPack();return false}
 const paths=['coins','packs','starterV199','sealedV161.packCredits','specialStatsV198','gradingV44.openedForGrading','recentHitsV188','packStatsV253'];
 const checkpoint=paths.map(path=>{const keys=path.split('.'),key=keys.pop(),obj=keys.reduce((o,k)=>o?.[k],state);return {keys,key,exists:!!obj&&Object.hasOwn(obj,key),value:obj?.[key]===undefined?undefined:JSON.parse(JSON.stringify(obj[key]))}});
 const rollback=()=>{for(const item of checkpoint){const obj=item.keys.reduce((o,k)=>o?.[k],state);if(!obj)continue;if(item.exists)obj[item.key]=item.value;else delete obj[item.key]}v114BatchGroups=[];pulls=[];idx=0;save()};
 v114BatchGroups=[];let flat=[];
 try{
 for(let n=0;n<10;n++){let ok=await makePack();if(!ok){rollback();return false}let group=pulls.map(c=>({...c,_v114Pack:n+1}));v114BatchGroups.push(group);flat.push(...group)}
 pulls=flat;idx=0;save();warmPack(pulls);return true;
 }catch(error){rollback();throw error}
}
function v114BatchFinish(){
 let groups=v114BatchGroups.length?v114BatchGroups:[pulls];
 groups.forEach(g=>{let best=[...g].sort((a,b)=>tier(b)-tier(a))[0];if(!best)return;let hit=g.some(c=>tier(c)>=2||c.secret);if(hit)state.hits++;let bestTier=tier(best);addXP(5+bestTier*3,'pack');state.history.unshift({set:sel.name,best:best.name,rarity:best.rarity||'Card',time:Date.now()})});
 state.history=state.history.slice(0,40);save();
}
document.querySelectorAll('#v114PackMode button').forEach(b=>b.addEventListener('click',()=>{if(busy)return;v114PackCount=Number(b.dataset.count)||1;resetPack()}));
// V115: the ten-pack fan is the actual gesture target. V114 disabled the hidden single pack, leaving nothing swipeable.
(()=>{const line=document.getElementById('v114TenLine');if(!line)return;let active=false,sx=0,sy=0,pid=null;const reset=()=>{active=false;pid=null;line.style.transform='translate(-50%,-50%)';};line.addEventListener('pointerdown',e=>{if(busy||v114PackCount!==10)return;active=true;pid=e.pointerId;sx=e.clientX;sy=e.clientY;try{line.setPointerCapture(pid)}catch(_){};e.preventDefault()},{passive:false});line.addEventListener('pointermove',e=>{if(!active||busy||e.pointerId!==pid)return;let dx=Math.max(0,e.clientX-sx),dy=e.clientY-sy;line.style.transform=`translate(calc(-50% + ${Math.min(dx*.16,22)}px),calc(-50% + ${Math.max(-8,Math.min(8,dy*.05))}px))`;if(dx>=115){active=false;line.style.transform='translate(-50%,-50%)';beginRip()}e.preventDefault()},{passive:false});line.addEventListener('pointerup',reset,{passive:false});line.addEventListener('pointercancel',reset,{passive:false});})();
function v142StartTear(){if(openStyle!==0)return;v142CancelTear();let foil=$('#foil'),pack=$('#pack');if(!foil||!pack)return;let c=foil.cloneNode(true);c.id='v142TearPiece';c.className='foil v142TearPiece';c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));pack.appendChild(c);foil.classList.add('v142CutBase');v142SetTear(0)}
function v142SetTear(p){if(openStyle!==0)return;let foil=$('#foil'),c=document.getElementById('v142TearPiece');if(!foil||!c)return;let x=Math.max(0,Math.min(100,p*100)),y=13.2,lip=Math.max(.7,Math.min(2.2,.7+p*1.5));foil.style.clipPath='';c.style.clipPath=`polygon(0 ${y-lip}%,${x}% ${y-lip}%,${x}% ${y+lip}%,0 ${y+lip}%)`;c.style.transform=`translateY(${-p*2}px)`;c.style.filter=`drop-shadow(0 ${1+p*2}px ${2+p*2}px rgba(30,40,60,${.06+p*.08}))`}
function v142CancelTear(){let foil=$('#foil'),c=document.getElementById('v142TearPiece');if(c)c.remove();if(foil){foil.style.clipPath='';foil.classList.remove('v142CutBase')}}
function v142CommitTear(){let c=document.getElementById('v142TearPiece');if(c){c.classList.add('v142Fly');setTimeout(()=>c.remove(),650)}let foil=$('#foil');if(foil)foil.style.clipPath='polygon(0 13.2%,100% 13.2%,100% 100%,0 100%)'}
function xy(e){let q=e.touches?e.touches[0]:e;return{x:q.clientX,y:q.clientY}}function down(e){let a=audio();if(a&&a.state==='suspended')a.resume();if(busy)return;drag=true;let q=xy(e);startX=q.x;startY=q.y;$('#tear').classList.remove('pulse');$('#pack').classList.add('v91Grab');v142StartTear();if(e.cancelable)e.preventDefault()}function move(e){if(!drag||busy)return;let q=xy(e),dx=q.x-startX,dy=q.y-startY,p=0;if(openStyle===0)p=Math.max(0,Math.min(1,dx/205));if(openStyle===1)p=Math.max(0,Math.min(1,-dy/150));if(openStyle===2)p=Math.max(0,Math.min(1,(dx-dy)/260));$('#prog').style.width=(p*100)+'%';$('#pack').style.transform=`rotateY(${Math.max(-9,Math.min(9,dx*.045))}deg) rotateX(${Math.max(-7,Math.min(7,-dy*.035))}deg)`;if(openStyle===0){$('#tear').style.left=(p*205-5)+'px';v142SetTear(p)}else if(openStyle===1){$('#tear').style.transform=`translateY(${-p*125}px) rotate(${-p*25}deg)`;$('#foilTop').style.transform=`translateY(${-p*25}px) rotateX(${p*28}deg)`}else{$('#tear').style.transform=`translate(${p*175}px,${-p*80}px) rotate(${p*35}deg)`;$('#foilTop').style.transform=`translate(${p*12}px,${-p*12}px) rotate(${p*5}deg)`}if(e.cancelable)e.preventDefault();if(p>=.96){drag=false;v142SetTear(1);v142CommitTear();beginRip()}}function up(){if(!drag)return;drag=false;$('#tear').style.left='-5px';$('#tear').style.transform='';$('#prog').style.width='0';$('#foilTop').style.transform='';$('#pack').style.transform='';$('#tear').classList.add('pulse');$('#pack').classList.remove('v91Grab');v142CancelTear()}
let ripToken=0;function finishRip(token){if(token!==ripToken||!busy||!pulls.length)return;let p=$('#pack'),st=$('#stack'),stage=$('#stage'),inside=document.getElementById('v90InsideCards');stage.classList.add('cardModeV89');stage.classList.remove('v114TenMode','v114TenRipping');inside?.classList.remove('show','v91Emerge');p.style.display='none';document.querySelector('.v114BatchChip')?.remove();st.style.display='block';st.classList.add('v91Land');requestAnimationFrame(()=>st.classList.add('show'));$('#counter').style.display='block';$('#instruction').textContent='Drag to peek • flick the top card away';showBack();st.classList.add('v91Land');setTimeout(()=>st.classList.remove('v91Land'),760);stage.classList.remove('v91Cinematic','v91Flash')}
function v91FoilBurst(){let stage=$('#stage');let old=document.getElementById('v91FoilBits');old?.remove();let box=document.createElement('div');box.id='v91FoilBits';box.className='v91FoilBits';for(let i=0;i<14;i++){let b=document.createElement('i');let a=(Math.PI*2*i/14)+(Math.random()-.5)*.45,dist=70+Math.random()*115;b.style.setProperty('--x',(Math.cos(a)*dist)+'px');b.style.setProperty('--y',(Math.sin(a)*dist+55)+'px');b.style.setProperty('--r',(Math.random()*180)+'deg');b.style.setProperty('--d',(520+Math.random()*380)+'ms');box.appendChild(b)}stage.appendChild(box);setTimeout(()=>box.remove(),1100)}
async function beginRip(){busy=true;let token=++ripToken;$('#rarityBanner').classList.remove('show');if(v114PackCount===10){$('#stage').className='stage v91Cinematic v114TenMode v114TenRipping';$('#instruction').textContent='RIPPING ALL 10 PACKS…';try{sfxEventV70('tear');setTimeout(()=>sfxEventV70('wrapper'),180);setTimeout(()=>sfxEventV70('tear'),360)}catch(e){}if(navigator.vibrate)navigator.vibrate([12,18,12,18,24]);await new Promise(r=>setTimeout(r,360));}else{$('#stage').className='stage v91Cinematic';$('#instruction').textContent='';}let ok=false;try{ok=v114PackCount===10?await v114MakeBatch():await makePack()}catch(error){console.error('[TCG] Pack opening failed',error);toast('Pack could not open. Please retry.')}if(!ok){v142CancelTear();busy=false;$('#stage').className='stage';v114RenderMode();return}if(v114PackCount===10){$('#stage').classList.add('v114TenMode','v114TenRipping');$('#instruction').textContent='10 PACKS RIPPED • 100 CARDS READY'}let p=$('#pack'),stage=$('#stage'),inside=document.getElementById('v90InsideCards');p.classList.remove('ripping','rip0','rip1','rip2');p.classList.add('v91Rip');stage.classList.add('v91Flash');v91FoilBurst();try{sfxEventV70('tear');setTimeout(()=>sfxEventV70('wrapper'),250)}catch(e){}if(navigator.vibrate)navigator.vibrate([12,22,16,34,26]);setTimeout(()=>inside?.classList.add('v91Emerge'),90);setTimeout(()=>{if(token===ripToken)stage.classList.remove('v91Flash')},700);setTimeout(()=>finishRip(token),760);setTimeout(()=>{if(token===ripToken&&busy&&pulls.length&&$('#stack').style.display==='none')finishRip(token)},1050)}
function showBack(autoReveal=false){
 let c=pulls[idx],img=$('#cardImg'),st=$('#stack');if(!c)return;
 st.className='cardStack show faceVisible flipped';st.style.transform='';st.style.opacity='1';st.dataset.faceReady='0';
 $('#stage').className='stage cardModeV89';$('#rarityBanner').classList.remove('show');$('#meta').classList.remove('show','hitDecision','flowOut');
 $('#counter').textContent=v114PackCount===10?`${Math.floor(idx/10)+1} / 10`:`${idx+1} / ${pulls.length}`;$('#instruction').textContent=v114PackCount===10?'Swipe through all 100 cards':'Swipe the card away to continue';
 const chip=document.getElementById('v74RouteChip');if(chip){chip.classList.remove('show');chip.textContent=''};
 hydrateCard(c).then(()=>{
   if(!pulls[idx]||pulls[idx].id!==c.id)return;
   const face=c.img||c.thumb||'';let fxDone=false;const runFx=()=>{if(fxDone)return;fxDone=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(typeof v128PlayHero==='function'&&v128PlayHero(c)){sfxV67('card');}else applyRevealEffects(c,st)}))};if(face){img.onload=()=>{st.dataset.faceReady='1';runFx()};img.onerror=()=>{st.dataset.faceReady='1';runFx()};img.src=face;if(img.complete&&img.naturalWidth){st.dataset.faceReady='1';runFx()}}else{st.dataset.faceReady='1';runFx()}
   const bulk=isBulkCardV64(c);if(chip){chip.textContent=bulk?'🗃️ AUTO → BULK TUB':'📘 AUTO → BINDER';chip.classList.add('show');setTimeout(()=>chip.classList.remove('show'),900)}
 });
 if(!document.getElementById('rip')?.classList.contains('active'))updatePeekLayersV76();
 if(pulls[idx+1]){let n=new Image();n.src=pulls[idx+1].thumb||pulls[idx+1].img;hydrateCard(pulls[idx+1]).then(updatePeekLayersV76)}
 if(pulls[idx+2])hydrateCard(pulls[idx+2]).then(updatePeekLayersV76);
}

async function reveal(){return}

function effectClass(c){let r=(c.rarity||'').toLowerCase();if(/hyper|secret|rainbow|rare rainbow|rare secret/.test(r))return 'effect-hyper';if(/special illustration|shiny ultra/.test(r))return 'effect-sir';if(/ultra/.test(r))return 'effect-ultra';if(/illustration|amazing|radiant|trainer gallery/.test(r))return 'effect-ir';if(/double rare|rare holo v|ace spec|rare holo gx|vmax|vstar/.test(r))return 'effect-double';if(/rare|holo/.test(r)&&c.finish!=='Reverse Foil')return 'effect-holo';if(c.finish==='Reverse Foil')return 'effect-reverse';return ''}
function applyRevealEffects(c,st){sfxV67('card');let t=tier(c),v125Rare=t>=3||!!c?.secret;if(v125Rare){v125ForceRareReveal(c,st)}let isReverse=c.finish==='Reverse Foil',fx=effectClass(c),isFoil=!!fx,isHit=t>=2||c.secret,isNew=!state.binder[c.id]&&!state.bulkV64?.[c.id];if(isHit)setTimeout(()=>sfxV67(t>=4?'perfect':'hit'),90);if(fx)st.classList.add(fx);if(isFoil)st.classList.add('foil');if(isHit){st.classList.add('hit','hit'+Math.min(5,t));setTimeout(()=>{if(!$('#stage').classList.contains('v126RareStage')){$('#stage').classList.add('fx'+Math.min(5,t));sparks(t)}},100);hitSound(t);if(navigator.vibrate)navigator.vibrate(t>=5?[30,22,35,22,80]:t>=4?[25,30,25,30,60]:t>=3?[18,24,35]:[15,25,20])}else if(isReverse){holoSound()}else if(isFoil){holoSound();sparks(1)}if(t>=2){let b=$('#rarityBanner'),r=String(c.rarity||'').toLowerCase();b.textContent=
 /special illustration/.test(r)?'✦ SPECIAL ILLUSTRATION RARE ✦':
 /illustration/.test(r)?'✧ ILLUSTRATION RARE ✧':
 /shiny ultra/.test(r)?'✦ SHINY ULTRA RARE ✦':
 /shiny rare|rare shiny/.test(r)?'✦ SHINY RARE ✦':
 /hyper|secret|rainbow|rare rainbow|rare secret/.test(r)?'★ HYPER / SECRET RARE ★':
 /ultra/.test(r)?'✦ ULTRA RARE ✦':
 /double rare/.test(r)?'✦ DOUBLE RARE ✦':
 /ace spec/.test(r)?'✦ ACE SPEC ✦':
 /radiant/.test(r)?'✦ RADIANT RARE ✦':
 /amazing/.test(r)?'✦ AMAZING RARE ✦':
 /trainer gallery/.test(r)?'✦ TRAINER GALLERY ✦':
 /vmax/.test(r)?'✦ VMAX HIT ✦':
 /vstar/.test(r)?'✦ VSTAR HIT ✦':
 /rare holo v/.test(r)?'✦ POKÉMON V HIT ✦':
 /rare holo gx/.test(r)?'✦ POKÉMON-GX HIT ✦':
 '✦ HIT ✦';b.classList.add('show')}$('#cardName').textContent=(isNew?'NEW • ':'')+c.name;$('#cardRarity').textContent=c.rarity||'Card';$('#cardNo').textContent=`${c.set} • #${c.number}${c.finish?' • '+c.finish:''}`;let bulkRoute=isBulkCardV64(c),keepBtn=document.getElementById('keep');if(keepBtn)keepBtn.innerHTML=bulkRoute?'🗃️ ADD TO BULK TUB':'📘 STASH IN BINDER';$('#decisionHint').textContent=bulkRoute?'Bulk card — owning it in the Tub counts toward this Master Set.':'Hit card — owning it in the Binder counts toward this Master Set.';if(isHit){st.classList.add('hitMoment');$('#instruction').textContent=t>=4?'🔥 MASSIVE HIT!':'✨ HIT!';setTimeout(()=>{if(pulls[idx]!==c)return;st.classList.remove('hitMoment');$('#meta').classList.add('show','hitDecision');$('#instruction').textContent='Swipe this hit away to continue'},t>=4?900:620)}else{$('#meta').classList.add('show');$('#instruction').textContent=isReverse?'◇ REVERSE HOLO — swipe to continue':isFoil?'✦ HOLO — swipe to continue':'Swipe card away to continue'}}

function isBulkCardV64(c){
 const r=String(c?.rarity||'').toLowerCase().trim();
 if(!r||r==='card'||c?.emergency)return false;
 if(/shiny|illustration|ultra|double rare|secret|hyper|rainbow|radiant|amazing|trainer gallery|ace spec|rare holo v|max|vstar|gx|ex/.test(r))return false;
 if(/common|uncommon|rare|holo/.test(r))return true;
 return tier(c)<=1;
}
function addToBulkV64(c,count=1){
 let x=state.bulkV64[c.id];if(!x)state.bulkV64[c.id]={id:c.id,name:c.name,set:c.set,setId:c.setId||sel.id,number:c.number,rarity:c.rarity||'Card',img:c.img,thumb:c.thumb,secret:!!c.secret,finish:c.finish||'',market:c.market||.10,qty:count};else x.qty=(x.qty||0)+count;
}
function addToBinderV64(c,count=1){
 let x=state.binder[c.id];if(!x)state.binder[c.id]={id:c.id,name:c.name,set:c.set,setId:c.setId||sel.id,number:c.number,rarity:c.rarity||'Card',img:c.img,thumb:c.thumb,secret:!!c.secret,finish:c.finish||'',market:c.market||.10,qty:count};else x.qty=(x.qty||0)+count;
}
function decide(keep){sfxV67(keep?'keep':'trash');if(window.decisionLock)return;let c=pulls[idx];if(!c)return;window.decisionLock=true;awardChase(c);if(keep){if(isBulkCardV64(c)){addToBulkV64(c);toast('🗃️ Added to Bulk Tub • Master Set updated.');try{sfxEventV70('bulkDrop')}catch(e){}}else{let wasNew=!(state.binder?.[c.id]&&Number(state.binder[c.id].qty||0)>0);addToBinderV64(c);toast(wasNew?'📘 New hit added to Binder • Master Set updated.':'✓ Another hit stashed in Binder.');try{sfxEventV70('binder')}catch(e){}}}else{state.trashed=(state.trashed||0)+1;toast('Card trashed.')}save();try{renderBulkV64()}catch(e){};try{renderBinder()}catch(e){};try{renderSets()}catch(e){};try{renderMasterV57()}catch(e){};let st=$('#stack');$('#meta').classList.add('flowOut');st.classList.add(keep?'decisionOutKeep':'decisionOutTrash');if(navigator.vibrate)navigator.vibrate(keep?8:[7,18,7]);setTimeout(()=>{window.decisionLock=false;$('#meta').classList.remove('flowOut','hitDecision');advance(true)},145)}

function updatePeekLayersV76(){
 const a=document.getElementById('v76Under1'),b=document.getElementById('v76Under2');if(!a||!b)return;
 const n1=pulls[idx+1],n2=pulls[idx+2];
 [[a,n1],[b,n2]].forEach(([el,c])=>{const im=el.querySelector('img');if(c){const face=c.img||c.thumb||'';if(face&&im.src!==face)im.src=face;el.style.display='block'}else{el.style.display='none';im.removeAttribute('src')}});
}
let v76Tilt={x:0,y:0},v76TiltRAF=0;
function paintTiltV76(){v76TiltRAF=0;const stage=$('#stage');if(!stage||!busy||!pulls[idx]||v74Drag)return;const x=Math.max(-1,Math.min(1,v76Tilt.x)),y=Math.max(-1,Math.min(1,v76Tilt.y));stage.style.setProperty('--peekX',(x*8).toFixed(2)+'px');stage.style.setProperty('--peekY',(y*5).toFixed(2)+'px');stage.style.setProperty('--peekRY',(x*3.8).toFixed(2)+'deg');stage.style.setProperty('--peekRX',(-y*3.2).toFixed(2)+'deg');stage.classList.add('v76Gyro')}
function tiltV76(x,y){v76Tilt.x=v76Tilt.x*.72+x*.28;v76Tilt.y=v76Tilt.y*.72+y*.28;if(!v76TiltRAF)v76TiltRAF=requestAnimationFrame(paintTiltV76)}
window.addEventListener('deviceorientation',e=>{if(e.gamma==null||e.beta==null)return;tiltV76(Math.max(-22,Math.min(22,e.gamma))/22,Math.max(-22,Math.min(22,e.beta))/22)},{passive:true});
document.getElementById('stage')?.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!v74Drag){const r=e.currentTarget.getBoundingClientRect();tiltV76(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2)}},{passive:true});
function autoCollectV74(c){
 if(!c||window.v74CollectLock)return false;window.v74CollectLock=true;awardChase(c);
 if(isBulkCardV64(c)){addToBulkV64(c);try{sfxEventV70('bulkDrop')}catch(e){}}
 else{addToBinderV64(c);try{sfxEventV70('binder')}catch(e){}}
 save();try{renderBulkV64()}catch(e){};try{renderBinder()}catch(e){};try{renderSets()}catch(e){};try{renderMasterV57()}catch(e){}
 return true;
}
let v74Drag=null,v75RAF=0,v75LastThrow={x:0,y:18,r:0};
function v75PaintDrag(){
 v75RAF=0;if(!v74Drag)return;const d=v74Drag,st=$('#stack');
 const dx=d.dx,dy=d.dy,dist=Math.hypot(dx,dy),rot=Math.max(-22,Math.min(22,dx*.055));
 const lift=Math.min(1,dist/150),scale=1.012+lift*.018;
 st.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${rot}deg) scale(${scale})`;
 /* V82: the cards underneath resist the finger movement instead of travelling with
    the top card. This creates a real physical peek window while dragging. */
 const u1=document.getElementById('v76Under1'),u2=document.getElementById('v76Under2');
 const resist1=.075,resist2=.035;
 if(u1)u1.style.transform=`translate3d(${dx*resist1+5}px,${dy*resist1+8}px,0) rotate(${rot*-.035+.7}deg) scale(.992)`;
 if(u2)u2.style.transform=`translate3d(${dx*resist2-4}px,${dy*resist2+15}px,0) rotate(${rot*-.02-.65}deg) scale(.982)`;
 const reveal=Math.min(1,dist/115);
 if(u1){u1.style.filter=`brightness(${.97+reveal*.08}) drop-shadow(0 ${8+reveal*8}px ${12+reveal*12}px rgba(0,0,0,.28))`;u1.style.opacity=String(.88+reveal*.12)}
 st.style.setProperty('--shadowX',`${Math.max(-12,Math.min(12,dx*.035))}px`);st.style.setProperty('--shadowY',`${Math.max(-5,Math.min(12,dy*.025))}px`);
}
function v74SwipeStart(e){
 if(!busy||!pulls[idx]||window.v74CollectLock||Date.now()<Number(window.v124RareLockUntil||0))return;const st=$('#stack');if(st.style.display==='none')return;
 v74Drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,lastX:e.clientX,lastY:e.clientY,lastT:performance.now(),vx:0,vy:0,t:performance.now()};
 st.classList.remove('v75Snap','v75Enter','v76Dismiss');st.classList.add('v74Dragging','v75Held','v76Peeking');$('#stage').classList.add('v75Active');
 try{st.setPointerCapture?.(e.pointerId)}catch(_){} if(e.cancelable)e.preventDefault();
}
function v74SwipeMove(e){
 if(!v74Drag||e.pointerId!==v74Drag.id)return;const now=performance.now(),dt=Math.max(8,now-v74Drag.lastT),dx=e.clientX-v74Drag.x,dy=e.clientY-v74Drag.y;
 v74Drag.vx=(e.clientX-v74Drag.lastX)/dt;v74Drag.vy=(e.clientY-v74Drag.lastY)/dt;v74Drag.lastX=e.clientX;v74Drag.lastY=e.clientY;v74Drag.lastT=now;v74Drag.dx=dx;v74Drag.dy=dy;
 if(!v75RAF)v75RAF=requestAnimationFrame(v75PaintDrag);if(e.cancelable)e.preventDefault();
}
function v75ResetStack(st){
 st.classList.remove('v74Dragging','v75Held','v74Throw','v76Peeking','v76Dismiss');st.classList.add('v75Snap');$('#stage').classList.remove('v75Active');
 st.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)';['--sx','--sy','--sr','--sx2','--sy2','--sr2','--shadowX','--shadowY'].forEach(x=>st.style.removeProperty(x));
 const u1=document.getElementById('v76Under1'),u2=document.getElementById('v76Under2');
 if(u1){u1.style.transform='';u1.style.filter='';u1.style.opacity=''}
 if(u2){u2.style.transform='';u2.style.filter='';u2.style.opacity=''}
 setTimeout(()=>st.classList.remove('v75Snap'),330);
}
function v74SwipeEnd(e){
 if(!v74Drag||e.pointerId!==v74Drag.id)return;const d=v74Drag;v74Drag=null;if(v75RAF){cancelAnimationFrame(v75RAF);v75RAF=0}const st=$('#stack');
 const dist=Math.hypot(d.dx,d.dy),velocity=Math.hypot(d.vx,d.vy),projected=dist+velocity*115;
 if(projected<88){v75ResetStack(st);return}
 const c=pulls[idx];if(!autoCollectV74(c)){v75ResetStack(st);return}
 st.classList.remove('v74Dragging','v75Held','v75Snap','v76Peeking');$('#stage').classList.remove('v75Active');
 let ux=d.dx,uy=d.dy,len=Math.max(1,Math.hypot(ux,uy));ux/=len;uy/=len;
 if(velocity>.35){const vl=Math.max(.001,velocity);ux=d.vx/vl;uy=d.vy/vl}
 const travel=Math.max(window.innerWidth,window.innerHeight)*.82+260;
 const tx=d.dx+ux*travel,ty=d.dy+uy*travel,throwRot=Math.max(-52,Math.min(52,d.dx*.075+d.vx*14));
 const under=document.getElementById('v76Under1');if(under)under.classList.add('v76Promote');
 st.classList.add('v76Dismiss');st.style.opacity='1';requestAnimationFrame(()=>{st.style.transform=`translate3d(${tx}px,${ty}px,0) rotate(${throwRot}deg) scale(.96)`;st.style.opacity='0'});
 cardSound();if(navigator.vibrate)navigator.vibrate(isBulkCardV64(c)?7:[10,18,12]);
 setTimeout(()=>{if(under)under.classList.remove('v76Promote');st.classList.remove('v76Dismiss');st.style.transition='';st.style.opacity='';st.style.transform='';window.v74CollectLock=false;advance(false)},220);
}
function advance(autoReveal=false){if(idx<pulls.length-1){let prevPack=Math.floor(idx/10)+1;idx++;let nextPack=Math.floor(idx/10)+1;if(v114PackCount===10&&nextPack!==prevPack){document.dispatchEvent(new CustomEvent('v128-packbeat',{detail:{from:prevPack,to:nextPack}}));setTimeout(()=>showBack(autoReveal),160)}else showBack(autoReveal)}else{let best=[...pulls].sort((a,b)=>tier(b)-tier(a))[0];if(v114PackCount===10){v114BatchFinish();toast('10 packs finished!');}else{let hit=pulls.some(c=>tier(c)>=2||c.secret);if(hit)state.hits++;let bestTier=tier(best);addXP(5+bestTier*3,'pack');state.history.unshift({set:sel.name,best:best.name,rarity:best.rarity||'Card',time:Date.now()});state.history=state.history.slice(0,40);save();toast('Pack finished!');}showPackSummaryV88(best);}}

function showPackSummaryV88(best){
 busy=false;
 document.getElementById('v88Summary')?.remove();$('#stage').classList.remove('cardModeV89','v114TenMode','v114TenRipping','v91Cinematic','v91Flash');
 const bulk=pulls.filter(c=>typeof isBulkCardV64==='function'&&isBulkCardV64(c)).length;
 const hits=pulls.length-bulk;
 const value=pulls.reduce((s,c)=>s+Math.max(.1,Number(c.market||.1)),0);
 const xp=5+tier(best)*3;
 const wrap=document.createElement('div');wrap.id='v88Summary';wrap.className='v88Summary';
 const heading=document.createElement('h3');heading.textContent='✦ PACK COMPLETE ✦';wrap.appendChild(heading);
 const sub=document.createElement('div');sub.textContent=sel.name+' • Your collection has been updated';wrap.appendChild(sub);
 const fan=document.createElement('div');fan.className='v88Fan';
 [...pulls].sort((a,b)=>tier(b)-tier(a)).slice(0,5).reverse().forEach((c,i)=>{
  const im=document.createElement('img');im.src=c.thumb||c.img||'';im.alt=c.name||'Card';im.style.setProperty('--angle',((i-2)*11)+'deg');im.style.setProperty('--lift',(Math.abs(i-2)*14)+'px');im.style.animationDelay=(i*65)+'ms';fan.appendChild(im);
 });wrap.appendChild(fan);
 const stats=document.createElement('div');stats.className='v88Stats';
 [['📘 Binder  +',hits],['🗃️ Bulk  +',bulk],['💰 Pack value  ','$'+value.toFixed(2)],['⚡ XP  +',xp]].forEach(([k,v])=>{const b=document.createElement('b');b.textContent=k+v;stats.appendChild(b)});wrap.appendChild(stats);
 const button=document.createElement('button');button.type='button';button.id='v117OpenAnother';button.textContent=v114PackCount===10?'OPEN ANOTHER 10 PACKS →':'OPEN ANOTHER PACK →';const reopen=()=>{busy=false;wrap.remove();resetPack();applyPackArt();setTimeout(()=>buildPools(),30)};button.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();reopen()},{once:true});button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(document.body.contains(wrap))reopen()});wrap.appendChild(button);
 document.getElementById('stage').appendChild(wrap);
}

let audioCtx;function audio(){try{return audioCtx||(audioCtx=new(window.AudioContext||window.webkitAudioContext)())}catch{return null}}function tone(freq,when,dur,type='sine',gain=.06){let a=audio();if(!a)return;let o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,a.currentTime+when);g.gain.setValueAtTime(0,a.currentTime+when);g.gain.linearRampToValueAtTime(gain,a.currentTime+when+.015);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+when+dur);o.connect(g).connect(a.destination);o.start(a.currentTime+when);o.stop(a.currentTime+when+dur+.03)}function cardSound(){}function holoSound(){tone(520,0,.18,'sine',.035);tone(780,.07,.28,'sine',.028);tone(1040,.14,.36,'sine',.018)}function hitSound(t){let notes=t>=5?[392,523,659,784,1047]:t>=4?[330,440,554,880]:t>=3?[294,392,587]:[262,392,523];notes.forEach((n,i)=>tone(n,i*.075,.38,t>=4?'sine':'triangle',.045));if(t>=4){tone(110,0,.7,'sawtooth',.018);setTimeout(()=>tone(1568,0,.7,'sine',.025),220)}}function sparks(t=2){let st=$('#stage'),count=t>=5?70:t>=4?52:t>=3?38:24;for(let i=0;i<count;i++){let s=document.createElement('i');s.className='spark '+(t>=4?'big ':'')+(i%4===0?'star':'');s.style.left='50%';s.style.top='48%';let a=Math.random()*Math.PI*2,d=70+Math.random()*(t>=4?245:175);s.style.setProperty('--x',Math.cos(a)*d+'px');s.style.setProperty('--y',Math.sin(a)*d+'px');s.style.animationDuration=(.75+Math.random()*.65)+'s';st.appendChild(s);setTimeout(()=>s.remove(),1500)}}
let binderPageNo=0,selectedBinderCard=null;const CARDS_PER_PAGE=9;
const BINDER_THEMES=[
{id:'classic',name:'Midnight Vault',price:0,tag:'Starter',c1:'#182131',c2:'#05070c',a:'#ffd84d',poke:'25',label:'COLLECTION'},
{id:'pika',name:'Pikachu Voltage',price:18,tag:'Electric Edition',c1:'#342700',c2:'#0d0b03',a:'#ffe14d',poke:'25',label:'VOLTAGE'},
{id:'char',name:'Charizard Inferno',price:32,tag:'Fire Edition',c1:'#42130b',c2:'#100404',a:'#ff713d',poke:'6',label:'INFERNO'},
{id:'mew',name:'Mew Dreamscape',price:40,tag:'Psychic Edition',c1:'#3b1740',c2:'#0c0612',a:'#ff8de8',poke:'151',label:'DREAMSCAPE'},
{id:'ray',name:'Rayquaza Emerald',price:55,tag:'Dragon Edition',c1:'#073b32',c2:'#03100e',a:'#52f0b5',poke:'384',label:'EMERALD'},
{id:'umbreon',name:'Umbreon Eclipse',price:75,tag:'Chase Edition',c1:'#10172d',c2:'#03050d',a:'#7cb7ff',poke:'197',label:'ECLIPSE'},
{id:'gengar',name:'Gengar Phantom',price:60,tag:'Ghost Edition',c1:'#2b1642',c2:'#08040f',a:'#bc7cff',poke:'94',label:'PHANTOM'},
{id:'gold',name:'Golden Collector',price:120,tag:'Prestige Edition',c1:'#3c2d08',c2:'#090701',a:'#ffd45b',poke:'150',label:'PRESTIGE'},
{id:'blastoise',name:'Blastoise Tidal',price:24,tag:'Water Edition',c1:'#07304d',c2:'#03101c',a:'#58c8ff',poke:'9',label:'TIDAL'},
{id:'venusaur',name:'Venusaur Jungle',price:24,tag:'Grass Edition',c1:'#123c24',c2:'#04110a',a:'#62df85',poke:'3',label:'JUNGLE'},
{id:'eevee',name:'Eevee Heritage',price:28,tag:'Classic Edition',c1:'#4b3525',c2:'#130d08',a:'#e9bd84',poke:'133',label:'HERITAGE'},
{id:'sylveon',name:'Sylveon Ribbon',price:42,tag:'Fairy Edition',c1:'#4a203d',c2:'#120713',a:'#ff9ed8',poke:'700',label:'RIBBON'},
{id:'vaporeon',name:'Vaporeon Lagoon',price:38,tag:'Aqua Edition',c1:'#0a3851',c2:'#031019',a:'#7fe5ff',poke:'134',label:'LAGOON'},
{id:'jolteon',name:'Jolteon Surge',price:38,tag:'Thunder Edition',c1:'#4a3908',c2:'#120e02',a:'#fff05c',poke:'135',label:'SURGE'},
{id:'flareon',name:'Flareon Ember',price:38,tag:'Flame Edition',c1:'#4c1f0b',c2:'#140703',a:'#ff9a4e',poke:'136',label:'EMBER'},
{id:'espeon',name:'Espeon Aura',price:48,tag:'Mystic Edition',c1:'#3e224a',c2:'#0f0714',a:'#e6a2ff',poke:'196',label:'AURA'},
{id:'leafeon',name:'Leafeon Grove',price:44,tag:'Forest Edition',c1:'#294118',c2:'#091205',a:'#a9e86f',poke:'470',label:'GROVE'},
{id:'glaceon',name:'Glaceon Crystal',price:44,tag:'Ice Edition',c1:'#163c4c',c2:'#061116',a:'#a7efff',poke:'471',label:'CRYSTAL'},
{id:'dragonite',name:'Dragonite Skies',price:52,tag:'Dragon Edition',c1:'#254257',c2:'#071019',a:'#ffc87a',poke:'149',label:'SKIES'},
{id:'lugia',name:'Lugia Tempest',price:68,tag:'Legend Edition',c1:'#24344d',c2:'#060b14',a:'#d8e8ff',poke:'249',label:'TEMPEST'},
{id:'hooh',name:'Ho-Oh Radiance',price:68,tag:'Legend Edition',c1:'#4c1d16',c2:'#130504',a:'#ffd36a',poke:'250',label:'RADIANCE'},
{id:'mewtwo',name:'Mewtwo Genesis',price:72,tag:'Legend Edition',c1:'#31213f',c2:'#0a0610',a:'#c58cff',poke:'150',label:'GENESIS'},
{id:'greninja',name:'Greninja Shadow',price:58,tag:'Ninja Edition',c1:'#101d3d',c2:'#03060e',a:'#5f8dff',poke:'658',label:'SHADOW'},
{id:'lucario',name:'Lucario Aura',price:56,tag:'Fighter Edition',c1:'#17334a',c2:'#050d13',a:'#67c8ff',poke:'448',label:'AURA'},
{id:'gyarados',name:'Gyarados Rage',price:62,tag:'Storm Edition',c1:'#15364b',c2:'#040d13',a:'#ff5f5f',poke:'130',label:'RAGE'},
{id:'snorlax',name:'Snorlax Chill',price:35,tag:'Cozy Edition',c1:'#17353a',c2:'#061012',a:'#8de0c5',poke:'143',label:'CHILL'},
{id:'arcanine',name:'Arcanine Blaze',price:46,tag:'Kanto Edition',c1:'#4a1f0d',c2:'#130703',a:'#ffb24d',poke:'59',label:'BLAZE'},
{id:'tyranitar',name:'Tyranitar Titan',price:64,tag:'Power Edition',c1:'#253b22',c2:'#080f07',a:'#a9d36c',poke:'248',label:'TITAN'},
{id:'gardevoir',name:'Gardevoir Elegance',price:54,tag:'Elegant Edition',c1:'#2b3940',c2:'#081012',a:'#b5ffe2',poke:'282',label:'ELEGANCE'},
{id:'garchomp',name:'Garchomp Apex',price:66,tag:'Champion Edition',c1:'#1d2445',c2:'#050713',a:'#879cff',poke:'445',label:'APEX'},
{id:'zacian',name:'Zacian Crown',price:82,tag:'Royal Edition',c1:'#15364c',c2:'#050d13',a:'#ffd966',poke:'888',label:'CROWN'},
{id:'miraidon',name:'Miraidon Neon',price:88,tag:'Future Edition',c1:'#2e1b50',c2:'#090414',a:'#9e7cff',poke:'1008',label:'NEON'},
{id:'koraidon',name:'Koraidon Ancient',price:88,tag:'Ancient Edition',c1:'#4d1717',c2:'#130404',a:'#ff795d',poke:'1007',label:'ANCIENT'},
{id:'giratina',name:'Giratina Distortion',price:96,tag:'Mythic Edition',c1:'#25152f',c2:'#07030a',a:'#e4c45f',poke:'487',label:'DISTORTION'},
{id:'arceus',name:'Arceus Origin',price:110,tag:'Mythic Edition',c1:'#3a3934',c2:'#0d0d0b',a:'#f6df87',poke:'493',label:'ORIGIN'},
{id:'master',name:'Master Ball Vault',price:150,tag:'Ultimate Edition',c1:'#40102c',c2:'#0c0208',a:'#ff5aa7',poke:'1010',label:'MASTER VAULT'}

];
// Prestige binder rewards. Early prestige binders are level rewards; later prestige binders are earned by pulling a specific hit.
const BINDER_LEVEL_REWARDS={sylveon:4,espeon:6,dragonite:10,lucario:14};
const BINDER_HIT_REWARDS={
  umbreon:{setId:'swsh7',card:'Umbreon VMAX'},
  greninja:{setId:'sv06',card:'Greninja ex'},
  lugia:{setId:'swsh12',card:'Lugia V'},
  hooh:{setId:'sm12',card:'Charizard & Braixen-GX',label:'Cosmic Eclipse showcase hit'},
  mewtwo:{setId:'sv10',card:"Team Rocket's Mewtwo ex"},
  garchomp:{setId:'sv04',card:'Roaring Moon ex',label:'Paradox Rift showcase hit'},
  zacian:{setId:'swsh12.5',card:'Giratina VSTAR',label:'Crown Zenith showcase hit'},
  miraidon:{setId:'sv08',card:'Pikachu ex',label:'Surging Sparks showcase hit'},
  koraidon:{setId:'sv05',card:'Walking Wake ex',label:'Temporal Forces showcase hit'},
  giratina:{setId:'swsh11',card:'Giratina V'},
  arceus:{setId:'swsh9',card:'Charizard V',label:'Brilliant Stars showcase hit'},
  master:{setId:'sm9',card:'Latias & Latios-GX',label:'Team Up ultimate hit'}
};
function binderRewardLevel(id){return Number(BINDER_LEVEL_REWARDS[id]||0)}
function binderHitReward(id){return BINDER_HIT_REWARDS[id]||null}
function rewardSetName(r){let x=SETS.find(s=>s.id===r?.setId);return x?x.name:'Unknown Set'}
function hasBinderHitReward(id){let r=binderHitReward(id);if(!r)return false;let badge=state.chaseBadges?.[r.setId];if(badge&&String(badge.name||'').toLowerCase()===r.card.toLowerCase())return true;let setName=rewardSetName(r);return Object.values(state.binder||{}).some(c=>c&&c.set===setName&&String(c.name||'').toLowerCase()===r.card.toLowerCase())}
function syncRewardBinders(showToast=false){
  const lv=levelFromXP(state.xp),gained=[];
  Object.entries(BINDER_LEVEL_REWARDS).forEach(([id,req])=>{if(lv>=req&&!state.binderOwned.includes(id)){state.binderOwned.push(id);gained.push(id)}});
  Object.keys(BINDER_HIT_REWARDS).forEach(id=>{if(hasBinderHitReward(id)&&!state.binderOwned.includes(id)){state.binderOwned.push(id);gained.push(id)}});
  if(gained.length){localStorage.setItem('tcgRipperSave',JSON.stringify(state));if(showToast){let t=BINDER_THEMES.find(x=>x.id===gained[gained.length-1]);toast(`🏆 Prestige binder earned: ${t?t.name:'new binder'}!`)}}
  return gained;
}
function syncLevelBinders(showToast=false){return syncRewardBinders(showToast)}
function pokeArt(id){return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
function currentBinderTheme(){return BINDER_THEMES.find(x=>x.id===state.binderTheme)||BINDER_THEMES[0]}
function applyBinderTheme(){let t=currentBinderTheme(),b=$('#binderBook');if(!b)return;b.style.setProperty('--cover1',t.c1);b.style.setProperty('--cover2',t.c2);b.style.setProperty('--accent',t.a);b.style.setProperty('--art',`url("${pokeArt(t.poke)}")`);let logo=b.querySelector('.binderLogo');if(logo)logo.innerHTML=`${t.name.split(' ')[0]}<br><b>${t.label}</b>`;let stat=$('#binderStat');if(stat)stat.dataset.theme=t.name}
function renderBinderShop(){let box=$('#binderThemes');if(!box)return;syncRewardBinders(false);let lv=levelFromXP(state.xp);$('#binderShopBalance').textContent=`$${Number(state.coins||0).toFixed(2)} • LV ${lv} • ${state.binderOwned.length}/${BINDER_THEMES.length} owned`;box.innerHTML='';BINDER_THEMES.forEach(t=>{let req=binderRewardLevel(t.id),hit=binderHitReward(t.id),owned=state.binderOwned.includes(t.id),eq=state.binderTheme===t.id,levelLocked=req&&lv<req,hitLocked=hit&&!hasBinderHitReward(t.id),d=document.createElement('div');d.className='binderTheme'+(eq?' equipped':'')+(req?' levelReward':'')+(hit?' hitReward':'')+(levelLocked?' levelLocked':'')+(hitLocked?' hitLocked':'');d.style.setProperty('--t1',t.c1);d.style.setProperty('--t2',t.c2);d.style.setProperty('--ta',t.a);let status=eq?'✓ EQUIPPED':owned?'OWNED':req?`LEVEL ${req} REWARD`:hit?'CHASE REWARD':t.name;let action=owned?'TAP TO EQUIP':req?(levelLocked?`🔒 LV ${req}`:'UNLOCKED'):hit?(hitLocked?'🔒 PULL TO EARN':'CLAIMED'):'$'+t.price.toFixed(2);let ribbon=req?'<span class="rewardRibbon">LEVEL REWARD</span>':hit?'<span class="hitRibbon">CHASE REWARD</span>':'';let veil=levelLocked?`<div class="levelLockVeil"><div><div class="lockIcon">🔒</div><b>PRESTIGE BINDER</b><small>Reach Level ${req}</small></div></div>`:hitLocked?`<div class="hitLockVeil"><div class="hitQuest"><strong>🔒 PULL QUEST</strong><b>Pull ${hit.card}</b><small>Open <b style="display:inline;color:#d9e6ff">${rewardSetName(hit)}</b> packs and hit this card to permanently earn this binder.</small><em>SET TO OPEN: ${rewardSetName(hit).toUpperCase()}</em></div></div>`:'';d.innerHTML=`<div class="themePreview"><strong>${t.name}</strong><img src="${pokeArt(t.poke)}">${ribbon}${veil}</div><div class="themeMeta"><div><b>${status}</b><small>${t.tag}${req?' • Cannot be purchased':hit?` • Earn from ${rewardSetName(hit)}`:''}</small></div><div class="themePrice">${action}</div></div>`;d.onclick=()=>buyOrEquipBinder(t.id);box.appendChild(d)})}
function buyOrEquipBinder(id){let t=BINDER_THEMES.find(x=>x.id===id);if(!t)return;let req=binderRewardLevel(id),hit=binderHitReward(id),lv=levelFromXP(state.xp);syncRewardBinders(false);if(req&&lv<req){toast(`🔒 ${t.name} is earned at Level ${req}. You're Level ${lv}.`);return}if(hit&&!hasBinderHitReward(id)){toast(`🔒 Pull ${hit.card} from ${rewardSetName(hit)} to earn ${t.name}.`);return}if(!state.binderOwned.includes(id)){if(req||hit){state.binderOwned.push(id);toast(`🏆 Prestige reward claimed: ${t.name}!`);hitSound(4)}else{if(Number(state.coins||0)<t.price){toast(`You need $${t.price.toFixed(2)} for ${t.name}. Work a few shifts 😅`);return}state.coins=Math.round((Number(state.coins||0)-t.price)*100)/100;state.binderOwned.push(id);toast(`🛍 Bought ${t.name}!`);hitSound(3)}}state.binderTheme=id;save();applyBinderTheme();renderBinderShop();if(navigator.vibrate)navigator.vibrate(18)}
function openBinderShop(){syncLevelBinders(true);renderBinderShop();$('#binderShopModal').classList.add('show')}
function closeBinderShop(){$('#binderShopModal').classList.remove('show')}

function sellPrice(c){return Math.max(.10,Math.round((Number(c.market)||.10)*100)/100)}
function binderCards(){let q=($('#search').value||'').toLowerCase(),f=$('#setFilter').value;return Object.values(state.binder).filter(c=>c&&c.qty>0&&(f==='all'||c.set===f)&&String(c.name||'').toLowerCase().includes(q)).sort((a,b)=>tier(b)-tier(a)||String(a.name).localeCompare(String(b.name)))}
async function repairBinderImage(img,id){let c=state.binder[id];if(!c||img.dataset.repairing)return;img.dataset.repairing='1';try{let r=await fetch(`https://api.tcgdex.net/v2/en/cards/${id}`);if(r.status===404)throw new Error('Artwork identity unavailable; ownership preserved');if(!r.ok)throw 0;let j=await r.json();detailCache[id]=j;c.rarity=j.rarity||c.rarity;c.market=marketFromDetail(j,c.finish);if(j.image){c.img=asset(j.image,'high');c.thumb=asset(j.image,'low');save();img.onerror=null;img.src=c.img||c.thumb;img.dataset.repairing='';return}}catch(e){}let slot=img.closest('.slot');if(slot){slot.innerHTML=`<div style="display:grid;place-items:center;height:100%;padding:5px;text-align:center;font-size:9px;color:#9aa6ba">${c.name||'Card'}<br><small>art unavailable</small></div>`}}
function migrateBinderImages(){Object.keys(state.binder).forEach(k=>{let c=state.binder[k];if(!c||!(c.qty>0)){delete state.binder[k];return}/* Early builds saved invented placeholder records such as 'Surging Sparks Card #31'. They have no real TCGdex identity and can never load valid art. */if(/\bCard #?\d+$/i.test(String(c.name||''))||/^(common|uncommon|rare)-?\d+$/i.test(String(c.id||''))){delete state.binder[k];return}if(c.img)c.img=c.img.replace(/\.(high|low)\.webp$/,'/$1.webp');if(c.thumb)c.thumb=c.thumb.replace(/\.(high|low)\.webp$/,'/$1.webp');if(!(c.market>0))c.market=.10});save()}
function renderBinder(anim=false){applyBinderTheme();let arr=binderCards(),pages=Math.max(1,Math.ceil(arr.length/CARDS_PER_PAGE));binderPageNo=Math.max(0,Math.min(binderPageNo,pages-1));$('#binderStat').textContent=`${arr.length} unique • ${arr.reduce((n,c)=>n+(c.qty||0),0)} total cards`;if(typeof renderBinderShelfV147==='function')renderBinderShelfV147();$('#pageLabel').textContent=`Page ${binderPageNo+1} / ${pages}`;$('#prevPage').disabled=binderPageNo===0;$('#nextPage').disabled=binderPageNo>=pages-1;let g=$('#binderGrid');g.innerHTML='';let page=arr.slice(binderPageNo*CARDS_PER_PAGE,(binderPageNo+1)*CARDS_PER_PAGE);page.forEach(c=>{if(!c.img||/\/low\.webp$/.test(c.img)){hydrateCard(c).then(()=>{let im=g.querySelector(`[data-card-id=\"${CSS.escape(c.id)}\"] img`);if(im&&c.img)im.src=c.img})}let d=document.createElement('div'),fx=effectClass(c);d.dataset.cardId=c.id;d.className='slot'+(fx?' cardFx '+fx:'');let src=(c.img||c.thumb||'').replace('/low.webp','/high.webp');if(src&&c.img!==src)c.img=src;d.innerHTML=src?`<img loading="eager" decoding="async" fetchpriority="high" src="${src}" onerror="repairBinderImage(this,'${c.id}')"><span class="rarity-stars" aria-hidden="true"></span><span class="qty">${Math.max(1,Number(c.qty||1))}x</span>`:`<div style="display:grid;place-items:center;height:100%;padding:5px;text-align:center;font-size:9px;color:#9aa6ba">${c.name||'Card'}<br><small>art unavailable</small></div>`;d.onclick=()=>openBinderCard(c.id);g.appendChild(d)});for(let i=page.length;i<CARDS_PER_PAGE;i++){let d=document.createElement('div');d.className='slot emptySlot';d.style.opacity='.12';g.appendChild(d)}if(anim){let pg=$('#binderPage'),ghost=pg.querySelector('.pageGhost');if(ghost)ghost.remove();g.classList.remove('page-arrive-next','page-arrive-prev');void g.offsetWidth;g.classList.add(anim==='prev'?'page-arrive-prev':'page-arrive-next');setTimeout(()=>g.classList.remove('page-arrive-next','page-arrive-prev'),620)}}
async function openBinderCard(id){let c=state.binder[id];if(!c)return;selectedBinderCard=id;let inspect=$('#inspect3d'),fx=effectClass(c);inspect.className='inspect3d'+(fx?' cardFx '+fx:'');$('#inspectImg').src=c.img||c.thumb||'';$('#inspectName').textContent=c.name;$('#inspectInfo').textContent=`${c.set} • #${c.number} • ${c.rarity||'Card'}${c.finish?' • '+c.finish:''} • ${c.qty} ${c.qty===1?'copy':'copies'}`;$('#sellValue').textContent='Loading market value…';$('#cardModal').classList.add('show');if(typeof syncGradeLaunchV147==='function')syncGradeLaunchV147();if(fx){if(tier(c)>=2){hitSound(Math.min(5,tier(c)));if(navigator.vibrate)navigator.vibrate(tier(c)>=4?[18,25,35]:[12,18,22])}else holoSound()}await hydrateCard(c);if(selectedBinderCard===id&&state.binder[id]===c){state.binder[id].market=c.market;save();$('#inspectImg').src=c.img||c.thumb||'';$('#sellValue').textContent=`Market sell value: $${sellPrice(c).toFixed(2)} each`}}
function closeBinderCard(){$('#cardModal').classList.remove('show');selectedBinderCard=null}
const binderSaleLocksV2554=new Set();
async function sellBinder(all){
 const id=selectedBinderCard,c=state.binder[id];
 if(!c||Number(c.qty)<1||binderSaleLocksV2554.has(id))return false;
 binderSaleLocksV2554.add(id);
 try{
  try{await hydrateCard(c)}catch{toast('Card price unavailable. Please retry.');return false}
  if(state.binder[id]!==c||Number(c.qty)<1)return false;
  const count=all?Math.floor(Number(c.qty)):1,price=Number(sellPrice(c));
  if(!Number.isFinite(price)||price<0||!Number.isFinite(count)||count<1)return false;
  const earned=Math.round(price*count*100)/100;
  c.qty=Number(c.qty)-count;state.coins=Math.round((Number(state.coins||0)+earned)*100)/100;
  if(c.qty<=0)delete state.binder[id];save();toast(`Sold ${count} for $${earned.toFixed(2)}`);
  if(selectedBinderCard===id)closeBinderCard();renderBinder(true);return true;
 }finally{binderSaleLocksV2554.delete(id)}
}
function renderHist(){let h=$('#hist');h.innerHTML=state.history.length?'':'<div class="sub">No packs yet.</div>';state.history.forEach(x=>h.insertAdjacentHTML('beforeend',`<div class="hist"><span><b>${x.set}</b><br><small>${new Date(x.time).toLocaleString()}</small></span><span style="text-align:right">${x.best}<br><small>${x.rarity}</small></span></div>`))}function toast(t){let x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(window.to);window.to=setTimeout(()=>x.classList.remove('show'),2200)}
let gesturePointer=null,gestureStart=0;
function robustDown(e){if(busy)return;gesturePointer=e.pointerId;gestureStart=Date.now();try{$('#pack').setPointerCapture(e.pointerId)}catch(_){}down(e)}
function robustMove(e){if(gesturePointer!==null&&e.pointerId!==gesturePointer)return;move(e)}
function robustUp(e){if(gesturePointer!==null&&e.pointerId!==gesturePointer)return;try{$('#pack').releasePointerCapture(e.pointerId)}catch(_){}gesturePointer=null;up(e)}
$('#pack').addEventListener('pointerdown',robustDown,{passive:false});$('#pack').addEventListener('pointermove',robustMove,{passive:false});$('#pack').addEventListener('pointerup',robustUp,{passive:false});$('#pack').addEventListener('pointercancel',robustUp,{passive:false});
// V90: pack behaves like a held physical object even before the tear begins.
(function v90PackParallax(){
 const p=$('#pack'),stage=$('#stage'); if(!p||!stage)return;
 function paint(e){if(busy||drag||p.style.display==='none')return;const r=p.getBoundingClientRect();const nx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width*.5)));const ny=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height*.5)));p.style.transform=`perspective(900px) rotateY(${nx*8}deg) rotateX(${-ny*6}deg) translateZ(4px)`;}
 p.addEventListener('pointermove',paint,{passive:true});
 p.addEventListener('pointerenter',()=>p.classList.add('v90Touching'),{passive:true});
 p.addEventListener('pointerleave',()=>{if(!drag&&!busy){p.classList.remove('v90Touching');p.style.transform=''}},{passive:true});
})();

function binderUnclipSound(){
  /* Short, dry mechanical snap: two tiny transients + metal contact.
     Synthesized locally so content://downloads works offline with no audio fetch. */
  try{
    const A=window.AudioContext||window.webkitAudioContext, ac=new A(), t=ac.currentTime;
    const master=ac.createGain(), comp=ac.createDynamicsCompressor();
    master.gain.setValueAtTime(.58,t);master.gain.exponentialRampToValueAtTime(.001,t+.115);
    master.connect(comp);comp.connect(ac.destination);
    function tick(at,freq,vol,dur){
      const o=ac.createOscillator(),g=ac.createGain(),hp=ac.createBiquadFilter();
      o.type='square';o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(freq*.72,at+dur);
      hp.type='highpass';hp.frequency.value=950;
      g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.001,at+dur);
      o.connect(hp);hp.connect(g);g.connect(master);o.start(at);o.stop(at+dur+.005);
    }
    tick(t,2350,.30,.022);      // latch release
    tick(t+.036,1450,.22,.032); // metal clip landing
    const len=Math.floor(ac.sampleRate*.055),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ac.sampleRate*.0045));
    const n=ac.createBufferSource(),bp=ac.createBiquadFilter(),ng=ac.createGain();
    n.buffer=buf;bp.type='bandpass';bp.frequency.value=3200;bp.Q.value=2.4;
    ng.gain.setValueAtTime(.24,t);ng.gain.exponentialRampToValueAtTime(.001,t+.05);
    n.connect(bp);bp.connect(ng);ng.connect(master);n.start(t);n.stop(t+.06);
    setTimeout(()=>ac.close().catch(()=>{}),260);
  }catch(e){try{cardSound()}catch(_){}}
}
function toggleBinderFromClip(){
  let b=$('#binderBook'),clip=$('#zipPull');if(!b||!clip)return;
  let opening=!b.classList.contains('open');
  b.classList.add('clip-releasing');binderUnclipSound();
  if(navigator.vibrate)navigator.vibrate(opening?[18,18,28]:[16]);
  b.classList.toggle('open',opening);b.classList.toggle('zipped',!opening);
  clip.setAttribute('aria-label',opening?'Clip binder closed':'Unclip and open binder');
  if(opening)renderBinder();
  setTimeout(()=>b.classList.remove('clip-releasing'),380);
}

$('#pack').addEventListener('click',e=>{if(busy||drag)return;if(Date.now()-gestureStart<450)return;toast('Swipe directly across the pack to open it')});const v74Stack=$('#stack');v74Stack.onclick=null;v74Stack.addEventListener('pointerdown',v74SwipeStart,{passive:false});v74Stack.addEventListener('pointermove',v74SwipeMove,{passive:false});v74Stack.addEventListener('pointerup',v74SwipeEnd,{passive:false});v74Stack.addEventListener('pointercancel',v74SwipeEnd,{passive:false});$('#search').oninput=()=>{binderPageNo=0;renderBinder()};$('#setFilter').onchange=()=>{binderPageNo=0;renderBinder()};$('#openBinderShop').onclick=openBinderShop;$('#closeBinderShop').onclick=closeBinderShop;$('#binderShopModal').onclick=e=>{if(e.target===$('#binderShopModal'))closeBinderShop()};$('#zipPull').onclick=toggleBinderFromClip;
$('#closeBinderTab').onclick=e=>{e.stopPropagation();if($('#binderBook').classList.contains('open'))toggleBinderFromClip();};
$('#binderBook').addEventListener('dblclick',e=>{
  if($('#binderBook').classList.contains('open') && !e.target.closest('.binderPage,.pageTurnSheet,button,.card')) toggleBinderFromClip();
});function turnBinderPage(dir){let pg=$('#binderPage'),grid=$('#binderGrid');if(pg.querySelector('.pageGhost'))return;let ghost=grid.cloneNode(true);ghost.removeAttribute('id');ghost.classList.add('pageGhost',dir==='prev'?'turn-prev':'turn-next');pg.appendChild(ghost);binderPageNo+=dir==='prev'?-1:1;renderBinder(dir);cardSound();setTimeout(()=>ghost.remove(),560)}$('#prevPage').onclick=()=>{if(binderPageNo>0)turnBinderPage('prev')};$('#nextPage').onclick=()=>{if((binderPageNo+1)*CARDS_PER_PAGE<binderCards().length)turnBinderPage('next')};$('#closeCard').onclick=closeBinderCard;$('#cardModal').onclick=e=>{if(e.target===$('#cardModal'))closeBinderCard()};$('#sellOne').onclick=()=>sellBinder(false);$('#sellAll').onclick=()=>sellBinder(true);$('#inspect3d').onpointermove=e=>{let r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;e.currentTarget.style.transform=`rotateY(${x*18}deg) rotateX(${-y*18}deg)`};$('#inspect3d').onpointerleave=e=>e.currentTarget.style.transform='';let activeJob=null,jobProgress=0,workState=null;
function money(n){state.coins=Math.round((Number(state.coins||0)+n)*100)/100;save();}
function updateEarn(){
 let bulk=Object.values(state.bulkV64||{}).filter(c=>c&&c.qty>0&&sellPrice(c)<=1),bi=$('#bulkInfo');if(bi)bi.textContent=`${bulk.reduce((n,c)=>n+c.qty,0)} bulk cards • est. $${bulk.reduce((n,c)=>n+sellPrice(c)*c.qty,0).toFixed(2)}`;
 let q=state.shopV84||{rep:0,deals:0,profit:0,ledger:[]};let r=$('#shopRep84');if(r)r.textContent=`REP ${q.rep}`;let c=$('#shopCareer84');if(c)c.textContent=`$${Number(q.profit||0).toFixed(2)} shop profit`;let b=$('#repBar84');if(b)b.style.width=Math.min(100,(q.rep%10)*10)+'%';let l=$('#ledgerSummary84');if(l)l.textContent=q.ledger?.[0]?.msg||`${q.deals||0} deals completed`;let er=document.getElementById('earnRepV153');if(er)er.textContent=String(q.rep||0);let ep=document.getElementById('earnProfitV153');if(ep)ep.textContent='$'+Number(q.profit||0).toFixed(2);let ed=document.getElementById('earnDealsV153');if(ed)ed.textContent=String(q.deals||0);let ec=document.getElementById('earnCashV153');if(ec)ec.textContent='$'+Number(state.coins||0).toFixed(2);let show=document.getElementById('show84'),br=document.getElementById('break84');if(show)show.classList.toggle('earnLockedV153',Number(q.rep||0)<5);if(br)br.classList.toggle('earnLockedV153',Number(q.rep||0)<10);let sg=document.getElementById('showGateV153');if(sg)sg.textContent=Number(q.rep||0)>=5?'OPEN':'REP 5+';let bg=document.getElementById('breakGateV153');if(bg)bg.textContent=Number(q.rep||0)>=10?'OPEN':'REP 10+';
}
function openWork(title,sub){$('#workTitle').textContent=title;$('#workSub').textContent=sub;$('#workArea').innerHTML='';$('#workScore').textContent='';$('#workModal').classList.add('show')}
function closeWork(force=false){if(workState&&!force){if(!confirm('Leave this shift? Progress will be lost.'))return}workState=null;activeJob=null;$('#workModal').classList.remove('show');$('#workArea').innerHTML=''}
$('#workClose').onclick=()=>closeWork();
function finishWork(kind,pay,msg){pay=Math.round(pay*2*100)/100;money(pay);state.jobCareer.earnings=Math.round((Number(state.jobCareer.earnings||0)+pay)*100)/100;state.jobs[kind]=(state.jobs[kind]||0)+1;save();hitSound(2);if(navigator.vibrate)navigator.vibrate([18,25,30]);workState=null;activeJob=null;$('#workScore').textContent=`SHIFT COMPLETE • +$${pay.toFixed(2)} • NO XP`;$('#workArea').innerHTML=`<div style="text-align:center;padding:55px 10px"><div style="font-size:64px">💵</div><h2>${msg}</h2><button class="btn primary" id="doneWork">COLLECT $${pay.toFixed(2)}</button></div>`;$('#doneWork').onclick=()=>{closeWork(true);updateEarn()}}
const stockTypes=[['BOOSTERS','🎴'],['SLEEVES','🛡️'],['BINDERS','📘']];
function startSortGame(){if(activeJob)return toast('Finish your current shift first.');activeJob='sort';workState={kind:'sort',round:0,score:0,target:0};openWork('📦 MORNING STOCK SHIFT','A delivery just arrived. Read each carton and shelve it in the right department before opening time.');nextSort()}
function nextSort(){let w=workState;if(!w)return;if(w.round>=8)return finishWork('sort',4,'Stock room sorted!');w.target=Math.floor(Math.random()*stockTypes.length);let [name,icon]=stockTypes[w.target];$('#workScore').textContent=`SHIFT 07:30 • CARTON ${w.round+1}/8`;$('#workArea').innerHTML=`<div class="shiftHud"><div class="shiftMeter"><i style="width:${w.round/8*100}%"></i></div><b>$4.00 SHIFT</b></div><div class="stockRoom" id="stockRoom"><div class="stockSign">STOCKROOM • MORNING DELIVERY</div><div class="shelfWall">${stockTypes.map((x,i)=>`<div class="physicalShelf" data-bin="${i}"><div class="shelfIcon">${x[1]}</div><b>${x[0]}</b></div>`).join('')}</div><div class="stockFloor"><div class="dragCarton" id="dragCarton"><span>${icon}</span>${name}<small>DRAG ME</small></div></div><div class="dragHint">Grab the carton and physically drag it onto the correct shelf</div></div><div class="paySlip">Clocked in • Stock Assistant • 8 cartons</div>`;let box=$('#dragCarton'),room=$('#stockRoom'),dragging=false,ox=0,oy=0;function move(e){if(!dragging)return;let r=room.getBoundingClientRect();box.style.left=(e.clientX-r.left-ox)+'px';box.style.top=(e.clientY-r.top-oy)+'px';box.style.transform='none';$$('.physicalShelf').forEach(sh=>{let a=sh.getBoundingClientRect();sh.classList.toggle('hot',e.clientX>=a.left&&e.clientX<=a.right&&e.clientY>=a.top&&e.clientY<=a.bottom)})}function end(e){if(!dragging)return;dragging=false;box.classList.remove('dragging');let hit=[...$$('.physicalShelf')].find(sh=>{let a=sh.getBoundingClientRect();return e.clientX>=a.left&&e.clientX<=a.right&&e.clientY>=a.top&&e.clientY<=a.bottom});$$('.physicalShelf').forEach(sh=>sh.classList.remove('hot'));if(hit&&+hit.dataset.bin===w.target){hit.classList.add('stockSuccess');w.score++;w.round++;cardSound();if(navigator.vibrate)navigator.vibrate([8,20,8]);box.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.65)'}],{duration:220});setTimeout(nextSort,240)}else{if(navigator.vibrate)navigator.vibrate(18);$('#workScore').textContent=hit?`Wrong shelf — ${name} doesn't go there`:`Place the carton ON a shelf`;box.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:180});setTimeout(nextSort,360)}}box.onpointerdown=e=>{dragging=true;box.setPointerCapture(e.pointerId);let b=box.getBoundingClientRect();ox=e.clientX-b.left;oy=e.clientY-b.top;box.classList.add('dragging')};box.onpointermove=move;box.onpointerup=end;box.onpointercancel=end}
function startCounterGame(){if(activeJob)return toast('Finish your current shift first.');activeJob='counter';workState={kind:'counter',round:0,served:0,change:0,target:0};openWork('🧾 FRONT COUNTER SHIFT','You are on register. Ring up real shop purchases and return the exact change without holding up the queue.');nextCustomer()}
function nextCustomer(){let w=workState;if(!w)return;if(w.round>=5)return finishWork('counter',6,'Counter shift complete!');let prices=[3.4,4.8,6.3,7.6,8.7,11.4,13.8],price=prices[Math.floor(Math.random()*prices.length)],paid=price<8?10:20;w.target=Math.round((paid-price)*100)/100;w.change=0;$('#workScore').textContent=`REGISTER 1 • CUSTOMER ${w.round+1}/5`;renderRegister(price,paid)}
function renderRegister(price,paid){let w=workState,den=[5,2,1,.5,.2,.1];$('#workArea').innerHTML=`<div class="shiftHud"><div class="shiftMeter"><i style="width:${w.round/5*100}%"></i></div><b>$12.00 SHIFT</b></div><div class="jobScene"><div class="customerBubble">Customer: Here's $${paid.toFixed(2)}. Thanks!</div><div class="registerCard"><div>SALE TOTAL</div><div class="registerBig">$${price.toFixed(2)}</div><div>Customer paid <b>$${paid.toFixed(2)}</b></div><div class="changeTray">CHANGE TRAY: $<span id="tray">${w.change.toFixed(2)}</span></div><div class="denoms">${den.map(v=>`<button class="coinBtn" data-v="${v}">+$${v.toFixed(2)}</button>`).join('')}</div><button class="giveBtn" id="clearChange">CLEAR TRAY</button><button class="giveBtn" id="giveChange" style="margin-top:8px">GIVE CHANGE & PRINT RECEIPT</button></div><div class="paySlip">Clocked in • Sales Assistant • Register 1</div></div>`;$$('.coinBtn').forEach(b=>b.onclick=()=>{w.change=Math.round((w.change+Number(b.dataset.v))*100)/100;$('#tray').textContent=w.change.toFixed(2);cardSound()});$('#clearChange').onclick=()=>{w.change=0;$('#tray').textContent='0.00'};$('#giveChange').onclick=()=>{if(Math.abs(w.change-w.target)<.001){w.served++;w.round++;cardSound();if(navigator.vibrate)navigator.vibrate(10);nextCustomer()}else{$('#workScore').textContent=`Wrong change. Customer needs $${w.target.toFixed(2)} — try again`;if(navigator.vibrate)navigator.vibrate([20,30,20])}}}
function startRescueGame(){let need=Math.max(0,8-Number(state.coins||0));if(need<=0)return;if(activeJob)return toast('Finish your current shift first.');activeJob='rescue';workState={kind:'rescue',left:7,pay:need/2};openWork('🧹 CLOSING SHIFT','You need pack money, so you picked up a closing shift. Clear the shop floor before the manager locks up.');spawnMess()}
function spawnMess(){let w=workState;if(!w)return;$('#workScore').textContent=`CLEAN-UP • ${7-w.left}/7 cleared`;$('#workArea').innerHTML='<div class="rescueFloor" id="rescueFloor"></div>';let floor=$('#rescueFloor');for(let i=0;i<w.left;i++){let m=document.createElement('button');m.className='mess';m.textContent=['🧾','📦','🗑️','🧹'][Math.floor(Math.random()*4)];m.style.left=(5+Math.random()*78)+'%';m.style.top=(5+Math.random()*72)+'%';m.onclick=()=>{m.remove();w.left--;cardSound();if(navigator.vibrate)navigator.vibrate(7);$('#workScore').textContent=`CLEAN-UP • ${7-w.left}/7 cleared`;if(w.left<=0)finishWork('rescue',w.pay,'Rescue shift complete!')};floor.appendChild(m)}}
$('#sortJob').onclick=startSortGame;$('#counterJob').onclick=startCounterGame;$('#rescueJob').onclick=startRescueGame;
function bulkEligible(){return Object.values(state.bulkV64||{}).filter(c=>c&&c.qty>0&&sellPrice(c)<=1).sort((a,b)=>sellPrice(a)-sellPrice(b))}
$('#sellBulkOne').onclick=()=>{let c=bulkEligible()[0];if(!c){toast('No cards worth $1 or less to sell.');return}let v=sellPrice(c);c.qty--;if(c.qty<=0)delete state.bulkV64[c.id];money(v);save();toast(`Bulk sold ${c.name} • +$${v.toFixed(2)}`);updateEarn()};
$('#sellBulkAll').onclick=()=>{let a=bulkEligible();if(!a.length){toast('No bulk cards to sell.');return}let n=0,v=0;a.forEach(c=>{n+=c.qty;v+=sellPrice(c)*c.qty;delete state.bulkV64[c.id]});money(Math.round(v*100)/100);save();toast(`Sold ${n} bulk cards • +$${v.toFixed(2)}`);updateEarn()};
const BADGE_DEFS=[
['first','FIRST RIP','Open your first pack',()=>state.packs>=1,'🎴'],['ten','PACK STACK','Open 10 packs',()=>state.packs>=10,'📦'],['fifty','RIP MACHINE','Open 50 packs',()=>state.packs>=50,'⚙️'],['hundred','CENTURY CLUB','Open 100 packs',()=>state.packs>=100,'💯'],['hit1','HIT HUNTER','Pull 10 hits',()=>state.hits>=10,'✨'],['hit50','FOIL FANATIC','Pull 50 hits',()=>state.hits>=50,'🌈'],['hit100','CHASE LORD','Pull 100 hits',()=>state.hits>=100,'💎'],['binder','BINDER BUILDER','Own 25 unique cards',()=>Object.keys(state.binder).length>=25,'📘'],['vault','VAULT KEEPER','Own 100 unique cards',()=>Object.keys(state.binder).length>=100,'🗄️'],['level10','RISING STAR','Reach Level 10',()=>levelFromXP(state.xp)>=10,'⚡'],['elite','ELITE TRAINER','Reach Level 20',()=>levelFromXP(state.xp)>=20,'🏆'],['master','MASTER COLLECTOR','Reach Level 30',()=>levelFromXP(state.xp)>=30,'🔱'],['icon','TCG ICON','Reach Level 38',()=>levelFromXP(state.xp)>=38,'👑'],['worker','SHOP GRINDER','Complete 20 shifts',()=>totalJobs()>=20,'🛠️'],['arcade','ARCADE ACE','Win 20 premium mini-games',()=>totalMini()>=20,'🕹️']];
function totalJobs(){return Object.values(state.jobs||{}).reduce((a,b)=>a+Number(b||0),0)}
function totalMini(){return Object.values(state.miniStats||{}).reduce((a,b)=>a+Number(b||0),0)}
function binderTotal(){return Object.values(state.binder||{}).reduce((a,c)=>a+Number(c?.qty||0),0)}
function maxCardValue(){return Math.max(0,...Object.values(state.binder||{}).map(c=>Number(c?.market||0)))}
function unlockedCount(){return SETS.filter(setUnlocked).length}
const ACHIEVEMENTS=[
['a01','First Tear','Open 1 pack','🎴',()=>state.packs,1],['a02','Getting Warm','Open 5 packs','🔥',()=>state.packs,5],['a03','Ten Deep','Open 10 packs','📦',()=>state.packs,10],['a04','Pack Habit','Open 25 packs','😈',()=>state.packs,25],['a05','Half Century','Open 50 packs','5️⃣',()=>state.packs,50],['a06','Century Ripper','Open 100 packs','💯',()=>state.packs,100],['a07','Pack Storm','Open 250 packs','🌪️',()=>state.packs,250],['a08','Cardboard Legend','Open 500 packs','🏛️',()=>state.packs,500],
['a09','First Spark','Pull your first hit','✨',()=>state.hits,1],['a10','Hot Hand','Pull 5 hits','🔥',()=>state.hits,5],['a11','Hit Hunter','Pull 10 hits','🎯',()=>state.hits,10],['a12','Foil Fever','Pull 25 hits','🌈',()=>state.hits,25],['a13','Hit Machine','Pull 50 hits','⚡',()=>state.hits,50],['a14','Triple Digits','Pull 100 hits','💎',()=>state.hits,100],
['a15','Binder Started','Own 10 unique cards','📗',()=>Object.keys(state.binder).length,10],['a16','Binder Builder','Own 25 unique cards','📘',()=>Object.keys(state.binder).length,25],['a17','Collector','Own 50 unique cards','🗂️',()=>Object.keys(state.binder).length,50],['a18','Vault Keeper','Own 100 unique cards','🗄️',()=>Object.keys(state.binder).length,100],['a19','Museum Curator','Own 200 unique cards','🏛️',()=>Object.keys(state.binder).length,200],['a20','Stacked Binder','Hold 100 total cards','📚',()=>binderTotal(),100],['a21','Card Mountain','Hold 250 total cards','⛰️',()=>binderTotal(),250],
['a22','Level Up','Reach Level 2','⬆️',()=>levelFromXP(state.xp),2],['a23','Rising Ripper','Reach Level 5','⭐',()=>levelFromXP(state.xp),5],['a24','Double Digits','Reach Level 10','🔟',()=>levelFromXP(state.xp),10],['a25','Elite Status','Reach Level 20','🏆',()=>levelFromXP(state.xp),20],['a26','Master Rank','Reach Level 30','🔱',()=>levelFromXP(state.xp),30],['a27','TCG Icon','Reach Level 38','👑',()=>levelFromXP(state.xp),38],
['a28','New Horizons','Unlock 5 sets','🔓',()=>unlockedCount(),5],['a29','Shelf Expansion','Unlock 10 sets','🏪',()=>unlockedCount(),10],['a30','Era Explorer','Unlock 20 sets','🧭',()=>unlockedCount(),20],['a31','Master Shelf','Unlock all sets','🌐',()=>unlockedCount(),SETS.length],
['a32','First Shift','Complete 1 shop shift','🛠️',()=>totalJobs(),1],['a33','Part Timer','Complete 5 shop shifts','🧾',()=>totalJobs(),5],['a34','Shop Regular','Complete 10 shop shifts','🏬',()=>totalJobs(),10],['a35','Employee Month','Complete 25 shop shifts','🥇',()=>totalJobs(),25],['a36','Workaholic','Complete 50 shop shifts','⚙️',()=>totalJobs(),50],
['a37','Price Rookie','Win Price Check once','🏷️',()=>state.miniStats.price,1],['a38','Price Gun','Win Price Check 10 times','💲',()=>state.miniStats.price,10],['a39','Sleeved Up','Win Sleeve Rush once','🃏',()=>state.miniStats.sleeve,1],['a40','Perfect Fit','Win Sleeve Rush 10 times','🛡️',()=>state.miniStats.sleeve,10],['a41','Good Memory','Win Order Memory once','🧠',()=>state.miniStats.memory,1],['a42','Photographic','Win Order Memory 10 times','📸',()=>state.miniStats.memory,10],['a43','Dock Hand','Win Delivery Catch once','🚚',()=>state.miniStats.delivery,1],['a44','Warehouse Pro','Win Delivery Catch 10 times','📦',()=>state.miniStats.delivery,10],['a45','Arcade Regular','Win 10 premium mini-games','🕹️',()=>totalMini(),10],['a46','Arcade Ace','Win 30 premium mini-games','👾',()=>totalMini(),30],
['a47','First Dollar','Have $10 at once','💵',()=>Number(state.coins||0),10],['a48','Pocket Money','Have $25 at once','🪙',()=>Number(state.coins||0),25],['a49','Shop Float','Have $50 at once','💰',()=>Number(state.coins||0),50],['a50','Big Bank','Have $100 at once','🏦',()=>Number(state.coins||0),100],['a51','High Roller','Have $250 at once','💸',()=>Number(state.coins||0),250],
['a52','Clean Binder','Trash 10 cards','🗑️',()=>state.trashed||0,10],['a53','Ruthless','Trash 50 cards','♻️',()=>state.trashed||0,50],['a54','Dollar Card','Own a card worth $1+','💳',()=>maxCardValue(),1],['a55','Nice Pull','Own a card worth $5+','💵',()=>maxCardValue(),5],['a56','Premium Pull','Own a card worth $10+','💎',()=>maxCardValue(),10],['a57','Monster Pull','Own a card worth $25+','🐉',()=>maxCardValue(),25],['a58','Treasure','Own a card worth $50+','👑',()=>maxCardValue(),50],['a59','Dream Card','Own a card worth $100+','🌟',()=>maxCardValue(),100]
];
function updateBadges(){BADGE_DEFS.forEach(([id,n,d,fn])=>{if(fn())state.badges[id]=true});ACHIEVEMENTS.forEach(([id,n,d,ico,get,target])=>{if(Number(get())>=target)state.achievements[id]=true})}
function bestBinderHits(){return Object.values(state.binder).filter(c=>c&&c.qty>0).sort((a,b)=>tier(b)-tier(a)||(Number(b.market)||0)-(Number(a.market)||0)).slice(0,6)}
function renderProfile(){updateBadges();let lv=levelFromXP(state.xp),lo=xpFloor(lv),hi=xpCeil(lv),pct=Math.max(0,Math.min(100,(state.xp-lo)/(hi-lo)*100));$('#profileRank').textContent=rankName(lv);$('#profileLevel').textContent=`Level ${lv} • ${unlockedCount()}/${SETS.length} sets unlocked`;$('#xpFill').style.width=pct+'%';$('#xpText').textContent=`${Math.floor(state.xp-lo)} / ${hi-lo} XP toward Level ${lv+1}`;let badge=document.getElementById('collectorLevelBadgeV158');if(badge)badge.textContent=`LV ${lv}`;let slabs=state.gradingV44?.graded||[],binderValue=Object.values(state.binder||{}).reduce((n,c)=>n+sellPrice(c)*Number(c.qty||0),0),bulkValue=Object.values(state.bulkV64||{}).reduce((n,c)=>n+sellPrice(c)*Number(c.qty||0),0),slabValue=slabs.reduce((n,j)=>n+gradedValueV56(j),0),collectionValue=binderValue+bulkValue+slabValue+(state.hubEscrowV256||[]).reduce((n,c)=>n+sellPrice(c),0),sales=Number(state.marketV57?.sold||state.marketV57?.sales?.length||0)+Number(state.hubTotalsV256?.sales||0),trades=Number(state.tradeV154?.count||0)+Number(state.hubTotalsV256?.trades||0),highGrade=slabs.reduce((m,j)=>Math.max(m,Number(j.grade||0)),0);let head=document.getElementById('profileHeaderSubV158');if(head)head.textContent=`${rankName(lv)} • ${binderTotal()} Binder cards • ${slabs.length} slabs`;$('#careerGrid').innerHTML=`<div><b>${Number(state.packs||0)}</b><span>Packs Opened</span></div><div><b>${Number(state.hits||0)}</b><span>Hits Pulled</span></div><div><b>${binderTotal()}</b><span>Binder Cards</span></div><div><b>$${collectionValue.toFixed(2)}</b><span>Collection Value</span></div><div><b>${sales}</b><span>Marketplace Sales</span></div><div><b>${trades}</b><span>Trades Completed</span></div><div><b>${slabs.length}</b><span>Slabs Owned</span></div><div><b>${highGrade?highGrade.toFixed(1):'—'}</b><span>Highest Grade</span></div>`;let sh=$('#showcase'),hits=bestBinderHits();sh.innerHTML=hits.length?hits.map((c,i)=>`<button class="showHit fx${tier(c)} ${i===0?'heroHitV158':''}" data-id="${c.id}"><img src="${c.thumb||c.img||''}"><span><b>${c.name}</b><small>$${Number(c.market||sellPrice(c)||0).toFixed(2)}</small></span></button>`).join(''):'<div class="profileEmptyV158">Your strongest Binder cards will appear here.</div>';sh.querySelectorAll('.showHit').forEach(x=>x.onclick=()=>openBinderCard(x.dataset.id));$('#badges').innerHTML=BADGE_DEFS.map(([id,n,d,fn,ico])=>`<div class="badge ${state.badges[id]?'earned':'lockedBadge'}"><i>${state.badges[id]?ico:'◆'}</i><b>${n}</b><span>${d}</span></div>`).join('');let bc=Object.values(state.badges||{}).filter(Boolean).length;$('#badgeCount').textContent=`${bc} / ${BADGE_DEFS.length}`;let done=ACHIEVEMENTS.filter(a=>state.achievements[a[0]]).length;$('#achievementCount').textContent=`${done} / ${ACHIEVEMENTS.length}`;$('#achPercent').textContent=Math.round(done/ACHIEVEMENTS.length*100)+'%';$('#achPoints').textContent=done*100;if(window.renderAchievementsV160)renderAchievementsV160(window.profileAchFilterV160||'all');$('#unlockRoad').innerHTML=SETS.map(set=>{let unlocked=setUnlocked(set),mp=masterProgressV58(set),p=Math.max(0,Math.min(100,Number(mp.p||0)));return `<button type="button" class="roadSetV158 ${unlocked?'earned':'locked'}" data-profile-set-v160="${set.id}" style="--sa:${set.a};--sb:${set.b}"><span class="roadLogoV158"><img src="${logo(set)}" onerror="this.style.display='none'"></span><span class="roadInfoV158"><small>${unlocked?'MASTER SET':'LOCKED SET'}</small><b>${set.name}</b><em>${unlocked?(mp.total?`${mp.n} / ${mp.total}`:`${mp.n||0} owned`):`Unlocks at Level ${set.unlock}`}</em><i><u style="width:${unlocked?p:0}%"></u></i></span><strong>${unlocked?Math.round(p)+'%':'🔒'}</strong></button>`}).join('');$('#unlockRoad').querySelectorAll('[data-profile-set-v160]').forEach(btn=>btn.onclick=()=>{let set=SETS.find(x=>x.id===btn.dataset.profileSetV160);if(set)showSetRequirements(set)});let rc=document.getElementById('profileRoadCountV158');if(rc)rc.textContent=`${unlockedCount()} / ${SETS.length}`;let su=document.getElementById('profileSetsUnlockedV158');if(su)su.textContent=`${unlockedCount()} / ${SETS.length}`;let cc=SETS.filter(x=>state.chaseBadges?.[x.id]).length;$('#chaseCount').textContent=`${cc} / ${SETS.length}`;let masters=SETS.filter(x=>{let p=masterProgressV58(x);return p.total>0&&p.n>=p.total}).length,ms=document.getElementById('profileMastersV158');if(ms)ms.textContent=String(masters)}


/* V83 — fast skill-based Earn Hub */
function earnFinishV83(kind,base,score,max,msg){
 let e=state.earnV83,ratio=Math.max(0,Math.min(1,score/Math.max(1,max))),perf=ratio>=.9;
 let mult=1+(Math.min(5,Number(e.streak||0))*.08),pay=Math.round(base*(.72+.56*ratio)*mult*100)/100;
 money(pay);state.jobCareer.earnings=Math.round((Number(state.jobCareer.earnings||0)+pay)*100)/100;
 state.miniStats[kind]=(state.miniStats[kind]||0)+1;e.played[kind]=(e.played[kind]||0)+1;
 if(!(e.contract||[]).includes(kind))e.contract.push(kind);e.streak=perf?Number(e.streak||0)+1:0;
 save();hitSound(perf?4:2);if(navigator.vibrate)navigator.vibrate(perf?[18,25,45]:15);
 workState=null;activeJob=null;$('#workScore').textContent=`${perf?'PERFECT SHIFT':'SHIFT COMPLETE'} • +$${pay.toFixed(2)} • NO XP`;
 $('#workArea').innerHTML=`<div style="text-align:center;padding:45px 8px"><div style="font-size:62px">${perf?'🔥💵':'💵'}</div><h2>${msg}</h2><p>${score}/${max} performance • ${mult.toFixed(2)}× streak multiplier</p><button class="btn primary" id="doneWorkV83">COLLECT $${pay.toFixed(2)}</button></div>`;
 $('#doneWorkV83').onclick=()=>{closeWork(true);updateEarn()}
}
function startQuickFlipV83(){if(activeJob)return toast('Finish your current shift first.');activeJob='quickflip';workState={kind:'quickflip',round:0,score:0};openWork('🃏 QUICK FLIP','Three sellers, one profitable deal. Compare market value against asking price and buy the best margin.');quickFlipRoundV83()}
function quickFlipRoundV83(){let w=workState;if(w.round>=6)return earnFinishV83('quickflip',18,w.score,6,'Dealer table cleared!');
 let market=Math.floor(12+Math.random()*55),good=Math.round(market*(.48+Math.random()*.18)),mid=Math.round(market*(.82+Math.random()*.12)),bad=Math.round(market*(1.08+Math.random()*.28));
 let opts=[good,mid,bad].sort(()=>Math.random()-.5);w.best=Math.min(...opts);$('#workScore').textContent=`DEAL ${w.round+1}/6 • MARKET $${market}`;
 $('#workArea').innerHTML=`<div class="gamePad"><div class="v83Deal"><div class="v83DealCard"><div style="font-size:48px">✨🃏</div><b>Card market value</b><strong>$${market}</strong><span>Which seller leaves the best resale margin?</span><div class="v83Choices">${opts.map((v,i)=>`<button data-v="${v}">SELLER ${i+1}<br>$${v}</button>`).join('')}</div></div></div></div>`;
 $$('.v83Choices button').forEach(b=>b.onclick=()=>{w.round++;if(+b.dataset.v===w.best){w.score++;cardSound()}else navigator.vibrate?.(20);quickFlipRoundV83()})
}
function startPackRushV83(){if(activeJob)return toast('Finish your current shift first.');activeJob='packrush';workState={kind:'packrush',round:0,score:0,combo:0};openWork('📦 PACK & SHIP RUSH','Read the order and hit the matching packing station. Correct streaks increase your final pay.');packRushRoundV83()}
function packRushRoundV83(){let w=workState;if(w.round>=10)return earnFinishV83('packrush',22,w.score,10,'Orders dispatched!');
 let a=[['BOOSTER','🎴'],['BINDER','📘'],['SLEEVES','🛡️']],t=a[Math.floor(Math.random()*a.length)];w.target=t[0];$('#workScore').textContent=`ORDER ${w.round+1}/10 • COMBO ×${w.combo}`;
 $('#workArea').innerHTML=`<div class="gamePad"><div class="v83Rush"><div class="v83Order">PACK NOW → ${t[1]} ${t[0]}</div><div class="v83RushBtns">${a.map(x=>`<button data-v="${x[0]}">${x[1]}<br><small>${x[0]}</small></button>`).join('')}</div></div></div>`;
 $$('.v83RushBtns button').forEach(b=>b.onclick=()=>{w.round++;if(b.dataset.v===w.target){w.score++;w.combo++;cardSound()}else{w.combo=0;navigator.vibrate?.(20)}packRushRoundV83()})
}
function startHaggleV83(){if(activeJob)return toast('Finish your current shift first.');activeJob='haggle';workState={kind:'haggle',round:0,score:0};openWork('🤝 COLLECTOR HAGGLING','Read the seller. Choose a fair opening offer: too low walks the deal, too high kills your margin.');haggleRoundV83()}
function haggleRoundV83(){let w=workState;if(w.round>=5)return earnFinishV83('haggle',24,w.score,5,'Negotiations complete!');
 let ask=[20,30,40,50,60][Math.floor(Math.random()*5)],sweet=Math.round(ask*.8),opts=[Math.round(ask*.55),sweet,Math.round(ask*.96)].sort(()=>Math.random()-.5);w.sweet=sweet;
 $('#workScore').textContent=`DEAL ${w.round+1}/5`;$('#workArea').innerHTML=`<div class="gamePad"><div class="v83Deal"><div class="v83DealCard"><div style="font-size:50px">🧑‍💼🃏</div><b>Seller asks $${ask}</b><p>“I have a little room, but don't lowball me.”</p><div class="v83Choices">${opts.map(v=>`<button data-v="${v}">OFFER<br>$${v}</button>`).join('')}</div></div></div></div>`;
 $$('.v83Choices button').forEach(b=>b.onclick=()=>{w.round++;if(+b.dataset.v===w.sweet){w.score++;holoSound()}else navigator.vibrate?.([12,18,12]);haggleRoundV83()})
}
function startVaultV83(){if(activeJob)return toast('Finish your current shift first.');activeJob='vault';workState={kind:'vault',round:0,score:0};openWork('🔐 VAULT MATCH','Incoming graded slabs have slot numbers. Put each slab into the matching vault bay.');vaultRoundV83()}
function vaultRoundV83(){let w=workState;if(w.round>=8)return earnFinishV83('vault',25,w.score,8,'Vault intake secured!');
 let target=1+Math.floor(Math.random()*6);w.target=target;let nums=[1,2,3,4,5,6].sort(()=>Math.random()-.5);$('#workScore').textContent=`SLAB ${w.round+1}/8`;
 $('#workArea').innerHTML=`<div class="gamePad"><div class="v83Vault"><div class="v83Order">PSA-style slab intake → BAY <b>${target}</b></div><div class="v83VaultGrid">${nums.map(n=>`<button data-v="${n}">🔒<br>BAY ${n}</button>`).join('')}</div></div></div>`;
 $$('.v83VaultGrid button').forEach(b=>b.onclick=()=>{w.round++;if(+b.dataset.v===w.target){w.score++;holoSound()}else navigator.vibrate?.(18);vaultRoundV83()})
}

/* V84 card-shop economy world */
function shopPool84(){
 let a=[];Object.values(cache||{}).forEach(d=>(d?.cards||[]).forEach(c=>{if(c?.img||c?.thumb)a.push(c)}));
 if(!a.length)a=Object.values(state.binder||{}).filter(c=>c&&(c.img||c.thumb));
 return a;
}
function shopCardPick84(minTier=0){let p=shopPool84().filter(c=>tier(c)>=minTier);return p[Math.floor(Math.random()*p.length)]||shopPool84()[0]}
function shopRep84(n,msg){let q=state.shopV84;q.rep=Math.max(0,q.rep+n);if(msg)q.ledger.unshift({t:Date.now(),msg});q.ledger=q.ledger.slice(0,20);save();updateEarn()}
function shopPay84(n,msg){n=Math.round(n*100)/100;money(n);state.shopV84.profit=Math.round((state.shopV84.profit+n)*100)/100;state.jobCareer.earnings=Math.round((Number(state.jobCareer.earnings||0)+n)*100)/100;shopRep84(1,msg||`Shop income +$${n.toFixed(2)}`);hitSound(n>=25?4:2);return n}
function routeShopCardV87(c,count=1){if(!c)return 'none';if(isBulkCardV64(c)){addToBulkV64(c,count);return 'bulk'}addToBinderV64(c,count);return 'binder'}
function shopBuyCard84(c,cost){cost=Number(cost||0);if(!c)return false;if(Number(state.coins)<cost){toast('Not enough cash for that deal.');return false}money(-cost);let dest=routeShopCardV87(c);state.shopV84.deals++;shopRep84(1,`Bought ${c.name} for $${cost.toFixed(2)}`);save();try{renderBinder()}catch(e){}try{renderBulkV64()}catch(e){}try{renderSets()}catch(e){};toast(dest==='bulk'?'🗃️ Bought • sent to Bulk Tub':'📘 Bought • sent to Binder');return true}
function finishShop84(html){$('#workScore').textContent='SHOP ACTIVITY';$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84">${html}<button class="btn primary" id="shopDone84">BACK TO SHOP</button></div></div></div>`;$('#shopDone84').onclick=()=>{activeJob=null;workState=null;closeWork(true);updateEarn()}}
function counterCustomer85(){
 const names=['Mia','Jordan','Alex','Sam','Taylor','Casey','Riley','Jamie','Morgan','Kai'];
 const types=[
  {label:'Casual Collector',avatar:'🧑',patience:3,floor:.76},
  {label:'Binder Collector',avatar:'👩‍💼',patience:4,floor:.72},
  {label:'Competitive Player',avatar:'🧢',patience:2,floor:.82},
  {label:'Long-time Collector',avatar:'🧔',patience:3,floor:.79}
 ];
 let t=types[Math.floor(Math.random()*types.length)];
 return {...t,name:names[Math.floor(Math.random()*names.length)]};
}
function counterMarket85(c){return Math.max(.1,Number(c?.market||sellPrice(c)||.1))}
function startCounter84(){
 activeJob='counter84';
 let n=3+Math.floor(Math.random()*8),cards=Array.from({length:n},()=>shopCardPick84(Math.random()<.22?2:0)).filter(Boolean);
 let value=cards.reduce((x,c)=>x+counterMarket85(c),0);
 let customer=counterCustomer85(),ask=Math.max(3,Math.round(value*(.72+Math.random()*.28)*100)/100);
 let floor=Math.max(1,Math.round(ask*customer.floor*100)/100);
 workState={cards,value,ask,floor,customer,attempts:0,patience:customer.patience,status:'open',offer:Math.min(ask,Math.max(1,Math.round(ask*.82*100)/100))};
 openWork('🧑‍💼 CUSTOMER COUNTER','Inspect the collection, read the seller and negotiate a deal that makes sense for your shop.');
 renderCounter84();
}
function counterMood85(w){
 let left=Math.max(0,w.patience-w.attempts);
 return left>=3?'RELAXED':left===2?'LISTENING':left===1?'LAST OFFER':'READY TO LEAVE';
}
function renderCounter84(){
 let w=workState;if(!w||w.status!=='open')return;
 let lo=Math.max(.5,Math.round(w.ask*.55*100)/100),hi=Math.max(lo+1,Math.round(w.ask*1.05*100)/100);
 w.offer=Math.min(hi,Math.max(lo,Number(w.offer||w.ask*.82)));
 $('#workScore').textContent=`CUSTOMER ASK • $${w.ask.toFixed(2)} • ${w.cards.length} CARDS`;
 $('#workArea').innerHTML=`<div class="gamePad"><div class="counterShell85"><div class="counterGlass85">
  <div class="customerTop85"><div class="customerAvatar85">${w.customer.avatar}</div><div><b>${w.customer.name}</b><span>${w.customer.label} • ${w.cards.length}-card collection</span></div><div class="mood85" id="mood85">${counterMood85(w)}</div></div>
  <div class="askPanel85"><div><small>SELLER'S ASK</small><strong>$${w.ask.toFixed(2)}</strong></div><em>${Math.max(0,w.patience-w.attempts)} negotiation chance${Math.max(0,w.patience-w.attempts)===1?'':'s'} left</em></div>
  <div class="collectionStrip85" id="collectionStrip85">${w.cards.map((c,i)=>`<button class="counterCard85" data-inspect85="${i}"><img src="${c.thumb||c.img||''}" onerror="this.style.opacity='.18'"><b>${c.name||'Unknown card'}</b><span>${c.rarity||c.set||'Card'}</span></button>`).join('')}</div>
  <div class="collectionMeta85"><span>↔ Swipe cards • tap one to inspect</span><span>${w.cards.length} ITEMS</span></div>
  <div class="negotiation85"><div class="offerRead85"><div><small>YOUR OFFER</small><strong id="offerVal85">$${w.offer.toFixed(2)}</strong></div><em>Cash: $${Number(state.coins||0).toFixed(2)}</em></div>
   <input id="offer85" type="range" min="${lo}" max="${hi}" step=".25" value="${w.offer}">
   <div class="quickOffers85"><button data-pct85=".70">70%</button><button data-pct85=".80">80%</button><button data-pct85=".90">90%</button><button data-pct85="1">ASK</button></div>
   <button class="makeOffer85" id="makeOffer85" type="button">🤝 MAKE OFFER • $${w.offer.toFixed(2)}</button>
   <div class="negReply85" id="negReply85">Study the cards first. The seller may accept, counter, or walk depending on your offer and their patience.</div>
  </div>
 </div></div></div>`;
 const slider=$('#offer85'),val=$('#offerVal85'),make=$('#makeOffer85');
 const sync=()=>{w.offer=Number(slider.value);val.textContent='$'+w.offer.toFixed(2);make.textContent='🤝 MAKE OFFER • $'+w.offer.toFixed(2)};
 slider.addEventListener('input',sync,{passive:true});slider.addEventListener('change',sync);
 $$('[data-pct85]').forEach(b=>b.addEventListener('click',()=>{slider.value=Math.min(hi,Math.max(lo,Math.round(w.ask*Number(b.dataset.pct85)*4)/4));sync()}));
 $$('[data-inspect85]').forEach(b=>b.addEventListener('click',()=>inspectCounterCard85(Number(b.dataset.inspect85))));
 make.addEventListener('click',submitCounterOffer85);
}
function inspectCounterCard85(i){
 let w=workState,c=w?.cards?.[i];if(!c)return;
 let old=$('#counterInspect85');if(old)old.remove();
 let d=document.createElement('div');d.id='counterInspect85';d.className='inspect85 show';
 d.innerHTML=`<div class="inspectCard85"><img src="${c.img||c.thumb||''}"><h3>${c.name||'Card'}</h3><p>${c.set||''}${c.rarity?' • '+c.rarity:''}</p><button type="button">BACK TO COLLECTION</button></div>`;
 document.body.appendChild(d);d.querySelector('button').onclick=()=>d.remove();d.onclick=e=>{if(e.target===d)d.remove()};
}
function submitCounterOffer85(){
 let w=workState;if(!w||w.status!=='open')return;
 let slider=$('#offer85'),reply=$('#negReply85'),make=$('#makeOffer85');if(!slider||!make)return;
 let offer=Math.round(Number(slider.value)*100)/100;w.offer=offer;
 if(Number(state.coins||0)<offer){reply.className='negReply85 bad';reply.textContent=`You only have $${Number(state.coins||0).toFixed(2)} cash. Lower the offer or earn more first.`;navigator.vibrate?.(20);return}
 make.disabled=true;
 let softness=(Math.random()-.5)*w.ask*.06,acceptAt=Math.max(w.floor,w.floor+softness);
 if(offer>=acceptAt){setTimeout(()=>completeCounterDeal85(offer),260);return}
 w.attempts++;
 let left=w.patience-w.attempts;
 if(left<=0){w.status='walked';setTimeout(()=>counterWalk85(offer),280);return}
 let counter=Math.max(w.floor,Math.min(w.ask,Math.round((acceptAt+(w.ask-acceptAt)*(.18+Math.random()*.28))*100)/100));
 w.ask=counter;w.floor=Math.min(counter,Math.max(w.floor,Math.round(counter*(.86+Math.random()*.05)*100)/100));w.offer=Math.min(counter,Math.max(offer,Math.round(counter*.88*100)/100));
 reply.className='negReply85 bad';reply.textContent=`${w.customer.name}: “I can't do $${offer.toFixed(2)}. I'd come down to $${counter.toFixed(2)}.”`;
 setTimeout(renderCounter84,650);
}
function completeCounterDeal85(offer){
 let w=workState;if(!w||w.status!=='open')return;if(Number(state.coins||0)<offer){renderCounter84();return}
 w.status='accepted';money(-offer);w.cards.forEach(addBinder);state.shopV84.deals++;
 let spread=w.value-offer,rep=spread>=0?2:1;shopRep84(rep,`Counter deal • ${w.cards.length} cards for $${offer.toFixed(2)}`);
 hitSound(spread>=10?4:2);navigator.vibrate?.([18,35,18]);
 $('#workScore').textContent='🤝 DEAL COMPLETE';
 $('#workArea').innerHTML=`<div class="gamePad"><div class="counterShell85"><div class="counterGlass85 counterResult85"><div class="big85">🤝</div><h3>Collection purchased</h3><p>${w.customer.name}'s ${w.cards.length}-card collection has been added to your inventory.</p><div class="counterReceipt85"><div><span>Seller ask</span><b>$${w.ask.toFixed(2)}</b></div><div><span>You paid</span><b>$${offer.toFixed(2)}</b></div><div><span>Estimated card value</span><b>$${w.value.toFixed(2)}</b></div><div><span>Estimated spread</span><b>${spread>=0?'+':''}$${spread.toFixed(2)}</b></div><div><span>Shop reputation</span><b>+${rep}</b></div></div><button class="makeOffer85" id="counterDone85">RETURN TO SHOP</button></div></div></div>`;
 $('#counterDone85').onclick=()=>{activeJob=null;workState=null;closeWork(true);updateEarn()};
}
function counterWalk85(offer){
 let w=workState;$('#workScore').textContent='CUSTOMER LEFT';
 $('#workArea').innerHTML=`<div class="gamePad"><div class="counterShell85"><div class="counterGlass85 counterResult85"><div class="big85">🚪</div><h3>No deal</h3><p>${w.customer.name} passed after your $${offer.toFixed(2)} offer. You kept your cash and no inventory changed.</p><button class="makeOffer85" id="counterDone85">RETURN TO SHOP</button></div></div></div>`;
 $('#counterDone85').onclick=()=>{activeJob=null;workState=null;closeWork(true);updateEarn()};
}
function startLots84(){activeJob='lots84';openWork('📦 COLLECTION LOT AUCTION','The photos only tell part of the story. Bid against collectors, then uncover what you actually bought.');let types=[['Old Binder','📘',28],['Tin & Loose Cards','🧰',18],['Storage Box','📦',38]],lots=types.map((x,i)=>({name:x[0],icon:x[1],bid:x[2]+Math.floor(Math.random()*18),cards:4+i*3}));workState={lots};$('#workScore').textContent='AUCTION LIVE';$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><h3>Three lots are closing now</h3>${lots.map((l,i)=>`<div class="lot84"><b>${l.icon} ${l.name}</b><span>${l.cards}–${l.cards+4} cards • partial photos only</span><button class="btn" data-lot="${i}">BID $${l.bid}</button></div>`).join('')}</div></div></div>`;$$('[data-lot]').forEach(b=>b.onclick=()=>resolveLot84(lots[+b.dataset.lot]))}
function resolveLot84(l){
 if(Number(state.coins)<l.bid)return toast('Not enough cash to bid.');money(-l.bid);
 let count=l.cards+Math.floor(Math.random()*5),cards=Array.from({length:count},()=>shopCardPick84(Math.random()<.16?2:0)).filter(Boolean);
 workState={lot:l,cards,paid:l.bid};$('#workScore').textContent='LOT WON • UNOPENED';
 $('#workArea').innerHTML=`<div class="gamePad"><div class="lotReveal87"><div class="lotParcel87">${l.icon}<span>SEALED COLLECTION LOT</span><b>${l.name}</b></div><h3>You won it for $${Number(l.bid).toFixed(2)}</h3><p>The contents are still unknown.</p><button class="openLot87" id="openLot87">OPEN COLLECTION</button></div></div>`;
 document.getElementById('openLot87').onclick=()=>openWonLotV87();
}
function openWonLotV87(){let w=workState;if(!w?.cards)return;try{sfxEventV70('packTear')}catch(e){};$('#workScore').textContent='OPENING COLLECTION';let cards=w.cards;
 $('#workArea').innerHTML=`<div class="gamePad"><div class="binderReveal87 opening"><div class="binderCover87"><i>✦</i><b>COLLECTOR BINDER</b><span>tap to open</span></div><div class="binderInside87"><div class="binderRing87"></div><div class="binderCards87">${cards.map((c,i)=>`<button class="lotCard87" data-lotcard="${i}" style="--d:${Math.min(i,12)*.045}s"><img src="${c.thumb||c.img||''}"><span>${isBulkCardV64(c)?'BULK':'HIT'}</span></button>`).join('')}</div></div></div><button class="openBinder87" id="openBinder87">OPEN BINDER</button></div>`;
 document.getElementById('openBinder87').onclick=()=>{document.querySelector('.binderReveal87')?.classList.add('opened');document.getElementById('openBinder87').textContent='ADD COLLECTION TO INVENTORY';document.getElementById('openBinder87').onclick=collectWonLotV87;try{sfxEventV70('binder')}catch(e){}};
}
function collectWonLotV87(){let w=workState;if(!w?.cards)return;let bulk=0,hits=0,value=0;w.cards.forEach(c=>{let d=routeShopCardV87(c);d==='bulk'?bulk++:hits++;value+=Number(c.market||sellPrice(c)||.1)});state.shopV84.deals++;shopRep84(value>w.paid?2:1,`Won ${w.lot?.name||'collection'} for $${w.paid}`);save();try{renderBinder()}catch(e){}try{renderBulkV64()}catch(e){}try{renderSets()}catch(e){};finishShop84(`<div class="lotReceipt87"><div class="big85">📚</div><h3>Collection sorted</h3><p><b>${hits}</b> hit${hits===1?'':'s'} → Binder &nbsp;•&nbsp; <b>${bulk}</b> bulk → Tub</p><div class="counterReceipt85"><div><span>Paid</span><b>$${Number(w.paid).toFixed(2)}</b></div><div><span>Estimated card value</span><b>$${value.toFixed(2)}</b></div><div><span>Total cards</span><b>${w.cards.length}</b></div></div></div>`)}
function startFlip84(){activeJob='flip84';openWork('📱 ONLINE FLIPPING','Listings disappear quickly. Buy only when you think the spread is worth tying up your cash.');let feed=Array.from({length:8},()=>{let c=shopCardPick84(Math.random()<.35?2:0),mv=Math.max(2,Number(c?.market||sellPrice(c)||2)),ask=Math.max(1,Math.round(mv*(.5+Math.random()*.9)*100)/100);return {c,mv,ask}}).filter(x=>x.c);workState={feed};renderFlip84()}
function renderFlip84(){let w=workState;$('#workScore').textContent='LIVE LISTINGS • BUY BEFORE THEY REFRESH';$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><div class="feed84">${w.feed.map((x,i)=>`<div class="listing84"><img src="${x.c.thumb||x.c.img}"><div><b>${x.c.name}</b><span>market ~$${x.mv.toFixed(2)}</span></div><button data-buy="${i}">$${x.ask.toFixed(2)}</button></div>`).join('')}</div><button class="btn" id="refreshFlip84">REFRESH FEED</button></div></div></div>`;$$('[data-buy]').forEach(b=>b.onclick=()=>{let x=w.feed[+b.dataset.buy];if(!shopBuyCard84(x.c,x.ask))return;b.disabled=true;b.textContent='BOUGHT';toast(x.ask<x.mv?'🔥 Under-market pickup!':'Added to inventory.')});$('#refreshFlip84').onclick=startFlip84}
function startShow84(){if(state.shopV84.rep<5)return toast('Reach Shop Rep 5 to get invited to the card show.');activeJob='show84';openWork('🎪 CARD SHOW','Walk dealer tables. Each table has a different risk profile and stock quality.');let tables=[['Veteran Dealer','🧔','Fair prices, stronger hits',2],['Estate Table','📦','Messy stock, unpredictable',0],['High-End Case','💎','Expensive but serious cards',3],['Trade Night','🤝','Mixed collector stock',1]];$('#workScore').textContent='SHOW FLOOR';$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><div class="showTables84">${tables.map((t,i)=>`<button data-table="${i}">${t[1]}<br>${t[0]}<br><small>${t[2]}</small></button>`).join('')}</div></div></div></div>`;$$('[data-table]').forEach(b=>b.onclick=()=>showTable84(tables[+b.dataset.table]))}
function showTable84(t){let cards=Array.from({length:4},()=>shopCardPick84(t[3])).filter(Boolean),c=cards[Math.floor(Math.random()*cards.length)],mv=Math.max(3,Number(c.market||sellPrice(c)||3)),ask=Math.round(mv*(.72+Math.random()*.4)*100)/100;workState={cards,c,mv,ask};$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><h3>${t[1]} ${t[0]}</h3><div class="walkCards84">${cards.map(x=>`<div class="walkCard84"><img src="${x.thumb||x.img}"><b>${x.name}</b></div>`).join('')}</div><p>Dealer offers <b>${c.name}</b> for $${ask.toFixed(2)} • market around $${mv.toFixed(2)}</p><div class="choice84"><button id="showBuy84">BUY $${ask.toFixed(2)}</button><button id="showHaggle84">HAGGLE</button><button id="showWalk84">WALK</button></div></div></div></div>`;$('#showBuy84').onclick=()=>{if(shopBuyCard84(c,ask))finishShop84(`<h3>🛍️ Pickup secured</h3><p>${c.name} is now in your inventory.</p>`)};$('#showHaggle84').onclick=()=>{let offer=Math.round(ask*.86*100)/100;if(Math.random()<.62&&shopBuyCard84(c,offer))finishShop84(`<h3>🤝 Dealer accepted $${offer.toFixed(2)}</h3><p>${c.name} added to inventory.</p>`);else toast('Dealer declined your offer.')};$('#showWalk84').onclick=()=>finishShop84('<h3>🚶 You walked away</h3><p>Sometimes keeping cash is the best trade.</p>')}
function startBinderBuy84(){activeJob='binderbuy84';openWork('🎒 MYSTERY BINDER BUY','The seller lets you peek at three cards only. Decide whether those clues justify buying the unseen binder.');let count=9+Math.floor(Math.random()*8),cards=Array.from({length:count},()=>shopCardPick84(Math.random()<.13?2:0)).filter(Boolean),peek=cards.slice(0,3),price=18+Math.floor(Math.random()*45);workState={cards,price};$('#workScore').textContent='3 PEEKS • ONE DECISION';$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><h3>Seller wants $${price} for the binder</h3><div class="peek84">${peek.map(c=>`<img src="${c.thumb||c.img}">`).join('')}</div><p>${cards.length} cards total. Everything after these three remains unseen.</p><div class="choice84"><button id="binderTake84">BUY $${price}</button><button id="binderOffer84">OFFER $${Math.round(price*.82)}</button><button id="binderWalk84">WALK</button></div></div></div></div>`;$('#binderTake84').onclick=()=>resolveBinder84(price);$('#binderOffer84').onclick=()=>{let o=Math.round(price*.82);Math.random()<.55?resolveBinder84(o):toast('Seller says no.')};$('#binderWalk84').onclick=()=>finishShop84('<h3>🚶 Passed on the binder</h3><p>Your cash stays safe for the next opportunity.</p>')}
function resolveBinder84(cost){let w=workState;if(Number(state.coins)<cost)return toast('Not enough cash.');money(-cost);let bulk=0,hits=0;w.cards.forEach(c=>routeShopCardV87(c)==='bulk'?bulk++:hits++);let value=w.cards.reduce((x,c)=>x+Number(c.market||sellPrice(c)||.1),0);shopRep84(value>cost?2:1,`Mystery binder • paid $${cost}`);save();try{renderBinder()}catch(e){}try{renderBulkV64()}catch(e){};finishShop84(`<h3>📘 Binder revealed</h3><div class="peek84">${w.cards.slice(-4).map(c=>`<img src="${c.thumb||c.img}">`).join('')}</div><p>${hits} hits → Binder • ${bulk} bulk → Tub<br>Estimated value <b>$${value.toFixed(2)}</b> against $${cost} paid.</p>`)}
function startShopShift84(){activeJob='shift84';workState={round:0,score:0,combo:0};openWork('🏪 SHOP RUSH','Multiple shop jobs hit at once. React to the icon, keep your combo alive and clear the queue.');shopShiftRound84()}
function shopShiftRound84(){let w=workState;if(w.round>=14)return finishShift84();let tasks=[['📦','STOCK'],['🧑','SERVE'],['✉️','SHIP'],['🛡️','SLEEVE']],t=tasks[Math.floor(Math.random()*tasks.length)];w.target=t[1];$('#workScore').textContent=`QUEUE ${w.round+1}/14 • COMBO ×${w.combo}`;$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><h3>DO NOW → ${t[0]} ${t[1]}</h3><div class="taskBoard84">${tasks.sort(()=>Math.random()-.5).map(x=>`<button data-task="${x[1]}">${x[0]}<small>${x[1]}</small></button>`).join('')}</div></div></div></div>`;$$('[data-task]').forEach(b=>b.onclick=()=>{w.round++;if(b.dataset.task===w.target){w.score++;w.combo++;cardSound()}else{w.combo=0;navigator.vibrate?.(18)}shopShiftRound84()})}
function finishShift84(){let w=workState,pay=12+w.score*1.35+Math.min(10,w.combo);shopPay84(pay,`Shop Rush ${w.score}/14`);finishShop84(`<h3>🏪 Shift closed</h3><p>You cleared ${w.score}/14 tasks and earned <b>$${pay.toFixed(2)}</b>.</p>`)}
function startDelivery84(){activeJob='delivery84';openWork('🚚 DELIVERY RUN','Choose a route. Fast routes pay more but carry a higher chance of a failed delivery bonus.');let base=10+Math.floor(Math.random()*10);workState={base};$('#workScore').textContent='VALUABLE ORDER READY';$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><h3>Order value secured in transit</h3><div class="route84"><button data-route="safe">🛣️ SAFE ROUTE<br><small>+$${base} • 95% success</small></button><button data-route="city">🏙️ CITY SHORTCUT<br><small>+$${base+8} • 78% success</small></button><button data-route="rush">⚡ EXPRESS RUN<br><small>+$${base+16} • 58% success</small></button></div></div></div></div>`;$$('[data-route]').forEach(b=>b.onclick=()=>{let k=b.dataset.route,ch=k==='safe'?.95:k==='city'?.78:.58,p=k==='safe'?base:k==='city'?base+8:base+16;if(Math.random()<ch){shopPay84(p,`${k} delivery completed`);finishShop84(`<h3>📦 Delivered</h3><p>Clean hand-off. You earned <b>$${p.toFixed(2)}</b>.</p>`)}else finishShop84(`<h3>🚧 Delivery delayed</h3><p>You still protected the customer's cards, but lost the route bonus. No payout this run.</p>`)})}
function startBreak84(){if(state.shopV84.rep<10)return toast('Reach Shop Rep 10 before customers trust you to host breaks.');activeJob='break84';openWork('🎥 LIVE BREAK HOST','Fill fictional customer slots, then reveal a short break. Big hits increase tips.');let fill=.55+Math.random()*.45,cards=Array.from({length:5},()=>shopCardPick84(Math.random()<.25?2:0)).filter(Boolean);workState={fill,cards};$('#workScore').textContent=`BREAK SLOTS • ${Math.round(fill*100)}% FILLED`;$('#workArea').innerHTML=`<div class="gamePad"><div class="shopScene84"><div class="shopCard84"><h3>🔴 LIVE • Collector Break</h3><div class="breakMeter84"><i style="width:${fill*100}%"></i></div><p>Customers have filled ${Math.round(fill*100)}% of the break. Start now or wait for another session.</p><button class="btn primary" id="runBreak84">RIP THE BREAK</button></div></div></div>`;$('#runBreak84').onclick=()=>{let hits=cards.filter(c=>tier(c)>=2).length,pay=Math.round((10+fill*12+hits*4)*100)/100;shopPay84(pay,`Live break • ${hits} hits`);finishShop84(`<h3>🎥 Break complete</h3><div class="peek84">${cards.map(c=>`<img src="${c.thumb||c.img}">`).join('')}</div><p>${hits} hit${hits===1?'':'s'} generated tips. Shop margin + tips: <b>$${pay.toFixed(2)}</b>.</p>`)}}
// Premium interactive shop games
function finishPremium(kind,pay,msg){state.miniStats[kind]=(state.miniStats[kind]||0)+1;finishWork(kind,pay,msg)}
function startPriceGame(){if(activeJob)return toast('Finish your current shift first.');activeJob='price';workState={kind:'price',round:0,score:0};openWork('🏷️ PRICE & LABEL SHIFT','The morning price file changed. Match each product to the correct shelf ticket before customers arrive.');nextPriceRound()}
function nextPriceRound(){let w=workState;if(!w)return;if(w.round>=6)return finishPremium('price',5,'Price gun certified!');let items=[['Booster Pack',8],['Card Sleeves',4.5],['Deck Box',6],['Toploaders',5.5],['Binder',18],['Playmat',14]],it=items[Math.floor(Math.random()*items.length)],opts=[it[1],Math.max(.5,it[1]-2),it[1]+2,it[1]+4].sort(()=>Math.random()-.5);$('#workScore').textContent=`PRICE ${w.round+1}/6`;$('#workArea').innerHTML=`<div class="gamePad"><div style="width:100%;text-align:center"><div style="font-size:64px">🏷️</div><h2>${it[0]}</h2><div class="priceChoices">${opts.map(v=>`<button class="gameChoice" data-v="${v}">$${v.toFixed(2)}</button>`).join('')}</div></div></div>`;$$('.gameChoice').forEach(b=>b.onclick=()=>{if(+b.dataset.v===it[1]){w.round++;cardSound();nextPriceRound()}else{b.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:180});$('#workScore').textContent='Wrong price — check the shelf tag'}})}
function startSleeveGame(){if(activeJob)return toast('Finish your current shift first.');activeJob='sleeve';workState={kind:'sleeve',round:0,hits:0};openWork('🃏 SINGLES DESK','A customer paid for protective sleeving. Line each card up cleanly with the sleeve—no bent corners.');nextSleeve()}
function nextSleeve(){let w=workState;if(!w)return;if(w.round>=5)return finishPremium('sleeve',7,'Five cards sleeved cleanly!');$('#workScore').textContent=`CARD ${w.round+1}/5`;$('#workArea').innerHTML=`<div class="gamePad"><div style="width:100%"><div class="sleeveLane"><div class="sleeveTarget"></div><div class="movingCard" id="movingCard"></div></div><button class="btn primary" id="sleeveTap" style="width:100%;margin-top:12px">SLEEVE!</button></div></div>`;$('#sleeveTap').onclick=()=>{let lane=$('.sleeveLane').getBoundingClientRect(),c=$('#movingCard').getBoundingClientRect(),center=c.top+c.height/2,target=lane.top+lane.height/2;if(Math.abs(center-target)<62){w.round++;holoSound();nextSleeve()}else{$('#workScore').textContent='Missed the sleeve — time it closer';if(navigator.vibrate)navigator.vibrate([20,20,20])}}}
function startMemoryGame(){if(activeJob)return toast('Finish your current shift first.');activeJob='memory';let icons=['⚡','🔥','💧','🌿','🌙','💎'];let seq=Array.from({length:4},()=>icons[Math.floor(Math.random()*icons.length)]);workState={kind:'memory',round:0,seq,input:[]};openWork('🧠 CLICK & COLLECT','A customer reads out a four-pack order at the counter. Memorise it, then pick the exact products from the shelf.');$('#workScore').textContent='MEMORISE';$('#workArea').innerHTML=`<div class="gamePad"><div style="font-size:48px;letter-spacing:15px">${seq.join('')}</div></div>`;setTimeout(()=>{if(workState?.kind==='memory')memoryInput()},2200)}
function memoryInput(){let w=workState,icons=['⚡','🔥','💧','🌿','🌙','💎'];$('#workScore').textContent=`REBUILD ORDER • ${w.input.length}/4`;$('#workArea').innerHTML=`<div class="gamePad"><div style="width:100%"><div style="min-height:70px;text-align:center;font-size:40px">${w.input.join(' ')||'?'}</div><div class="memoryChoices">${icons.map(x=>`<button class="gameChoice" data-i="${x}">${x}</button>`).join('')}</div></div></div>`;$$('.gameChoice').forEach(b=>b.onclick=()=>{let x=b.dataset.i,ix=w.input.length;if(x!==w.seq[ix]){w.input=[];$('#workScore').textContent='Order reset — wrong pack';if(navigator.vibrate)navigator.vibrate([20,25,20]);setTimeout(memoryInput,350);return}w.input.push(x);cardSound();if(w.input.length===4)return finishPremium('memory',6.5,'Perfect order memory!');memoryInput()})}
const deliveryStock=[['BOOSTER CASE','🎴','BOOSTERS'],['ETB CARTON','📦','BOOSTERS'],['SLEEVE CASE','🛡️','ACCESSORIES'],['TOPLOADER BOX','🪪','ACCESSORIES'],['BINDER CARTON','📘','BINDERS'],['PORTFOLIO CASE','🗂️','BINDERS']];
function startDeliveryGame(){if(activeJob)return toast('Finish your current shift first.');activeJob='delivery';workState={kind:'delivery',sorted:0,miss:0,combo:0,target:null,done:false};openWork('🚚 RECEIVING & SORTATION','Clock into the warehouse receiving line. Read each carton while it moves, then route it to BOOSTERS, ACCESSORIES or BINDERS before it clears the scanner.');deliveryRound()}
function deliveryRound(){let w=workState;if(!w)return;if(w.sorted>=10)return finishPremium('delivery',7,'Receiving line cleared — manifest complete!');let item=deliveryStock[Math.floor(Math.random()*deliveryStock.length)];w.target=item[2];w.done=false;$('#workScore').textContent=`RECEIVING LINE • ${w.sorted}/10 SORTED • ${w.miss} ERRORS`;$('#workArea').innerHTML=`<div class="shiftHud"><div class="shiftMeter"><i style="width:${w.sorted*10}%"></i></div><b>$14.00 SHIFT</b></div><div class="gamePad"><div class="deliveryTrack" id="deliveryTrack"><div class="warehouseTop"><span>RECEIVING 03 • CONVEYOR ONLINE</span><span class="dockLight"></span></div><div class="deliveryPrompt">READ CARTON → <strong>ROUTE TO CHUTE</strong></div><div class="deliveryCombo">COMBO ×${Math.max(1,w.combo)}</div><div class="belt"></div><div class="scannerBeam"></div><button class="deliveryBox" id="movingCarton"><b>${item[1]} ${item[0]}</b><small>TCG DISTRIBUTION • SCAN</small></button><div class="sortConsole"><button class="chuteBtn" data-chute="BOOSTERS"><span>🎴</span>BOOSTERS</button><button class="chuteBtn" data-chute="ACCESSORIES"><span>🛡️</span>ACCESSORIES</button><button class="chuteBtn" data-chute="BINDERS"><span>📘</span>BINDERS</button></div></div></div><div class="paySlip">Clocked in • Receiving Assistant • Route 10 cartons accurately</div>`;let box=$('#movingCarton');let finish=(ok,btn)=>{if(w.done)return;w.done=true;box.style.animationPlayState='paused';if(ok){w.sorted++;w.combo++;btn?.classList.add('correct');cardSound();if(navigator.vibrate)navigator.vibrate(9);box.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(55px) scale(.72)',opacity:.15}],{duration:260,easing:'ease-in'});setTimeout(deliveryRound,300)}else{w.miss++;w.combo=0;if(navigator.vibrate)navigator.vibrate([18,25,18]);$('#workScore').textContent=`SORT ERROR • ${item[0]} belongs in ${w.target}`;box.animate([{transform:'translateX(-5px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:220});setTimeout(deliveryRound,650)}};$$('.chuteBtn').forEach(b=>b.onclick=()=>finish(b.dataset.chute===w.target,b));box.addEventListener('animationend',()=>{if(w.done)return;w.done=true;w.miss++;w.combo=0;$('#workScore').textContent=`MISSED SCAN • ${item[0]} passed the station`;if(navigator.vibrate)navigator.vibrate(25);setTimeout(deliveryRound,600)})}
$('#counter84').onclick=startCounter84;$('#lots84').onclick=startLots84;$('#flip84').onclick=startFlip84;$('#show84').onclick=startShow84;$('#binderBuy84').onclick=startBinderBuy84;$('#shopShift84').onclick=startShopShift84;$('#delivery84').onclick=startDelivery84;$('#break84').onclick=startBreak84;
$('#priceJob').onclick=startPriceGame;$('#sleeveJob').onclick=startSleeveGame;$('#memoryJob').onclick=startMemoryGame;$('#deliveryJob').onclick=startDeliveryGame;
$('#openPullRates').onclick=showPullRates;$('#ratesClose').onclick=()=>$('#ratesModal').classList.remove('show');$('#ratesModal').onclick=e=>{if(e.target.id==='ratesModal')$('#ratesModal').classList.remove('show')};
$$('.nav button').forEach(b=>b.onclick=()=>{$$('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.s).classList.add('active');if(b.dataset.s==='binder')renderBinder();if(b.dataset.s==='earn')updateEarn();if(b.dataset.s==='history')renderHist();if(b.dataset.s==='profile')renderProfile()});
SETS.forEach(s=>$('#setFilter').insertAdjacentHTML('beforeend',`<option value="${s.name}">${s.name}</option>`));
if(!setUnlocked(sel))sel=SETS.find(setUnlocked)||SETS[0];
migrateBinderImages();stats();updateProgressUI();
/* V38 reveal watchdog: never leave the player waiting on "Next card…" */
setInterval(()=>{
  try{
    const msg=document.querySelector('#cardMsg,#cardStatus,.cardMsg,.cardStatus');
    const txt=(msg?.textContent||'').trim().toLowerCase();
    const active=(typeof currentPack!=='undefined'&&currentPack)||(typeof packCards!=='undefined'&&packCards?.length);
    if(active && txt.includes('next card')){
      window.__nextCardWaitSince=window.__nextCardWaitSince||Date.now();
      if(Date.now()-window.__nextCardWaitSince>650){
        window.__nextCardWaitSince=Date.now();
        if(typeof showCard==='function') showCard();
        else if(typeof revealCard==='function') revealCard();
        else if(typeof nextCard==='function') nextCard();
      }
    }else window.__nextCardWaitSince=0;
  }catch(e){}
},180);


/* V43 modal safety: no overlay can permanently trap the game */
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')document.querySelectorAll('.modal.show,.setReqModal.show,.cardModal.show').forEach(x=>x.classList.remove('show'))
});
document.addEventListener('click',e=>{
 const m=e.target.closest('.modal.show,.setReqModal.show,.cardModal.show');
 if(m && e.target===m)m.classList.remove('show');
});

renderSets();resetPack();setTimeout(()=>buildPools(),120);window.addEventListener('tcg:critical-ready',()=>auditAllProgressionTargets(),{once:true});

// V22 — reliable Set Requirements modal closing
(function(){
  const modal=document.getElementById('setReqModal');
  const close=document.getElementById('reqClose');
  function closeSetRequirements(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    modal?.classList.remove('show');
  }
  if(close){
    close.style.position='relative'; close.style.zIndex='10005'; close.style.pointerEvents='auto'; close.style.touchAction='manipulation';
    close.addEventListener('click',closeSetRequirements);
    close.addEventListener('pointerup',closeSetRequirements);
    close.addEventListener('touchend',closeSetRequirements,{passive:false});
  }
  modal?.addEventListener('click',e=>{ if(e.target===modal) closeSetRequirements(e); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && modal?.classList.contains('show')) closeSetRequirements(e); });
})();

/* V45 grading phase 2 — isolated from pack/set/progression renderers */
state.gradingV44=state.gradingV44||{submissions:[]};state.gradingV44.graded=state.gradingV44.graded||[];state.gradingV44.openedForGrading=Number(state.gradingV44.openedForGrading||0);
/* V81 grading luck: 5% base chance of a Mint 9+ outcome, rising with misses;
   guaranteed 9+ on the 100th consecutive non-9+ grade. */
state.gradingV44.mintPityV81=Math.max(0,Number(state.gradingV44.mintPityV81||0));
function gradingLuckV81(){
 const misses=Math.max(0,Number(state.gradingV44.mintPityV81||0));
 const chance=Math.min(.20,.05+(misses*.0015)); // 5% base, +0.15 percentage points per miss, capped at 20%
 return {misses,chance,guaranteed:misses>=99};
}
function applyMintLuckV81(j){
 const luck=gradingLuckV81(),hit=luck.guaranteed||Math.random()<luck.chance;
 if(hit){
   /* Boost saved subgrades enough that the normal weakest-subgrade rule still produces 9–10. */
   const perfect=Math.random()<.08;
   if(perfect){
     j.condition={centering:100,corners:100,edges:100,surface:100};
   }else{
     const vals=[90,95,100];
     j.condition={
       centering:vals[Math.floor(Math.random()*vals.length)],
       corners:vals[Math.floor(Math.random()*vals.length)],
       edges:vals[Math.floor(Math.random()*vals.length)],
       surface:vals[Math.floor(Math.random()*vals.length)]
     };
     /* Never let a lucky outcome fall below 9.0. */
     for(const k of Object.keys(j.condition))j.condition[k]=Math.max(90,j.condition[k]);
   }
   state.gradingV44.mintPityV81=0;
   j.mintLuckV81=true;
 }else{
   state.gradingV44.mintPityV81=luck.misses+1;
 }
 return hit;
}

function gradeSeed(x){let h=2166136261;for(let i=0;i<x.length;i++){h^=x.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function makeCondition(card,uid){
 const seed=gradeSeed(`${card.id}|${uid}|${card.name}`);
 const r=n=>Math.round((72+(((seed+n*2654435761)>>>0)%281)/10)*10)/10;
 return {centering:r(1),corners:r(2),edges:r(3),surface:r(4)}
}

function finalGradeV48(c){
 const vals=Object.values(c).map(v=>v/10),avg=vals.reduce((a,b)=>a+b,0)/vals.length,min=Math.min(...vals);
 return Math.max(1,Math.min(10,Math.round(Math.min(avg,min+.5)*2)/2))
}
function gradeNameV48(g){return g>=10?'GEM MINT':g>=9?'MINT':g>=8?'NM-MT':g>=7?'NEAR MINT':g>=6?'EX-MT':'EX'}
function condWordV48(v){return v>=97?'Pristine':v>=93?'Excellent':v>=87?'Very Good':v>=80?'Good':'Fair'}
let returnRevealJobV53=null;
function returnFxV53(g){return g>=10?'fx-gem':g>=9?'fx-great':g>=8?'fx-good':'fx-common'}
function slabMarkupV53(j){
 return `<div class="gradeSlab"><div class="gradeSlabLabel"><span>VAULT GRADE<br>${j.name}<br>${j.cert||'VAULT CERTIFIED'}</span><strong class="gradeBig">${Number(j.grade).toFixed(1)}</strong></div><img src="${j.thumb||''}"></div>`;
}
function startReturnRevealV53(j){
 returnRevealJobV53=j;
 const st=document.getElementById('gradeReturnStageV53'),sl=document.getElementById('returnSlabBodyV53'),gt=document.getElementById('returnGradeTextV53');
 st.className='gradeReturnStage show '+returnFxV53(Number(j.grade));
 sl.innerHTML=slabMarkupV53(j);gt.innerHTML=`<strong>${Number(j.grade)===10?'💎 GEM MINT 10':Number(j.grade).toFixed(1)}</strong><span>${gradeNameV48(Number(j.grade))}</span>`;
 st.classList.remove('torn','launch','revealed');const p=document.getElementById('tearProgressV55');if(p)p.style.width='0';
}
function tearReturnV53(){
 const st=document.getElementById('gradeReturnStageV53');if(!st.classList.contains('show')||st.classList.contains('torn'))return;
 st.classList.add('torn');try{binderUnclipSound()}catch(e){}
 setTimeout(()=>{st.classList.add('launch');try{cardSound()}catch(e){}},320);
 setTimeout(()=>{st.classList.add('revealed');if(Number(returnRevealJobV53?.grade)>=10)try{holoSound()}catch(e){}},1450);
}
function finishReturnV53(){
 const j=returnRevealJobV53,st=document.getElementById('gradeReturnStageV53');st.classList.remove('show','torn','launch','revealed');if(j)showSlabV52(j);
}
function showSlabV52(j){
 if(!j)return;const c=j.condition||{};
 document.getElementById('gradeRevealBodyV48').innerHTML=`<div class="gradeSlab"><div class="gradeSlabLabel"><span>VAULT GRADE<br>${j.name}<br>${j.cert||'VAULT CERTIFIED'}</span><strong class="gradeBig">${Number(j.grade||0).toFixed(1)}</strong></div><img src="${j.thumb||''}"></div><h2>${Number(j.grade||0)===10?'💎 GEM MINT 10':gradeNameV48(Number(j.grade||0))+' '+Number(j.grade||0).toFixed(1)}</h2><div class="subgrades">${Object.entries(c).map(([k,v])=>`<div><b>${k[0].toUpperCase()+k.slice(1)}</b><span>${(v/10).toFixed(1)} • ${condWordV48(v)}</span></div>`).join('')}</div><div class="sub" style="text-align:center">Authenticated • ${j.cert||''}</div><div class="slabValue" style="text-align:center;font-size:13px">Raw $${Number(j.raw||.1).toFixed(2)} → Graded $${gradedValueV56(j).toFixed(2)}</div><div class="slabActionBar"><button class="btn" onclick="document.getElementById('gradeRevealV48').classList.remove('show')">KEEP IN VAULT</button><button class="btn sellSlabBtn" data-sell-slab="${j.uid}">SELL SLAB • $${gradedValueV56(j).toFixed(2)}</button></div>`;
 const copies=(state.gradingV44.graded||[]).filter(x=>x.id===j.id),avg=copies.length?(copies.reduce((n,x)=>n+Number(x.grade||0),0)/copies.length).toFixed(2):Number(j.grade||0).toFixed(2),hi=copies.length?Math.max(...copies.map(x=>Number(x.grade||0))).toFixed(1):Number(j.grade||0).toFixed(1);document.getElementById('gradeRevealBodyV48').insertAdjacentHTML('beforeend',`<div class="vaultStats" style="text-align:center">Your population: ${copies.length} • Average ${avg} • Highest ${hi}</div>`);document.getElementById('gradeRevealV48').classList.add('show');
}
function renderSlabVaultV52(){
 const el=document.getElementById('slabShelfV52'),ct=document.getElementById('slabVaultCountV52'),stats=document.getElementById('vaultStatsV56');if(!el||!ct)return;
 let a=(state.gradingV44.graded||[]).slice(),q=(document.getElementById('slabSearchV56')?.value||'').toLowerCase(),sort=document.getElementById('slabSortV56')?.value||'new';
 if(q)a=a.filter(j=>(j.name+' '+(j.set||'')+' '+j.grade).toLowerCase().includes(q));
 if(sort==='grade')a.sort((x,y)=>y.grade-x.grade);else if(sort==='value')a.sort((x,y)=>gradedValueV56(y)-gradedValueV56(x));else if(sort==='name')a.sort((x,y)=>x.name.localeCompare(y.name));else a.reverse();
 const all=state.gradingV44.graded||[];ct.textContent=`${all.length} SLAB${all.length===1?'':'S'}`;
 if(stats){const avg=all.length?(all.reduce((n,j)=>n+Number(j.grade||0),0)/all.length).toFixed(2):'—',hi=all.length?Math.max(...all.map(j=>Number(j.grade||0))).toFixed(1):'—',val=all.reduce((n,j)=>n+gradedValueV56(j),0).toFixed(2);stats.innerHTML=`<div><small>AVERAGE</small><b>${avg}</b></div><div><small>HIGHEST</small><b>${hi}</b></div><div><small>VAULT VALUE</small><b>$${val}</b></div>`}
 el.innerHTML=a.length?a.map(j=>`<button type="button" class="miniSlab slabInspectV52 grade${Number(j.grade)>=10?10:Number(j.grade)>=9?9:Number(j.grade)>=8?8:7}" data-slab-uid="${j.uid}"><div class="miniSlabCase"><span class="miniGrade">${Number(j.grade||0).toFixed(1)}</span><img src="${j.thumb||''}"></div><div class="miniSlabLabel">${j.name}</div><div class="slabValue">$${gradedValueV56(j).toFixed(2)}</div></button>`).join(''):'<div class="sub" style="grid-column:1/-1">No matching slabs.</div>';
}
function revealGradeV48(uid){
 const i=state.gradingV44.submissions.findIndex(j=>j.uid===uid);if(i<0)return;
 const j=state.gradingV44.submissions[i],left=Math.max(0,Number(j.dueOpen||5)-(Number(state.gradingV44.openedForGrading||0)-Number(j.startOpen||0)));
 if(left>0){toast(`${left} pack${left===1?'':'s'} remaining.`);return}
 /* V51 migration: submissions created before V45 have no saved condition object. */
 if(!j.condition||typeof j.condition!=='object'){
   j.condition=makeCondition({id:j.id||j.name,name:j.name||'Card'},j.uid||('LEGACY'+j.name));
 }
 const naturalGradeV81=finalGradeV48(j.condition);
 if(naturalGradeV81>=9){j.grade=naturalGradeV81;state.gradingV44.mintPityV81=0}
 else{applyMintLuckV81(j);j.grade=finalGradeV48(j.condition)}
 j.cert='VG-'+String(j.uid).slice(-8).toUpperCase();j.revealedAt=Date.now();
 state.gradingV44.submissions.splice(i,1);state.gradingV44.graded.push(j);save();checkGradeAchievementsV56(j);renderGradingV44();
 renderSlabVaultV52();startReturnRevealV53(j);
 try{binderUnclipSound()}catch(e){};if(j.grade===10)try{holoSound()}catch(e){}
}
function migrateLegacyGradesV51(){
 let changed=false;
 for(const j of (state.gradingV44.submissions||[])){
   if(!j.condition||typeof j.condition!=='object'){
     j.condition=makeCondition({id:j.id||j.name,name:j.name||'Card'},j.uid||('LEGACY'+j.name));changed=true;
   }
 }
 if(changed)save();
}
migrateLegacyGradesV51();
function renderGradingV44(){
 const rows=document.getElementById('gradeRows'),count=document.getElementById('gradingCount');
 if(!rows||!count)return;
 const a=state.gradingV44.submissions||[];
 for(const j of a){if(!j.v47){j.startOpen=Number(state.gradingV44.openedForGrading||0);j.dueOpen=5;j.v47=true}}
 count.textContent=`${a.length} AWAY`;
 rows.innerHTML=a.length?a.map(j=>{
   const left=Math.max(0,Number(j.dueOpen||5)-(Number(state.gradingV44.openedForGrading||0)-Number(j.startOpen||0))),ready=left===0,total=Math.max(1,Number(j.dueOpen||5)),done=Math.max(0,total-left),pct=Math.max(4,Math.min(100,done/total*100)),stage=stageV56(j,left);
   return `<div class="gradeRow"><img src="${j.thumb||''}"><div class="gradeJourneyInfoV147"><b>${j.name}</b><small>${j.set||''} • ${stage}</small><div class="gradeJourneyV147"><i style="width:${pct}%"></i></div><em>${ready?'Return ready':left+' pack'+(left===1?'':'s')+' remaining'}</em></div>${ready?`<button type="button" class="gradeStatus ready gradeRevealBtn" data-grade-uid="${j.uid}">REVEAL</button>`:`<span class="gradeStatus">${stage}</span>`}</div>`
 }).join(''):'<div class="gradeEmptyV147"><b>No cards away</b><span>Inspect a Binder card and send it to grading.</span></div>';

}
const GRADE_TIERS_V56={standard:{name:'Standard',fee:12,packs:5},priority:{name:'Priority',fee:25,packs:3},express:{name:'Express',fee:45,packs:1}};
state.gradingV44.tierV56=state.gradingV44.tierV56||'standard';state.gradingV44.achV56=state.gradingV44.achV56||{};
function gradedValueV56(j){const raw=Math.max(.1,Number(j.raw||.1)),g=Number(j.grade||0);const mult=g>=10?4.8:g>=9.5?3.2:g>=9?2.25:g>=8.5?1.65:g>=8?1.3:g>=7?1.05:.85;return Math.round(raw*mult*100)/100}
function stageV56(j,left){const total=Number(j.dueOpen||5),done=Math.max(0,total-left),p=total?done/total:1;return p>=1?'RETURN READY':p>=.8?'RETURNING':p>=.65?'SLABBING':p>=.45?'GRADING':p>=.25?'AUTHENTICATING':p>0?'RECEIVED':'SUBMITTED'}
function achV56(key,label){if(state.gradingV44.achV56[key])return;state.gradingV44.achV56[key]=1;save();const e=document.getElementById('achievementToastV56');if(e){e.textContent='🏆 '+label;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2400)}}
function checkGradeAchievementsV56(j){const a=state.gradingV44.graded||[];if(a.length>=1)achV56('first','FIRST SLAB');if(Number(j.grade)>=9)achV56('mint','MINT CONDITION');if(Number(j.grade)>=10)achV56('ten','PERFECT 10');if(a.length>=25)achV56('king','SLAB KING');if(a.filter(x=>Number(x.grade)>=10).length>=10)achV56('legend','VAULT LEGEND')}
function submitBinderCardV44(){
 const key=typeof selectedBinderCard!=='undefined'?selectedBinderCard:null;
 const c=key!=null&&state.binder?state.binder[key]:null;
 if(!c||Number(c.qty||0)<1){toast('Select a binder card first.');return}
 const tier=GRADE_TIERS_V56[state.gradingV44.tierV56]||GRADE_TIERS_V56.standard;if(Number(state.coins||0)<tier.fee){toast(`You need $${tier.fee} for ${tier.name} grading.`);return}
 const uid='SUB'+Date.now()+Math.random().toString(16).slice(2,7);
 const condition=conditionForGradingV161(c,uid),img=c.thumb||c.img||'';
 state.coins=Math.round((Number(state.coins||0)-tier.fee)*100)/100;
 state.gradingV44.submissions.push({
   uid,id:c.id,name:c.name,set:c.set||'',setId:c.setId||masterResolveSetV62(c,c.id)||'',thumb:img,raw:Number(c.market||.1),
   startOpen:Number(state.gradingV44.openedForGrading||0),dueOpen:tier.packs,tier:tier.name,v47:true,
   condition,historyV161:[...(c.historyV161||[]),{time:Date.now(),label:'Submitted for grading'}],phase:'grading'
 });
 c.qty=Number(c.qty||1)-1;if(c.qty<=0)delete state.binder[key];
 save();stats();
 try{closeBinderCard()}catch(e){}
 try{renderBinder(true)}catch(e){}
 renderGradingV44();
 toast(`${c.name} submitted • $${tier.fee} • ready after ${tier.packs} pack${tier.packs===1?'':'s'}.`);
}
document.getElementById('gradeOne').addEventListener('click',submitBinderCardV44);
renderGradingV44();renderSlabVaultV52();





{
 const close=document.getElementById('closeGradeV48'),modal=document.getElementById('gradeRevealV48');
 if(close&&modal){
   close.onclick=()=>modal.classList.remove('show');
   modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};
 }
}

/* V49: delegated listener works for dynamically rendered READY buttons and avoids inline onclick. */
document.addEventListener('click',e=>{
 const b=e.target.closest('.gradeRevealBtn');
 if(!b)return;
 e.preventDefault();e.stopPropagation();
 revealGradeV48(b.dataset.gradeUid);
});
document.addEventListener('click',e=>{const b=e.target.closest('.slabInspectV52');if(!b)return;e.preventDefault();e.stopPropagation();showSlabV52((state.gradingV44.graded||[]).find(x=>x.uid===b.dataset.slabUid));});

{
 const st=document.getElementById('gradeReturnStageV53'),tear=document.getElementById('returnTearV53'),skip=document.getElementById('returnSkipV53'),prog=document.getElementById('tearProgressV55'),blade=document.getElementById('tearBladeV55');
 let sx=null,pid=null,cut=false;
 const move=e=>{
   if(pid!==e.pointerId||sx===null||cut)return;
   const r=tear.getBoundingClientRect(),x=Math.max(0,Math.min(r.width,e.clientX-r.left)),pct=x/r.width*100;
   prog.style.width=pct+'%';blade.style.left=x+'px';
   if(pct>=88){cut=true;tear.releasePointerCapture?.(pid);tearReturnV53();if(navigator.vibrate)navigator.vibrate([18,25,35])}
 };
 tear.addEventListener('pointerdown',e=>{if(st.classList.contains('torn'))return;pid=e.pointerId;sx=e.clientX;cut=false;tear.classList.add('dragging');tear.setPointerCapture?.(pid);prog.style.width='3%';blade.style.left='3%'});
 tear.addEventListener('pointermove',move);
 tear.addEventListener('pointerup',e=>{if(!cut){prog.style.width='0';blade.style.left='8px'}tear.classList.remove('dragging');sx=null;pid=null});
 tear.addEventListener('pointercancel',()=>{tear.classList.remove('dragging');prog.style.width='0';sx=null;pid=null});
 skip.addEventListener('click',e=>{e.stopPropagation();finishReturnV53()});
 st.addEventListener('click',e=>{if(st.classList.contains('revealed')&&!e.target.closest('.returnSkip'))finishReturnV53()});
}

document.addEventListener('click',e=>{
 const t=e.target.closest('.gradeTier');if(t){state.gradingV44.tierV56=t.dataset.tier;document.querySelectorAll('.gradeTier').forEach(x=>x.classList.toggle('active',x===t));save();return}
 const b=e.target.closest('[data-sell-slab]');if(b){const uid=b.dataset.sellSlab,i=(state.gradingV44.graded||[]).findIndex(x=>x.uid===uid);if(i<0)return;const j=state.gradingV44.graded[i],v=gradedValueV56(j);state.gradingV44.graded.splice(i,1);state.coins=Math.round((Number(state.coins||0)+v)*100)/100;save();document.getElementById('gradeRevealV48').classList.remove('show');renderSlabVaultV52();stats();toast(`Sold graded ${j.name} for $${v.toFixed(2)}`)}
});
['slabSearchV56','slabSortV56'].forEach(id=>document.getElementById(id)?.addEventListener(id.includes('Search')?'input':'change',renderSlabVaultV52));
document.querySelectorAll('.gradeTier').forEach(x=>x.classList.toggle('active',x.dataset.tier===state.gradingV44.tierV56));

/* V57 Master Sets + Marketplace + Huge Chase */
state.masterV57=state.masterV57||{claimed:{}};state.masterV57.seen=state.masterV57.seen||{};
function masterResolveSetV62(c,id){
 let sid=c?.setId||c?.card?.setId||'';
 const setName=c?.set||c?.card?.set||'';
 if(!sid&&setName){const st=SETS.find(x=>x.name===setName);sid=st?.id||''}
 const cid=id||c?.id||c?.card?.id||'';
 if(!sid&&cid){const st=SETS.find(x=>cid===x.id||cid.startsWith(x.id+'-'));sid=st?.id||''}
 return sid
}
function addMasterSeenV62(c,fallbackId){
 if(!c)return false;
 const card=c.card&&typeof c.card==='object'?{...c.card,...c}:c;
 const id=card.id||fallbackId;if(!id)return false;
 const sid=masterResolveSetV62(card,id);
 const setName=card.set||SETS.find(x=>x.id===sid)?.name||'';
 const prev=state.masterV57.seen[id];
 if(!prev||(!prev.setId&&sid)){state.masterV57.seen[id]={id,setId:sid,set:setName};return true}
 return false
}
function migrateExistingBinderToMasterV60(){
 /* V78: storage is authoritative. Never auto-evict a card the player manually moved to Binder.
    New pulls still route automatically through isBulkCardV64(), but manual organization persists. */
 return false;
}migrateExistingBinderToMasterV60();
state.marketV57=state.marketV57||{listings:[],sold:0};state.marketV57.listings=state.marketV57.listings||[];state.marketV57.sales=state.marketV57.sales||[];state.marketV57.sold=Number(state.marketV57.sold||0);
let marketPickV57=null,chasePickV57=null;

function allOwnedV57(){return Object.values(state.binder||{}).filter(c=>c&&Number(c.qty||0)>0)}
function setTotalsV57(){
 const m={};state.masterTotalsV66=state.masterTotalsV66||{};state.masterTotalsV195=state.masterTotalsV195||{};
 for(const set of SETS){
   const d=cache?.[set.id],base=d?.base;
   /* V195: prefer the complete main+subset catalog total once verified. Otherwise use the full loaded checklist,
      not cardCount.official (which can exclude secret cards). */
   const total=Number(state.masterTotalsV195[set.id]||base?.cards?.length||d?.cards?.length||state.masterTotalsV66[set.id]||0);
   m[set.id]={name:set.name,total,owned:new Set()};
 }
 const add=(c,key='')=>{if(!c)return;const id=c.id||key;if(!id)return;const sid=masterResolveSetV62(c,id);if(sid&&m[sid])m[sid].owned.add(id)};
 const ownBox=(box)=>{for(const [key,c] of Object.entries(box||{})){if(!c||Number(c.qty||0)<=0)continue;add(c,key)}};
 ownBox(state.binder);ownBox(state.bulkV64);for(const c of state.hubEscrowV256||[])add(c);
 /* A card is still part of the collection while away at grading, slabbed, or listed for sale. Progress drops only after sale/trade/removal. */
 for(const c of (state.gradingV44?.submissions||[]))add(c);
 for(const c of (state.gradingV44?.graded||[]))add(c);
 for(const l of (state.marketV57?.listings||[])){if(l?.kind==='slab'&&l.slab)add(l.slab);else add(l?.card||l)}
 return m;
}
function masterProgressV58(set){const x=setTotalsV57()[set.id],n=x?.owned.size||0;if(!x||!x.total)return {n,total:0,p:n?2:0};return {n,total:x.total,p:Math.min(100,n/x.total*100)}}
function renderMasterV57(){
 const el=document.getElementById('masterGridV57');if(!el)return;const m=setTotalsV57();
 const rows=Object.entries(m).map(([id,x])=>{const n=x.owned.size,p=x.total?Math.min(100,n/x.total*100):0;[25,50,75,100].forEach(k=>{const key=id+'-'+k;if(p>=k&&!state.masterV57.claimed[key]){state.masterV57.claimed[key]=1;try{badge(`MASTER ${k}% • ${x.name}`)}catch(e){};try{toast(`📚 ${x.name} ${k}% complete — reward unlocked!`)}catch(e){}}});return `<div class="masterTile"><b>${x.name}</b><small>${n}/${x.total} • ${p.toFixed(1)}%</small><div class="masterProg"><i style="width:${p}%"></i></div><div class="masterMilestones">25% ◆ 50% ◆ 75% ◆ 100%</div></div>`}).sort((a,b)=>a.localeCompare(b));
 el.innerHTML=rows.length?rows.join(''):'<div class="sub">Open sets to build their checklists.</div>';save();
}
function marketScoreV57(l){
 const ratio=Number(l.ask)/Math.max(.1,Number(l.market||.1));return ratio<=.75?.72:ratio<=.9?.48:ratio<=1?.30:ratio<=1.15?.14:ratio<=1.35?.055:.012;
}
function marketTickV57(){
 if(document.documentElement.classList.contains('hub-transaction-pending'))return;
 const a=state.marketV57.listings||[];if(!a.length)return;
 for(let i=a.length-1;i>=0;i--){
  const l=a[i];l.age=(l.age||0)+1;
  if(Math.random()<marketScoreV57(l)){
   a.splice(i,1);state.marketV57.sold++;money(Number(l.ask));
   state.marketV57.sales.unshift({uid:'S'+Date.now()+Math.random(),id:l.id,name:l.name,set:l.set||'',thumb:l.thumb||'',market:Number(l.market||0),soldFor:Number(l.ask||0),when:Date.now(),cycles:Number(l.age||0),kind:l.kind||'card',grade:Number(l.grade||0),cert:l.cert||''});
   state.marketV57.sales=state.marketV57.sales.slice(0,100);
   const t=document.getElementById('marketSoldToastV57');if(t){t.textContent=`💰 ${l.kind==='slab'?'GRADED CARD':'CARD'} SOLD — ${l.name} • $${Number(l.ask).toFixed(2)}`;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}
  }
 }
 save();renderMarketV57();renderMarketHistoryV72();renderSets();try{renderSlabVaultV52()}catch(e){};try{renderMasterV57()}catch(e){}
}
function renderMarketV57(){
 const el=document.getElementById('marketListV57');if(!el)return;const a=state.marketV57.listings||[];
 el.innerHTML=(a.length?a.map(l=>{const slab=l.kind==='slab';return `<div class="marketRow ${slab?'marketSlabRowV157':''}"><span class="marketRowArtV157 ${slab?'slabV157':''}"><img src="${l.thumb||''}">${slab?`<i>${Number(l.grade||0).toFixed(1)}</i>`:''}</span><div><b>${l.name}${slab?` <em>GRADED ${Number(l.grade||0).toFixed(1)}</em>`:''}</b><small>${slab?'Graded value':'Market'} $${Number(l.market||0).toFixed(2)} • Ask $${Number(l.ask).toFixed(2)} • ${l.age||0} cycles</small></div><button class="btn" data-cancel-list="${l.uid}">CANCEL</button></div>`}).join(''):'<div class="sub">No active listings.</div>');
}
function renderMarketHistoryV72(){
 const el=document.getElementById('marketHistoryV72');if(!el)return;const a=state.marketV57.sales||[],total=a.reduce((n,x)=>n+Number(x.soldFor||0),0),tot=document.getElementById('marketHistoryTotalV72');if(tot)tot.textContent=`$${total.toFixed(2)} earned`;
 el.innerHTML=a.length?a.map(x=>{const slab=x.kind==='slab';return `<div class="marketRow marketSaleRowV72 ${slab?'marketSlabRowV157':''}"><span class="marketRowArtV157 ${slab?'slabV157':''}"><img src="${x.thumb||''}">${slab?`<i>${Number(x.grade||0).toFixed(1)}</i>`:''}</span><div><b>${x.name}${slab?` <em>GRADED ${Number(x.grade||0).toFixed(1)}</em>`:''}</b><small>Sold $${Number(x.soldFor||0).toFixed(2)} • ${x.set||'Unknown set'} • ${new Date(x.when||Date.now()).toLocaleDateString()}</small></div><strong>+$${Number(x.soldFor||0).toFixed(2)}</strong></div>`}).join(''):'<div class="sub">No completed marketplace sales yet.</div>';
}
function openMarketPickerV57(card){
 const raw=(card?[card]:allOwnedV57()).map(c=>({sourceType:'binder',key:'binder:'+c.id,sourceRef:c,id:c.id,name:c.name,set:c.set||'',thumb:c.thumb||c.img||'',rarity:c.rarity||'',qty:Number(c.qty||1),market:Number(c.market||.1)}));
 const slabs=card?[]:(state.gradingV44?.graded||[]).map(j=>({sourceType:'slab',key:'slab:'+j.uid,sourceRef:j,uid:j.uid,id:j.id,name:j.name,set:j.set||'',thumb:j.thumb||j.img||'',rarity:`Graded ${Number(j.grade||0).toFixed(1)}`,grade:Number(j.grade||0),cert:j.cert||'',qty:1,market:gradedValueV56(j)}));
 if(!raw.length&&!slabs.length){toast('No Binder cards or graded slabs available to list.');return}
 let source=card?'binder':(raw.length?'binder':'slab');marketPickV57=card?raw[0]:(source==='binder'?raw[0]:slabs[0]);const p=document.getElementById('marketPickV57');
 const renderPicker=(filter='')=>{const pool=source==='slab'?slabs:raw,q=String(filter||'').trim().toLowerCase(),shown=pool.filter(c=>!q||`${c.name||''} ${c.set||''} ${c.rarity||''} ${c.grade||''}`.toLowerCase().includes(q));
  p.innerHTML=`${card?'':`<div class="marketSourceTabsV157"><button type="button" data-market-source-v157="binder" class="${source==='binder'?'active':''}">BINDER <span>${raw.length}</span></button><button type="button" data-market-source-v157="slab" class="${source==='slab'?'active':''}">GRADED <span>${slabs.length}</span></button></div><div class="marketPickerSearchWrapV156"><span>⌕</span><input id="marketPickerSearchV156" type="search" autocomplete="off" placeholder="${source==='slab'?'Search graded cards':'Search your Binder'}" value="${String(filter||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></div>`}<div class="marketVisualPickerV156 ${card?'singleV156':''}">${shown.length?shown.map(c=>{const idx=pool.indexOf(c),active=marketPickV57?.key===c.key,img=c.thumb||'';return `<button type="button" class="marketVisualCardV156 ${c.sourceType==='slab'?'marketVisualSlabV157 ':''}${active?'active':''}" data-market-card-index-v157="${idx}"><span class="marketVisualArtV156 ${c.sourceType==='slab'?'slabArtV157':''}"><img src="${img}" alt="">${c.sourceType==='slab'?`<b class="marketGradeBadgeV157">${Number(c.grade||0).toFixed(1)}</b>`:`<i>${c.qty>1?`×${c.qty}`:''}</i>`}</span><span class="marketVisualInfoV156"><b>${c.name||'Card'}</b><small>${c.sourceType==='slab'?`GRADED ${Number(c.grade||0).toFixed(1)}${c.cert?' • '+c.cert:''}`:(c.rarity||c.set||'Binder card')}</small><strong>$${Number(c.market||.1).toFixed(2)}</strong></span></button>`}).join(''):`<div class="marketPickerEmptyV156">${source==='slab'?'No graded slabs available.':'No Binder cards match that search.'}</div>`}</div>`;
  p.querySelectorAll('[data-market-source-v157]').forEach(btn=>btn.onclick=()=>{source=btn.dataset.marketSourceV157;const next=source==='slab'?slabs[0]:raw[0];if(next)marketPickV57=next;renderPicker('');if(next){document.getElementById('marketPriceV57').value=Number(next.market||.1).toFixed(2);document.getElementById('marketCreateV57').textContent=next.sourceType==='slab'?'LIST GRADED CARD':'LIST CARD'}});
  p.querySelectorAll('[data-market-card-index-v157]').forEach(btn=>btn.onclick=()=>{const c=pool[Number(btn.dataset.marketCardIndexV157)];if(!c)return;marketPickV57=c;p.querySelectorAll('.marketVisualCardV156').forEach(x=>x.classList.toggle('active',x===btn));document.getElementById('marketPriceV57').value=Number(c.market||.1).toFixed(2);document.getElementById('marketCreateV57').textContent=c.sourceType==='slab'?'LIST GRADED CARD':'LIST CARD';try{navigator.vibrate?.(7)}catch(e){}});
  const search=document.getElementById('marketPickerSearchV156');if(search)search.oninput=e=>renderPicker(e.target.value);
 };
 renderPicker('');document.getElementById('marketPriceV57').value=Number(marketPickV57.market||.1).toFixed(2);document.getElementById('marketCreateV57').textContent=marketPickV57.sourceType==='slab'?'LIST GRADED CARD':'LIST CARD';document.getElementById('marketModalV57').classList.add('show');
}
function createListingV57(){
 const c=marketPickV57,ask=Math.max(.1,Number(document.getElementById('marketPriceV57').value||0));if(!c)return;
 if(c.sourceType==='slab'){
  const i=(state.gradingV44?.graded||[]).findIndex(j=>j.uid===c.uid);if(i<0){toast('That graded card is no longer in your Vault.');return}
  const j=state.gradingV44.graded.splice(i,1)[0],market=gradedValueV56(j);state.marketV57.listings.push({uid:'L'+Date.now()+Math.random(),kind:'slab',id:j.id,name:j.name,set:j.set||'',thumb:j.thumb||j.img||'',market:Number(market||.1),ask,age:0,grade:Number(j.grade||0),cert:j.cert||'',slab:j});save();document.getElementById('marketModalV57').classList.remove('show');renderMarketV57();renderSlabVaultV52();toast(`Listed graded ${j.name} ${Number(j.grade||0).toFixed(1)} for $${ask.toFixed(2)}`);return
 }
 const raw=c.sourceRef||c;if(!(state.binder?.[raw.id]&&Number(state.binder[raw.id].qty||0)>0)){toast('That card is no longer in your binder.');return}
 state.binder[raw.id].qty--;if(state.binder[raw.id].qty<=0)delete state.binder[raw.id];state.marketV57.listings.push({uid:'L'+Date.now()+Math.random(),kind:'card',id:raw.id,name:raw.name,set:raw.set||'',thumb:raw.thumb||raw.img||'',market:Number(raw.market||.1),ask,age:0,card:raw});save();document.getElementById('marketModalV57').classList.remove('show');renderMarketV57();renderBinder();renderSets();try{renderMasterV57()}catch(e){};toast(`Listed ${raw.name} for $${ask.toFixed(2)} • Master Sets recalculated`);
}
function hugeHitV57(c,isGod=false){
 if(!c)return false;const v=Number(c.market||0),rar=String(c.rarity||'').toLowerCase(),huge=isGod||v>=35||/secret|illustration rare|hyper rare|special art|rainbow|gold/.test(rar);if(!huge)return false;
 chasePickV57=c;const st=document.getElementById('chaseStageV57');st.className='chaseStageV57 show'+(isGod?' godV57':'');document.getElementById('chaseImgV57').src=c.img||c.thumb||'';document.getElementById('chaseNameV57').textContent=c.name;document.getElementById('chaseValueV57').textContent='$0.00';
 requestAnimationFrame(()=>st.classList.add('rise'));setTimeout(()=>{st.classList.add('reveal');let n=0,target=v,start=performance.now();const f=t=>{n=Math.min(target,target*(t-start)/900);document.getElementById('chaseValueV57').textContent='$'+n.toFixed(2);if(n<target)requestAnimationFrame(f)};requestAnimationFrame(f);try{holoSound()}catch(e){}},1750);return true;
}
function closeChaseV57(){document.getElementById('chaseStageV57').className='chaseStageV57';chasePickV57=null}
document.addEventListener('click',e=>{
 
 if(e.target.id==='marketCloseV57')document.getElementById('marketModalV57').classList.remove('show');
 if(e.target.id==='marketCreateV57')createListingV57();
 const c=e.target.closest('[data-cancel-list]');if(c){const i=state.marketV57.listings.findIndex(x=>x.uid===c.dataset.cancelList);if(i>=0){const l=state.marketV57.listings.splice(i,1)[0];if(l.kind==='slab'&&l.slab){state.gradingV44=state.gradingV44||{submissions:[],graded:[]};state.gradingV44.graded=state.gradingV44.graded||[];if(!state.gradingV44.graded.some(j=>j.uid===l.slab.uid))state.gradingV44.graded.push(l.slab);try{renderSlabVaultV52()}catch(e){}}else{if(state.binder[l.id])state.binder[l.id].qty=(state.binder[l.id].qty||0)+1;else state.binder[l.id]={...(l.card||{}),id:l.id,name:l.name,set:l.set,thumb:l.thumb,market:l.market,qty:1};}save();renderMarketV57();renderBinder();renderSets();try{renderMasterV57()}catch(e){}}}
 const a=e.target.closest('[data-chase-act]');if(a&&chasePickV57){const act=a.dataset.chaseAct,c=chasePickV57;closeChaseV57();if(act==='market')openMarketPickerV57(c);else if(act==='grade'){toast('Open the card in Binder to submit it to grading.')}else toast(`${c.name} kept in Binder.`)}
});
document.getElementById('chaseSkipV57').onclick=closeChaseV57;
setInterval(marketTickV57,45000);
setInterval(()=>{renderMasterV57();renderMarketV57()},5000);
renderMasterV57();renderMarketV57();renderMarketHistoryV72();

/* Non-invasive chase hook: watches the already-rendered current card; never delays normal reveal. */
let chaseSeenV57='';
setInterval(()=>{try{if(typeof pulls==='undefined'||!pulls?.length)return;const c=pulls[Math.max(0,Math.min(pulls.length-1,(typeof idx!=='undefined'?idx:0)))];if(!c||c.id===chaseSeenV57)return;chaseSeenV57=c.id;if((c.img||c.thumb)&&Number(c.market||0)>=35)setTimeout(()=>hugeHitV57(c,false),120)}catch(e){}},350);

function marketCandidatesV58(){
 const pool=[];Object.values(cache||{}).forEach(d=>(d?.cards||[]).forEach(c=>{if(tier(c)>=2)pool.push(c)}));
 const seen=new Set(),out=[];for(const c of pool.sort((a,b)=>tier(b)-tier(a)||Number(b.market||0)-Number(a.market||0))){if(!seen.has(c.id)){seen.add(c.id);out.push(c)}if(out.length>=8)break}return out;
}
function renderMarketBuyV58(){
 const el=document.getElementById('marketBuyV58');if(!el)return;const a=marketCandidatesV58();
 el.innerHTML=a.length?a.map(c=>{const ask=Math.max(.25,Math.round(Number(c.market||.1)*(1.08+((gradeSeed(c.id)%23)/100))*100)/100);return `<div class="marketHitV58"><img src="${c.thumb||c.img||''}"><b>${c.name}</b><small>${c.rarity||'Hit'} • $${ask.toFixed(2)}</small><button class="btn" data-buy-hit="${c.id}" data-buy-price="${ask}">BUY HIT</button></div>`}).join(''):'<div class="marketEmptyV58">Open/load some sets first — collector hit listings will appear here.</div>';
}
document.getElementById('listMarketV58')?.addEventListener('click',async()=>{
 const c=state.binder?.[selectedBinderCard];if(!c)return;await hydrateCard(c);closeBinderCard();openMarketPickerV57(c);
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-buy-hit]');if(!b)return;const id=b.dataset.buyHit,price=Number(b.dataset.buyPrice),c=marketCandidatesV58().find(x=>x.id===id);if(!c)return;
 if(Number(state.coins||0)<price){toast(`You need $${price.toFixed(2)}.`);return}
 state.coins=Math.round((Number(state.coins||0)-price)*100)/100;
 if(state.binder[id])state.binder[id].qty=(state.binder[id].qty||0)+1;else state.binder[id]={...c,qty:1,market:Number(c.market||.1)};
 state.masterV57.seen[id]={id,setId:c.setId||'',set:c.set||''};save();stats();renderBinder();renderSets();renderMarketBuyV58();toast(`Bought ${c.name} for $${price.toFixed(2)}`);
});
setInterval(renderMarketBuyV58,6000);renderMarketBuyV58();

/* V60 migration retry after asynchronous startup; idempotent. */
setTimeout(()=>{migrateExistingBinderToMasterV60();renderSets();},900);
setTimeout(()=>{migrateExistingBinderToMasterV60();renderSets();},2600);

/* V62 keeps Master Set totals synchronized with binder + grading vault. */
setInterval(()=>{try{migrateExistingBinderToMasterV60()}catch(e){}},4000);

/* V63: hydrate every set database in small batches so Master Set totals are real,
   not dependent on whether the player has manually opened that set this session. */
let masterHydratingV63=false;
async function hydrateMasterSetsV63(){
 if(masterHydratingV63)return;masterHydratingV63=true;
 const ids=new Set(Object.values(state.binder||{}).filter(c=>c&&Number(c.qty||0)>0).map(c=>masterResolveSetV62(c,c.id)).filter(Boolean));
 ids.add(sel.id);
 for(const id of ids){
   const st=SETS.find(x=>x.id===id);if(!st)continue;
   try{if(!cache[id]?.base||cache[id].base.emergency)await getSet(st)}catch(e){}
 }
 masterHydratingV63=false;try{renderSets()}catch(e){};save();
}
setTimeout(hydrateMasterSetsV63,500);

/* Reconcile legacy graded records after databases have loaded. */
setTimeout(()=>{migrateExistingBinderToMasterV60();try{renderSets()}catch(e){}},3500);

/* V64 physical loose-card Bulk Tub */
let bulkInspectIdV64=null,bulkTiltX=0,bulkTiltY=0,bulkMotionOnV64=true,bulkDragV65=null,bulkSortV151='mixed';
function bulkCardsV64(){return Object.values(state.bulkV64||{}).filter(c=>c&&Number(c.qty||0)>0)}
function bulkSeedV64(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function renderBulkV64(){
 const tub=document.getElementById('bulkTubV64');if(!tub)return;let cards=bulkCardsV64(),copies=cards.reduce((n,c)=>n+Number(c.qty||0),0),totalValue=cards.reduce((n,c)=>n+sellPrice(c)*Number(c.qty||0),0);
 const stat=document.getElementById('bulkStatV64');if(stat)stat.textContent=copies?`${cards.length} unique • ${copies} loose cards`:'Nothing in bulk yet';
 const valueEl=document.getElementById('bulkValueStatV150');if(valueEl)valueEl.textContent=`$${totalValue.toFixed(2)}`;
 const cashEl=document.getElementById('bulkCashV151');if(cashEl)cashEl.textContent=`$${Number(state.coins||0).toFixed(2)}`;
 const hintEl=document.getElementById('bulkHintV150');if(hintEl)hintEl.textContent=copies?'Drag cards around • press and hold to inspect':'Rip a few packs and your loose cards will appear here';
 tub.innerHTML='';
 tub.classList.toggle('bulkEmptyV102',copies===0);tub.classList.toggle('bulkEmptyV150',copies===0);
 const sellBtnV102=document.getElementById('sellBulkTubV64');if(sellBtnV102){sellBtnV102.disabled=copies===0;sellBtnV102.textContent=copies?`Review bulk sale · ${copies} cards`:'Tub empty'}
 if(!cards.length){tub.innerHTML='<div class="bulkEmptySceneV150"><div class="bulkEmptyCopyV150"><b>BULK STORAGE EMPTY</b><span>Keep ripping and your commons, uncommons and extras will land here.</span></div></div>';return}
 if(bulkSortV151==='stacks')cards=cards.slice().sort((a,b)=>Number(b.qty||0)-Number(a.qty||0)||String(a.name).localeCompare(String(b.name)));
 else if(bulkSortV151==='value')cards=cards.slice().sort((a,b)=>(sellPrice(b)*Number(b.qty||0))-(sellPrice(a)*Number(a.qty||0)));
 else cards=cards.slice().sort((a,b)=>bulkSeedV64(a.id)-bulkSeedV64(b.id));
 const visual=cards.slice(0,48);
 visual.forEach((c,i)=>{const seed=bulkSeedV64(c.id),d=document.createElement('button');d.type='button';d.className='looseCard';d.dataset.bulkId=c.id;
   let x,y,rot;
   if(bulkSortV151==='mixed'){x=12+((seed%7200)/100);y=15+(((seed>>>8)%5000)/100);rot=-13+((seed>>>16)%2600)/100}
   else {const cols=4,row=Math.floor(i/cols),col=i%cols;x=17+col*22+(row%2?2:-1);y=24+row*24;rot=(bulkSortV151==='stacks'?(-5+(col%3)*4):(-2+(i%2)*4));}
   const depth=Math.max(0,Math.min(4,Number(c.qty||1)-1));d.dataset.x=x;d.dataset.y=y;d.dataset.rot=rot;d.dataset.dx=0;d.dataset.dy=0;d.style.left=x+'%';d.style.top=y+'%';d.style.zIndex=String(i+2);d.style.setProperty('--stackDepth',String(depth));const thumb=c.thumb||c.img||'';const qty=Number(c.qty||1);d.innerHTML=`<span class="bulkCardStackV150" aria-hidden="true"></span><img src="${thumb}" draggable="false"><span class="bulkCardQtyV150">${qty>1?`×${qty}`:''}</span>`;wireLooseCardV64(d,c.id);tub.appendChild(d)});
 applyBulkTiltV64();
}
function applyBulkTiltV64(){
 document.querySelectorAll('#bulkTubV64 .looseCard').forEach((d,i)=>{if(d.classList.contains('dragging'))return;const rot=Number(d.dataset.rot||0),depth=.20+(i%9)/14,dx=Number(d.dataset.dx||0)+bulkTiltX*depth,dy=Number(d.dataset.dy||0)+bulkTiltY*depth;d.style.transform=`translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${rot+bulkTiltX*.07}deg)`});
}
function repelCardsV65(active,cx,cy,vx,vy){
 document.querySelectorAll('#bulkTubV64 .looseCard').forEach((d,i)=>{if(d===active)return;const r=d.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,dx=x-cx,dy=y-cy,dist=Math.hypot(dx,dy);if(dist<125&&dist>1){const force=(125-dist)/125*15;d.dataset.dx=Math.max(-45,Math.min(45,Number(d.dataset.dx||0)+(dx/dist)*force+vx*.06));d.dataset.dy=Math.max(-45,Math.min(45,Number(d.dataset.dy||0)+(dy/dist)*force+vy*.06))}});
 applyBulkTiltV64();
}
function wireLooseCardV64(d,id){
 let timer=null,sx=0,sy=0,lx=0,ly=0,moved=false;
 d.addEventListener('pointerdown',e=>{e.preventDefault();sx=lx=e.clientX;sy=ly=e.clientY;moved=false;d.setPointerCapture?.(e.pointerId);d.classList.add('held');timer=setTimeout(()=>{if(!moved){timer=null;openBulkCardV64(id);if(navigator.vibrate)navigator.vibrate(20)}},420)});
 d.addEventListener('pointermove',e=>{if(!d.hasPointerCapture?.(e.pointerId))return;const mx=e.clientX-sx,my=e.clientY-sy,vx=e.clientX-lx,vy=e.clientY-ly;lx=e.clientX;ly=e.clientY;if(Math.hypot(mx,my)>9){moved=true;if(timer){clearTimeout(timer);timer=null}d.classList.remove('held');d.classList.add('dragging');d.dataset.dx=Math.max(-115,Math.min(115,mx));d.dataset.dy=Math.max(-150,Math.min(150,my));d.style.transform=`translate(-50%,-50%) translate(${d.dataset.dx}px,${d.dataset.dy}px) rotate(${Number(d.dataset.rot||0)+vx*.35}deg)`;repelCardsV65(d,e.clientX,e.clientY,vx,vy)}});
 const up=e=>{if(timer){clearTimeout(timer);timer=null}d.classList.remove('held','dragging');if(moved){const tub=document.getElementById('bulkTubV64').getBoundingClientRect(),r=d.getBoundingClientRect();let nx=Math.max(9,Math.min(89,((r.left+r.width*.5-tub.left)/tub.width)*100)),ny=Math.max(16,Math.min(77,((r.top+r.height*.5-tub.top)/tub.height)*100));d.style.left=nx+'%';d.style.top=ny+'%';d.dataset.x=nx;d.dataset.y=ny;d.dataset.dx=0;d.dataset.dy=0}applyBulkTiltV64()};d.addEventListener('pointerup',up);d.addEventListener('pointercancel',up);
}
function openBulkCardV64(id){const c=state.bulkV64?.[id];if(!c)return;bulkInspectIdV64=id;document.getElementById('bulkInspectImgV64').src=c.img||c.thumb||'';document.getElementById('bulkInspectNameV64').textContent=c.name;document.getElementById('bulkInspectTypeV150').textContent=(c.finish||c.rarity||'Bulk card').toUpperCase();document.getElementById('bulkInspectInfoV64').textContent=`${c.set} • #${c.number} • ${c.rarity||'Card'}${c.finish?' • '+c.finish:''} • ${c.qty} in tub`;document.getElementById('bulkInspectValueV150').textContent=`Bulk value • $${(sellPrice(c)*Number(c.qty||0)).toFixed(2)}`;document.getElementById('bulkInspectV64').classList.add('show')}
function closeBulkCardV64(){document.getElementById('bulkInspectV64').classList.remove('show');bulkInspectIdV64=null}
function moveBulkToBinderV64(){
 const id=bulkInspectIdV64,c=state.bulkV64?.[id];if(!c)return;
 const copy={...c,qty:1,manualBinder:true};
 c.qty=Number(c.qty||1)-1;if(c.qty<=0)delete state.bulkV64[id];
 addToBinderV64(copy,1);if(state.binder?.[id])state.binder[id].manualBinder=true;
 save();closeBulkCardV64();renderBulkV64();renderBinder();renderSets();try{renderMasterV57()}catch(e){};
 toast(`📘 ${copy.name} moved to Binder — it will stay there.`)
}
function onBulkOrientationV64(e){bulkTiltX=Math.max(-18,Math.min(18,Number(e.gamma||0)*.45));bulkTiltY=Math.max(-15,Math.min(15,(Number(e.beta||0)-45)*.16));applyBulkTiltV64()}
async function autoEnableBulkMotionV65(){
 try{
   if(typeof DeviceOrientationEvent==='undefined')return;
   if(typeof DeviceOrientationEvent.requestPermission==='function'){
     /* iOS requires a user gesture; silently use drag physics until one occurs. */
     const once=async()=>{try{if(await DeviceOrientationEvent.requestPermission()==='granted')window.addEventListener('deviceorientation',onBulkOrientationV64,{passive:true})}catch(e){}};
     document.getElementById('bulkTubV64')?.addEventListener('pointerdown',once,{once:true});
   }else window.addEventListener('deviceorientation',onBulkOrientationV64,{passive:true});
 }catch(e){}
}
document.getElementById('bulkCloseV64').onclick=closeBulkCardV64;
document.getElementById('bulkInspectV64').onclick=e=>{if(e.target===e.currentTarget)closeBulkCardV64()};
document.getElementById('bulkMoveBinderV64').onclick=moveBulkToBinderV64;
document.getElementById('sellBulkTubV64').onclick=()=>{const a=bulkCardsV64();if(!a.length){toast('Bulk Tub is empty.');return}let n=0,v=0;a.forEach(c=>{n+=c.qty;v+=sellPrice(c)*c.qty});state.bulkV64={};money(Math.round(v*100)/100);save();renderBulkV64();renderSets();try{renderMasterV57()}catch(e){};toast(`Sold ${n} bulk cards • +$${v.toFixed(2)} • Master Sets recalculated`)};
setTimeout(()=>{migrateExistingBinderToMasterV60();renderBulkV64();renderBinder();renderSets()},500);
setTimeout(autoEnableBulkMotionV65,650);

/* V66 repair pass for cards saved while TCGdex was unavailable. */
let repairRunningV66=false;
async function repairSavedCardsV66(){
 if(repairRunningV66)return;repairRunningV66=true;
 const groups=[state.binder||{},state.bulkV64||{}];
 for(const group of groups){
   for(const [id,c] of Object.entries(group)){
     if(!c||(!c.emergency&&(c.rarity&&c.rarity!=='Card')&&c.img))continue;
     await hydrateCard(c);
     /* If a card in Bulk turns out to be a real hit, restore it to Binder. */
     if(group===state.bulkV64&&c.rarity&&c.rarity!=='Card'&&tier(c)>=2){
       const qty=Number(c.qty||1);addToBinderV64(c,qty);delete state.bulkV64[id];
     }
     save();await new Promise(r=>setTimeout(r,90));
   }
 }
 repairRunningV66=false;renderBulkV64();renderBinder();renderSets();
}
setTimeout(repairSavedCardsV66,1200);

/* V68 mobile-safe WebAudio + Settings */
const audioV67={ctx:null,master:null,music:null,sfx:null,musicOn:true,sfxOn:true,musicVol:.34,sfxVol:.62,timer:null,step:0};const settingsV68={haptics:true};
try{let a=JSON.parse(localStorage.getItem('tcgAudioV68')||localStorage.getItem('tcgAudioV67')||'{}');if(typeof a.m==='boolean')audioV67.musicOn=a.m;if(typeof a.s==='boolean')audioV67.sfxOn=a.s;if(Number.isFinite(a.mv))audioV67.musicVol=a.mv;if(Number.isFinite(a.sv))audioV67.sfxVol=a.sv;if(typeof a.h==='boolean')settingsV68.haptics=a.h}catch(e){}
function audioInitV67(){let A=window.AudioContext||window.webkitAudioContext;if(!A)return false;if(!audioV67.ctx){let c=audioV67.ctx=new A();audioV67.master=c.createGain();audioV67.music=c.createGain();audioV67.sfx=c.createGain();audioV67.master.gain.value=.8;audioV67.music.connect(audioV67.master);audioV67.sfx.connect(audioV67.master);audioV67.master.connect(c.destination);startMusicV67()}try{audioV67.ctx.resume()}catch(e){}updateAudioV68();return true}
function toneV67(freq,dur=.12,type='sine',vol=.08,delay=0,dest='sfx'){let c=audioV67.ctx;if(!c)return;let o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest==='music'?audioV67.music:audioV67.sfx);o.start(t);o.stop(t+dur+.04)}
function noiseV67(dur=.05,vol=.025){if(!audioV67.ctx||!audioV67.sfxOn)return;let c=audioV67.ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);let n=c.createBufferSource(),g=c.createGain();n.buffer=b;g.gain.value=vol;n.connect(g);g.connect(audioV67.sfx);n.start()}
function sfxV67(k){if(!audioV67.sfxOn)return;audioInitV67();if(!audioV67.ctx)return;if(k==='tap')toneV67(560,.045,'sine',.07);else if(k==='keep'){toneV67(660,.09,'sine',.13);toneV67(880,.15,'sine',.1,.07)}else if(k==='trash'){noiseV67(.08,.08);toneV67(170,.1,'triangle',.06)}else if(k==='coin'){toneV67(880,.07,'sine',.13);toneV67(1320,.14,'sine',.11,.06)}else if(k==='card'){}else if(k==='hit'){[523,659,784,1047].forEach((f,i)=>toneV67(f,.24,'sine',.11,i*.065))}else if(k==='perfect'){[523,659,784,988,1319].forEach((f,i)=>toneV67(f,.32,'sine',.12,i*.075))}else if(k==='bulk')noiseV67(.04,.04)}
function startMusicV67(){if(audioV67.timer)return;const n=[261.63,293.66,329.63,293.66,261.63,246.94,220,246.94],b=[130.81,146.83,123.47,110];audioV67.timer=setInterval(()=>{if(!audioV67.musicOn||!audioV67.ctx||audioV67.ctx.state!=='running')return;let i=audioV67.step++;if(i%2===0)toneV67(n[(i/2)%n.length|0],2.65,'sine',.038,0,'music');if(i%8===0)toneV67(b[(i/8)%b.length|0],5.4,'sine',.026,0,'music')},1972)}
function saveAudioV68(){localStorage.setItem('tcgAudioV68',JSON.stringify({m:audioV67.musicOn,s:audioV67.sfxOn,mv:audioV67.musicVol,sv:audioV67.sfxVol,h:settingsV68.haptics}))}
function paintRangeV70(el,val){if(!el)return;el.style.setProperty('--pct',Math.round(val*100)+'%')}
function updateAudioV68(syncRanges=false){
 if(audioV67.ctx){let t=audioV67.ctx.currentTime;audioV67.music.gain.setTargetAtTime(audioV67.musicOn?audioV67.musicVol:0,t,.02);audioV67.sfx.gain.setTargetAtTime(audioV67.sfxOn?audioV67.sfxVol:0,t,.02)}
 for(const [id,on] of [['musicToggleV68',audioV67.musicOn],['sfxToggleV68',audioV67.sfxOn],['hapticToggleV68',settingsV68.haptics]]){let e=document.getElementById(id);if(e){e.textContent=on?'ON':'OFF';e.classList.toggle('on',on)}}
 let m=document.getElementById('musicVolV68'),x=document.getElementById('sfxVolV68');
 if(syncRanges){if(m)m.value=Math.round(audioV67.musicVol*100);if(x)x.value=Math.round(audioV67.sfxVol*100)}
 paintRangeV70(m,audioV67.musicVol);paintRangeV70(x,audioV67.sfxVol);saveAudioV68()
}
function unlockAudioV68(){audioInitV67();document.removeEventListener('pointerdown',unlockAudioV68,true);document.removeEventListener('touchstart',unlockAudioV68,true);document.removeEventListener('click',unlockAudioV68,true)}
document.addEventListener('pointerdown',unlockAudioV68,true);document.addEventListener('touchstart',unlockAudioV68,true);document.addEventListener('click',unlockAudioV68,true);
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b||/ToggleV68$/.test(b.id)||b.id==='testAudioV68')return;sfxV67('tap')},true);document.addEventListener('pointerdown',e=>{if(e.target.closest('.looseCard'))sfxV67('bulk')},{passive:true});
setTimeout(()=>{let m=document.getElementById('musicToggleV68'),x=document.getElementById('sfxToggleV68'),mv=document.getElementById('musicVolV68'),sv=document.getElementById('sfxVolV68'),h=document.getElementById('hapticToggleV68'),t=document.getElementById('testAudioV68');if(m)m.onclick=()=>{audioInitV67();audioV67.musicOn=!audioV67.musicOn;updateAudioV68()};if(x)x.onclick=()=>{audioInitV67();audioV67.sfxOn=!audioV67.sfxOn;updateAudioV68();if(audioV67.sfxOn)sfxV67('keep')};if(h)h.onclick=()=>{settingsV68.haptics=!settingsV68.haptics;updateAudioV68();if(settingsV68.haptics&&navigator.vibrate)navigator.vibrate(12)};if(t)t.onclick=()=>{audioInitV67();audioV67.musicOn=audioV67.sfxOn=true;updateAudioV68();sfxV67('perfect');toneV67(261.63,.8,'sine',.11,.05,'music');toneV67(392,.8,'sine',.09,.18,'music')};updateAudioV68(true)},150);
/* Event-specific sound hooks */
const _toastV67=window.toast;
if(typeof _toastV67==='function')window.toast=function(msg,...a){let x=String(msg||'').toLowerCase();if(x.includes('sold')||x.includes('+$'))sfxV67('coin');else if(x.includes('binder')||x.includes('bulk tub'))sfxV67('keep');return _toastV67(msg,...a)};

/* V69 robust navigation for dynamically-added Settings screen */
document.querySelectorAll('.nav button[data-s]').forEach(btn=>{
 btn.addEventListener('click',function(){
   const id=this.dataset.s,screen=document.getElementById(id);if(!screen)return;
   document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
   document.querySelectorAll('.nav button[data-s]').forEach(x=>x.classList.remove('active'));
   screen.classList.add('active');this.classList.add('active');
   window.scrollTo({top:0,behavior:'smooth'});
   if(id==='settings')setTimeout(updateAudioV68,0);
 });
});

/* V69 settings controls: delegated so they work regardless of screen creation timing */
document.addEventListener('click',e=>{
 const b=e.target.closest('#musicToggleV68,#sfxToggleV68,#hapticToggleV68,#testAudioV68');if(!b)return;
 e.preventDefault();e.stopPropagation();audioInitV67();
 if(b.id==='musicToggleV68'){audioV67.musicOn=!audioV67.musicOn;updateAudioV68();if(audioV67.musicOn)toneV67(523,.18,'sine',.12,0,'music')}
 if(b.id==='sfxToggleV68'){audioV67.sfxOn=!audioV67.sfxOn;updateAudioV68();if(audioV67.sfxOn)sfxV67('keep')}
 if(b.id==='hapticToggleV68'){settingsV68.haptics=!settingsV68.haptics;updateAudioV68();if(settingsV68.haptics&&navigator.vibrate)navigator.vibrate(12)}
 if(b.id==='testAudioV68'){audioV67.musicOn=true;audioV67.sfxOn=true;updateAudioV68();sfxV67('perfect');toneV67(261.63,.85,'sine',.13,.04,'music');toneV67(392,.85,'sine',.11,.18,'music')}
},true);


/* ============================================================
   V70 FULL GAME AUDIO SYSTEM
   Original synthesized SFX; no external copyrighted audio.
   ============================================================ */
let audioEventsV70={lastLevel:0,lastXP:0,lastAchievements:0,lastMoney:0,lastGradeCount:0,lastSubmissionCount:0,lastScreen:''};

function hapticV70(pattern){if(settingsV68.haptics&&navigator.vibrate)try{navigator.vibrate(pattern)}catch(e){}}
function chordV70(notes,dur=.25,vol=.08,gap=.055,type='sine'){notes.forEach((f,i)=>toneV67(f,dur,type,vol,i*gap))}
function sfxEventV70(kind){
 if(!audioV67.sfxOn)return;audioInitV67();if(!audioV67.ctx)return;
 switch(kind){
  case 'packGrab': hapticV70(8);break;
  case 'tear': hapticV70([12,20,18]);break;
  case 'wrapper': break;
  case 'flip': hapticV70(5);break;
  case 'reverse': toneV67(720,.13,'sine',.08);toneV67(1080,.20,'sine',.06,.07);break;
  case 'holo': chordV70([523,784,1047],.25,.08,.06);hapticV70(12);break;
  case 'bigHit': chordV70([392,523,659,784,1047],.34,.11,.07);toneV67(1568,.45,'sine',.07,.28);hapticV70([20,25,35]);break;
  case 'godPack': chordV70([261,329,392,523,659,784,1047,1319],.5,.11,.065);hapticV70([30,25,30,25,60]);break;
  case 'level': chordV70([392,523,659,784,1047],.34,.10,.075);toneV67(1319,.5,'sine',.07,.32);hapticV70([18,35,30]);break;
  case 'achievement': chordV70([659,831,988,1319],.30,.09,.08);hapticV70([10,30,20]);break;
  case 'unlock': chordV70([440,554,659,880],.34,.08,.09);break;
  case 'binder': noiseV67(.04,.025);toneV67(550,.08,'sine',.06);toneV67(825,.12,'sine',.045,.06);break;
  case 'bulkDrop': noiseV67(.07,.06);toneV67(170,.06,'triangle',.035);break;
  case 'bulkSell': chordV70([880,1109,1320],.20,.09,.055);hapticV70(15);break;
  case 'marketList': toneV67(440,.07,'triangle',.06);toneV67(660,.13,'sine',.07,.06);break;
  case 'sale': chordV70([988,1319,1568],.22,.10,.06);hapticV70([10,20,15]);break;
  case 'job': chordV70([330,440,550],.18,.065,.05,'triangle');break;
  case 'submitGrade': noiseV67(.06,.035);toneV67(300,.08,'triangle',.05);toneV67(600,.12,'sine',.055,.07);break;
  case 'gradeStage': toneV67(392,.08,'sine',.05);toneV67(523,.12,'sine',.05,.06);break;
  case 'slabSeal': noiseV67(.05,.04);toneV67(180,.05,'square',.035);toneV67(900,.09,'sine',.055,.04);hapticV70(18);break;
  case 'slabReveal': chordV70([262,392,523,659,784],.42,.095,.08);hapticV70([18,30,45]);break;
  case 'grade10': chordV70([523,659,784,1047,1319,1568],.52,.12,.07);hapticV70([25,25,25,25,70]);break;
  case 'masterMilestone': chordV70([349,440,523,698,880],.4,.09,.075);break;
  case 'error': toneV67(180,.12,'square',.04);toneV67(140,.16,'square',.035,.08);hapticV70(30);break;
 }
}

/* True touch sliders: pointer capture prevents the page/nav from stealing the gesture. */
function bindRangeV70(id,key){
 const el=document.getElementById(id);if(!el||el.dataset.v70)return;el.dataset.v70='1';
 const set=e=>{audioInitV67();let v=Math.max(0,Math.min(1,Number(el.value)/100));audioV67[key]=v;paintRangeV70(el,v);if(audioV67.ctx){let g=key==='musicVol'?audioV67.music:audioV67.sfx;g.gain.setTargetAtTime((key==='musicVol'?audioV67.musicOn:audioV67.sfxOn)?v:0,audioV67.ctx.currentTime,.015)}saveAudioV68()};
 el.addEventListener('pointerdown',e=>{e.stopPropagation();try{el.setPointerCapture(e.pointerId)}catch(x){}},{passive:false});
 el.addEventListener('input',e=>{e.stopPropagation();set(e)},{passive:false});
 el.addEventListener('change',set);
 paintRangeV70(el,audioV67[key]);
}
setTimeout(()=>{bindRangeV70('musicVolV68','musicVol');bindRangeV70('sfxVolV68','sfxVol');updateAudioV68(true)},300);

/* Semantic audio hooks from real game UI/actions. */
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;let t=(b.textContent||'').toLowerCase(),id=b.id||'';
 if(/open|rip|pack/.test(t)&&!/settings/.test(t))sfxEventV70('packGrab');
 if(/sell bulk/.test(t))sfxEventV70('bulkSell');
 if(/grade|submit/.test(t)&&!/upgrade/.test(t))sfxEventV70('submitGrade');
 if(/binder/.test(t)&&!/tab|theme/.test(t))sfxEventV70('binder');
 if(/list.*market|marketplace/.test(t))sfxEventV70('marketList');
},false);

/* Detect important game-state transitions without replacing core functions. */
function levelV70(){try{return Math.max(1,Math.floor(Math.sqrt(Number(state.xp||0)/55))+1)}catch(e){return 1}}
function achCountV70(){try{return Object.values(state.achievements||{}).filter(Boolean).length}catch(e){return 0}}
setTimeout(()=>{audioEventsV70.lastLevel=levelV70();audioEventsV70.lastXP=Number(state.xp||0);audioEventsV70.lastAchievements=achCountV70();audioEventsV70.lastMoney=Number(state.coins||0);audioEventsV70.lastGradeCount=(state.gradingV44?.graded||[]).length;audioEventsV70.lastSubmissionCount=(state.gradingV44?.submissions||[]).length},700);
setInterval(()=>{
 try{
  let lv=levelV70(),ac=achCountV70(),money=Number(state.coins||0),gc=(state.gradingV44?.graded||[]).length,sc=(state.gradingV44?.submissions||[]).length;
  if(lv>audioEventsV70.lastLevel){sfxEventV70('level');audioEventsV70.lastLevel=lv}
  if(ac>audioEventsV70.lastAchievements){sfxEventV70('achievement');audioEventsV70.lastAchievements=ac}
  if(gc>audioEventsV70.lastGradeCount){let newest=(state.gradingV44?.graded||[]).slice(-1)[0];sfxEventV70(Number(newest?.grade)>=10?'grade10':'slabReveal');audioEventsV70.lastGradeCount=gc}
  if(sc>audioEventsV70.lastSubmissionCount){sfxEventV70('submitGrade');audioEventsV70.lastSubmissionCount=sc}
  audioEventsV70.lastMoney=money;
 }catch(e){}
},900);

/* Toast/event interpretation adds audio to systems that don't expose a stable hook. */
const toastV70=window.toast;
if(typeof toastV70==='function')window.toast=function(msg,...args){
 let x=String(msg||'').toLowerCase();
 if(/level up|level \d/.test(x))sfxEventV70('level');
 else if(/achievement|badge/.test(x))sfxEventV70('achievement');
 else if(/god pack/.test(x))sfxEventV70('godPack');
 else if(/grade 10|perfect 10/.test(x))sfxEventV70('grade10');
 else if(/slab|return ready/.test(x))sfxEventV70('slabReveal');
 else if(/sold|sale/.test(x))sfxEventV70('sale');
 else if(/master set|25%|50%|75%|100%/.test(x))sfxEventV70('masterMilestone');
 else if(/unlocked/.test(x))sfxEventV70('unlock');
 return toastV70(msg,...args)
};

/* Pack-card visual lifecycle cues */
let audioPackV70={idx:-99,active:false};
setInterval(()=>{
 try{
  let active=typeof pulls!=='undefined'&&Array.isArray(pulls)&&pulls.length>0;
  let ci=typeof idx!=='undefined'?Number(idx):-1;
  if(active&&!audioPackV70.active){sfxEventV70('tear');audioPackV70.active=true}
  if(active&&ci!==audioPackV70.idx&&ci>=0){
    sfxEventV70('flip');let c=pulls[ci],t=c?tier(c):0;
    if(c?.finish==='Reverse Foil')setTimeout(()=>sfxEventV70('reverse'),70);
    if(t===2)setTimeout(()=>sfxEventV70('holo'),90);
    if(t>=3||c?.secret)setTimeout(()=>sfxEventV70('bigHit'),100);
    audioPackV70.idx=ci
  }
  if(!active){audioPackV70.active=false;audioPackV70.idx=-99}
 }catch(e){}
},180);

/* V71 Master Copy repair: recover one unique copy from Bulk into Binder.
   This makes existing saves follow the new rule immediately. */
function repairMasterCopiesV71(){
 let moved=0;
 for(const [id,c] of Object.entries(state.bulkV64||{})){
   if(!c||Number(c.qty||0)<=0)continue;
   if(!(state.binder?.[id]&&Number(state.binder[id].qty||0)>0)){
     addToBinderV64(c,1);c.qty=Number(c.qty||1)-1;if(c.qty<=0)delete state.bulkV64[id];moved++;
   }
 }
 if(moved){save();try{renderBinder()}catch(e){};try{renderBulkV64()}catch(e){};try{renderSets()}catch(e){};try{renderMasterV57()}catch(e){};setTimeout(()=>toast(`📘 Recovered ${moved} Master Set ${moved===1?'card':'cards'} from Bulk into your Binder.`),700)}
}
/* V72 Bulk itself counts; do not move it into Binder. */

/* V77 rarity-routing repair: hits accidentally stored in Bulk by older builds are
   moved to Binder once. Bulk remains for true bulk-class cards only. */
function repairMisroutedHitsV77(){
 let moved=0;
 for(const [id,c] of Object.entries(state.bulkV64||{})){
   if(!c||Number(c.qty||0)<=0)continue;
   if(!isBulkCardV64(c)){
     addToBinderV64(c,Number(c.qty||1));
     delete state.bulkV64[id];
     moved++;
   }
 }
 if(moved){
   save();
   try{renderBulkV64()}catch(e){}
   try{renderBinder()}catch(e){}
   try{renderSets()}catch(e){}
   try{renderMasterV57()}catch(e){}
   setTimeout(()=>toast(`📘 Fixed ${moved} misrouted ${moved===1?'hit':'hits'} — moved to Binder.`),650);
 }
}
setTimeout(repairMisroutedHitsV77,700);



/* ===== original script 4 id=v99-scroll-scope-js ===== */

(function(){
  function syncV99Scroll(){
    const rip=document.getElementById('rip');
    const lock=!!(rip&&rip.classList.contains('active'));
    const root=document.documentElement, body=document.body;
    body.classList.toggle('v99RipLocked',lock);
    root.classList.toggle('v100RipLock',lock);
    root.classList.toggle('v100PageScroll',!lock);
    body.classList.toggle('v100PageScroll',!lock);
    root.style.overflowY=lock?'hidden':'auto';
    body.style.overflowY=lock?'hidden':'auto';
    root.style.height=lock?'100dvh':'auto';
    body.style.height=lock?'100dvh':'auto';
    if(!lock){
      root.style.overscrollBehaviorY='auto'; body.style.overscrollBehaviorY='auto';
      root.style.touchAction='pan-y'; body.style.touchAction='pan-y';
    }
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('.nav button')) requestAnimationFrame(syncV99Scroll);
  },true);
  const mo=new MutationObserver(syncV99Scroll);
  document.querySelectorAll('.screen').forEach(el=>mo.observe(el,{attributes:true,attributeFilter:['class']}));
  window.addEventListener('pageshow',syncV99Scroll);
  syncV99Scroll();
})();



/* ===== original script 5 id=v104-boot-script ===== */
(()=>{const splash=document.getElementById('bootSplashV104');if(!splash)return;const close=()=>splash.classList.add('hide');splash.addEventListener('click',close,{once:true});setTimeout(close,1850);setTimeout(()=>splash.remove(),2600)})();


/* ===== original script 6 id=v126-immaculate-rare-trigger ===== */

function v125ForceRareReveal(c,st){
 const stage=document.getElementById('stage'), stack=st||document.getElementById('stack'), img=document.getElementById('cardImg');
 if(!stage||!stack||!img)return;
 const token=(window.v126RareToken=(window.v126RareToken||0)+1);
 window.v124RareLockUntil=Date.now()+1900;
 document.getElementById('v126RareBackdrop')?.remove();document.getElementById('v126RareFlash')?.remove();document.getElementById('v126RareBurst')?.remove();
 const backdrop=document.createElement('div');backdrop.id='v126RareBackdrop';
 const flash=document.createElement('div');flash.id='v126RareFlash';
 const burst=document.createElement('div');burst.id='v126RareBurst';
 for(let i=0;i<14;i++){const ray=document.createElement('i');ray.style.setProperty('--r',(i*25.714)+'deg');ray.style.setProperty('--d',(i%3*24)+'ms');burst.appendChild(ray)}
 stage.append(backdrop,flash,burst);stage.classList.add('v126RareStage');
 // Kill older hit-stage circles and overlays for this cinematic.
 stage.classList.remove('fx3','fx4','fx5');
 const set=(k,v)=>stack.style.setProperty(k,v,'important');
 set('transition','none');set('transform','translate3d(0,34px,0) scale(.78) rotateZ(-1.2deg)');set('filter','brightness(.55) saturate(.72)');set('opacity','.2');
 void stack.offsetWidth;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(token!==window.v126RareToken)return;
   backdrop.classList.add('on');flash.classList.add('fire');burst.classList.add('fire');
   set('transition','transform 360ms cubic-bezier(.08,.92,.18,1.18),filter 300ms ease,opacity 160ms ease');
   set('transform','translate3d(0,-22px,0) scale(1.16) rotateZ(.7deg)');set('filter','brightness(1.16) saturate(1.16) drop-shadow(0 28px 38px rgba(16,24,45,.34))');set('opacity','1');
 }));
 setTimeout(()=>{if(token!==window.v126RareToken)return;set('transition','transform 220ms cubic-bezier(.2,.85,.25,1),filter 220ms ease');set('transform','translate3d(0,-8px,0) scale(1.055) rotateZ(-.25deg)');set('filter','brightness(1.07) saturate(1.1) drop-shadow(0 22px 30px rgba(16,24,45,.28))')},390);
 setTimeout(()=>{if(token!==window.v126RareToken)return;set('transition','transform 520ms cubic-bezier(.18,.76,.2,1),filter 520ms ease');set('transform','translate3d(0,0,0) scale(1) rotateZ(0)');set('filter','brightness(1) saturate(1) drop-shadow(0 18px 24px rgba(16,24,45,.20))');backdrop.classList.remove('on')},670);
 setTimeout(()=>{if(token!==window.v126RareToken)return;['transition','transform','filter','opacity'].forEach(k=>stack.style.removeProperty(k));stage.classList.remove('v126RareStage');backdrop.remove();flash.remove();burst.remove()},1420);
 try{sfxV67('perfect');setTimeout(()=>sfxV67('hit'),180)}catch(_){};try{navigator.vibrate?.([22,28,48,24,85])}catch(_){}
}



/* ===== original script 7 id=v127-center-stage-hook ===== */

(()=>{
 const old=window.v125ForceRareReveal;
 if(typeof old!=='function')return;
 window.v125ForceRareReveal=function(c,st){
   const stack=st||document.getElementById('stack');
   if(!stack)return old(c,st);
   document.body.classList.add('v127RareActive');
   const prev={position:stack.style.position,left:stack.style.left,top:stack.style.top,right:stack.style.right,bottom:stack.style.bottom,width:stack.style.width,zIndex:stack.style.zIndex};
   old(c,stack);
   // V126 removes its own cinematic at 1420ms; keep the centered hero moment through the full lock.
   setTimeout(()=>{
     document.body.classList.remove('v127RareActive');
     for(const [k,v] of Object.entries(prev)) stack.style[k]=v||'';
   },1880);
 };
})();



/* ===== original script 8 id=v128-immersive-controller ===== */

(()=>{
 const rip=document.getElementById('rip'),extract=document.getElementById('v128Extract'),hero=document.getElementById('v128Hero');
 function paintTheme(){if(!rip||!window.sel)return;rip.style.setProperty('--v128a',(sel.a||'#dff8f3')+'35');rip.style.setProperty('--v128b',(sel.b||'#dcecf8')+'42')}
 setInterval(paintTheme,800);setTimeout(paintTheme,50);
 // Keep the selected set centred but remove dashboard text entirely.
 const oldRender=window.renderSets; // reference only; never replace core function
 document.getElementById('sets')?.addEventListener('click',()=>setTimeout(paintTheme,80));
 // Physical extraction step: after wrapper rip completes, pause before cards are revealed.
 const realFinish=window.finishRip;
 if(typeof realFinish==='function'){
   window.finishRip=function(token){
     if(token!==ripToken||!busy||!pulls.length)return;
     if(extract && !extract.dataset.done){
       extract.dataset.token=String(token);extract.classList.add('on');
       const a=document.getElementById('v128ExtractPack');if(a)a.src=document.getElementById('packArt')?.src||'';
       return;
     }
     if(extract)extract.dataset.done='';realFinish(token);
   };
 }
 let es=null,ey=0;
 extract?.addEventListener('pointerdown',e=>{if(!extract.classList.contains('on'))return;es=e.pointerId;ey=e.clientY;extract.setPointerCapture?.(e.pointerId);e.preventDefault()},{passive:false});
 extract?.addEventListener('pointermove',e=>{if(e.pointerId!==es)return;let dy=Math.min(0,e.clientY-ey);let c=extract.querySelector('.v128Cards');if(c)c.style.transform=`translate(-50%,calc(-8% + ${dy}px))`;if(dy<-95){es=null;extract.classList.add('go');try{sfxEventV70('wrapper')}catch(_){};if(navigator.vibrate)navigator.vibrate([10,22,16]);setTimeout(()=>{let t=Number(extract.dataset.token||ripToken);extract.classList.remove('on','go');extract.querySelector('.v128Cards').style.transform='';extract.dataset.done='1';window.finishRip(t);setTimeout(()=>{extract.dataset.done=''},50)},620)}e.preventDefault()},{passive:false});
 extract?.addEventListener('pointerup',()=>{es=null;let c=extract.querySelector('.v128Cards');if(c)c.style.transform=''});
 // Pre-reveal rarity system. Runs after artwork is ready, before player can swipe it away.
 window.v128HeroPlaying=false;
 window.v128PlayHero=function(c){
   if(!c||!hero||window.v128HeroPlaying)return false;let t=typeof tier==='function'?tier(c):0;if(t<3&&!c.secret)return false;
   window.v128HeroPlaying=true;window.v124RareLockUntil=Date.now()+2300;
   const img=document.getElementById('v128HeroImg'),rare=document.getElementById('v128HeroRare'),meta=document.getElementById('v128HeroMeta');
   img.src=c.img||c.thumb||'';let r=String(c.rarity||'SPECIAL HIT').toUpperCase();rare.textContent=r;meta.textContent=`${c.name} · #${c.number}${c.market>0?' · $'+Number(c.market).toFixed(2):''}`;
   hero.className='on'+(t>=5||c.secret?' chase':'');document.body.classList.add('v128Hero');
   try{if(window.bgGainV67)bgGainV67.gain.setTargetAtTime(.025,audioV67.currentTime,.05)}catch(_){}
   setTimeout(()=>{hero.classList.add('play');try{hitSound(Math.min(5,t));}catch(_){};if(navigator.vibrate)navigator.vibrate(t>=5?[24,45,38,55,70]:[18,28,30])},150);
   setTimeout(()=>hero.classList.add('info'),1050);
   setTimeout(()=>{hero.className='';document.body.classList.remove('v128Hero');window.v128HeroPlaying=false;try{updateAudioV68()}catch(_){}},2250);
   return true;
 };
 // 10-pack rhythm: announce each new mini-pack after every tenth card.
 const beat=document.getElementById('v128PackBeat');
 document.addEventListener('v128-packbeat',e=>{if(!beat)return;document.getElementById('v128BeatTitle').textContent=`PACK ${e.detail.from} COMPLETE`;document.getElementById('v128BeatSub').textContent=`PACK ${e.detail.to}`;beat.classList.remove('on');void beat.offsetWidth;beat.classList.add('on');setTimeout(()=>beat.classList.remove('on'),760)});
})();



/* ===== original script 9 id=v129-scene-controller ===== */

(()=>{
 const cash=document.getElementById('v129CashValue'),coins=document.getElementById('coins'),stage=document.getElementById('stage'),extract=document.getElementById('v128Extract'),hero=document.getElementById('v128Hero');
 const syncCash=()=>{if(!cash)return;let v=coins?.textContent||Number(window.state?.coins||0).toFixed(2);v=String(v).replace(/^\$+/,'');cash.textContent='$'+v};
 syncCash();if(coins)new MutationObserver(syncCash).observe(coins,{childList:true,characterData:true,subtree:true});
 const syncScene=()=>{
   const summary=!!document.getElementById('v88Summary');
   const cards=!!stage?.classList.contains('cardModeV89');
   const immersive=!!extract?.classList.contains('on')||!!hero?.classList.contains('on')||!!stage?.classList.contains('v91Cinematic');
   document.body.classList.toggle('v129Summary',summary);
   document.body.classList.toggle('v129Cards',cards&&!summary);
   document.body.classList.toggle('v129Immersive',immersive&&!summary);
 };
 const obs=new MutationObserver(syncScene);if(stage)obs.observe(stage,{attributes:true,childList:true,subtree:false});if(extract)obs.observe(extract,{attributes:true});if(hero)obs.observe(hero,{attributes:true});syncScene();
 document.addEventListener('pointerup',()=>setTimeout(syncScene,0),true);
})();



/* ===== original script 10 id=v130-hit-transition-controller ===== */

(()=>{
 const hero=document.getElementById('v128Hero');
 if(!hero)return;
 window.v128PlayHero=function(c){
   if(!c||window.v128HeroPlaying)return false;
   const t=typeof tier==='function'?tier(c):0;
   if(t<3&&!c.secret)return false;
   window.v128HeroPlaying=true;
   window.v124RareLockUntil=Date.now()+2350;
   const img=document.getElementById('v128HeroImg'),rare=document.getElementById('v128HeroRare'),meta=document.getElementById('v128HeroMeta');
   const src=c.img||c.thumb||document.getElementById('cardImg')?.src||'';
   const launch=()=>{
     if(!window.v128HeroPlaying)return;
     let r=String(c.rarity||'SPECIAL HIT').toUpperCase();
     if(rare)rare.textContent=r;
     if(meta)meta.textContent=`${c.name} · #${c.number}${c.market>0?' · $'+Number(c.market).toFixed(2):''}`;
     hero.className='on'+(t>=5||c.secret?' chase':'');
     document.body.classList.add('v128Hero');
     /* Card is visible on frame one; impact begins immediately on frame two. */
     requestAnimationFrame(()=>requestAnimationFrame(()=>{
       hero.classList.add('play');
       try{hitSound(Math.min(5,t))}catch(_){}
       try{navigator.vibrate?.(t>=5?[24,45,38,55,70]:[18,28,30])}catch(_){}
     }));
     setTimeout(()=>hero.classList.add('info'),900);
     setTimeout(()=>{
       hero.className='';
       document.body.classList.remove('v128Hero');
       window.v128HeroPlaying=false;
       try{updateAudioV68()}catch(_){}
     },2200);
   };
   if(img){
     img.classList.remove('ready');
     img.src=src;
     /* Do not dim the scene until the hero artwork is actually paint-ready. */
     if(img.complete&&img.naturalWidth){launch()}
     else{
       let done=false;
       const go=()=>{if(done)return;done=true;launch()};
       img.addEventListener('load',go,{once:true});
       img.addEventListener('error',go,{once:true});
       setTimeout(go,450);
     }
   }else launch();
   return true;
 };
})();



/* ===== original script 11 id=v132-extraction-drag-fix ===== */

(()=>{
 const ex=document.getElementById('v128Extract'); if(!ex)return;
 let id=null,y0=0;
 ex.addEventListener('pointerdown',e=>{if(!ex.classList.contains('on'))return;id=e.pointerId;y0=e.clientY},{capture:true});
 ex.addEventListener('pointermove',e=>{
   if(e.pointerId!==id||!ex.classList.contains('on')||ex.classList.contains('go'))return;
   const dy=Math.min(0,e.clientY-y0),c=ex.querySelector('.v128Cards');
   if(c)c.style.setProperty('transform',`translate(-50%,${dy}px)`,'important');
 },{capture:true,passive:true});
 const clear=()=>{id=null;const c=ex.querySelector('.v128Cards');if(c&&!ex.classList.contains('go'))c.style.removeProperty('transform')};
 ex.addEventListener('pointerup',clear,{capture:true});ex.addEventListener('pointercancel',clear,{capture:true});
 new MutationObserver(()=>{if(!ex.classList.contains('on')){const c=ex.querySelector('.v128Cards');c?.style.removeProperty('transform')}}).observe(ex,{attributes:true,attributeFilter:['class']});
})();



/* ===== original script 12 id=v145-hit-cinematic-controller ===== */

(()=>{
 const hero=document.getElementById('v128Hero'); if(!hero)return;
 ['v145Aura','v145Burst','v145Particles','v145Sweep'].forEach(c=>{if(!hero.querySelector('.'+c)){const d=document.createElement('div');d.className=c;hero.insertBefore(d,hero.firstChild)}});
 const base=window.v128PlayHero;
 window.v128PlayHero=function(c){
   if(!c)return false;
   const t=typeof tier==='function'?tier(c):0;
   const ok=base(c);
   if(ok){
     hero.classList.toggle('v145Hyper',t>=5||!!c.secret);
     if(t>=5||c.secret){
       try{navigator.vibrate?.([22,32,42,38,72])}catch(_){}
     }
   }
   return ok;
 };
})();



/* ===== original script 13 id=v147-collection-experience-script ===== */

(function(){
  function q(s,r=document){return r.querySelector(s)}
  function qa(s,r=document){return [...r.querySelectorAll(s)]}
  window.syncGradeLaunchV147=function(){
    const b=document.getElementById('gradeOne'); if(!b||typeof GRADE_TIERS_V56==='undefined')return;
    const t=GRADE_TIERS_V56[state.gradingV44?.tierV56||'standard']||GRADE_TIERS_V56.standard;
    b.textContent=`SEND TO GRADING · $${t.fee} · ${t.packs} PACK${t.packs===1?'':'S'}`;
  };
  window.renderBinderShelfV147=function(){
    const shelf=document.getElementById('binderShelfV147'),name=document.getElementById('binderThemeNameV147');if(!shelf||typeof BINDER_THEMES==='undefined')return;
    try{syncRewardBinders(false)}catch(e){}
    const owned=(state.binderOwned||[]).map(id=>BINDER_THEMES.find(t=>t.id===id)).filter(Boolean);
    const cur=BINDER_THEMES.find(t=>t.id===state.binderTheme)||BINDER_THEMES[0];if(name)name.textContent=cur.name;
    shelf.innerHTML=owned.map(t=>`<button type="button" class="binderMiniV147 ${t.id===state.binderTheme?'active':''}" data-equip-binder-v147="${t.id}" style="--c1:${t.c1};--c2:${t.c2};--a:${t.a}"><img src="${pokeArt(t.poke)}" alt=""><span>${t.name}</span></button>`).join('')+`<button type="button" class="binderMiniV147 binderMiniShopV147" data-open-binder-shop-v147><b>＋</b><span>BINDER SHOP</span></button>`;
  };
  window.setBinderModeV147=function(mode){
    qa('[data-binder-mode]').forEach(b=>b.classList.toggle('active',b.dataset.binderMode===mode));
    qa('[data-binder-panel]').forEach(p=>p.classList.toggle('active',p.dataset.binderPanel===mode));
    const sheet=document.getElementById('binderFilterSheetV147');if(sheet){sheet.classList.remove('show');sheet.setAttribute('aria-hidden','true')}
    if(mode==='binder'){try{renderBinder()}catch(e){};renderBinderShelfV147()}
    if(mode==='grading'){try{renderGradingV44()}catch(e){};syncGradeLaunchV147()}
    if(mode==='vault'){try{renderSlabVaultV52()}catch(e){}}
    window.scrollTo({top:0,behavior:'smooth'});
  };
  qa('[data-binder-mode]').forEach(b=>b.addEventListener('click',()=>setBinderModeV147(b.dataset.binderMode)));
  document.addEventListener('click',e=>{
    const eq=e.target.closest('[data-equip-binder-v147]');
    if(eq){const id=eq.dataset.equipBinderV147;if((state.binderOwned||[]).includes(id)){state.binderTheme=id;save();applyBinderTheme();renderBinderShelfV147();navigator.vibrate?.(12)}return}
    if(e.target.closest('[data-open-binder-shop-v147]')){openBinderShop();return}
    if(e.target.closest('.binderTheme'))setTimeout(renderBinderShelfV147,30);
    const tier=e.target.closest('.gradeTier');if(tier)setTimeout(syncGradeLaunchV147,0);
  });
  const filter=document.getElementById('binderFilterSheetV147');
  const openFilter=()=>{if(filter){filter.classList.add('show');filter.setAttribute('aria-hidden','false');setTimeout(()=>document.getElementById('search')?.focus(),180)}};
  const closeFilter=()=>{if(filter){filter.classList.remove('show');filter.setAttribute('aria-hidden','true')}};
  document.getElementById('binderFilterBtnV147')?.addEventListener('click',openFilter);
  document.getElementById('binderFilterCloseV147')?.addEventListener('click',closeFilter);
  document.getElementById('binderFilterShadeV147')?.addEventListener('click',closeFilter);
  document.getElementById('binderCoverV147')?.addEventListener('click',e=>{if(e.target.closest('button'))return;const b=document.getElementById('binderBook');if(b&&!b.classList.contains('open'))toggleBinderFromClip()});
  let sx=null,sy=null,pid=null,lastSwipe=0;const page=document.getElementById('binderPage');
  if(page){
    page.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;pid=e.pointerId},{passive:true});
    page.addEventListener('pointermove',e=>{if(pid!==e.pointerId||sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.25)page.setPointerCapture?.(pid)},{passive:true});
    page.addEventListener('pointerup',e=>{if(pid!==e.pointerId||sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=sy=null;pid=null;if(Math.abs(dx)>58&&Math.abs(dx)>Math.abs(dy)*1.25){if(dx<0&&((binderPageNo+1)*CARDS_PER_PAGE<binderCards().length)){lastSwipe=Date.now();turnBinderPage('next')}else if(dx>0&&binderPageNo>0){lastSwipe=Date.now();turnBinderPage('prev')}}},{passive:true});
    page.addEventListener('pointercancel',()=>{sx=sy=null;pid=null});
    page.addEventListener('click',e=>{if(Date.now()-lastSwipe<320){e.preventDefault();e.stopImmediatePropagation()}},true);
  }
  const binder=document.getElementById('binder');
  if(binder){
    const activate=()=>{if(!binder.classList.contains('active'))return;stats();renderBinderShelfV147();syncGradeLaunchV147();if(!q('[data-binder-panel].active'))setBinderModeV147('binder')};
    new MutationObserver(activate).observe(binder,{attributes:true,attributeFilter:['class']});activate();
  }
  renderBinderShelfV147();syncGradeLaunchV147();
})();



/* ===== original script 14 id=v148-collection-final-controller ===== */

(()=>{
  /* UI-only controller. It never replaces or clears state.binder or state.gradingV44.graded. */
  const binder=document.getElementById('binder');
  if(!binder)return;

  // Keep a non-mutating integrity stamp so we can detect accidental UI regressions in development.
  const countState=()=>({
    binderUnique:Object.values(state?.binder||{}).filter(c=>c&&Number(c.qty||0)>0).length,
    binderTotal:Object.values(state?.binder||{}).reduce((n,c)=>n+(c?Number(c.qty||0):0),0),
    slabs:Array.isArray(state?.gradingV44?.graded)?state.gradingV44.graded.length:0,
    submissions:Array.isArray(state?.gradingV44?.submissions)?state.gradingV44.submissions.length:0
  });
  window.__collectionIntegrityV148=countState;

  // Preserve selected collection sub-view for this page session without changing the save schema.
  let mode='binder';
  const setMode=(m)=>{
    if(!['binder','grading','vault'].includes(m))m='binder';
    mode=m;
    if(typeof window.setBinderModeV147==='function')window.setBinderModeV147(m);
  };
  binder.querySelectorAll('[data-binder-mode]').forEach(btn=>{
    btn.addEventListener('click',()=>{mode=btn.dataset.binderMode||'binder'}, {passive:true});
  });

  // Card inspection: swipe down to return the card to its pocket.
  const modal=document.getElementById('cardModal');
  const inspect=modal?.querySelector('.inspectCard');
  if(modal&&inspect){
    let sy=null,pid=null,dy=0;
    inspect.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,input,select'))return;
      sy=e.clientY;dy=0;pid=e.pointerId;
      try{inspect.setPointerCapture(pid)}catch(_){}
    },{passive:true});
    inspect.addEventListener('pointermove',e=>{
      if(pid!==e.pointerId||sy===null)return;
      dy=Math.max(0,e.clientY-sy);
      if(dy>0){
        inspect.style.transform=`translateY(${Math.min(95,dy*.55)}px) scale(${1-Math.min(.055,dy/2600)})`;
        inspect.style.opacity=String(Math.max(.58,1-dy/520));
      }
    },{passive:true});
    const finish=e=>{
      if(pid!==null&&e?.pointerId!==undefined&&pid!==e.pointerId)return;
      const close=dy>105;
      sy=null;pid=null;
      inspect.style.transition='transform .22s ease,opacity .22s ease';
      inspect.style.transform=close?'translateY(120px) scale(.96)':'';
      inspect.style.opacity=close?'0':'';
      setTimeout(()=>{
        inspect.style.transition='';
        inspect.style.transform='';
        inspect.style.opacity='';
        if(close&&typeof closeBinderCard==='function')closeBinderCard();
      },close?150:220);
      dy=0;
    };
    inspect.addEventListener('pointerup',finish,{passive:true});
    inspect.addEventListener('pointercancel',finish,{passive:true});
  }

  // When this screen activates, refresh only render output — never inventory arrays/objects.
  const onActivate=()=>{
    if(!binder.classList.contains('active'))return;
    try{stats()}catch(_){}
    try{renderBinderShelfV147()}catch(_){}
    try{syncGradeLaunchV147()}catch(_){}
    if(mode==='grading'){try{renderGradingV44()}catch(_){}}
    if(mode==='vault'){try{renderSlabVaultV52()}catch(_){}}
  };
  new MutationObserver(onActivate).observe(binder,{attributes:true,attributeFilter:['class']});

  // Selected shelf binder is kept in view.
  const shelf=document.getElementById('binderShelfV147');
  if(shelf){
    const scrollSelected=()=>{
      requestAnimationFrame(()=>shelf.querySelector('.binderMiniV147.active')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}));
    };
    shelf.addEventListener('click',e=>{if(e.target.closest('[data-equip-binder-v147]'))setTimeout(scrollSelected,80)});
  }

  onActivate();
})();



/* ===== original script 15 id=v151-bulk-sort-controller ===== */

(()=>{
 const root=document.getElementById('bulk');if(!root)return;
 root.querySelectorAll('[data-bulk-sort-v151]').forEach(btn=>btn.addEventListener('click',()=>{
   bulkSortV151=btn.dataset.bulkSortV151||'mixed';
   root.querySelectorAll('[data-bulk-sort-v151]').forEach(x=>x.classList.toggle('active',x===btn));
   try{renderBulkV64()}catch(e){}
   try{navigator.vibrate?.(7)}catch(e){}
 }));
 const syncCash=()=>{const el=document.getElementById('bulkCashV151');if(el)el.textContent=`$${Number(state?.coins||0).toFixed(2)}`};
 new MutationObserver(()=>{if(root.classList.contains('active')){syncCash();try{renderBulkV64()}catch(e){}}}).observe(root,{attributes:true,attributeFilter:['class']});
 syncCash();
})();



/* ===== original script 16 id=v153-collector-district-controller ===== */
/* retired by V154 */


/* ===== original script 17 id=v154-collector-exchange-controller ===== */

(()=>{
 const root=document.getElementById('earn');if(!root)return;
 let active='buy';
 const tabs=[...root.querySelectorAll('[data-exchange-tab-v154]')];
 const panels=[...root.querySelectorAll('[data-exchange-panel-v154]')];
 const dayKey=()=>window.gameDayKeyV170?.()||new Date().toISOString().slice(0,10);
 const syncCash=()=>{const e=document.getElementById('exchangeCashV154');if(e)e.textContent=`$${Number(state?.coins||0).toFixed(2)}`};
 const syncSummary=()=>{
   const listings=state?.marketV57?.listings?.length||0,sold=Number(state?.marketV57?.sold||0),trades=Number(state?.tradeV154?.count||0);
   const a=document.getElementById('exchangeListingsV154'),b=document.getElementById('exchangeSoldV154'),c=document.getElementById('exchangeTradesV154'),h=document.getElementById('exchangeListingHintV154');
   if(a)a.textContent=String(listings);if(b)b.textContent=String(sold);if(c)c.textContent=String(trades);if(h)h.textContent=`${listings} active`;
 };
 const previousMarketRenderV2554=renderMarketV57;
 renderMarketV57=function(){const out=previousMarketRenderV2554.apply(this,arguments);syncCash();syncSummary();return out};
 const setTab=name=>{
   active=['buy','sell','trade','sealed'].includes(name)?name:'buy';
   tabs.forEach(b=>b.classList.toggle('active',b.dataset.exchangeTabV154===active));
   panels.forEach(p=>p.classList.toggle('active',p.dataset.exchangePanelV154===active));
   syncCash();syncSummary();
   try{renderMarketBuyV58()}catch(_){}try{renderMarketV57()}catch(_){}try{renderMarketHistoryV72()}catch(_){};
   if(active==='trade')renderTradeBoardV154();
 };
 tabs.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.exchangeTabV154)));
 document.getElementById('exchangeListBinderV154')?.addEventListener('click',()=>{try{openMarketPickerV57()}catch(_){}});
 document.getElementById('exchangeSellBulkV154')?.addEventListener('click',()=>document.getElementById('sellBulkAll')?.click());

 function tradePoolV154(){
   const out=[],seen=new Set();
   Object.values(cache||{}).forEach(d=>(d?.cards||[]).forEach(c=>{
     if(!c||!c.id||seen.has(c.id)||Number(c.market||0)<.25)return;
     try{if(isBulkCardV64(c))return}catch(_){}
     seen.add(c.id);out.push(c);
   }));
   return out;
 }
 function ownedTradeCardsV154(){return Object.values(state.binder||{}).filter(c=>c&&Number(c.qty||0)>0&&Number(c.market||0)>=.25)}
 function makeTradeOffersV154(){
   state.tradeV154=state.tradeV154||{day:dayKey(),accepted:{},count:0};
   if(state.tradeV154.day!==dayKey()){state.tradeV154.day=dayKey();state.tradeV154.accepted={}}
   state.tradeV154.accepted=state.tradeV154.accepted||{};
   const owned=ownedTradeCardsV154(),pool=tradePoolV154(),offers=[];
   if(!owned.length||!pool.length)return offers;
   const ordered=[...owned].sort((a,b)=>((bulkSeedV64(String(a.id)+'|'+dayKey())%10000)-(bulkSeedV64(String(b.id)+'|'+dayKey())%10000)));
   for(const give of ordered){
     if(offers.length>=4)break;
     const gv=Math.max(.25,Number(give.market||.25));
     let choices=pool.filter(c=>c.id!==give.id&&Number(c.market||0)>=gv*.88&&Number(c.market||0)<=gv*1.12);
     if(!choices.length)choices=pool.filter(c=>c.id!==give.id&&Number(c.market||0)>=gv*.75&&Number(c.market||0)<=gv*1.25);
     if(!choices.length)continue;
     choices.sort((a,b)=>Math.abs(Number(a.market||0)-gv)-Math.abs(Number(b.market||0)-gv)||((bulkSeedV64(String(a.id)+'|'+give.id+'|'+dayKey())%997)-(bulkSeedV64(String(b.id)+'|'+give.id+'|'+dayKey())%997)));
     const take=choices[bulkSeedV64(String(give.id)+'|'+dayKey())%Math.min(choices.length,5)];
     const uid=`${dayKey()}|${give.id}|${take.id}`;
     if(state.tradeV154.accepted[uid])continue;
     if(offers.some(o=>o.take.id===take.id))continue;
     offers.push({uid,give,take});
   }
   return offers;
 }
 window.renderTradeBoardV154=function(){
   const el=document.getElementById('tradeBoardV154');if(!el)return;
   const offers=makeTradeOffersV154();
   el.innerHTML=offers.length?offers.map(o=>`<div class="tradeOfferV154"><div class="tradeSideV154"><img src="${o.give.thumb||o.give.img||''}"><small>YOU GIVE</small><b>${o.give.name}</b><em>$${Number(o.give.market||0).toFixed(2)}</em></div><div class="tradeArrowV154">⇄</div><div class="tradeSideV154"><img src="${o.take.thumb||o.take.img||''}"><small>YOU GET</small><b>${o.take.name}</b><em>$${Number(o.take.market||0).toFixed(2)}</em></div><button type="button" data-trade-accept-v154="${o.uid}">ACCEPT TRADE</button></div>`).join(''):'<div class="tradeEmptyV154">No fair trade offers are available right now. Load more sets or add more cards to your Binder and the board will populate automatically.</div>';
 };
 function acceptTradeV154(uid){
   const offer=makeTradeOffersV154().find(o=>o.uid===uid);if(!offer)return toast('That trade offer is no longer available.');
   const give=state.binder?.[offer.give.id];if(!give||Number(give.qty||0)<=0){renderTradeBoardV154();return toast('You no longer own the card required for that trade.');}
   give.qty=Number(give.qty||0)-1;if(give.qty<=0)delete state.binder[offer.give.id];
   const t=offer.take;if(state.binder[t.id])state.binder[t.id].qty=Number(state.binder[t.id].qty||0)+1;else state.binder[t.id]={...t,qty:1,market:Number(t.market||.1)};
   state.masterV57=state.masterV57||{seen:{},claimed:{}};state.masterV57.seen=state.masterV57.seen||{};state.masterV57.seen[t.id]={id:t.id,setId:t.setId||'',set:t.set||''};
   state.tradeV154.accepted[uid]=Date.now();state.tradeV154.count=Number(state.tradeV154.count||0)+1;
   save();try{renderBinder()}catch(_){}try{renderSets()}catch(_){}try{renderMasterV57()}catch(_){};syncSummary();renderTradeBoardV154();
   try{navigator.vibrate?.([8,35,12])}catch(_){};toast(`Trade complete • ${offer.take.name} added to Binder`);
 }
 root.addEventListener('click',e=>{const b=e.target.closest('[data-trade-accept-v154]');if(b)acceptTradeV154(b.dataset.tradeAcceptV154)});
 new MutationObserver(()=>{if(root.classList.contains('active')){syncCash();syncSummary();try{renderMarketBuyV58()}catch(_){}try{renderMarketV57()}catch(_){}try{renderMarketHistoryV72()}catch(_){};if(active==='trade')renderTradeBoardV154()}}).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',e=>{if(e.target.closest('[data-buy-hit],[data-cancel-list],#marketCreateV57,#sellBulkAll'))setTimeout(()=>{syncCash();syncSummary()},60)});
 setTab('buy');
})();



/* ===== original script 18 id=v160-profile-static-controller ===== */
(()=>{window.profileAchFilterV160='all';window.renderAchievementsV160=function(filter='all'){window.profileAchFilterV160=filter;let el=document.getElementById('achievementGrid');if(!el)return;let rows=ACHIEVEMENTS.map(([id,n,d,ico,get,target])=>{let v=Math.min(target,Number(get())||0),pc=Math.min(100,target?v/target*100:0),ok=!!state.achievements[id];return{id,n,d,ico,v,target,pc,ok}});if(filter==='done')rows=rows.filter(x=>x.ok);if(filter==='near')rows=rows.filter(x=>!x.ok&&x.pc>=40).sort((a,b)=>b.pc-a.pc);el.innerHTML=rows.length?rows.map(x=>`<div class="achievement ${x.ok?'done':''}"><div class="achIcon">${x.ok?x.ico:'◆'}</div><div><b>${x.n}</b><small>${x.d}</small><div class="achProgress"><i style="width:${x.pc}%"></i></div></div><em>${x.ok?'DONE':`${Math.floor(x.v)}/${x.target}`}</em></div>`).join(''):'<div class="profileEmptyV158">Nothing in this filter yet.</div>';document.querySelectorAll('[data-ach-filter-v160]').forEach(b=>b.classList.toggle('active',b.dataset.achFilterV160===filter))};let profile=document.getElementById('profile'),settings=document.getElementById('settings');profile?.addEventListener('click',e=>{let m=e.target.closest('[data-profile-mode-v160]');if(m){let v=m.dataset.profileModeV160;profile.querySelectorAll('[data-profile-mode-v160]').forEach(b=>b.classList.toggle('active',b===m));profile.querySelectorAll('[data-profile-panel-v160]').forEach(p=>p.classList.toggle('active',p.dataset.profilePanelV160===v));return}let f=e.target.closest('[data-ach-filter-v160]');if(f)renderAchievementsV160(f.dataset.achFilterV160)});let openSettings=()=>{settings?.classList.add('show');settings?.setAttribute('aria-hidden','false');try{updateAudioV68(true)}catch(e){}},closeSettings=()=>{settings?.classList.remove('show');settings?.setAttribute('aria-hidden','true')};document.getElementById('openProfileSettingsV158')?.addEventListener('click',openSettings);document.getElementById('closeProfileSettingsV158')?.addEventListener('click',closeSettings);document.getElementById('closeSettingsShadeV158')?.addEventListener('click',closeSettings);let prefs={reducedMotion:false,packTilt:true,cinematicFull:true};try{Object.assign(prefs,JSON.parse(localStorage.getItem('tcgPrefsV160')||'{}'))}catch(e){}let sync=()=>{document.documentElement.classList.toggle('v158ReducedMotion',prefs.reducedMotion);document.documentElement.classList.toggle('v158NoPackTilt',!prefs.packTilt);document.documentElement.classList.toggle('v158CinematicReduced',!prefs.cinematicFull);[['reducedMotionV160',prefs.reducedMotion,'ON','OFF'],['packTiltV160',prefs.packTilt,'ON','OFF'],['cinematicV160',prefs.cinematicFull,'FULL','REDUCED']].forEach(([id,on,a,b])=>{let x=document.getElementById(id);if(x){x.textContent=on?a:b;x.classList.toggle('on',on)}});try{localStorage.setItem('tcgPrefsV160',JSON.stringify(prefs))}catch(e){}};document.getElementById('reducedMotionV160')?.addEventListener('click',()=>{prefs.reducedMotion=!prefs.reducedMotion;sync()});document.getElementById('packTiltV160')?.addEventListener('click',()=>{prefs.packTilt=!prefs.packTilt;sync()});document.getElementById('cinematicV160')?.addEventListener('click',()=>{prefs.cinematicFull=!prefs.cinematicFull;sync()});sync();document.getElementById('exportSaveV160')?.addEventListener('click',()=>{try{let blob=new Blob([JSON.stringify({version:201,save:state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tcg-pack-ripper-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){toast('Could not export save.')}});let inp=document.getElementById('importSaveFileV160');document.getElementById('importSaveV160')?.addEventListener('click',()=>inp?.click());inp?.addEventListener('change',async()=>{let f=inp.files?.[0];if(!f)return;try{let x=JSON.parse(await f.text()),next=x.save||x;if(!next?.binder)throw 0;if(confirm('Replace your current local save with this imported save?')){localStorage.setItem('tcgRipperSave',JSON.stringify(next));location.reload()}}catch(e){toast('Invalid save file.')}finally{inp.value=''}})})();
