const VERSION = 'tcg-pack-ripper-0.262.5-league1';
const STATIC = `${VERSION}-static`;
const ART_LIMITS={thumb:1000,medium:300,high:100};
const ART_NAMES=Object.fromEntries(Object.keys(ART_LIMITS).map(q=>[q,`${VERSION}-cards-${q}`]));
const MEDIA = `${VERSION}-media`;
const CORE = ['./src/league/index.js','./src/league/controller.js','./src/league/view.js','./src/league/rules.js','./src/league/banner.js','./styles/league.css','./src/sealed/index.js','./src/sealed/model.js','./src/sealed/assets.js','./styles/sealed-vault.css','./assets/ui/sealed-unavailable.svg','./styles/launch-cinematic.css','./assets/theme/smoke-gold.webp','./assets/theme/smoke-ghost.webp','./assets/theme/smoke-vortex.webp','./assets/packs/sv04.5.webp','./assets/packs/swsh12.5.webp','./assets/packs/swsh11.webp',
  './card-assets.json','./assets/ui/card-unavailable.svg',
  './styles/collector-v261.css','./src/screens/rip/silver-shell.js','./src/screens/rip/silver-model.js',
  './src/packs/compact-recap.js','./src/artwork/card-image.js',
  './src/utils/transaction-id.js','./src/collector/district.js','./src/collector/clock.js','./src/collector/notifications.js','./src/collector/catalog-counts.js','./src/collector/collection.js','./src/collector/contracts.js','./src/collector/inspector.js','./src/collector/index.js','./src/collector/transactions.js','./src/collector/model.js','./runtime/collector-bridge.js',
  './src/app/collector-navigation.js','./styles/collector-v260.css',
  './runtime/supabase.js','./src/app/settings-overlay.js',
  './styles/collector-studio.css','./styles/collector-cinematics.css','./src/screens/rip/index.js','./src/screens/binder/studio.js','./src/animations/packs/cinematic-profile.js',
  './styles/profile-studio.css','./runtime/profile-bridge.js','./src/screens/profile/index.js','./src/screens/profile/model.js',
  './styles/bulk.css','./runtime/bulk-bridge.js','./src/screens/bulk/index.js','./src/screens/bulk/model.js',
  './','./index.html','./src/main.js','./src/trade-hub/index.js','./src/trade-hub/model.js','./src/trade-hub/controller.js','./src/trade-hub/view.js','./src/trade-hub/render.js','./src/data/ranks.js','./src/ui.js','./src/app/runtime-loader.js','./src/app/diagnostics.js','./src/app/launch-screen.js','./src/pwa/register.js',
  './src/config/app-config.js','./src/config/runtime-manifest.js','./src/utils/async.js','./src/app/navigation-preload.js','./src/app/navigation-input.js','./src/systems/binder.js','./src/systems/packs.js','./src/systems/rank-frame-renderer.js','./src/packs/index.js','./src/packs/pack-engine.js','./src/packs/pack-generator.js','./src/packs/pack-results.js','./src/packs/pack-session.js','./src/packs/pack-history.js','./src/packs/pack-costs.js','./src/packs/pack-hud.js','./src/packs/pack-rates.js','./src/animations/packs/reveal-profile.js','./src/animations/packs/reveal-controller.js','./src/animations/packs/ten-pack-controller.js','./src/animations/packs/pack-summary.js','./src/screens/binder/index.js','./src/screens/binder/binder-bridge.js','./src/screens/binder/binder-model.js','./src/screens/binder/binder-renderer.js','./src/screens/binder/binder-inspector.js','./src/screens/binder/binder-status.js','./src/artwork/index.js','./src/artwork/card-identity.js','./src/artwork/artwork-db.js','./src/artwork/artwork-queue.js','./src/artwork/artwork-resolver.js','./src/artwork/artwork-cache.js',
  './styles/core.css','./styles/collection.css','./styles/packs.css','./styles/pack-v253.css','./styles/pack-v2533.css','./styles/pack-v254.css','./styles/multiplayer.css','./styles/trade-hub.css','./styles/binder.css','./styles/mobile-performance.css',
  './runtime/core.js','./runtime/progression.js','./runtime/special-collection.js','./runtime/packs.js','./runtime/pack-bridge.js','./runtime/binder-bridge.js','./runtime/profile-extras.js','./runtime/hub-bridge.js','./runtime/rank-frames.js',
  './src/app/health-check.js','./src/platform/mobile.js','./src/platform/image-policy.js','./src/animations/screen-transitions.js','./ui/components/binder-shop.html','./ui/components/bulk-inspect.html','./ui/screens/history.html','./ui/screens/marketplace.html',
  './ui/chrome.html','./ui/screens/rip.html','./ui/screens/binder.html','./ui/screens/bulk.html','./ui/screens/trade.html','./ui/screens/profile.html','./ui/overlays.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC)
    .then(cache => Promise.allSettled(CORE.map(async url => {
      try { const r = await fetch(url, { cache: 'reload' }); if (r.ok) await cache.put(url, r); } catch (_) {}
    })))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('tcg-pack-ripper-') && ![STATIC, MEDIA, ...Object.values(ART_NAMES)].includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function cachedFallback(cache, req, url) {
  return await cache.match(req) || await cache.match(new Request(url.origin + url.pathname)) || null;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sourceCard=url.hostname==='assets.tcgdex.net'&&/\/(low|high)\.(webp|png|jpg)$/.test(url.pathname);
  const mirrorCard=url.hostname==='ddeuwrnfmdgvizkrjhii.supabase.co'&&url.pathname.includes('/storage/v1/object/public/card-assets/cards/');
  if(sourceCard||mirrorCard){
    const q=/\/high\./.test(url.pathname)?'high':/\/medium\./.test(url.pathname)?'medium':'thumb';
    event.respondWith((async()=>{
      let cache;try{cache=await caches.open(ART_NAMES[q]);const hit=await cache.match(req);if(hit)return hit;}catch{}
      try{let res;try{res=await fetch(new Request(req,{mode:'cors',credentials:'omit'}));}catch{res=await fetch(req);}if(res.ok&&res.headers.get('content-type')?.startsWith('image/')&&cache)event.waitUntil((async()=>{try{await cache.put(req,res.clone());const keys=await cache.keys();for(const k of keys.slice(0,Math.max(0,keys.length-ART_LIMITS[q])))await cache.delete(k);}catch{}})());return res;}
      catch{return await caches.match('./assets/ui/card-unavailable.svg').catch(()=>null)||Response.error();}
    })());return;
  }
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match('./index.html')));
    return;
  }

  if (url.pathname.includes('/assets/')) {
    event.respondWith(caches.open(MEDIA).then(async cache => {
      const hit = await (await caches.open(STATIC)).match(req) || await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) event.waitUntil(cache.put(req,res.clone()).then(async()=>{const keys=await cache.keys();for(const k of keys.slice(0,Math.max(0,keys.length-1000)))await cache.delete(k);}).catch(()=>{}));
      return res;
    }).catch(()=>fetch(req)));
    return;
  }

  // Executable/UI resources are network-first. This prevents a new HTML shell
  // from being paired with stale JS/runtime chunks from an older app version.
  const liveCode = /\/(src|runtime|ui|styles)\//.test(url.pathname) || /\/(manifest\.webmanifest)$/.test(url.pathname);
  if (liveCode) {
    event.respondWith(caches.open(STATIC).then(async cache => {
      try {
        const res = await fetch(req, { cache: 'no-store' });
        if (res.ok) event.waitUntil(cache.put(req, res.clone()).catch(()=>{}));
        return res;
      } catch (_) {
        return await cachedFallback(cache, req, url) || Response.error();
      }
    }).catch(()=>fetch(req)));
    return;
  }

  event.respondWith(caches.open(STATIC).then(async cache => {
    const hit = await cache.match(req);
    const network = fetch(req).then(res => {
      if (res.ok) event.waitUntil(cache.put(req, res.clone()).catch(()=>{}));
      return res;
    }).catch(() => null);
    return hit || await network || Response.error();
  }).catch(()=>fetch(req)));
});
