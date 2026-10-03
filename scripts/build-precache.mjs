import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path));else if(/\.(js|css|html|webmanifest)$/.test(path)&&entry.name!=='sw.js')out.push('./'+relative(root,path).replaceAll('\\','/'));}return out;}
const core=(await walk(root)).sort();
const worker=join(root,'sw.js');
const source=await readFile(worker,'utf8');
await writeFile(worker,source.replace(/const CORE = \[[\s\S]*?\];/, 'const CORE = '+JSON.stringify(['./',...core],null,2)+';'));
console.log('Production offline manifest: '+core.length+' resources');
