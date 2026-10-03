import { artworkCacheKey } from './card-identity.js';

const DB_NAME = 'tcgBinderArtworkV239';
const STORE = 'art';
const memory = { low: new Map(), high: new Map() };
let dbPromise = null;

function validBlob(blob) {
  return blob instanceof Blob && blob.size > 1000 && String(blob.type || '').startsWith('image/');
}

function mapFor(size) {
  return size === 'high' ? memory.high : memory.low;
}

export function openArtworkDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Artwork database failed to open'));
    } catch (error) {
      reject(error);
    }
  });
  return dbPromise;
}

async function dbGet(key) {
  try {
    const db = await openArtworkDB();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function dbPut(key, blob) {
  try {
    const db = await openArtworkDB();
    await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    return true;
  } catch {
    return false;
  }
}

async function dbDelete(key) {
  try {
    const db = await openArtworkDB();
    await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {}
}

export async function cachedArtworkUrl(card, size = 'low') {
  const key = artworkCacheKey(card, size);
  const map = mapFor(size);
  if (map.has(key)) return map.get(key);
  const blob = await dbGet(key);
  if (!validBlob(blob)) return '';
  const url = URL.createObjectURL(blob);
  map.set(key, url);
  return url;
}

export async function storeArtworkBlob(card, size, blob) {
  if (!validBlob(blob)) throw new Error('Invalid artwork image');
  const key = artworkCacheKey(card, size);
  await dbPut(key, blob);
  const map = mapFor(size);
  const previous = map.get(key);
  if (previous) {
    try { URL.revokeObjectURL(previous); } catch {}
  }
  const url = URL.createObjectURL(blob);
  map.set(key, url);
  return url;
}

export async function clearArtworkEntry(card, size = 'low') {
  const key = artworkCacheKey(card, size);
  const map = mapFor(size);
  const previous = map.get(key);
  if (previous) {
    try { URL.revokeObjectURL(previous); } catch {}
    map.delete(key);
  }
  await dbDelete(key);
}

export function clearArtworkMemory() {
  for (const map of [memory.low, memory.high]) {
    for (const url of map.values()) {
      try { URL.revokeObjectURL(url); } catch {}
    }
    map.clear();
  }
}

window.addEventListener?.('pagehide', () => clearArtworkMemory(), { once: true });
