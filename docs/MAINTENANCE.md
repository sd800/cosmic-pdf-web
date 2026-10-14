# Maintenance and publishing

## Files

- `index.html`: complete bilingual content and semantic page structure.
- `styles.css`: layouts, system light/dark palettes and reduced-motion support.
- `boot.js`: restore only the visitor’s explicitly chosen language before first paint. Do not inspect browser/device language.
- `site.js`: manual language changes, clearly labeled example explanation and installation-address copying. No AI calls or analytics.
- `assets/logo.svg`: the extension’s existing logo; keep it in sync when branding changes.
- `assets/reading-notes.pdf`: independently authored demonstration, with a native text page and a raster-only page. Do not substitute private course/customer documents.
- `tools/create-sample.py`: optional maintainer-only PDF regeneration; it is not needed to open or publish the site.
- `assets/social.png`: social sharing artwork made from the website’s own visual design.
- `CNAME`: `pdf.songming.org`. Keep this file at the root.

## GitHub Pages

Publish `sd800/cosmic-pdf-web` from **main / (root)**. Set the custom domain to **pdf.songming.org** and enable HTTPS when available. DNS is managed by the owner. No GitHub Actions or build configuration is used.

The website also works by opening `index.html` from Finder. All presentation assets are local; the download links use the public HTTPS download host.

## Downloads

Both installation and source links use `https://cpdf.songming.org/downloads/`, never a GitHub redirect. The download host belongs to the separate `sd800/cosmic-pdf` repository. That repository’s local `scripts/build-downloads.py` creates both archives and SHA-256 metadata. Regenerate the downloads whenever publishing an extension update, then commit/push them with the release. Do not include Git metadata, ignored files, personal scripts, credentials or generated download archives inside themselves.

The installation ZIP contains `cosmic-pdf/extension/`; the full source ZIP contains `cosmic-pdf-source/extension/` plus the tracked project sources. The public steps consistently ask the user to select `extension` after unzipping.

## Verification

Check desktop/mobile layouts in light/dark, complete English/Chinese content, keyboard operation of the example, persisted language on reload, and direct ZIP links. Verify that a browser configured for Chinese still starts in English when no language is saved. Do not claim the example is a live AI response. Keep website statements consistent with the shipped extension.

Reusable screenshots/reports may go in ignored `test-dist/` with a short README. Do not commit real API keys, private browser profiles, build dependencies or user documents.
