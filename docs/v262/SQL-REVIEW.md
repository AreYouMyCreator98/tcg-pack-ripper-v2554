# V262 SQL review — not applied, public access OFF

Review `supabase/migrations/20261008040000_collector_league.sql` before running it in Supabase SQL Editor. This migration requires the existing V256 Hub, identity/mobile matchmaking, battle-stream and snapshot-timeout fixes. It does not require the optional V260 economy/Stakes migration.

## Exact changes

- Creates private `league_config`, `league_matches`, `league_members`, `league_queue`, `league_requests` tables. No existing room is converted or removed.
- Adds `league_stats` and `league_banner` JSONB columns to `hub_private.profiles`, retaining all existing profile fields. Existing RP, seasons, saves and cosmetics are not reset.
- Creates a per-user `public.league_signals` table, SELECT-own RLS and Realtime publication membership. Clients cannot write signals or read other users' rows.
- Adds authenticated `league_command` RPC and participant-only `league_identity_art` RPC. Private helpers are revoked from public, anon and authenticated roles.
- Adds validators, bounded phase snapshots, deterministic stats, simultaneous turn resolution and once-only server RP settlement.
- Extends existing `public_profile` output with equipped competitive metadata. Its existing avatar validation and privacy checks are preserved. Hot battle snapshots use `public_profile_brief`, not the save/photo query.
- Adds a guard trigger to existing Hub rooms: a player in a live Draft Duel/queue cannot enter another legacy room. It only rejects new room participation; it does not change existing rooms.
- Adds indexes on new tables: host/guest recent history, queue age/expiry, per-account receipt window. Local EXPLAIN uses `league_host_history` with 2,000 historical matches.
- Uses the existing legacy queue/economy advisory lock only for queue mutations and ready/pack award. Snapshot reads and tactical turns do not take it. Tactical commands use participant/room locks; RP profiles and pack save rows lock in UUID order.
- Transaction wraps installation; 3-second lock timeout causes rollback on contention. Reapplying has been tested locally. No statement_timeout increase.

## Defaults and activation

`enabled=false`, `qa_users={}`. Running the migration alone does not enable Draft Duel for anyone. Current Ranked and Casual remain available. Stakes remains disabled.

After reviewing/applying the migration, allow only the two isolated QA accounts in a separate transaction:

```sql
begin;
update hub_private.league_config
set enabled=false,
    qa_users=array['QA_ACCOUNT_A_UUID','QA_ACCOUNT_B_UUID']::uuid[]
where id=true;
commit;
```

Use the actual isolated QA account IDs, never existing players. Do not set `enabled=true` yet. The client launch control is visible only when the authenticated backend grants access.

To stop further QA admission without deleting state:

```sql
update hub_private.league_config set enabled=false,qa_users='{}' where id=true;
```

Do this after active QA matches are finished/cancelled: removing access mid-match prevents further participant commands. Existing match records, awards and inventory remain intact. Do not drop tables or reverse awards as a rollback strategy.

## Authority and costs

Pack generation/award calls the existing `make_pack` / `battle_award_mode` transaction. One Ranked pack per participant; existing starter credit → set credit → $8 game cash order is unchanged. Both players' charges and ten-card awards commit together or both roll back. Turn RPCs never serialize/alter player collections. Result settlement changes authoritative Hub RP/records once; the existing rank bridge refreshes the client cache.

The squad base budget is 100. For a pool where even the cheapest five exceed 100 (e.g. God Pack), budget equals the cheapest five's total. This guarantees a legal squad without rerolling or altering collection outcomes. This policy is versioned in immutable match rules and displayed in the draft UI.

## Still required after application

Two authenticated isolated QA accounts must complete **at least 10 complete matches**. Verify live Realtime, reconnect/background recovery, all actions/default timers, hidden information, RP, no duplicate rewards, no statement timeouts and mobile performance. Local PGlite role tests do NOT meet that gate. No main merge/publish before this evidence exists.

The companion `docs/v262/QA-ALLOWLIST.sql` contains the actual UUIDs of the two previously authorized, isolated QA accounts. It contains no passwords or tokens. Review it and run after the migration instead of the placeholder example above.
