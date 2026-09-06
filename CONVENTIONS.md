# Site Conventions

Static HTML site (GitHub Pages). No build step. Tailwind via Play CDN + [`js/tailwind-config.js`](js/tailwind-config.js); hand-written CSS in [`css/style.css`](css/style.css) for effects and shared patterns.

## Where things live

| Kind of thing | Where it goes |
| --- | --- |
| Chrome identical on every page (nav, footer) | Custom elements in [`js/partials.js`](js/partials.js) (`<site-header>`, `<site-footer>`) |
| Visual pattern reused across pages (hero shell, section container, eyebrows) | Named class in [`css/style.css`](css/style.css) |
| Logic reused across modules (`escapeHtml`, status messages) | Shared module such as [`js/utils.js`](js/utils.js) |
| Page-specific JS orchestration | [`js/pages/`](js/pages/) (e.g. `home.js`, `machines.js`, `menu.js`) |
| Page-specific CSS | [`css/pages/`](css/pages/) (e.g. `machines.css`), linked only from that page |
| Domain components used by multiple pages | Shared modules (e.g. [`js/machine-card.js`](js/machine-card.js) for home + machines) |

## Matching intent, not forcing sameness

Consolidation is not the goal by itself. Two things that look alike today but represent different UI roles stay as separate classes (e.g. `.hero-eyebrow-label` vs `.section-eyebrow-label`) so each can evolve independently.

Only extract patterns that already repeat in two or more places. One-off page styles stay inline.

## Interactive UI state

Active/open/selected styles for controls must have one source of truth (usually CSS classes toggled by JS, as with `.toolbar-btn.is-active`). Avoid duplicating the same class recipe in both static HTML and JS constants.

## Paths and cache busting

Pages live at different depths. Scripts and assets use relative paths (`js/...` at root, `../js/...` under `machines/`). Shared partials resolve `SITE_BASE` from the `partials.js` script `src`.

Top-level `<script>` / `<link>` tags use a `?v=` query for cache busting after deploys. Bump it when those files change.
