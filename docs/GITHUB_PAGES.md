# GitHub Pages deployment

You can deploy this project directly without a build step:

- Upload the entire project root, keeping `index.html`, `src/`, `runtime/`, `styles/`, `ui/`, `assets/`, `icons/`, `manifest.webmanifest`, and `sw.js` at the repository root.
- GitHub Pages should publish from `main` / repository root.

For the cleaner production path, run `npm install && npm run build` on a computer or GitHub Actions and publish the resulting `dist/` folder.
