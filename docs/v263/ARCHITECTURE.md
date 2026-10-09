# V263 implementation map

| Current system | Reuse / extension | Backend risk |
| --- | --- | --- |
| `league_command`, queue, advisory locks | Human search first; bounded fallback after seven seconds in the same queue transaction | Retains per-user → shared queue lock order; cancellation cannot commit behind fallback |
| `league_matches`, auth-backed guest | Optional separate private AI foreign key; human guest FK preserved | Guest becomes nullable, XOR constraint requires exactly one human/AI guest; no existing row rewritten |
| `make_pack`, `battle_award_mode` | Both participants use real packs; only human invokes existing charge/award | AI has no auth account, save, wallet, collection or trading access |
| `league_draft`, budget/stat rules | Enumerate up to 252 legal squads; choose rank-dependent near-best option | Same budget and card eligibility; production validator remains final authority |
| `league_resolve` / deadlines | Same simultaneous turn/KO engine; effective AI participant ID | AI action is validated; missing actions retain Defend/idle behavior |
| `league_settle` | Human path unchanged; AI branch uses existing rating function, serializes profile updates | Exact-once match lock; highest RP retained; positive human gains get disclosed modifier |
| `league_snapshot`, Realtime signal | Same protocol and rendering; adds explicit AI identity and public modifier | Private actions, AI skill config, save contents and unrevealed cards excluded |
| Client pulse/reconnect | Unchanged human infrastructure | AI timing adds private pg_cron worker; stale worker heartbeat prevents NEW fallback matches |
| Competitive banner/profile | Same renderer, permanent rank frame, AI badge, compact profile disclosure | No fake earned badges, biography, friends, online counts or social profile |

## Scheduling

`INSTALL-SCHEDULER.sql` installs a named one-second pg_cron job separately from the data migration. Availability/version must be verified in Supabase. The worker uses a single try-lock, bounded 100-room batches and a 500ms time budget, row `SKIP LOCKED`, per-room error isolation, and persisted due times. Scheduling is independent of the human client. Reaction timing is quantized by the one-second scheduler; it is not a precise subsecond timer.

Fallback refuses to start new AI matches if the worker heartbeat is older than ten seconds. Existing matches still have normal client timer recovery if the scheduler fails. Turning off public AI fallback does not interrupt active matches or human Ranked. Remove QA allowlist entries as well to disable new QA fallback.

AI roster identities may play independent concurrent matches, so twenty identities do not cap server capacity at twenty players. Their rating updates are serialized. No population numbers or social presence are fabricated. Search prefers ±200 RP and widens to ±400. Grandmaster can widen further but only to Master/Grandmaster AI, whose tactical skill remains appropriate at the highest tier. Long-term roster RP drift needs monitoring: if every eligible identity drifts out of a lower-rank range, the queue retains human search instead of silently assigning an extreme mismatch.

## Data/security

The only schema relaxation is nullable human `guest_id`, paired with an additive AI foreign key and XOR check. Existing human guest authentication FK stays intact. The authoritative command implementation is a private function; browser access remains through the original authenticated RPC. No anonymous/private-table/function grants. Existing V262 public access and Stakes are unchanged. Public AI defaults off, AI QA allowlist empty. No save migration or initial RP mutation.

The decision function receives only `{own, opponent, turn, previous}` from the publicly visible combat state; never a match record, unrevealed pool, locked action, RNG seed, or account data. Completed previous actions are public. The function uses independent decision variance, not future pack/combat RNG.

## Review gates

1. Review data migration and separate scheduler SQL; apply only after approval.
2. Add only isolated QA IDs to AI allowlist; leave public AI off.
3. Complete 20 authenticated full AI matches, human-vs-human race tests, actual mobile reconnect/background checks and timing measurements.
4. Public enablement is a separate decision after these gates. Local simulation is not live QA.
