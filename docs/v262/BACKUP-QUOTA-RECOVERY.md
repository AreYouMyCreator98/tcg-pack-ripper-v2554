# V262.4 backup quota recovery

The physical Samsung screenshot now confirms `QuotaExceededError` during primary collection restoration. QA1 is a 2.15 MB save; legacy full-save backups compete with it in localStorage. This is not evidence of a Supabase statement timeout.

On a primary restore quota failure, move only allowlisted legacy backup values into IndexedDB (`tcgSaveBackupsV262/backups`). Wait for the write transaction to commit and read back the exact contents before replacing that localStorage backup value with a small reference. Retry the primary write after each archive. Never archive/delete the active save, authentication, account bindings or pending economic receipts. Abort primary restoration if account/local revision changed while archival was asynchronous.

Rolling-backup restoration and pre-cloud reconciliation understand the references. Failed, blocked or corrupted archive storage leaves originals and the transaction hold intact. Ordinary restores do not touch IndexedDB. No server migration, account edits, inventory changes or flag changes.

Isolated Chromium 390x844 test: filled actual localStorage quota with a 2,151,224-character primary save and backup; larger primary write threw QuotaExceededError. Recovery completed in 174 ms, primary contents matched, pending receipt remained, and backup contents were readable after reload. This is desktop Chromium mobile-viewport evidence, not physical Samsung or Safari certification. Synthetic fixture only; live QA rooms were not touched.

Limitations: IndexedDB must be available and have capacity. If the primary save alone exceeds the localStorage quota, this bounded backup migration cannot solve it; restoration remains safely held. No unrelated cache is deleted.
