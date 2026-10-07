import {cp,mkdir,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {APP_CONFIG} from '../src/config/app-config.js';
const output=new URL('../.temp/v261-preview/',import.meta.url);
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
await cp(new URL('../dist/',import.meta.url),output,{recursive:true});
// Only the generated preview is isolated. Production account configuration and
// the production save schema remain unchanged in source and in dist.
async function isolate(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const path=join(dir,entry.name);if(entry.isDirectory()){await isolate(path);continue;}
 if(entry.name.endsWith('.map')){await rm(path);continue;}
 if(!/\.(js|html|json|webmanifest)$/.test(entry.name))continue;
 let source=await readFile(path,'utf8');
 for(const key of ['tcgRipperSave','tcgPrefsV160','tcgAudioV68','tcgAudioV67'])source=source.replaceAll(key,'tcgPreviewV261_'+key);
 source=source.replace(/tcg-pack-ripper-0\.261\.0-1/g,'tcg-pack-ripper-preview-v261-1').replace("k.startsWith('tcg-pack-ripper-')","k.startsWith('tcg-pack-ripper-preview-')");
 if(entry.name==='manifest.webmanifest'){const manifest=JSON.parse(source);manifest.name='TCG Pack Ripper+ V261 Preview';manifest.short_name='V261 Preview';source=JSON.stringify(manifest,null,2);}
 await writeFile(path,source);
}}
await isolate(output.pathname);
const bootstrap=`window.TCG_PREVIEW=true;
window.TCG_CLOUD_CONFIG=Object.freeze({});
const previewFetch=window.fetch.bind(window);
window.fetch=(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);if(url.hostname.endsWith('.supabase.co')&&!url.pathname.startsWith('/functions/v1/card-art-v239'))return Promise.reject(new Error('Online accounts are disabled in this isolated preview.'));return previewFetch(input,options);};
window.addEventListener('tcg:app-ready',()=>{const badge=document.querySelector('.silver-brand span');if(badge){badge.id='previewNotice';badge.textContent='V261 PREVIEW · LOCAL SAVE';badge.title='Separate local save. Online accounts disabled.';}});`;
await writeFile(new URL('preview-bootstrap.js',output),bootstrap);
let html=await readFile(new URL('index.html',output),'utf8');
html=html.replace('<head>','<head>\n<script src="./preview-bootstrap.js"></script>');
await writeFile(new URL('index.html',output),html);
const worker=new URL('sw.js',output);await writeFile(worker,(await readFile(worker,'utf8')).replace('const CORE = [','const CORE = ["./preview-bootstrap.js",'));
await writeFile(new URL('PREVIEW-INFO.json',output),JSON.stringify({version:APP_CONFIG.version,buildId:APP_CONFIG.buildId,branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),onlineAccounts:false,saveNamespace:'tcgPreviewV261_',liveDeployment:false},null,2));
await writeFile(new URL('serve.py',output),`from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, socket
os.chdir(Path(__file__).resolve().parent)
print('V261 isolated preview. On the same Wi-Fi, open http://YOUR-COMPUTER-LAN-IP:8080 on your phone.')
print('Use a separate HTTPS preview host to test install/offline PWA behavior. Ctrl+C stops this server.')
ThreadingHTTPServer(('0.0.0.0',8080),SimpleHTTPRequestHandler).serve_forever()
`);
await cp(new URL('../docs/v261/PHONE-PREVIEW.md',import.meta.url),new URL('README.md',output));
console.log('Isolated review build: '+output.pathname);
