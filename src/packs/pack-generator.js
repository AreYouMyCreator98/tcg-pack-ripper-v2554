import { revealProfile } from '../animations/packs/reveal-profile.js';

export function validateGeneratedPack(cards) {
  if (!Array.isArray(cards)) return { ok: false, reason: 'not-array', count: 0 };
  if (cards.length !== 10) return { ok: false, reason: 'wrong-card-count', count: cards.length };
  const missing = cards.filter(card => !card?.id);
  if (missing.length) return { ok: false, reason: 'missing-card-id', count: cards.length, missing: missing.length };
  return { ok: true, count: 10 };
}

export function nonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

export function generatedPackMeta(detail = {}) {
  const cards = Array.isArray(detail.cards) ? detail.cards : [];
  const profiles = cards.map(revealProfile);
  return {
    valid: validateGeneratedPack(cards),
    set: detail.set || {},
    cards,
    bestTier: profiles.reduce((n, x) => Math.max(n, x.tier), 0),
    hit: profiles.some(x => x.hit),
    sirPlus: profiles.some(x => x.sirPlus),
    godPack: !!detail.godPack || profiles.some(x => x.god),
    cashSpent: nonNegativeNumber(detail.cashSpent),
    starterUsed: nonNegativeNumber(detail.starterUsed),
    creditsUsed: nonNegativeNumber(detail.creditsUsed)
  };
}

export function bridgeAvailable(target = window) {
  return !!target.TCG_PACK_LEGACY?.snapshot;
}
