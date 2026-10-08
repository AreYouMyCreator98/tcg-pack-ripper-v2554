// Competitive-only derived layer. Never write these fields to owned collection cards.
export const RULES=Object.freeze({version:1,budget:100,squad:5,active:3,bench:2,turnSeconds:12,draftSeconds:45,maxTurns:20,knockouts:3});
export const TYPES=['fire','water','grass','lightning','fighting','psychic','darkness','metal','colorless'];
export const ABILITIES=['blaze','guard','quick_strike','heal','piercing','counter','disrupt'];
export function identityHash(id){let n=0;for(const c of String(id))n=(n*31+c.charCodeAt(0))%1000003;return n;}
export function battleStats(card){
 const hash=identityHash(card.id),tier=Math.max(0,Math.min(5,Number(card.tier)||0)),role=hash%5;
 const source=String(card.types?.[0]||card.type||'').toLowerCase(),type=TYPES.includes(source)?source:TYPES[hash%TYPES.length];
 const hp=Number(card.hp),hpBonus=Number.isFinite(hp)&&hp>0?Math.min(8,Math.floor(hp/50)):0;
 return {power:25+(hash%7)+Math.min(3,tier)+(role===0?4:0),defense:8+((hash>>2)%5)+(role===1?5:0),speed:12+((hash>>3)%9)+(role===3?6:0),max_hp:82+((hash>>4)%17)+hpBonus+(role===1?14:0),ability:ABILITIES[hash%ABILITIES.length],cost:/uncommon/i.test(card.rarity)?12:[10,16,20,24,28,30][tier],type,type_source:TYPES.includes(source)?'source':'derived-affinity',role:['attacker','tank','support','speed','control'][role]};
}
export function squadBudget(cards){return Math.max(RULES.budget,cards.map(c=>battleStats(c).cost).sort((a,b)=>a-b).slice(0,5).reduce((n,c)=>n+c,0));}
export function validateDraft(cards,indices){if(!Array.isArray(indices)||indices.length!==5||new Set(indices).size!==5||indices.some(i=>!Number.isInteger(i)||i<0||i>=cards.length))throw Error('Choose five different pulled card instances.');const cost=indices.reduce((n,i)=>n+battleStats(cards[i]).cost,0);if(cost>squadBudget(cards))throw Error('Squad exceeds this pack’s budget.');return cost;}
export function typeMultiplier(a,b){const advantage={fire:'grass',grass:'water',water:'fire',lightning:'water',fighting:'lightning',psychic:'fighting',darkness:'psychic',metal:'darkness'};return advantage[a]===b?1.2:advantage[b]===a?.85:1;}
export function ratingDelta(rp,opponent,result){if(result===.5)return 0;const expected=1/(1+10**((opponent-rp)/400));return result===1?Math.max(12,Math.min(28,Math.round(40*(1-expected)))):-Math.max(10,Math.min(24,Math.round(40*expected)));}
export function competitiveRank(rp){return [...[{id:'bronze',name:'Bronze',min:0},{id:'silver',name:'Silver',min:250},{id:'gold',name:'Gold',min:450},{id:'platinum',name:'Platinum',min:700},{id:'diamond',name:'Diamond',min:1000},{id:'master',name:'Master',min:1400},{id:'apex',name:'Grandmaster',min:1900}]].reverse().find(r=>rp>=r.min);}
