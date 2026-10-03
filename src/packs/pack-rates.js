// Mirrors the V252 generator exactly. These constants are informational and
// tested against public/runtime/core.js; generation still runs through the
// legacy bridge so this refactor cannot silently change live odds.
export const GOD_PACK_RATE = 0.001;

export const PACK_RATE_SNAPSHOT = Object.freeze({
  sv: Object.freeze({ wildcard: 0.012, final: Object.freeze({ doubleRare: 0.17, ultraRare: 0.055, illustrationRare: 0.035, specialIllustrationRare: 0.025, hyperRare: 0.01, aceSpec: 0.005 }) }),
  swsh: Object.freeze({ wildcard: 0.012, final: Object.freeze({ holoRare: 0.18, holoV: 0.09, holoVMAX: 0.035, holoVSTAR: 0.02, radiant: 0.02, amazing: 0.02, ultraRare: 0.012, secretRare: 0.008, shinyVMAX: 0.005 }) }),
  sm: Object.freeze({ wildcard: 0.015, final: Object.freeze({ rareHolo: 0.16, ultraRare: 0.075, secretRare: 0.025, prismStar: 0.01 }) }),
  xy: Object.freeze({ wildcard: 0.015, final: Object.freeze({ rareHolo: 0.16, ultraRare: 0.075, secretRare: 0.025 }) })
});

export const SV_REVERSE_UPGRADES = Object.freeze({ illustrationRare: 0.055, ultraRare: 0.018, specialIllustrationRare: 0.009, hyperRare: 0.003 });
