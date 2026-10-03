import { generatedPackMeta, nonNegativeNumber } from './pack-generator.js';
import { bestCard } from './pack-results.js';

function blankSession() {
  return {
    startedAt: Date.now(), packs: 0, hits: 0, sirPlusPacks: 0, godPacks: 0,
    cashSpent: 0, starterPacks: 0, sealedCredits: 0, valueGenerated: 0,
    uniqueAdded: 0, binderAdded: 0, bulkAdded: 0, collected: 0,
    best: null, bestHitStreak: 0, currentHitStreak: 0
  };
}

export class PackSession {
  constructor(persistent = {}) {
    this.session = blankSession();
    this.persistent = {
      packsSinceSirPlus: Math.floor(nonNegativeNumber(persistent.packsSinceSirPlus)),
      packsSinceGod: Math.floor(nonNegativeNumber(persistent.packsSinceGod)),
      hitStreak: Math.floor(nonNegativeNumber(persistent.hitStreak)),
      bestHitStreak: Math.floor(nonNegativeNumber(persistent.bestHitStreak)),
      lifetimeGodPacks: Math.floor(nonNegativeNumber(persistent.lifetimeGodPacks)),
      lifetimeSirPlusPacks: Math.floor(nonNegativeNumber(persistent.lifetimeSirPlusPacks))
    };
  }

  recordPack(detail) {
    const meta = generatedPackMeta(detail);
    if (!meta.valid.ok) return { accepted: false, meta };
    this.session.packs++;
    if (meta.hit) this.session.hits++;
    if (meta.sirPlus) this.session.sirPlusPacks++;
    if (meta.godPack) this.session.godPacks++;
    this.session.cashSpent += meta.cashSpent;
    this.session.starterPacks += meta.starterUsed;
    this.session.sealedCredits += meta.creditsUsed;
    this.session.valueGenerated += meta.cards.reduce((n, c) => n + Math.max(0.1, nonNegativeNumber(c.market, 0.1)), 0);

    const best = bestCard(meta.cards);
    const bestMarket = Number(best?.market || 0);
    const previousTier = Number(this.session.best?.tier ?? -1);
    const previousMarket = Number(this.session.best?.market || 0);
    if (best && (!this.session.best || meta.bestTier > previousTier || (meta.bestTier === previousTier && bestMarket > previousMarket))) {
      this.session.best = { ...best, tier: meta.bestTier };
    }

    this.persistent.packsSinceSirPlus = meta.sirPlus ? 0 : this.persistent.packsSinceSirPlus + 1;
    this.persistent.packsSinceGod = meta.godPack ? 0 : this.persistent.packsSinceGod + 1;
    this.persistent.hitStreak = meta.hit ? this.persistent.hitStreak + 1 : 0;
    this.persistent.bestHitStreak = Math.max(this.persistent.bestHitStreak, this.persistent.hitStreak);
    if (meta.godPack) this.persistent.lifetimeGodPacks++;
    if (meta.sirPlus) this.persistent.lifetimeSirPlusPacks++;

    this.session.currentHitStreak = meta.hit ? this.session.currentHitStreak + 1 : 0;
    this.session.bestHitStreak = Math.max(this.session.bestHitStreak, this.session.currentHitStreak);
    return { accepted: true, meta };
  }

  recordCollection(detail = {}) {
    if (detail.route === 'trash') return;
    this.session.collected++;
    if (detail.route === 'bulk') this.session.bulkAdded++;
    else this.session.binderAdded++;
    if (detail.wasNew) this.session.uniqueAdded++;
  }

  reconcileOpeningValue(generatedValue, resolvedValue) {
    const generated = Number(generatedValue || 0);
    const resolved = Number(resolvedValue || 0);
    if (!Number.isFinite(generated) || !Number.isFinite(resolved)) return this.session.valueGenerated;
    this.session.valueGenerated = Math.max(0, this.session.valueGenerated + (resolved - generated));
    return this.session.valueGenerated;
  }

  reset() { this.session = blankSession(); }
  snapshot() { return { session: { ...this.session, best: this.session.best ? { ...this.session.best } : null }, persistent: { ...this.persistent } }; }
}
