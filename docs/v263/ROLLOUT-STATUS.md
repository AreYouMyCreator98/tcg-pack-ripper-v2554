# V263 rollout checkpoint — 9 October 2026

Migration and independent one-second scheduler are installed in production. Worker heartbeat and recent successful cron executions were verified. AI fallback is configured at 7 seconds; initial human search is 3 seconds. Both isolated QA accounts are allowlisted.

14 full authenticated AI matches passed. The user explicitly stopped further AI tests and requested deployment; the remaining 20-match gate is waived, not reported as passed. Both QA accounts were confirmed idle after stopping. See live-verification-summary.json and live-qa-results.json for evidence and limitations.

359 automated tests and release:check passed. Both live authenticated Realtime subscriptions received signals. Fourteen Chromium layout/input cases passed; physical Android/Safari behavior and a concurrent live human/AI race remain unverified. Mobile resume handlers, saves, Stakes and Casual behavior are unchanged.

Deployment is proceeding from feat/v263-ai-ranked-fallback. Public AI remains OFF at the last check until ENABLE-PRODUCTION-APPROVED.sql is run in SQL Editor. The Management API connection is read-only; no additional user authorization is required, only that technical activation step. It checks public League, active one-second cron and a fresh worker heartbeat. Existing standard ENABLE-PRODUCTION.sql retains the original 20-match gate for other rollouts.
