/* Presentation-only achievement artwork. Never changes earned badge state. */
const ACHIEVEMENT_SERIES = Object.freeze({
  pack:['First Tear','Getting Warm','Ten Deep','Pack Habit','Half Century','Century Ripper','Pack Storm','Cardboard Legend'],
  hit:['First Spark','Hot Hand','Hit Hunter','Foil Fever','Hit Machine','Triple Digits'],
  binder:['Binder Started','Binder Builder','Collector','Vault Keeper','Museum Curator','Stacked Binder','Card Mountain'],
  level:['Level Up','Rising Ripper','Double Digits','Elite Status','Master Rank','TCG Icon'],
  sets:['New Horizons','Shelf Expansion','Era Explorer','Master Shelf'],
  shop:['First Shift','Part Timer','Shop Regular','Employee Month','Workaholic'],
  arcade:['Price Rookie','Price Gun','Sleeved Up','Perfect Fit','Good Memory','Photographic','Dock Hand','Warehouse Pro','Arcade Regular','Arcade Ace'],
  wealth:['First Dollar','Pocket Money','Shop Float','Big Bank','High Roller'],
  legacy:['Clean Binder','Ruthless'],
  chase:['Dollar Card','Nice Pull','Premium Pull','Monster Pull','Treasure','Dream Card']
});

const MYTHIC_ACHIEVEMENT_SERIES = Object.freeze({
  pack:['Pack Avalanche','Four Digits','Cardboard Marathon','Ripper Eternal'],
  hit:['Heat Check','Hit Factory','Foil Tsunami','One Thousand Sparks'],
  binder:['Deep Catalogue','Living Pokédex Shelf','Heavy Binder','Four-Figure Binder','Cardboard Warehouse','Binder Boutique Complete'],
  level:['Icon Ascendant','Vault Royalty','Absolute Collector'],
  sets:['Master Apprentice','Master Architect','Master Empire','Nothing Missing'],
  chase:['Chase Starter','Chase Cabinet','Chase Museum','Every Grail','Quarter-K Grail','Monster Grail'],
  slab:['Slab Starter Wall','Slab Cabinet','Slab Room','Slab Museum','Gem Minted','Ten Perfect Tens','Perfect Shelf','Perfect Vault'],
  shop:['Seller Reputation','Market Veteran','Market Institution','Sales Ledger','Auction House','Trade Circuit','Trade Network','Trade Legend','Shop Veteran','Shop Lifer'],
  arcade:['Arcade Veteran','Arcade Immortal'],
  wealth:['Serious Cash','Four-Figure Float'],
  vault:['Sealed Wall']
});

export const ACHIEVEMENT_ART = Object.freeze(Object.fromEntries([
 ...Object.entries(ACHIEVEMENT_SERIES).flatMap(([art,names])=>names.map((name,index)=>[name,{art,tier:Math.min(4,Math.floor(index*5/names.length))}])),
 ...Object.entries(MYTHIC_ACHIEVEMENT_SERIES).flatMap(([art,names])=>names.map((name,index)=>[name,{art,tier:index===names.length-1?4:3}]))
]));

export const BADGE_ART = Object.freeze({
  'FIRST RIP':{art:'pack',tier:0},'PACK STACK':{art:'pack',tier:1},'RIP MACHINE':{art:'pack',tier:2},'CENTURY CLUB':{art:'pack',tier:3},
  'HIT HUNTER':{art:'hit',tier:1},'FOIL FANATIC':{art:'hit',tier:2},'CHASE LORD':{art:'chase',tier:4},
  'BINDER BUILDER':{art:'binder',tier:1},'VAULT KEEPER':{art:'vault',tier:3},
  'RISING STAR':{art:'level',tier:1},'ELITE TRAINER':{art:'level',tier:2},'MASTER COLLECTOR':{art:'level',tier:3},'TCG ICON':{art:'level',tier:4},
  'SHOP GRINDER':{art:'shop',tier:2},'ARCADE ACE':{art:'arcade',tier:3},
  'PACK TITAN':{art:'pack',tier:3},'PACK MYTH':{art:'pack',tier:4},
  'HIT ROYALTY':{art:'hit',tier:3},'HIT IMMORTAL':{art:'hit',tier:4},
  'LIVING ARCHIVE':{art:'binder',tier:3},'CARDBOARD FORTRESS':{art:'binder',tier:4},
  'LEVEL CAP':{art:'level',tier:4},
  'FIVE CROWNS':{art:'sets',tier:3},'MASTER DYNASTY':{art:'sets',tier:4},'TOTAL COMPLETION':{art:'sets',tier:4},
  'CHASE FIVE':{art:'chase',tier:2},'CHASE VAULT':{art:'chase',tier:3},'CHASE CONSTELLATION':{art:'chase',tier:4},
  'SLAB WALL':{art:'slab',tier:2},'SLAB MUSEUM':{art:'slab',tier:4},'PERFECT TEN CLUB':{art:'slab',tier:4},
  'MARKET MOGUL':{art:'shop',tier:3},'TRADE KING':{art:'shop',tier:3},
  'FOUR FIGURES':{art:'wealth',tier:4},'BINDER LORD':{art:'binder',tier:4}
});
const BADGE_NAMES = Object.freeze({
 first:'FIRST RIP',ten:'PACK STACK',fifty:'RIP MACHINE',hundred:'CENTURY CLUB',hit1:'HIT HUNTER',hit50:'FOIL FANATIC',hit100:'CHASE LORD',
 binder:'BINDER BUILDER',vault:'VAULT KEEPER',level10:'RISING STAR',elite:'ELITE TRAINER',master:'MASTER COLLECTOR',icon:'TCG ICON',worker:'SHOP GRINDER',arcade:'ARCADE ACE',
 packTitanV163:'PACK TITAN',packMythV163:'PACK MYTH',hitRoyalV163:'HIT ROYALTY',hitImmortalV163:'HIT IMMORTAL',archiveV163:'LIVING ARCHIVE',
 hoarderV163:'CARDBOARD FORTRESS',maxLevelV163:'LEVEL CAP',master5V163:'FIVE CROWNS',master10V163:'MASTER DYNASTY',masterAllV163:'TOTAL COMPLETION',
 chase5V163:'CHASE FIVE',chase15V163:'CHASE VAULT',chaseAllV163:'CHASE CONSTELLATION',slab25V163:'SLAB WALL',slab100V163:'SLAB MUSEUM',
 ten10V163:'PERFECT TEN CLUB',market50V163:'MARKET MOGUL',trade50V163:'TRADE KING',bankerV163:'FOUR FIGURES',binderLordV163:'BINDER LORD'
});

