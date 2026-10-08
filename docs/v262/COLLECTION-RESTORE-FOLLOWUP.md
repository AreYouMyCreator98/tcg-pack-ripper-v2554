# V262.3 collection restore safety

QA Hotfix 1 reports `Collection sync is pending` while QA Hotfix 2 succeeds. Read-only inspection and local replay in the preceding investigation confirmed the ready room state and successful SQL ready processing against copies of both saves. QA1's serialized state is approximately 2.15 MB versus QA2's 66 KB. This does not establish the physical device's precise failure cause.

The restore path previously changed live state and acknowledged the remote version before writing the primary local cache. A failed primary write could therefore leave a partially acknowledged restore. Optional preferences/audio/selection/timestamp writes could also report failure after a successful collection restore.

Persist the primary collection first; only then replace live state and acknowledge the version. Treat optional cache writes as best-effort. Preserve pending financial receipts and transaction holds on primary failure. Distinguish quota, session, missing account state, local revision conflicts, account changes and generic read failures in the pending-action message. No automatic clearing of storage, inventory, pending receipts or saves.

Four regression cases cover primary quota failure, optional cache failure, concurrent local progress, and network failure/retry. The exact Samsung failure remains unconfirmed until the new diagnostic is observed. No SQL, odds, economic or public feature-flag changes.
