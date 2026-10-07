import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2).filter(x=>x!=='--');
const result=spawnSync('python3',['scripts/cards/pipeline.py',...args],{stdio:'inherit'});
if(result.error)console.error(result.error.message);
process.exit(result.status??1);
