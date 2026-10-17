# Maintenance and publishing

## Versioning

Every commit message uses `Release YY.M.D.NUM`, for example `Release 26.10.14.3`. Use the release date in America/Chicago, unpadded month/day numbers and a sequence starting at 1 each day. Increment NUM for each new commit on that date. Keep the current VERSION and CHANGELOG aligned with this calendar format.

## Files

- `index.html`: complete bilingual content and semantic page structure.
- `styles.css`: layouts, automatic/manual light/dark palettes and reduced-motion support.
- `boot.js`: restore the visitor’s explicitly chosen language and appearance before the stylesheet loads. Do not inspect browser/device language.
- `site.js`: manual language and appearance changes, clearly labeled example explanation, installation-address copying and gentle anchor navigation. No AI calls or analytics.
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

## Anchor navigation

Plain same-page clicks use one requestAnimationFrame sequence, 650–1200 ms depending on distance, with smoothstep easing. Each frame uses instant placement so CSS smooth scrolling never stacks. Wheel/touch/pointer/key input, a new navigation, resize, history changes or hiding the page cancel obsolete work. Reduced-motion users get immediate placement. Targets retain existing sticky-header offsets; URL history and keyboard focus are preserved, and modifier/new-tab clicks stay native. No idle loop or scrolling dependency is added.

## Appearance

Without a saved choice, follow device light/dark changes. The footer shows Appearance - followed by a text button before Privacy. It displays the current mode and cycles Auto → Light → Dark, localized with the interface. Auto clears the saved override. Save only an explicit light/dark choice in `cosmic-pdf-web-theme`; restore it in boot.js before loading styles to avoid painting the opposite palette on reload. A blocked storage API must not prevent switching for the current page. Keep browser theme colors in sync. The fixed light/dark product comparison remains unchanged.
