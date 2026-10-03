import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../public/assets/', import.meta.url);
const out = new URL('../public/assets/manifest.json', import.meta.url);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'manifest.json') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const files = await walk(fileURLToPath(root));
const assets = [];
for (const file of files.sort()) {
  const bytes = await readFile(file);
  assets.push({
    path: relative(fileURLToPath(root), file).replaceAll('\\', '/'),
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  });
}
await writeFile(out, JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), assets }, null, 2));
console.log(`Wrote ${assets.length} assets to ${out.pathname}`);
