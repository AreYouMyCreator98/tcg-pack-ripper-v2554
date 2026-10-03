import { APP_CONFIG } from './config/app-config.js';
import { withTimeout } from './utils/async.js';

const fragmentPaths = [
  'ui/chrome.html',
  'ui/screens/rip.html',
  'ui/screens/binder.html',
  'ui/components/binder-shop.html',
  'ui/screens/bulk.html',
  'ui/components/bulk-inspect.html',
  'ui/screens/trade.html',
  'ui/screens/history.html',
  'ui/screens/marketplace.html',
  'ui/screens/profile.html'
];

function fragmentUrl(path, retry = 0) {
  const url = new URL(path, document.baseURI);
  url.searchParams.set('v', APP_CONFIG.buildId);
  if (retry) url.searchParams.set('retry', String(retry));
  return url.href;
}

async function getText(path) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await withTimeout(
        fetch(fragmentUrl(path, attempt), { cache: attempt ? 'reload' : 'no-cache' }),
        10000,
        `UI fragment ${path}`
      );
      if (!response.ok) throw new Error(`UI fragment failed: ${path} (${response.status})`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 120));
    }
  }
  throw lastError || new Error(`UI fragment failed: ${path}`);
}

export async function mountUI() {
  const [parts, overlays] = await Promise.all([
    Promise.all(fragmentPaths.map(getText)),
    getText('ui/overlays.html')
  ]);

  const root = document.getElementById('app-root');
  if (!root) throw new Error('UI mount failed: #app-root is missing');

  const app = document.createElement('div');
  app.className = 'app';
  app.innerHTML = parts.join('\n');
  root.replaceWith(app);
  document.body.insertAdjacentHTML('beforeend', overlays);
  return app;
}

export { fragmentPaths };
