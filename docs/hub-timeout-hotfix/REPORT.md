# Collector Hub timeout hotfix — review before applying

Branch: `fix/hub-timeout-hotfix`. Proposed client build: `v261-hub-hotfix-1`.
**Neither SQL patch has been applied to production. Main is unchanged. Stakes remains disabled.**

## Diagnosis and confidence

The reported production error is PostgreSQL statement cancellation. I cannot yet attribute that particular live cancellation to a logged statement: this environment has no Supabase logs/SQL connector, management token, database connection, or authenticated large-collection test account. Storage service-role access is not a substitute. Production logs/request context were requested; no new player account was created or existing player data accessed.

A concrete costly query was reproduced using the authenticated database-role harness:

`public.hub_command('snapshot')` → `hub_private.command` / `hub_private.snapshot` → `hub_private.snapshot_full` → its `sets` subquery → `hub_private.set_unlocked`.

The old `HAVING count(*) >= 10 AND set_unlocked(user,set_id)` lets PostgreSQL push the non-aggregate unlock predicate below aggregation. EXPLAIN shows:

```
Aggregate: Group Key set_id; Filter count(*) >= 10
  Seq Scan catalog
    Filter enabled AND hub_private.set_unlocked(user, set_id)
```

Thus 6,909 catalogue rows invoke a save-reading unlock check 6,909 times, instead of 33 synthetic sets. The previous large-collection test used only a 20-card fixture catalogue; it missed this cost. This is a pre-existing costly query retained by the battle migration, not evidence of recursive snapshot calls. More frequent polling can amplify it.

On the V260 public wrapper, even read-only snapshots take the global `(256,1)` advisory lock; an expensive snapshot serializes unrelated Hub commands behind it. The known older invoker wrapper lacks that additional snapshot lock and is retained unchanged. Without production definitions/logs, it is not established which wrapper is live.

Other confirmed work/load issues: battle snapshots serialized 20 historical rooms, each historical profile reopened a save just to remove its avatar afterward; the recent-request rate-limit query lacked a user/time index; automatic retries continued after snapshot failures. These are addressed without increasing statement_timeout.

## Local measurements

Same synthetic fixture before/after: 5,000 collection records including embedded history, 6,909 catalogue rows across 33 sets, 2,000 archived rooms. Authenticated RPCs run through the existing PostgreSQL/PGlite harness.

| Check | Before | After |
|---|---:|---:|
| Initial full snapshot, isolated stress run | 5,654 ms | 210 ms |
| Twenty repeated battle snapshots after patch | — | median 5 ms; max 6 ms |
| Unlock predicate placement | per catalogue card | after materialized set aggregation |
| Battle history returned | up to 20 rooms | active battles + latest terminal battle |
| Rate-check test history | scans 20,000 old receipts | user/time index selected |

An additional isolated profiling run measured 5,377 ms versus 181 ms. Parallel-suite timings vary. These are local measurements, not Supabase/mobile latency claims. PGlite did not enforce the attempted statement_timeout reproduction as native PostgreSQL would: the exact production `57014` cancellation and concurrent lock waits remain unverified.

## What the SQL changes

1. **20261008020000_hub_snapshot_timeout.sql** (required candidate):
   - Materializes per-set catalogue aggregation before checking unlock eligibility. Unlock rules are unchanged.
   - Removes the shared advisory lock from read-only V260 snapshots only. All economic mutations retain existing locks, validation and idempotency. Known legacy invoker is preserved.
   - Uses brief historical profile metadata without reading archived participants' full saves.
   - Narrows battle snapshots to active battles and latest terminal battle; excludes inventory, market, chat, set lists and other full-Hub data. Own rating/record fields remain available.
   - Signals queue matches only for an actual matched room, not an unrelated already-ready room.
   - Adds capability marker `battle_sync_version: 2`.
   - Runs transactionally with a 3-second migration lock-acquisition limit and definition guards. Unknown server definitions abort rather than being overwritten blindly.
2. **20261008020001_hub_request_window_index.sql** (optional separate maintenance query):
   - Adds `(user_id, created_at DESC)` to request receipts with `CREATE INDEX CONCURRENTLY`.
   - Preserves every receipt and existing rate limit. Run separately, outside BEGIN/COMMIT. Concurrency of index construction is not reproduced by PGlite; its index/plan equivalence was tested without CONCURRENTLY.

Neither file edits a player's saves, rooms, inventory, cash, RP, trades or progression. It does not re-award cards, settle pending matches, reset data, change odds or enable Stakes. The primary patch preserves current client compatibility; it can improve the existing live client before publishing the additional client protections.

## Client changes awaiting publication

- Automatic full-Hub fallback polls every 15 seconds instead of about 2.25 seconds; manual refresh and realtime triggers remain available.
- Lightweight battle fallback polls every 1.5 seconds; queue checks remain every 3 seconds. Opponent reveals still refresh on realtime notifications.
- Snapshot failures back off automatic polling/realtime retries at 5/10/20/30 seconds. Explicit Reconnect/resume still works. Pending transaction receipt recovery remains intact.
- Build and service-worker cache versions incremented for the eventual release.

## Validation and deployment gate

Regression tests cover full catalogue/large save/history, preserved inventory and cash, all rooms retained, authenticated access, opponent-prefix privacy, bounded and backwards progress, replayed receipts, once-only settlement, Ranked queue re-evaluation, Casual/trade legacy workflows, account switch, background resume, rapid batching, Stakes rejection and timeout backoff. **288 automated tests passed, zero failures; `pnpm run release:check` passed**, including production build and 52-resource production smoke. The final parallel suite measured initial snapshot 6,857 ms before / 304 ms after; battle median 8 ms / max 36 ms, illustrating machine-load sensitivity.

Read-only `diagnostics.sql` can identify the installed wrapper and current lock waiters. Share the failing RPC's Supabase log context (tokens removed) to complete live attribution.

**Live safety:** not yet certified safe to re-enable. The candidate passes local validation, but it must be reviewed/applied by the user, then tested with an authenticated large-collection account against the real backend. Do not interpret an anonymous AUTH_REQUIRED response or a static Pages check as multiplayer validation. Prompt 2 begins only after the user confirms the follow-up migration succeeded. Do not publish main before that gate and the requested live checks.
