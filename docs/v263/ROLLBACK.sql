begin;
update hub_private.league_ai_config set ai_ranked_fallback_enabled=false,qa_users='{}' where id=true;
-- Keep worker running until already-started AI matches finish. Human Ranked,
-- saves, RP and historical matches are untouched. Do not drop tables/functions.
commit;
