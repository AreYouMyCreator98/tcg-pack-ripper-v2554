// Download documented, publicly displayed pack / set-logo source images.
// This does not imply a reuse licence from SealedDex; these are TCG fan assets.
// Source artwork is credited in docs/v264-new-sets.md.
import {mkdir,readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
const run=promisify(execFile);
const base='https://images.sealeddex.com/images/expansions/';
export const SET_ART_V264={
  base1:{pack:'base-set/base-set-pack-0.webp',logo:'base-set/base-set_Logo.webp'},
  base2:{pack:'jungle/Jungle_Booster_Flareon.webp',logo:'jungle/Jungle_Logo.webp'},
  base3:{pack:'fossil/Fossil_Booster_Zapdos.webp',logo:'fossil/Fossil_Logo.webp'},
  base5:{pack:'team-rocket/team-rocket-pack-0.webp',logo:'team-rocket/Team_Rocket_Logo.webp'},
  neo1:{pack:'neo-genesis/Neo_Genesis_Booster_Lugia.webp',logo:'neo-genesis/Neo_Genesis_Logo_EN.webp'},
  'sv08.5':{pack:'prismatic-evolutions/prismatic-evolutions-pack-0.webp',logo:'prismatic-evolutions/SV8.5_Logo_EN.webp'},
  'sv10.5b':{pack:'black-bolt/black-bolt-pack-0.webp',logo:'black-bolt/black-bolt_Logo.webp'},
  'sv10.5w':{pack:'white-flare/white-flare-pack-0.webp',logo:'white-flare/white-flare_Logo.webp'},
  me05:{pack:'pitch-black/pitch-black_pack1.webp',logo:'pitch-black/pitch-black_logo.webp'},
  '30th':{pack:'30th-celebration/30th-celebration_pack1.webp',logo:'30th-celebration/30th-celebration_logo.webp'},
};
const publicRoot=resolve(import.meta.dirname,'../public/assets');
const queue=Object.entries(SET_ART_V264).flatMap(([id,record])=>[
  {id,type:'pack',url:base+record.pack,path:join(publicRoot,'packs',id+'.webp')},
  {id,type:'logo',url:base+record.logo,path:join(publicRoot,'set-logos',id+'.webp')},
]);
async function download(item){
  await mkdir(resolve(item.path,'..'),{recursive:true});
  let url=item.url;
  try{await run('curl',['-fsSL','--max-time','20',url,'-o',item.path],{maxBuffer:2000});}
  catch(error){
    // Logos on this public site are sometimes supplied only as 256w exports.
    if(item.type!=='logo')throw Error(item.id+': missing pack image '+url+' '+error.message);
    url=item.url.replace(/\.webp$/,'-256w.webp');
    await run('curl',['-fsSL','--max-time','20',url,'-o',item.path],{maxBuffer:2000});
  }
  const bytes=await readFile(item.path);
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.length<1000)throw Error('Invalid downloaded WebP for '+item.id+'/'+item.type);
  console.log(item.id,item.type,bytes.length,url);
}
const pending=[...queue];
await Promise.all(Array.from({length:5},async()=>{while(pending.length)await download(pending.shift())}));
