# V262.1 — account resume and collection handoff

The physical Android report showed the Hub in `recovering` with “Collection sync is pending” after switching to Chrome to sign in with the second QA account.

Confirmed client defects:

- `installLeague.setUser` closed the duel for every auth event, including same-account token/session refresh. Reproduced using the full running app and a real authenticated QA session; the duel closed before the patch and stayed open afterward.
- The Hub and League's independent snapshot listeners could both finish the shared cloud transaction hold. League now defers its unrelated snapshot save synchronization while the Hub owns an economic command or collection restoration.
- Concurrent resume/retry callbacks could launch separate full collection pulls. The finish operation now shares one pull per account/hold generation, retaining the hold on failure and preventing an old account's completion from releasing a new hold.
- League removed its persisted ready/recovery marker before confirming the save restore. The marker now survives failure and reload until restoration succeeds.

No SQL, save-schema, odds, rating formula, card-generation or settlement changes. No player saves or pending receipts are cleared. Draft Duel remains QA-gated; Stakes remains disabled.

## Verification

Five new regressions cover same-account refresh versus account switch, failed/retried restore, concurrent pulls, late completion across account changes, persisted recovery marker and cross-controller transaction ownership (some cases share a test).

Full app, authenticated QA Hotfix 1, 390×844 Chromium: loaded the current server save, confirmed the duel remains open across a same-account SDK session event, completed three collection handoffs with artificially delayed save reads, then injected a failed save read. The expected error was reproduced with the hold still active. After restoring connectivity and emitting visibility/online events, the app returned to `connected`, the hold cleared, and no uncaught JS errors occurred. No matchmaking/settlement command was sent during this test, to avoid interrupting the user's current QA matches.

HTTPS in this environment uses a certificate-verifying transport adapter. Native browser WebSocket connectivity is restricted here; this specific check exercised the existing polling/resume fallback. It does not replace physical Android suspension testing or the previously completed authenticated Realtime/match checks. Some external artwork returned 404 and followed the existing fallback path; this hotfix does not change card assets.

The service worker/build version is bumped to 0.262.1 / `v262-resume-sync-1`. The cache-version regression now reads release metadata instead of hardcoding the previous release number.

Full suite and `pnpm run release:check`: **328 passed, zero failures**; production smoke **62 resources**, offline manifest **50 resources**.
