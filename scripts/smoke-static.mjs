import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, relative, isAbsolute } from 'node:path';

const production = process.argv.includes('--production');
const root = fileURLToPath(new URL(production ? '../dist/' : '../deploy/', import.meta.url));
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  try {
    const raw = new URL(req.url, 'http://localhost').pathname;
    let path = normalize(join(root, raw === '/' ? 'index.html' : raw));
    const relativePath = relative(root, path);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) throw new Error('bad path');
    const s = await stat(path);
    if (s.isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}/`;
const staticChecks = [
  '', 'src/main.js', 'src/config/app-config.js', 'src/app/runtime-loader.js', 'src/app/health-check.js',
  'src/artwork/index.js', 'src/artwork/artwork-cache.js', 'src/artwork/artwork-db.js', 'src/artwork/artwork-resolver.js', 'src/artwork/artwork-queue.js', 'src/artwork/card-identity.js',
  'src/screens/binder/index.js', 'src/screens/binder/binder-renderer.js', 'src/screens/binder/binder-inspector.js', 'src/screens/binder/binder-model.js', 'src/screens/binder/binder-status.js', 'src/screens/binder/binder-bridge.js',
  'src/systems/binder.js', 'src/systems/packs.js', 'src/systems/rank-frame-renderer.js',
  'src/packs/index.js', 'src/packs/pack-engine.js', 'src/packs/pack-generator.js', 'src/packs/pack-results.js', 'src/packs/pack-session.js', 'src/packs/pack-history.js', 'src/packs/pack-costs.js', 'src/packs/pack-hud.js',
  'src/animations/packs/reveal-profile.js', 'src/animations/packs/reveal-controller.js', 'src/animations/packs/ten-pack-controller.js', 'src/animations/packs/pack-summary.js',
  'runtime/core.js', 'runtime/progression.js', 'runtime/special-collection.js', 'runtime/packs.js', 'runtime/pack-bridge.js', 'runtime/binder-bridge.js',
  'runtime/multiplayer.js', 'runtime/rank-frames.js', 'runtime/ranked.js',
  'styles/core.css', 'styles/pack-v253.css', 'styles/binder.css', 'ui/chrome.html', 'ui/screens/rip.html', 'ui/screens/binder.html',
  'assets/manifest.json', 'manifest.webmanifest', 'sw.js'
];
const checks = production
  ? [...new Set(['', 'sw.js', ...JSON.parse((await readFile(join(root, 'sw.js'), 'utf8')).match(/const CORE = (\[[\s\S]*?\]);/)[1])])]
  : staticChecks;
try {
  for (const path of checks) {
    const response = await fetch(base + path);
    if (!response.ok) throw new Error(`${path || 'index.html'} -> ${response.status}`);
  }
  console.log(`${production ? 'Production' : 'Static'} smoke OK (${checks.length} resources)`);
} finally {
  server.close();
}
