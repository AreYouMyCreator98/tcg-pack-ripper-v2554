// Ranked-only battle state. Printed card metadata is never written to owned saves.
export const RULES=Object.freeze({version:2,budget:100,squad:5,active:3,bench:2,turnSeconds:25,draftSeconds:45,maxTurns:20,knockouts:3});
export const TYPES=['fire','water','grass','lightning','fighting','psychic','darkness','metal','colorless'];
export const ABILITIES=['heal','guard','focus'];
export function identityHash(id){let n=0;for(const c of String(id))n=(n*31+c.charCodeAt(0))%1000003;return n;}
const numberFromPrint=value=>{const match=String(value??'').match(/^\s*(\d{1,4})/);return match?Math.min(400,Number(match[1])):0;};
const printType=t=>String(t||'').toLowerCase();
export function battleMoves(card){
 const attacks=Array.isArray(card?.attacks)?card.attacks.slice(0,3):[];
 return attacks.length?attacks.map(a=>({name:String(a.name||'Attack').slice(0,60),damage:numberFromPrint(a.damage)||10,energy:Math.min(4,Math.max(0,a.cost?.length||0)),effect:String(a.effect||'').slice(0,550),printed:true})):[{name:'Collector Strike',damage:28,energy:1,effect:'Standard League move. No printed attack metadata available for this card.',printed:false}];
}
export function battleStats(card){
 const tier=Math.max(0,Math.min(5,Number(card.tier)||0));
 const source=printType(card.types?.[0]||card.type),type=TYPES.includes(source)?source:'colorless';
 const printedHp=Number(card.hp),max_hp=Number.isFinite(printedHp)&&printedHp>=30&&printedHp<=500?Math.round(printedHp):90;
 const moves=battleMoves(card),printedAbility=card.abilities?.[0],abilityText=String(printedAbility?.effect||'');
 const ability=printedAbility?(/heal|remove \d+ damage/i.test(abilityText)?'heal':/prevent|protect|reduce damage|shield/i.test(abilityText)?'guard':'focus'):'none';
 const weakness=printType(card.weaknesses?.[0]?.type),resistance=printType(card.resistances?.[0]?.type);
 const role=ability==='heal'?'support':max_hp>=180?'tank':type==='lightning'?'speed':'attacker';
 return {power:moves[0].damage+Math.min(3,tier),defense:0,speed:type==='lightning'?24:20,max_hp,ability,ability_name:printedAbility?.name||'',ability_text:abilityText.slice(0,550),cost:/uncommon/i.test(card.rarity)?12:[10,16,20,24,28,30][tier],type,type_source:TYPES.includes(source)?'source':'neutral',role,moves,weakness:TYPES.includes(weakness)?weakness:'',resistance:TYPES.includes(resistance)?resistance:''};
}
export function squadBudget(cards){return Math.max(RULES.budget,cards.map(c=>battleStats(c).cost).sort((a,b)=>a-b).slice(0,5).reduce((n,c)=>n+c,0));}
export function validateDraft(cards,indices){if(!Array.isArray(indices)||indices.length!==5||new Set(indices).size!==5||indices.some(i=>!Number.isInteger(i)||i<0||i>=cards.length))throw Error('Choose five different pulled card instances.');const cost=indices.reduce((n,i)=>n+battleStats(cards[i]).cost,0);if(cost>squadBudget(cards))throw Error('Squad exceeds this pack’s budget.');return cost;}
export function typeMultiplier(a,b,weakness='',resistance=''){if(a===weakness)return 2;if(a===resistance)return .5;const advantage={fire:'grass',grass:'water',water:'fire',lightning:'water',fighting:'lightning',psychic:'fighting',darkness:'psychic',metal:'darkness'};return advantage[a]===b?1.2:advantage[b]===a?.85:1;}
export function ratingDelta(rp,opponent,result){if(result===.5)return 0;const expected=1/(1+10**((opponent-rp)/400));return result===1?Math.max(12,Math.min(28,Math.round(40*(1-expected)))):-Math.max(10,Math.min(24,Math.round(40*expected)));}
export function competitiveRank(rp){return [...[{id:'bronze',name:'Bronze',min:0},{id:'silver',name:'Silver',min:250},{id:'gold',name:'Gold',min:450},{id:'platinum',name:'Platinum',min:700},{id:'diamond',name:'Diamond',min:1000},{id:'master',name:'Master',min:1400},{id:'apex',name:'Grandmaster',min:1900}]].reverse().find(r=>rp>=r.min);}
