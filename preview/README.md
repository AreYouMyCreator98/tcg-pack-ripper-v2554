# V261 phone test build

Download **v261-preview.zip** using GitHub's **Download raw file** action. This archive was built from review commit `d76f2c4899d43a4f7e6bcd30d8885c30c40d8424` after 269 passing tests and a passing `pnpm run release:check`.

A temporary public URL could not be created from this environment: Cloudflare Tunnel's DNS connection was refused, and the alternate static preview host was blocked by the network proxy. No main/GitHub Pages deployment was attempted.

## Test directly from Android

1. Download the ZIP to your phone.
2. Sign in to Cloudflare (a free account is sufficient) and create a **new Cloudflare Pages Direct Upload project**.
3. Upload the ZIP, deploy, and open its new `pages.dev` URL in Chrome or Samsung Internet. This is a separate site; do not change the existing GitHub Pages configuration.

The header reads **V261 PREVIEW · LOCAL SAVE**. The archive disables account/cloud writes and uses a separate save namespace, so preview progress stays separate from production. Online market/trades/ranked require the production backend and are intentionally unavailable in this isolated preview.

Alternatively, extract on a computer, run `python3 serve.py`, and open `http://COMPUTER-LAN-IP:8080` on a phone on the same Wi-Fi. A plain local HTTP server cannot test PWA installation; use the separate HTTPS host for that.

See [the test report](../docs/v261/TEST-REPORT.md) and [device checklist](../docs/v261/PHONE-PREVIEW.md). Physical Samsung Internet/iPhone Safari testing is still required.
