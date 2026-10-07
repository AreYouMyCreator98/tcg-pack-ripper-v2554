# V261 phone preview

This is an isolated build of the `v261-dark-silver` review branch. It is not a production deployment. Account login, cloud writes, online market/trades and ranked are disabled in the preview. Local pack opening, collection, grading, progression and the district remain available. Your production save and account are untouched.

If a temporary HTTPS URL is provided, open it in Chrome or Samsung Internet. Temporary tunnels require this workspace to remain running. The header says **V261 PREVIEW · LOCAL SAVE**.

If the tunnel expires, the downloadable preview ZIP can be extracted on a computer. Run `python3 serve.py` in the extracted folder, connect your phone to the same Wi-Fi, then open `http://COMPUTER-LAN-IP:8080`. Alternatively upload the extracted folder to a **new**, separate static hosting site (Netlify Drop or Cloudflare Pages Direct Upload). Do not upload it to the existing GitHub Pages site. HTTPS hosting is needed to test PWA installation/offline behavior.

Test: all four destinations; arrow cycling and locked sets; Pull Rates and quick actions; profile avatar changes and reload; 1-pack recap; ten consecutive 10-pack openings; back/background/resume; orientation changes; scrolling large collections; Specials artwork; settings and audio unlock.

Do not import your only copy of a save. Export remains available, and preview saves use a separate namespace. Preview progress does not sync back to production.
