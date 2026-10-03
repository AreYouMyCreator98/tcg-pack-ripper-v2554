# V256 — Trade Hub rebuild

- Replaced the layered online runtimes with a modular Hub and authenticated transactional service.
- Added escrow, recoverable action receipts, cloud-version coordination and server-generated ranked outcomes.
- Rebuilt marketplace, private trades, chat, matchmaking, battles, identity and leaderboard.
- Preserved ranks, offline district, daily rewards and frames; added a coordinated migration for active listings.
- Added 6,889 verified card identities, all 32 expansions and Gallery/Vault subsets, with existing unlock gates.
- See docs/VERIFICATION-V256.md for test evidence and live-service limits.

# 0.255.4

See [release notes](docs/releases/0.255.4.md) and [verification report](docs/VERIFICATION-V2554.md).

# Changelog

## 0.255.3
- Fixed iPhone/Messenger ranked set selection with touch/pointer-safe direct selection that no longer waits on a full network-backed battle re-render.
- Added direct battle pack touch fallback and safer swipe thresholds for mobile browsers.
- Battle pack generation now restores global pack state in `finally` and retries one clean time after a generator failure instead of leaving the pack engine corrupted until reload.
- MATCH FOUND now renders immediately from cached/local identity before any profile network fetch, then hydrates the full profiles behind the animation.
- Fixed VMAX/VSTAR rarity classification for API strings such as `Holo Rare VMAX`; name-based fallbacks now protect VMAX, VSTAR, V, GX and ex scoring.
- Ranked top-hit selection is now index-safe and uses the corrected battle tier.
- The global reveal tier classifier received the same VMAX/VSTAR compatibility fix.
- No pull-rate, save-schema, economy or card-ownership changes.

## 0.255.2
- Fixed V255.1 startup stalls at the 47% Loading Collection phase.
- Service worker registration/update now begins before critical runtime loading, breaking stale-cache startup deadlocks.
- Corrected stale V255.0 app-config import query in main.js.
- Runtime/source/UI files are network-first with cache fallback.
- Timed-out runtime script elements are removed before retry to prevent duplicate late execution.
- Critical boot progress now identifies the exact runtime chunk being restored.
- Added a 28-second startup watchdog that converts an endless splash into an actionable retry screen.
- No save, economy, pull-rate or multiplayer-data changes.

## 0.255.1
- Fixed ranked READY on in-app/mobile browsers with direct pointer/touch wiring plus click fallback.
- Added server polling fallback so ready state syncs even when a realtime event is missed.
- Added a standalone MATCH FOUND cinematic before the ready lobby.
- Preserved the full player-banner VS intro after both players lock READY.
- Bumped service-worker cache to force delivery of the ranked-ready fix.

## 0.255.0
- Added a two-player READY gate to ranked Quick Match. Neither player can start the pack until both are ready.
- Added animated ranked VS intros with Profile photo, equipped ranked frame, selectable showcase badges, banner title/style and server-backed ranked record.
- Added a Profile Battle Banner editor with six banner styles, up to three earned showcase badges and record visibility control.
- Added realtime Global Chat with online presence count, unread messages, local mute controls and server-side spam/length limits.
- Ranked W/L/T/RP public identity is now rebuilt from completed matchmaking rooms on the server for cross-device consistency.
- Added server guards so matchmade battle progress/results cannot be submitted before both players are ready.
- Added stale matchmaking cleanup for paired rooms that never ready.
- Existing private battles, direct trades, player market, saves, cards and pack odds are unchanged.
- Restored V254 reveal-profile compatibility metadata used by SIR+ session/streak stats; reveal FX and pull odds are unchanged.
