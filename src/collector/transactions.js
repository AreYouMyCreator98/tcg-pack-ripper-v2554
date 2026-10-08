import {transactionId} from '../utils/transaction-id.js';
import {migrateCollector,cents,journal} from './model.js';
import {contractDay,refreshContracts} from './contracts.js';
export function createTransactions(bridge,{now=()=>bridge.now?.()??Date.now(),id=transactionId}={}){
 const begin=()=>{const state=bridge.state();if(migrateCollector(state,now()))bridge.save();return state;};
 function transact(kind,payload,receipt=id()){
  const current=begin(),account=bridge.account();
  for(const key of [payload.cardId,payload.card?.id,payload.take?.id].filter(x=>x!==undefined))if(typeof key!=='string'||!key||key.length>160||['__proto__','constructor','prototype'].includes(key))throw Error('Invalid card identity.');
  if(bridge.blocked())throw Error('Finish the current pack or cloud sync before changing your collection.');
  if(payload.account!==account)throw Error('The account changed. Review this action again.');
  const signature=JSON.stringify({kind,payload});
  const existing=current.collectorV260.receipts[receipt];
  if(existing){if(existing.signature!==signature)throw Error('Transaction ID was already used.');return existing.result;}
  if(payload.revision!==current.collectorV260.revision)throw Error('Your collection changed. Review this action again.');
  const next=structuredClone(current),meta=next.collectorV260;
  const requireCard=(source,key,qty=1)=>{const box=source==='bulk'?next.bulkV64:next.binder,c=box?.[key];if(!Number.isSafeInteger(qty)||qty<1||!c||Number(c.qty)<qty)throw Error('Not enough copies remain.');if(meta.cards[key]?.locked)throw Error('Unlock this card before transferring or selling it.');return {box,c};};
  let result={kind};
  if(kind==='flag'){
   if(!['favourite','locked'].includes(payload.flag))throw Error('Unknown card preference.');
   meta.cards[payload.cardId]={...meta.cards[payload.cardId],[payload.flag]:!!payload.value};
  }else if(kind==='chase'){
   const card=payload.card;if(!card?.id||!card.name)throw Error('Choose a card.');
   const at=meta.chases.findIndex(c=>c.id===card.id);if(at>=0)meta.chases.splice(at,1);else{if(meta.chases.length>=3)throw Error('Unpin a chase first. You can keep three.');meta.chases.push({id:card.id,name:card.name,setId:card.setId,set:card.set,thumb:card.thumb,img:card.img,rarity:card.rarity,number:card.number});}
  }else if(kind==='move'||kind==='sell'){
   const {box,c}=requireCard(payload.source,payload.cardId,payload.qty);
   if(Number(c.qty)!==payload.owned)throw Error('The number of copies changed. Review this action again.');
   if(kind==='sell'){
    const unit=cents(bridge.price(c));if(unit!==payload.unitCents||unit<1)throw Error('The price changed. Review the sale again.');
    const total=unit*payload.qty;if(!Number.isSafeInteger(total))throw Error('Invalid sale value.');
    next.coins=(cents(next.coins)+total)/100;meta.stats.sales=(meta.stats.sales||0)+payload.qty;result={kind,total,qty:payload.qty};
    journal(next,{id:receipt,kind:'sale',title:`Sold ${payload.qty} × ${c.name}`,value:total/100});
   }else{
    if(payload.source==='bulk'&&bridge.canBinder&&!bridge.canBinder(c))throw Error('Regular ex cards stay in Bulk under the current collection rules.');
    const target=payload.source==='bulk'?'binder':'bulkV64';next[target]??={};const dest=next[target][payload.cardId];next[target][payload.cardId]={...c,qty:Number(dest?.qty||0)+payload.qty,...(target==='binder'?{manualBinder:true,manualBulk:false}:{manualBulk:true,manualBinder:false})};
   }
   c.qty-=payload.qty;if(!c.qty)delete box[payload.cardId];
  }else if(kind==='bulkSale'){
   if(!Array.isArray(payload.lines)||!payload.lines.length)throw Error('No cards selected.');
   let total=0;const seen=new Set();
   for(const line of payload.lines){const {c}=requireCard('bulk',line.id,line.qty);if(seen.has(line.id)||Number(c.qty)!==line.owned||cents(bridge.price(c))!==line.unitCents||line.unitCents<1||(payload.keepOne&&line.qty>=c.qty))throw Error('Bulk sale changed. Review it again.');seen.add(line.id);total+=line.qty*line.unitCents;}
   if(!Number.isSafeInteger(total)||total!==payload.total)throw Error('Sale total changed.');
   for(const line of payload.lines){next.bulkV64[line.id].qty-=line.qty;if(!next.bulkV64[line.id].qty)delete next.bulkV64[line.id];}
   next.coins=(cents(next.coins)+total)/100;result={copies:payload.lines.reduce((n,l)=>n+l.qty,0),total};meta.stats.sales=(meta.stats.sales||0)+result.copies;
   journal(next,{id:receipt,kind:'sale',title:'Bulk delivery · '+result.copies+' cards',value:total/100});
  }else if(kind==='sealed'){
   const key=payload.productId,p=bridge.sealedProduct?.(key),store=next.sealedV161;
   if(typeof key!=='string'||!key.includes('|')||!store?.inventory)throw Error('Unknown sealed product.');
   const qty=Number(store.inventory[key]||0),shown=Number(store.display?.[key]||0);
   if(!Number.isSafeInteger(qty)||qty<0||!Number.isSafeInteger(shown)||shown<0)throw Error('Invalid sealed quantity.');
   if(qty!==payload.owned||shown!==payload.displayed)throw Error('Sealed inventory changed. Review again.');
   const action=payload.action;store.display??={};
   meta.sealed??={favourites:{},order:[]};meta.sealed.favourites??={};meta.sealed.order??=[];
   if(action==='favourite')meta.sealed.favourites[key]=!meta.sealed.favourites[key];
   else if(action==='display'){
    if(qty<1)throw Error('You do not own this product.');
    if(shown>0)delete store.display[key];
    else {if(Object.entries(store.display).reduce((a,[k,n])=>a+(Number(store.inventory[k]||0)>0?Number(n||0):0),0)>=12)throw Error('Your shelf is full. Remove a product first.');store.display[key]=1;}
   }else if(action==='reorder'){
    if(!shown||![-1,1].includes(payload.direction))throw Error('Choose a displayed product.');
    const keys=[...new Set([...meta.sealed.order,...Object.keys(store.display)])].filter(k=>store.display[k]>0);
    const at=keys.indexOf(key),to=at+payload.direction;if(to>=0&&to<keys.length)[keys[at],keys[to]]=[keys[to],keys[at]];meta.sealed.order=keys;
   }else {
    if(!p||!Number.isFinite(p.marketValue)||p.marketValue<=0||!Number.isSafeInteger(p.packCount)||p.packCount<1)throw Error('Product information unavailable.');
    const unit=cents(p.marketValue);if(unit!==payload.unitCents)throw Error('The price changed. Review again.');
    let value=p.marketValue;
    if(action==='buy'){
     if(!p.unlocked)throw Error('Unlock this set before buying.');
     if(cents(next.coins)<unit)throw Error('Not enough cash.');
     next.coins=(cents(next.coins)-unit)/100;store.inventory[key]=qty+1;
    }else {
     if(qty<1||qty<=shown)throw Error('Remove a copy from your shelf first.');
     if(action==='open'){store.packCredits??={};store.packCredits[p.setId]=Number(store.packCredits[p.setId]||0)+p.packCount;}
     else if(action==='sell'){value=Math.round(unit*.88)/100;next.coins=(cents(next.coins)+cents(value))/100;}
     else throw Error('Unknown sealed action.');
     store.inventory[key]=qty-1;if(!store.inventory[key]){delete store.inventory[key];delete store.display[key];}
    }
    store.history??=[];store.history.unshift({time:now(),type:action,setId:p.setId,pid:p.legacyType,price:value,...(action==='open'?{packs:p.packCount}:{})});store.history=store.history.slice(0,30);
    journal(next,{id:receipt,kind:'sealed',title:`${action==='open'?'Opened':action==='buy'?'Bought':'Sold'} ${p.setName} · ${p.name}`,value});
    result={kind,action,productId:key,packCount:p.packCount,value};
   }
  }else if(kind==='districtPurchase'){
   const district=meta.district,offer=district?.offers?.[payload.key],day=contractDay(next,now());
   if(!offer||district.day!==payload.day||day!==payload.day||district.used[payload.key])throw Error('This daily offer is no longer available.');
   const price=payload.costCents;if(!Number.isSafeInteger(price)||price<offer.minCents||price>offer.maxCents||price<1)throw Error('The asking price changed.');
   if(cents(next.coins)<price)throw Error('Not enough cash.');
   if(!offer.cards?.length)throw Error('No cards are available in this offer.');
   for(const card of offer.cards){const target=bridge.route?.(card)==='bulk'?'bulkV64':'binder';next[target]??={};next[target][card.id]={...card,qty:Number(next[target][card.id]?.qty||0)+1};}
   next.coins=(cents(next.coins)-price)/100;district.used[payload.key]=true;next.shopV84??={};next.shopV84.deals=Number(next.shopV84.deals||0)+1;
   meta.stats.purchases=(meta.stats.purchases||0)+1;
   if(meta.shopXP?.day!==day)meta.shopXP={day,earned:0};const xp=Math.min(10,100-meta.shopXP.earned);next.xp=Number(next.xp||0)+xp;meta.shopXP.earned+=xp;
   journal(next,{id:receipt,kind:'purchase',title:offer.title||'District collection purchased',value:price/100});result={kind,copies:offer.cards.length,price};
  }else if(kind==='shopProgress'){
   const day=contractDay(next,now());if(meta.shopXP?.day!==day)meta.shopXP={day,earned:0};const xp=Math.max(0,Math.min(10,100-meta.shopXP.earned));meta.shopXP.earned+=xp;next.xp=Number(next.xp||0)+xp;
   next.shopV84??={};next.shopV84.ledger??=[];next.shopV84.ledger.unshift({t:now(),msg:String(payload.message||'Collector deal')});next.shopV84.ledger=next.shopV84.ledger.slice(0,20);
  }else if(kind==='npcTrade'){
   const {box,c}=requireCard('binder',payload.cardId,1),take=payload.take;
   if(Number(c.qty)!==payload.owned||!take?.id||take.id===c.id||!take.name||!Number.isFinite(Number(take.market)))throw Error('The offer changed. Review it again.');
   next.tradeV154??={accepted:{},count:0};next.tradeV154.accepted??={};
   if(next.tradeV154.accepted[payload.offerId])throw Error('This trade was already completed.');
   c.qty--;if(!c.qty)delete box[payload.cardId];
   next.binder[take.id]={...take,qty:Number(next.binder[take.id]?.qty||0)+1};
   next.tradeV154.accepted[payload.offerId]=now();next.tradeV154.count=Number(next.tradeV154.count||0)+1;
   next.masterV57??={seen:{},claimed:{}};next.masterV57.seen??={};next.masterV57.seen[take.id]={id:take.id,setId:take.setId||'',set:take.set||''};
   const day=contractDay(next,now());if(meta.tradeXP?.day!==day)meta.tradeXP={day,count:0};if(meta.tradeXP.count<10){meta.tradeXP.count++;next.xp=Number(next.xp||0)+10;}
   journal(next,{id:receipt,kind:'trade',title:c.name+' → '+take.name});
  }else if(kind==='grade'){
   const {box,c}=requireCard(payload.source,payload.cardId,1);
   if(Number(c.qty)!==payload.owned)throw Error('Your copies changed.');
   const tiers={standard:{name:'Standard',fee:1200,packs:5},priority:{name:'Priority',fee:2500,packs:3},express:{name:'Express',fee:4500,packs:1}},tier=tiers[payload.tier];
   if(!tier)throw Error('Choose a grading service.');if(cents(next.coins)<tier.fee)throw Error('Not enough cash for this grading service.');
   const condition=c.conditionV161||bridge.condition(c);if(Object.keys(condition||{}).length!==4)throw Error('Card condition unavailable.');
   next.gradingV44??={submissions:[],graded:[],openedForGrading:0};
   next.gradingV44.submissions.push({uid:'V260-'+receipt,id:c.id,name:c.name,set:c.set,setId:c.setId,number:c.number,finish:c.finish,rarity:c.rarity,thumb:c.thumb||c.img,raw:c.market||.1,condition:structuredClone(condition),startOpen:next.gradingV44.openedForGrading||0,dueOpen:tier.packs,tier:tier.name,v47:true,collectorV260:true,phase:'grading',historyV161:[...(c.historyV161||[]),{time:now(),label:'Submitted for grading'}]});
   next.coins=(cents(next.coins)-tier.fee)/100;c.qty--;if(!c.qty)delete box[payload.cardId];
   result={kind,fee:tier.fee,packs:tier.packs};
  }else if(kind==='sellSlab'){
   const index=(next.gradingV44?.graded||[]).findIndex(s=>s.uid===payload.uid),slab=next.gradingV44?.graded[index];
   if(!slab||meta.cards[slab.id]?.locked)throw Error('This slab is unavailable or locked.');
   const value=cents(bridge.slabValue(slab));if(value!==payload.unitCents)throw Error('Slab price changed. Review the sale again.');
   next.gradingV44.graded.splice(index,1);next.coins=(cents(next.coins)+value)/100;meta.stats.sales=(meta.stats.sales||0)+1;
   journal(next,{id:receipt,kind:'sale',title:'Sold slab · '+slab.name,value:value/100});
  }else if(kind==='contract'){
   const day=contractDay(next,now());refreshContracts(next,day);const contract=meta.contracts[payload.contractId];
   if(!contract||contract.expires<=day||contract.claimed)throw Error('This contract has expired or was completed.');
   for(const line of contract.lines){const {c}=requireCard('bulk',line.id,line.qty);if(c.qty<=line.qty)throw Error('Contracts keep one copy. Collect more duplicates first.');}
   for(const line of contract.lines){next.bulkV64[line.id].qty-=line.qty;}
   contract.claimed=true;next.coins=(cents(next.coins)+contract.cashCents)/100;next.xp=Number(next.xp||0)+contract.xp;meta.stats.contracts=(meta.stats.contracts||0)+1;
   journal(next,{id:receipt,kind:'contract',title:contract.title+' completed',value:contract.cashCents/100});result={kind,cash:contract.cashCents/100,xp:contract.xp};
  }else if(kind==='masterPlus'){
   const {setId,tier}=payload,total=bridge.totals()[setId],threshold={graded:1,elite:8,perfect:10}[tier];
   if(!threshold||!total?.total||total.owned.size<total.total)throw Error('Complete the normal Master Set first.');
   const count=new Set((next.gradingV44?.graded||[]).filter(c=>c.setId===setId&&Number(c.grade)>=threshold).map(c=>c.id)).size;
   if(count<total.total)throw Error('Complete this grading collection first.');
   meta.masterPlus??={};const key=setId+':'+tier;if(meta.masterPlus[key])throw Error('Reward already collected.');meta.masterPlus[key]=true;
   meta.titles??=[];meta.titles.push((tier==='perfect'?'Perfect Master':tier==='elite'?'Elite Master':'Graded Master')+' · '+total.name);
   next.badges??={};next.badges['masterplus_'+setId+'_'+tier]=true;
   journal(next,{id:receipt,kind:'master',title:total.name+' Master Set+ · '+tier});
  }else if(kind==='master'){
   const {setId,milestone}=payload;if(![25,50,75,90,100].includes(milestone))throw Error('Unknown milestone.');
   const total=bridge.totals()[setId],key=`${setId}:${milestone}`;
   if(!total?.total||total.owned.size/total.total*100<milestone)throw Error('Complete this milestone first.');
   if(meta.masterRewards[key])throw Error('Reward already collected.');
   meta.masterRewards[key]=true;meta.cosmetics??={};meta.cosmetics[key]=true;
   if(milestone===25){next.coins=(cents(next.coins)+2500)/100;next.xp=Number(next.xp||0)+150;}
   if(milestone===90){meta.titles??=[];const title=total.name+' Master';if(!meta.titles.includes(title))meta.titles.push(title);}
   if(milestone>=50){next.badges??={};next.badges[`master_${setId}_${milestone}`]=true;}
   journal(next,{id:receipt,kind:'master',title:`${total.name} · ${milestone}% Master Set`});
  }else throw Error('Unknown transaction.');
  if(!Number.isFinite(next.coins)||next.coins<0)throw Error('Invalid balance.');
  meta.revision++;meta.receipts[receipt]={signature,result};
  // Receipts remain bounded; durable contract/master claim markers prevent replay
  // after receipt pruning. Inventory review protects ordinary sale replays.
  const keys=Object.keys(meta.receipts);for(const key of keys.slice(0,Math.max(0,keys.length-500)))delete meta.receipts[key];
  if(bridge.account()!==account||bridge.state()!==current)throw Error('The account changed.');
  bridge.commit(next);return result;
 }
 return {transact,review:()=>({account:bridge.account(),revision:begin().collectorV260.revision})};
}
