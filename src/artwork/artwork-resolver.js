import {cardImageCandidates,CARD_PLACEHOLDER} from './card-assets.js';
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
  let lastError;
  for(const source of cardImageCandidates(card,size)){
    if(source===CARD_PLACEHOLDER)break;
    try{return await fetchWithTimeout(source,{cache:force?'reload':'force-cache',credentials:'omit'},7000);}catch(error){lastError=error;}
  }
  // Retain the existing source-repair proxy as a last network fallback.
  try{return await fetchWithTimeout(proxyUrl(card,size),{credentials:'omit'},7000);}catch(error){lastError=error;}
  throw lastError||new Error('Artwork unavailable');
}
