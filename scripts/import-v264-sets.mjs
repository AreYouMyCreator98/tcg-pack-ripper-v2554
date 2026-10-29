// Import only the ten reviewed V264 expansions from a local checkout of
// https://github.com/tcgdex/cards-database. Never execute the source .ts files.
// Usage: node scripts/import-v264-sets.mjs /path/to/cards-database
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';

export const V264_SETS = Object.freeze([
  {id:'base1',name:'Base Set — 1st Edition',series:'base',dir:'Base/Base Set',count:102},
  {id:'base2',name:'Jungle',series:'base',dir:'Base/Jungle',count:64},
  {id:'base3',name:'Fossil',series:'base',dir:'Base/Fossil',count:62},
  {id:'base5',name:'Team Rocket',series:'base',dir:'Base/Team Rocket',count:83},
  {id:'neo1',name:'Neo Genesis',series:'neo',dir:'Neo/Neo Genesis',count:111},
  {id:'sv08.5',name:'Prismatic Evolutions',series:'sv',dir:'Scarlet & Violet/Prismatic Evolutions',count:180},
  {id:'sv10.5b',name:'Black Bolt',series:'sv',dir:'Scarlet & Violet/Black Bolt',count:172},
  {id:'sv10.5w',name:'White Flare',series:'sv',dir:'Scarlet & Violet/White Flare',count:173},
  {id:'me05',name:'Pitch Black',series:'me',dir:'Mega Evolution/Pitch Black',count:120},
  {id:'30th',name:'30th Celebration',series:'me',dir:'Mega Evolution/30th Celebration',count:158},
]);
const CLASSIC_SUBSET={id:'30th-c',parent:'30th',name:'30th Classic Collection',series:'me',dir:'Mega Evolution/30th Classic Collection',count:30};
// TCGdex has 30th-c metadata but its image CDN currently returns 404 for
// that subset. These IDs resolve to actual historical prints, matching the
// reprinted card identities. Never substitute the unrelated 30th main-set art.
const CLASSIC_REPRINT_ART={
  '001':'base1-4','002':'ex1-5','003':'ex5-11','004':'xy10-64','005':'gym1-18',
  '006':'neo4-11','007':'neo1-25','008':'sm9-33','009':'xy9-41','010':'dp2-18',
  '011':'pl1-47','012':'neo3-13','013':'sm4-57','014':'base1-58','015':'gym2-69',
  '016':'xy6-60','017':'sm1-89','018':'base3-5','019':'hgss4-99','020':'hgss4-100',
  '021':'bw3-92','022':'dp1-11','023':'xy11-79','024':'neo4-106','025':'ex10-108',
  '026':'swsh8-114','027':'swsh9-123','028':'swsh1-138','029':'neo1-9','030':'base1-35'
};
const sourceRoot=resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Pass the checked-out TCGdex cards-database directory.');
const root=resolve(import.meta.dirname,'..');
const outPublic=join(root,'public/catalog'),outBackend=join(root,'supabase/catalog');
const sourceLink='https://github.com/tcgdex/cards-database/blob/master/data/';

