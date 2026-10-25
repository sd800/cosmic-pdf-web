# Cosmic PDF website

The product website for Cosmic PDF: a calmer PDF reader for Chrome, with dark reading, AI explanations and local text recognition.

**Website:** https://pdf.songming.org

Open `index.html` directly to view the website. It is plain HTML, CSS and JavaScript, with no build step, external fonts, analytics or GitHub Actions.

English is the initial language. Visitors can choose Simplified Chinese. Appearance follows the device until changed with the footer’s Appearance text button. The website remembers these choices locally.

See [maintenance and publishing](docs/MAINTENANCE.md) for local checks, download packages and GitHub Pages setup.

Homepage aliases `/index.html`, `/index`, and `/index/` redirect to the root over HTTP/HTTPS, retaining query parameters and fragments. The `index/` directory supplies the static extensionless entry, while `redirect.js` normalizes it before rendering. Local `file://` opening is unchanged.
