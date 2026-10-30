# V265.0 — Battle Renaissance

Ranked Draft Duel is now a compact RPG-style tactical battle rather than a row
of tiny cards and generic actions. The enemy appears at the upper right, the
player at the lower left, with independent HP panels, a battle narration box,
four tactile actions, named printed attacks, descriptions and energy costs.
The post-match screen prioritises RP and the four most useful performance stats.

## Battle rules

- Real printed HP, types, attacks, abilities, weaknesses and resistances are
  imported at build time from TCGdex for all **999 Pokémon** in the five Ranked
  expansion pools. No network fetch is needed during a match.
- Non-Pokémon cards, unavailable artwork/metadata and legacy matches have safe
  `Collector Strike` / neutral fallbacks. No element or ability is fabricated
  from the card's ID hash.
- On every turn the active fighter regains one energy (up to four); attacks
  spend their printed attack's energy count (capped at four for the draft game).
- Exact weakness doubles incoming printed base damage. Resistance halves it.
  Without either, the original moderate type-counter table still contributes.
- Guard halves the next incoming strike. Switch consumes a turn. Printed
  abilities map to the League's limited heal, guard or focus actions, with a
  visible description distinguishing printed flavour text from the actual
  League action. Copy-attack text receives a simple supported effect.
- Player attacks, damage and energy are validated and settled atomically by
  Supabase; AI collectors choose only legal, affordable moves from the same
  visible battle state. No client-supplied HP/power/damage is trusted.
- A turn now lasts 25 seconds to allow mobile players to inspect attacks.
- Five-card draft, first three KOs, 20-turn cap, RP, account saves, pack
  rewards, collection showcase and AI identity remain unchanged.

This is a **custom draft battle**, not a complete simulation of the tabletop
Pokémon TCG. Complex deck-, hand-, prize-, coin-flip- and status-related card
effects aren't fully simulated and are labelled as simplified League actions.

## Safe rollout

1. Deploy the GitHub Pages frontend. It detects older battle snapshots that
   lack `stats.moves` and uses the previous controls until a V265 match starts.
2. Apply `20261030070756_v265_card_accurate_battles.sql` then
   `20261030071154_v265_battle_engine.sql` to the linked Supabase project.
   Both migrations are additive to cards/saves; the engine replaces only
   `league_*` and AI-authoritative battle functions, preserving existing
   match/rating history.
3. Test one QA match from each supported phone/browser. Automated Chromium
   fixture: `node scripts/verify-league-v265-browser.cjs` with Vite on port 5187.

## Verification

- `node tests/league-v265.test.mjs`: metadata SQL, JS/server stat parity,
  attack selection, weaknesses, KOs, AI end-to-end settlement.
- `node tests/league-database.test.mjs`: historical Ranked regressions, 10
  local authenticated simulations, privacy, balance and RP.
- `node tests/league-client.test.mjs`: account switching, reconnect and
  idempotent actions.
- `npm run build` and `npm run smoke:production`.

The visual Chromium fixture needs a Chromium binary; a successful build is not
proof of visual QA on every iPhone/Android model.
