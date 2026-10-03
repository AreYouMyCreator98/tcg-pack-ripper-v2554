import { artworkQueue } from './artwork-queue.js';
import { cachedArtworkUrl, clearArtworkEntry, storeArtworkBlob } from './artwork-db.js';
import { resolveArtworkBlob } from './artwork-resolver.js';
import { artworkCacheKey, artworkDiagnosticCard, cardIdentity } from './card-identity.js';

const inflight = new Map();
const failures = new Map();
let collectionSignature = '';
let collectionPromise = null;

function emit(phase, detail = {}) {
  window.dispatchEvent(new CustomEvent('tcg:artwork-status', {
    detail: { phase, ...artworkStatus(), ...detail }
  }));
}

function markFailure(card, size, error) {
  failures.set(artworkCacheKey(card, size), {
    card: artworkDiagnosticCard(card),
    size,
    message: String(error?.message || error || 'Artwork unavailable'),
    at: Date.now()
  });
}

function clearFailure(card, size) {
  failures.delete(artworkCacheKey(card, size));
}

export async function peekArtworkUrl(card, size = 'low') {
  return cachedArtworkUrl(card, size);
}

export async function getArtworkUrl(card, size = 'low', {
  force = false,
  priority = 50
} = {}) {
  if (!card) throw new Error('Card is required for artwork');
  if (!force) {
    const cached = await cachedArtworkUrl(card, size);
    if (cached) return cached;
  } else {
    await clearArtworkEntry(card, size);
  }

  const key = artworkCacheKey(card, size);
  if (!force && inflight.has(key)) return inflight.get(key);

  const task = artworkQueue.schedule(async () => {
    try {
      const blob = await resolveArtworkBlob(card, size, { force });
      const url = await storeArtworkBlob(card, size, blob);
      clearFailure(card, size);
      emit('cached', { card: artworkDiagnosticCard(card), size });
      return url;
    } catch (error) {
      markFailure(card, size, error);
      emit('failed', { card: artworkDiagnosticCard(card), size, message: String(error?.message || error) });
      throw error;
    }
  }, priority);

  inflight.set(key, task);
  try {
    return await task;
  } finally {
    if (inflight.get(key) === task) inflight.delete(key);
  }
}

export async function prefetchCards(cards, {
  size = 'low',
  priority = 10,
  onProgress = null
} = {}) {
  const unique = [];
  const seen = new Set();
  for (const card of cards || []) {
    if (!card || Number(card.qty || 0) <= 0) continue;
    const id = cardIdentity(card);
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(card);
  }

  let completed = 0;
  let success = 0;
  const workerCount = Math.min(3, Math.max(1, unique.length));
  let next = 0;
  const worker = async () => {
    while (next < unique.length) {
      const card = unique[next++];
      let ok = true;
      try {
        await getArtworkUrl(card, size, { priority });
        success++;
      } catch {
        ok = false;
      } finally {
        completed++;
        onProgress?.({ completed, success, total: unique.length, card, ok });
      }
    }
  };
  await Promise.all(Array.from({ length: workerCount }, worker));
  return { total: unique.length, success, failed: unique.length - success };
}

export function prepareCollectionInBackground(cards) {
  const valid = (cards || []).filter(card => card && Number(card.qty || 0) > 0);
  const signature = valid.map(cardIdentity).sort().join('~');
  if (collectionPromise && signature === collectionSignature) return collectionPromise;
  collectionSignature = signature;
  const run = () => prefetchCards(valid, { priority: 5 });
  const task = new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => resolve(run()), { timeout: 1800 });
    } else {
      setTimeout(() => resolve(run()), 500);
    }
  }).then(value => value);
  collectionPromise = task;
  task.then(() => {
    if (collectionPromise === task) collectionPromise = null;
  }, () => { if (collectionPromise === task) collectionPromise = null; });
  return task;
}

export async function repairFailedArtwork(cards = []) {
  const jobs = [];
  for (const card of cards || []) {
    if (!card) continue;
    for (const size of ['low', 'high']) {
      if (failures.has(artworkCacheKey(card, size))) {
        jobs.push(getArtworkUrl(card, size, { force: true, priority: 110 }));
      }
    }
  }
  return Promise.allSettled(jobs);
}

export function clearFailureForCard(card) {
  for (const size of ['low', 'high']) clearFailure(card, size);
}

export function artworkStatus() {
  const queue = artworkQueue.snapshot();
  return Object.freeze({
    failed: failures.size,
    inflight: inflight.size,
    queued: queue.queued,
    running: queue.running,
    concurrency: queue.concurrency
  });
}

export function artworkRepairReport() {
  return Object.freeze({
    generatedAt: new Date().toISOString(),
    ...artworkStatus(),
    failures: [...failures.values()].map(item => ({ ...item, card: { ...item.card } }))
  });
}
