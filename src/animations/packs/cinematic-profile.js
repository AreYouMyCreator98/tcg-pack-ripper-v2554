import { revealProfile } from './reveal-profile.js';

// Presentation only. Rarity, rewards and saved card identity remain authoritative.
export function cinematicProfile(card, { fast = false, reduced = false, compact = false } = {}) {
  const profile = revealProfile(card);
  const level = ['base','holo','ex','ultra','chase','apex','god'].indexOf(profile.effect);
  const quiet = fast || reduced;
  return Object.freeze({ ...profile,
    particles: quiet || level < 2 ? 0 : Math.min(compact ? 24 : 42, 8 + level * 5),
    bolts: quiet || level < 2 ? 0 : Math.min(6, level),
    rings: quiet || level < 2 ? 0 : Math.min(3, level - 1),
    duration: quiet ? 300 : level < 2 ? 850 : Math.min(2200, 850 + level * 220),
    quiet
  });
}