function literal(text,key){
  const match=text.match(new RegExp('\\b'+key+'\\s*:\\s*("(?:[^"\\\\]|\\\\.)*")'));
  return match?JSON.parse(match[1]):null;
}
function englishName(source){
  const block=source.match(/\bname\s*:\s*\{([\s\S]*?)\}/);
  return block?literal(block[1],'en'):null;
}
function tier(name,rarity){
  const x=(name+' '+rarity).toLowerCase();
  if(/mega hyper|hyper|secret|rainbow|gold rare|black white rare/.test(x))return 5;
  if(/classic collection|special illustration|shiny ultra|futuristic rare/.test(x))return 4;
  if(/illustration|shiny rare|rare shiny|ultra rare|radiant|trainer gallery|vmax|vstar|pikachu rare/.test(x))return 3;
  if(/double rare|ace spec|\bex\b|\bgx\b/.test(x))return 2;
  if(/rare|holo/.test(x))return 1;
  return 0;
}
// These are modest, deterministic GAME ECONOMY estimates, not advertised real-
// world card prices. Live card pricing can replace them when TCGdex provides it.
const GAME_VALUES=[.15,.8,4,11,26,48];
function gameValue(id,rank){
  if(id==='base1-4')return 450;
  return GAME_VALUES[rank];
}
async function readSet(set){
  const folder=join(sourceRoot,'data',set.dir),files=(await readdir(folder)).filter(file=>/^\d+\.ts$/.test(file));
  const cards=[];
  for(const file of files){
    const text=await readFile(join(folder,file),'utf8');
    const name=englishName(text),sourceRarity=literal(text,'rarity'),number=file.slice(0,-3);
    if(!name||!sourceRarity)throw Error('Missing card name/rarity: '+set.dir+'/'+file);
    const isVintage=['base','neo'].includes(set.series);
    const holo=isVintage&&/\btype:\s*["']holo["']/.test(text);
    const rarity=(set.id==='30th-c')?'Classic Collection':holo&&sourceRarity==='Rare'?'Rare Holo':sourceRarity;
    const firstEdition=set.id==='base1'&&/stamp:\s*\[\s*["']1st-edition["']/.test(text);
    let image='https://assets.tcgdex.net/en/'+set.series+'/'+set.id+'/'+number;
    const origin=set.id==='30th-c'?CLASSIC_REPRINT_ART[number]:null;
    if(set.id==='30th-c'){
      if(!origin)throw Error('No historical image reference for '+number);
      const divider=origin.lastIndexOf('-'),originSet=origin.slice(0,divider),originNumber=origin.slice(divider+1),originSeries=originSet.match(/^[a-z]+/)[0];
      image=`https://assets.tcgdex.net/en/${originSeries}/${originSet}/${originNumber}`;
    }
    const id=set.id+'-'+number;
    const card={id,name,number,set:set.parent?V264_SETS.find(s=>s.id===set.parent).name:set.name,setId:set.parent||set.id,rarity,img:image+'/high.webp',thumb:image+'/low.webp'};
    if(firstEdition){card.edition='1st Edition';card.firstEdition=true;}
    if(origin){card._historicalArtId=origin;card._historicalArtNote='Historical original print: anniversary-stamped scan not yet available';}
    if(set.parent){card._subsetId=set.id;card._subsetName=set.name;card._parentSetId=set.parent;}
    const rank=Math.max(set.parent?4:0,holo?3:0,tier(name,rarity));
    const backend={id,set_id:set.parent||set.id,tier:rank,metadataSource:sourceLink+set.dir+'/'+file,card:{...card,market:gameValue(id,rank),qty:1}};
    cards.push({card:backend.card,backend});
  }
  cards.sort((a,b)=>Number(a.card.number)-Number(b.card.number));
  if(cards.length!==set.count)throw Error(set.id+': expected '+set.count+', found '+cards.length);
  return cards;
}
await mkdir(outPublic,{recursive:true});await mkdir(outBackend,{recursive:true});
let total=0;
for(const set of V264_SETS){
  const rows=await readSet(set);
  if(set.id==='30th')rows.push(...await readSet(CLASSIC_SUBSET));
  const seen=new Set();
  for(const row of rows){
    if(seen.has(row.card.id))throw Error('Duplicate card '+row.card.id);
    seen.add(row.card.id);
  }
  await writeFile(join(outPublic,set.id+'.json'),JSON.stringify(rows.map(r=>r.card))+'\n');
  await writeFile(join(outBackend,set.id+'.json'),JSON.stringify(rows.map(r=>r.backend),null,2)+'\n');
  console.log(set.id+' '+set.name+': '+rows.length+' cards');
  total+=rows.length;
}
await writeFile(join(outBackend,'v264-provenance.json'),JSON.stringify({source:'https://github.com/tcgdex/cards-database',revision:'Checked-out local source',note:'Only literal public card names, rarities, first-edition flags, IDs and TCGdex asset links imported. Prices are game-economy estimates, not real trading card valuations; player saves are never changed.',sets:V264_SETS.map(s=>s.id),cards:total},null,2)+'\n');
console.log('V264 complete:',V264_SETS.length,'expansions,',total,'cards');
