import { cp, mkdir, rm, copyFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const deploy = `${root}/deploy`;

await rm(deploy, { recursive: true, force: true });
await mkdir(deploy, { recursive: true });
await copyFile(`${root}/index.html`, `${deploy}/index.html`);
await cp(`${root}/public`, deploy, { recursive: true });
await mkdir(`${deploy}/src`, { recursive: true });
await cp(`${root}/src`, `${deploy}/src`, { recursive: true });
console.log(`Static deploy written to ${deploy}`);
