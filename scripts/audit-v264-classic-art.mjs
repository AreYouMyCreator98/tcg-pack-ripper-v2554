// A read-only discovery helper for missing 30th Classic Collection images.
// TCGdex currently carries 30th-c metadata without hosting the scans.
import {readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const command=promisify(execFile);

const cards=JSON.parse(await readFile(new URL('../public/catalog/30th.json',import.meta.url)));
const classic=cards.filter(c=>c._subsetId==='30th-c');
const verify=process.argv.includes('--verify');
let cursor=0;
async function run(){
  while(cursor<classic.length){
    const c=classic[cursor++];
    try{
      if(verify){
        const {stdout}=await command('curl',['-sIL','--max-time','20',c.img]);
        const status=[...stdout.matchAll(/HTTP\/\d(?:\.\d)?\s+(\d{3})/g)].at(-1)?.[1];
        console.log(c.number,c.name,c._historicalArtId,status);
        if(status!=='200')process.exitCode=1;
      }else{
        const {stdout}=await command('curl',['-fsSL','--max-time','20','https://api.tcgdex.net/v2/en/cards?name=eq:'+encodeURIComponent(c.name)]);
        const matches=JSON.parse(stdout).filter(x=>x.image&&x.id!=='30th-c-'+c.number);
        console.log(c.number,c.name,JSON.stringify(matches.slice(0,12).map(x=>x.id)));
      }
    }catch(e){console.error(c.number,c.name,e.message);}
  }
}
await Promise.all(Array.from({length:6},run));
