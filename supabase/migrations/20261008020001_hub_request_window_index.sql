-- OPTIONAL separate SQL Editor run, outside BEGIN/COMMIT.
-- Speeds the existing per-user one-minute command rate check on long histories.
-- No changes to receipts or rate limits. CONCURRENTLY allows normal writes.
create index concurrently if not exists hub_requests_user_created
 on hub_private.requests(user_id,created_at desc);
