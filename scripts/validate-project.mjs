import { fileURLToPath } from 'node:url';
import { access, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const required = [
  'index.html','src/main.js','src/config/app-config.js','src/state/save-schema.js','src/app/health-check.js',
  'src/artwork/index.js','src/artwork/artwork-cache.js','src/artwork/artwork-db.js','src/artwork/artwork-resolver.js',
  'src/screens/binder/index.js','src/screens/binder/binder-renderer.js','src/screens/binder/binder-inspector.js','src/systems/binder.js',
  'src/packs/index.js','src/packs/pack-engine.js','src/packs/pack-session.js','src/packs/pack-results.js','src/systems/packs.js',
  'src/animations/packs/reveal-controller.js','src/animations/packs/reveal-profile.js',
  'public/runtime/core.js','public/runtime/packs.js','public/runtime/progression.js','public/runtime/pack-bridge.js','public/runtime/binder-bridge.js',
  'public/runtime/profile-extras.js','src/trade-hub/index.js','public/manifest.webmanifest','public/sw.js','public/assets/manifest.json'
];
let failed = false;
for (const file of required) {
  try { await access(join(root, file)); }
  catch { console.error(`Missing required file: ${file}`); failed = true; }
}
const runtimeFiles = ['core','packs','progression','profile-extras','hub-bridge','rank-frames','special-collection','pack-bridge','binder-bridge'];
for (const name of runtimeFiles) {
  const path = join(root, `public/runtime/${name}.js`);
  try {
    const text = await readFile(path, 'utf8');
    const giantDataUri = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100000,}/i.test(text);
    if (giantDataUri) { console.error(`Large embedded base64 image found in ${name}.js`); failed = true; }
    const s = await stat(path);
    if (s.size > 2_000_000) { console.error(`Runtime chunk unexpectedly large: ${name}.js (${s.size})`); failed = true; }
  } catch (error) { console.error(error); failed = true; }
}
if (failed) process.exit(1);
console.log('Project integrity OK');