export function achievementIconFor(name){return ACHIEVEMENT_ART[String(name||'').trim()]||{art:'reward',tier:0};}
export function badgeLabelFor(id){const title=String(id||'').trim();return BADGE_NAMES[title]||title.replace(/[_-]+/g,' ');}
export function badgeIconFor(name){const title=badgeLabelFor(name);return BADGE_ART[title]||(/master set|master\s+\d+%/i.test(title)?{art:'sets',tier:4}:/league|rank|season/i.test(title)?{art:'level',tier:3}:/dealer|shop/i.test(title)?{art:'shop',tier:2}:{art:'reward',tier:1});}
export const collectorIconUrl=art=>`assets/icons/collector/${/^(pack|binder|hit|vault|arcade|level|wealth|chase|sets|slab|shop|reward|legacy)$/.test(art)?art:'reward'}.png`;

export function installProfileIconArt(doc=document,win=window){
 const profile=doc.getElementById('profile');if(!profile)return {refresh(){},dispose(){}};
 const achievementGrid=doc.getElementById('achievementGrid'),badgeGrid=doc.getElementById('badges'),observers=[];
 function equip(node,icon,config){
   if(!icon||!config)return;
   const src=collectorIconUrl(config.art);
   if(icon.dataset.customIcon===src&&icon.querySelector('img'))return;
   const img=doc.createElement('img');img.src=new URL(src,doc.baseURI).href;img.loading='lazy';img.decoding='async';img.width=72;img.height=72;img.alt='';img.setAttribute('aria-hidden','true');
   // A missing image never hides achievement text or earned state.
   img.addEventListener('error',()=>{img.hidden=true;});
   icon.replaceChildren(img);icon.dataset.customIcon=src;node.dataset.customIconTier=String(config.tier);
   node.classList.add('custom-collector-icon');
 }
 function refresh(){
   for(const node of achievementGrid?.querySelectorAll('.achievement')||[]){const name=node.querySelector('b')?.textContent;equip(node,node.querySelector('.achIcon'),achievementIconFor(name));}
   for(const node of badgeGrid?.querySelectorAll('.badge')||[]){const name=node.querySelector('b')?.textContent;equip(node,node.querySelector('i'),badgeIconFor(name));}
   for(const node of profile.querySelectorAll('#v163Milestones .v163Milestone')){
     const name=node.querySelector('b')?.textContent;
     equip(node,node.querySelector('i'),name==='Everything complete'?{art:'reward',tier:4}:achievementIconFor(name));
   }
   for(const node of profile.querySelectorAll('#v163Recent .v163Milestone'))equip(node,node.querySelector('i'),{art:'pack',tier:0});
   for(const node of profile.querySelectorAll('#v163Daily .v163DailyRow')){
     const name=node.querySelector('b')?.textContent||'';
     const icon=name.includes('HIT')?{art:'hit',tier:1}:name.includes('SELL')?{art:'shop',tier:1}:{art:'pack',tier:1};
     const label=node.querySelector('b');if(!label)continue;
     if(!label.querySelector('img')){
       const img=doc.createElement('img');img.src=new URL(collectorIconUrl(icon.art),doc.baseURI).href;img.width=28;img.height=28;img.alt='';img.loading='lazy';img.decoding='async';img.className='collector-daily-icon';
       label.textContent=label.textContent.replace(/^\S+\s+/, '');label.prepend(img);
     }
   }
   const legendArt={SET:'sets',BINDER:'binder',SPECIAL:'chase',CASH:'wealth',RANK:'level'};
   for(const span of profile.querySelectorAll('.levelRoadLegendV197 span')){
     if(span.querySelector('img'))continue;
     const label=Object.keys(legendArt).find(word=>span.textContent.includes(word));if(!label)continue;
     const img=doc.createElement('img');img.src=new URL(collectorIconUrl(legendArt[label]),doc.baseURI).href;img.width=23;img.height=23;img.alt='';img.loading='lazy';img.decoding='async';img.className='collector-legend-icon';
     span.textContent=label;span.prepend(img);
   }
   for(const node of profile.querySelectorAll('.rewardBinderIconV197')){
     if(node.querySelector('img'))continue;
     const img=doc.createElement('img');img.src=new URL(collectorIconUrl('binder'),doc.baseURI).href;img.alt='';img.loading='lazy';img.decoding='async';img.width=56;img.height=56;node.replaceChildren(img);node.classList.add('custom-collector-reward');
   }
 }
 for(const el of [achievementGrid,badgeGrid,doc.getElementById('v163Milestones'),doc.getElementById('v163Recent'),doc.getElementById('v163Daily')])if(el&&win.MutationObserver){const observer=new win.MutationObserver(refresh);observer.observe(el,{childList:true});observers.push(observer);}
 refresh();
 return {refresh,dispose(){observers.forEach(observer=>observer.disconnect());}};
}
