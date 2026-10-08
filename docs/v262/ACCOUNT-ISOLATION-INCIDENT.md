# V262.6 account isolation incident

A player reported QA inventory appearing after signing into their own account. A read-only scoped inspection confirmed the current cloud record also had the QA-sized state, not merely a stale UI. The current record was preserved privately. No guessed restoration or backend overwrite was performed. The user's original collection remains unrecovered pending browser-backup inspection or an available server backup.

Root defect: active collection state/localStorage was shared across accounts, while binding/version/dirty keys were account-specific. Authentication changed `user` without proving that `state` belonged to that user. A previously bound account could reach the upload branch with the prior account's collection. Forced upload also lacked an ownership check.

Fix: track active save owner independently from session identity. Block uploads before and after session refresh when owner differs, including force. An unknown/foreign owner must preserve its local snapshot to IndexedDB, then restore the authenticated account's cloud state before uploading. Preserve the owner marker on successful primary restore; failure to persist it causes a conservative restore next boot. Clear scheduled uploads on auth changes. Remove automatic consideration of a global pre-cloud backup as another account's save. Hub purchases require owner match too.

An explicit Settings/account export downloads only current save and legacy/archived recovery backups, excluding authentication storage. It exists to support recovery inspection; it does not restore anything automatically. New-account creation while displaying an owned collection is blocked to avoid cloning it; a separate browser profile is required for that path in this hotfix.

Draft Duel now has a visible top-level Battle-section button even when old match history is being viewed. No RP, match, inventory, balance or feature-flag changes.
