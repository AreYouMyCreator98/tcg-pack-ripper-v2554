import { APP_CONFIG } from '../config/app-config.js';
import {
  cardNumber,
  cardSetId,
  cleanArtworkSource,
  preferredArtworkSource
} from './card-identity.js';

const PROXY = `${APP_CONFIG.supabase.url}/functions/v1/${APP_CONFIG.supabase.cardArtFunction}`;

function validImageBlob(blob) {
  return blob instanceof Blob && blob.size > 1000 && String(blob.type || '').startsWith('image/');
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 14000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Artwork request ${response.status}`);
    const blob = await response.blob();
    if (!validImageBlob(blob)) throw new Error('Artwork response was not an image');
    return blob;
  } finally {
    clearTimeout(timer);
  }
}

function localCandidate(card, size) {
  const raw = preferredArtworkSource(card, size);
  if (!raw) return '';
  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) return raw;
  try {
    const url = new URL(raw, document.baseURI);
    return url.origin === location.origin ? url.href : '';
  } catch {
    return '';
  }
}

function proxyUrl(card, size, deep = false) {
  const url = new URL(PROXY);
  const add = (key, value) => {
    const clean = String(value || '').trim();
    if (clean) url.searchParams.set(key, clean);
  };
  add('id', card?.id);
  add('set', cardSetId(card));
  add('setName', card?.set);
  add('number', cardNumber(card));
  add('name', card?.name);
  add('size', size);
  const source = cleanArtworkSource(preferredArtworkSource(card, size));
  if (source) add('src', source);
  if (deep) url.searchParams.set('deep', '1');
  return url.href;
}

export async function resolveArtworkBlob(card, size = 'low', { force = false } = {}) {
  const local = localCandidate(card, size);
  if (local && !force) {
    try {
      return await fetchWithTimeout(local, { cache: 'force-cache', credentials: 'same-origin' }, 9000);
    } catch {}
  }

  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetchWithTimeout(proxyUrl(card, size, attempt > 0), {
        mode: 'cors',
        cache: force || attempt ? 'reload' : 'force-cache',
        credentials: 'omit'
      }, attempt ? 18000 : 12000);
    } catch (error) {
      lastError = error;
      if (!attempt) await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw lastError || new Error('Artwork unavailable');
}
