---
name: Refactor v2 mini into root index page
overview: "Turn `prototyping/stitch_prototyping/v2 (mini)/code.html` into a clean, production-style static site at the repo root: `index.html` plus separated `css/` and `js/` files, with the placeholder Google-hosted logo images swapped for the real local assets in `assets/`. Visual output and behavior stay the same aside from the logo swap and a couple of dead/invalid-markup cleanups that have zero visual effect."
todos:
  - id: create-css
    content: Create css/style.css with extracted + reformatted styles
    status: completed
  - id: create-js
    content: Create js/tailwind-config.js and js/main.js
    status: completed
  - id: create-index
    content: "Create index.html: reformatted markup, links to new css/js files, swapped-in local logo assets, favicon, dead-markup cleanup"
    status: completed
  - id: verify
    content: Open index.html to visually confirm it matches the original v2 mini prototype
    status: completed
isProject: false
---

## Source & Target

- Source: [`prototyping/stitch_prototyping/v2 (mini)/code.html`](prototyping/stitch_prototyping/v2%20(mini)/code.html) (420 lines, minified/inline-styled AI-tool output).
- Target: new files at repo root, following the same flat convention as the existing [`assets/`](assets) folder:
  - `index.html`
  - `css/style.css`
  - `js/tailwind-config.js`
  - `js/main.js`

## File Split

- **`index.html`**: full markup, reformatted with consistent indentation and semantic structure (`header`, `main`, `section`, `footer` already present — just cleaned up). Keeps the Tailwind Play CDN `<script src="https://cdn.tailwindcss.com...">` tag (rewriting the whole page off Tailwind is out of scope), the Google Fonts / Material Symbols `<link>` tags, and loads:
  - `<script src="js/tailwind-config.js">` (must load after the Tailwind CDN script, same order as today's inline version)
  - `<link rel="stylesheet" href="css/style.css">`
  - `<script src="js/main.js" defer>` before `</body>`
- **`css/style.css`**: the current inline `<style>` block content (base reset, `::-webkit-scrollbar` hide, `.glass-card`, `.neon-glow-primary/red`, `.neon-text-red`, `.neon-border-red`, `.logo-neon-red`), reformatted with section comments. The header's hardcoded `style="top: 52px;"` inline override moves into a `.site-header { top: 52px; }` rule (same rendered position, no inline style attribute).
- **`js/tailwind-config.js`**: the `tailwind.config = {...}` object, extracted verbatim (colors, spacing, fontFamily, fontSize, borderRadius), just reformatted.
- **`js/main.js`**: the existing glass-card hover glow micro-interaction, extracted and wrapped in a `DOMContentLoaded` listener for safe external-script loading.

## Logo Swap (per `assets/`)

Replace the two `lh3.googleusercontent.com` placeholder logo `<img>` sources with local files:
- Header mark (small, `h-8`, next to nav): `assets/full_logo_crop_wordmark.png` — transparent wordmark-only crop, right size/detail for a compact header lockup.
- "Find the Vibe" location section mark (`h-16`, prominent): `assets/full_logo_transparent.png` — full lockup with "PINBALL • ARCADE" + "DUBLIN, CALIFORNIA", the most complete brand mark for a large, standalone placement.
- Add `<link rel="icon" href="assets/icon_transparent.png">` in `<head>` — there's currently no favicon at all; `icon_transparent.png` (transparent "G" mark) is the appropriate asset for this.

All other placeholder images (hero background, 3 machine photos, location map photo) stay as-is since there are no local equivalents yet.

## Zero-Visual-Impact Cleanups

While reformatting, fix a few invalid/dead bits left over from the AI page-builder export (none change what renders):
- Stray `<html lang="en" style="">` → `<html lang="en">`.
- Invalid `<div>` nested inside an inline `<span>` for the address (`<span>...<div>...</div></span>`) → flattened to one `<span>`.
- Malformed footer address markup (`<p></p><div class="">...</div><p></p>`) → single clean `<p>`.
- Remove the now-empty `<!-- Tournaments -->` / `<!-- Membership -->` section (no content between the comments — dead markup, renders nothing today).
- Dedupe the two overlapping Material Symbols Google Fonts `<link>` tags into one.
- Trim the stray trailing blank lines at end of file.

## What stays identical

All copy, layout, Tailwind utility classes, the promo announcement bar, nav items/links (`href="#"` placeholders kept as-is), hero content, machine cards, location section content/images (besides the logo), footer content, and the hover micro-interaction behavior.
