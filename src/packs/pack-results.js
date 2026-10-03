import { nonNegativeNumber } from './pack-generator.js';
import { revealProfile } from '../animations/packs/reveal-profile.js';

export function bestCard(cards = []) {
  return [...cards].filter(Boolean).sort((a, b) => {
    const pa = revealProfile(a), pb = revealProfile(b);
    return pb.tier - pa.tier || Number(b.market || 0) - Number(a.market || 0);
  })[0] || null;
}

export function rarityBreakdown(cards = []) {
  const map = new Map();
  for (const card of cards) {
    const key = String(card?.rarity || 'Card');
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([rarity, count]) => ({ rarity, count })).sort((a, b) => b.count - a.count || a.rarity.localeCompare(b.rarity));
}

export function summarizePackCards(cards = [], route = () => 'binder') {
  const list = cards.filter(Boolean);
  let binder = 0, bulk = 0, hits = 0, sirPlus = 0, godCards = 0, value = 0, estimatedCards = 0;
  for (const card of list) {
    const profile = revealProfile(card);
    if (profile.hit) hits++;
    if (profile.sirPlus) sirPlus++;
    if (profile.god) godCards++;
    if (route(card) === 'bulk') bulk++; else binder++;
    value += Math.max(0.1, nonNegativeNumber(card.market, 0.1));
    // The legacy runtime uses ten cents when a live price is unavailable.
    if (!Number.isFinite(Number(card.market)) || Number(card.market) <= 0.1) estimatedCards++;
  }
  return {
    cards: list.length,
    binder,
    bulk,
    hits,
    sirPlus,
    godPack: godCards > 0,
    value,
    estimatedCards,
    best: bestCard(list),
    rarity: rarityBreakdown(list)
  };
}
