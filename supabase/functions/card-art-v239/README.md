# card-art-v239

Production artwork proxy/resolver used by Binder artwork caching.

The deployment metadata in `deployment.json` identifies the exact production function captured during the modular migration. Before changing this backend, export the current function source into `index.ts`, test it separately, then deploy a new version and update this metadata.

This folder is intentionally present now so backend changes have a stable source-controlled home rather than being edited ad hoc.
