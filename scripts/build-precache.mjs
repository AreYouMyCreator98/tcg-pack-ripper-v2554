import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path));else if(/\.(js|css|html|webmanifest)$/.test(path)&&entry.name!=='sw.js')out.push('./'+relative(root,path).replaceAll('\\','/'));}return out;}
const core=(await walk(root)).sort();
const worker=join(root,'sw.js');
const source=await readFile(worker,'utf8');
const newSets=['base1','base2','base3','base5','neo1','sv08.5','sv10.5b','sv10.5w','me05','30th'];
const extras=newSets.flatMap(id=>[`./catalog/${id}.json`,`./assets/packs/${id}.webp`,`./assets/set-logos/${id}.webp`]);
await writeFile(worker,source.replace(/const CORE = \[[\s\S]*?\];/, 'const CORE = '+JSON.stringify(['./','./card-assets.json',...['theme/smoke-gold','theme/smoke-ghost','theme/smoke-vortex','packs/sv04.5','packs/swsh12.5','packs/swsh11'].map(p=>'./assets/'+p+'.webp'),...extras,'./assets/ui/card-unavailable.svg','./assets/ui/sealed-unavailable.svg',...core],null,2)+';'));
console.log('Production offline manifest: '+core.length+' resources');
