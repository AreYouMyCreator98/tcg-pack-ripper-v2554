# Next Refactor — V254 Cloud Saves & Accounts

With Binder/artwork modularized in V252 and pack orchestration/reveal modularized in V253, the next extraction target is account/cloud persistence.

V254 should isolate Supabase auth, account-authoritative saves, recovery comparison, optimistic revisions and offline mirrors behind one save service before multiplayer/economy extraction continues.
