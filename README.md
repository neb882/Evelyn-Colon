# Evelyn Colon — documented case history

This repository contains a static, sourced case-history and memorial page about Evelyn Colon, formerly known as “Beth Doe.” It is designed to publish directly with GitHub Pages and has no build step or third-party runtime dependencies.

## Publish with GitHub Pages

1. Push the contents of this directory to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the publishing branch (normally `main`) and the root (`/`) folder.

The lowercase `index.html` and empty `.nojekyll` file are already in the publishing root. All browser assets use repository-relative paths, so the site also works as a project page at `https://<account>.github.io/<repository>/`.

Once the final public URL is known, an absolute canonical URL and absolute Open Graph image URL can optionally be added to `index.html` for stronger search and social-preview metadata.

## Project structure

- `index.html` — page content and source list
- `assets/styles.css` — responsive and print styles
- `assets/site.js` — navigation, theme, reading progress, and coordinate-copy behavior
- `assets/gallery/` — optimized responsive derivatives of the July 2026 field photographs
- `assets/evelyn-colon-social-card.jpg` — social-preview artwork
- `research/claim-register.md` — internal sourcing and wording decisions retained for maintainers

## Editorial and image notes

The page distinguishes adjudicated facts, reported allegations, family recollections, and unresolved questions. For historically sensitive edits, update both the visible source note and the claim register.

Seven field photographs were supplied to this project as having been taken in July 2026. The supplied files contain no embedded capture date, GPS data, or photographer credit. No reusable license is asserted here; add the photographer’s preferred credit and license details before redistribution if they become available.

The source PNG exports are intentionally not included. The site uses full-frame, optimized JPEG derivatives with responsive sizes, visible captions, descriptive alternative text, and lazy loading.
