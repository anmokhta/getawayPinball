---
name: Site-wide consistency refactor
overview: First lock current site behavior with a characterization test suite (and fix the tests that already fail), then extract repeated Tailwind class strings and JS logic into shared CSS/JS without changing how pages look — except the planned fetch-error messages, whose tests get updated in that same step.
todos:
  - id: fix-stale-tests
    content: Fix existing tests that already fail against current copy/data (machines heading, machine names, file-protocol heading prefix)
    status: completed
  - id: characterization-tests
    content: Add characterization tests that pin current user-visible behavior and JS interactions (heroes, featured grid, location, decorative side text, machines toolbar, fetch-failure blanks) without asserting Tailwind class strings
    status: completed
  - id: css-classes
    content: Add new shared CSS classes to css/style.css (.section-container, .hero-shell, .hero-bg-layer, .hero-gradient-scrim, .decorative-vertical-text, .hero-eyebrow-label, .section-eyebrow-label, .hero-heading-sub, .hero-lede, .hero-left-container, .hero-eyebrow-rule, .section-accent-rule); also remove the dead commented-out old hero-menu.png line while in this file
    status: completed
  - id: apply-classes
    content: Update index.html, events/index.html, machines/index.html, menu/index.html, and js/partials.js to use the new classes instead of inline duplicated Tailwind strings
    status: completed
  - id: machines-css-split
    content: Move all machines-only CSS out of css/style.css into a new css/pages/machines.css (list-view rules, toolbar/dropdown styles, search expand, data-tooltip), linked only from machines/index.html
    status: completed
  - id: js-utils
    content: Create js/utils.js with shared escapeHtml() and a status-message renderer; update js/machine-card.js and js/drink-menu.js to import escapeHtml instead of redefining it
    status: completed
  - id: filter-source-of-truth
    content: Obsolete — machines toolbar rewrite already replaced the HTML/JS class-string split with CSS .toolbar-btn.is-active / .is-open. No work needed.
    status: cancelled
  - id: error-states
    content: Add consistent empty/error-state rendering to js/pages/home.js and js/pages/machines.js using the shared status-message renderer; update the characterization tests that currently pin the blank-on-failure behavior
    status: completed
  - id: cache-bust
    content: Fix menu.js?v=1 mismatch and bump ?v= on style.css/home.js/machines.js/menu.js references across all pages
    status: completed
  - id: conventions-doc
    content: Add CONVENTIONS.md documenting the shared-chrome/shared-style/shared-logic convention
    status: completed
  - id: verify
    content: Run npm test (characterization suite must stay green except the intentional error-state assertion updates) and manually check all 4 pages for zero unintended visual change
    status: completed
isProject: false
---

# Site-Wide Consistency Refactor

## Audit summary

Full audits of the 4 live pages (`index.html`, `events/index.html`, `machines/index.html`, `menu/index.html`) and all `js/` modules turned up the same failure mode as the "Insert Coin // Play Again" bug: **the same visual pattern or logic is hand-copied into multiple files instead of living in one place**, so edits silently drift out of sync. Full findings are in subagents [Audit HTML pages for duplication](5b6bf33c-d53f-4b42-b02f-309cb39ecee7) and [Audit CSS and config for inconsistency](bed89e3a-89a7-42fc-ad3c-af5390bb8fdf).

Note: no README/AGENTS.md/.cursor/rules exist today, so there's no written convention — this plan also proposes writing one down.

## Updates to the site since this plan was first drafted

Re-reviewed against current `main` (working tree clean, latest commits `14fbc6f` / `024a510` / `db06311`). The overall approach is unchanged. Two todos needed adjustment because the machines page toolbar was rewritten; everything else still applies.

- **Machines toolbar rewrite** (`machines/index.html` + `js/machine-card.js` + a large new block in `css/style.css`) — the old Stern/Williams/Bally chip buttons and `FILTER_ACTIVE_CLASSES` / `FILTER_INACTIVE_CLASSES` JS constants are gone. Filter/Sort are dropdowns; Search expands in place; View still toggles list/grid. Active/open state is now CSS (`.toolbar-btn.is-active` / `.is-open`), which already is a single source of truth. **The `filter-source-of-truth` todo is obsolete and cancelled.**
- **`css/style.css` grew a machines-only section** — list-view rules (plus a mobile stack media query), `.toolbar-*` / dropdown styles, `#machine-search-wrapper` expand, and `[data-tooltip]`. None of these are used on home/events/menu. **`machines-css-split` still happens, but it now moves this whole machines-only block**, not just the original list-view selectors.
- **`.hero-bg-menu` still has the dead commented-out `hero-menu.png` line** — drive-by cleanup while editing `style.css` still applies.
- **`id="location"` stays on the inner content `<div>`** in `index.html` — no conflict.
- **Home section divider drifted from menu** — home is now `h-[2px] w-32 bg-accent-red self-center opacity-30`; menu still adds `hidden md:block`. Do not force them identical. `.section-accent-rule` covers the shared visual; menu keeps `hidden md:block` as a page-specific utility.
- **Events section eyebrow gained `mb-4`** — still use `.section-eyebrow-label` plus that extra utility on events only.
- **`GAME_LIST_UPDATE_OPTIONS.md` was deleted** (`db06311`). The conventions doc should not cite it.
- **Pre-existing test drift (now in scope, phase 0):** `tests/pages.test.js` and `tests/file-protocol.test.js` still assert `"Every Table We've Got"` / `"Every Table"`; the page says `"Every Machine We've Got"`. The machines card test still expects `Medieval Madness`, which is no longer in `data/machines.json`. Fix these before adding new tests.

## 0. Characterization tests first (before any refactor)

Yes — other tests should be added, and they should land **before** the CSS/JS extraction. The current suite is too thin to catch a consistency refactor: it covers nav/footer chrome, a few hero strings, two CTA clicks, and scroll-to-`#location`. It does **not** cover home featured machines, decorative side text, the machines toolbar, fetch-failure behavior, or most of the copy this plan will touch.

Do not snapshot Tailwind class strings or CSS file paths. Those are exactly what this refactor will change. Pin **user-visible text, DOM IDs JS depends on, and interactive behavior**.

### 0a. Fix tests that already fail against current `main`

- [`tests/pages.test.js`](tests/pages.test.js) machines heading: `"Every Table We've Got"` → `"Every Machine We've Got"`.
- Same file, machine-card list: still asserts `Medieval Madness` (no longer in [`data/machines.json`](data/machines.json)). Assert current catalog names instead (`The Addams Family`, `Godzilla (Pro)`, `Williams`).
- [`tests/file-protocol.test.js`](tests/file-protocol.test.js) heading prefix `"Every Table"` → `"Every Machine"`.

### 0b. Expand page characterization ([`tests/pages.test.js`](tests/pages.test.js))

- **Home:** hero eyebrow `"The High Score Starts Here"`, heading contains `"This is your"` / `"Getaway"`, lede contains `"Everyone deserves a place to escape"`, decorative side text `"Insert Coin // Play Again"`, Featured section eyebrow `"— The Arsenal"` and heading `"Elite Playfields"`.
- **Home featured grid:** `#featured-machines-grid` renders 3 cards; first three names from `machines.json` (`The Addams Family`, `Aerosmith (Pro)`, `Avengers: Infinity Quest (Pro)`).
- **Home location:** `#location` exists; address `6890 Village Parkway` and phone `555-GETAWAY` are visible.
- **Events:** decorative side text `"League Nights // Soon"` (heading/eyebrow already covered).
- **Machines hero:** decorative side text `"Multiball // Tournament Ready"`; lede contains `"World-class tables"`.
- **Menu:** decorative side text `"Last Call // Stay Charged"`; section heading `"Alcoholic Beverages"` and `"Non-Alcoholic Beverages"`.

### 0c. New machines toolbar file ([`tests/machines-toolbar.test.js`](tests/machines-toolbar.test.js))

This is the highest-risk unique page logic and the CSS split will move its styles. Assert behavior, not class recipes:

- Filter dropdown opens; choosing Stern hides non-Stern cards; `"All Machines"` restores the full list; Filter toggle gets `is-active` only when a non-default filter is selected.
- Sort dropdown: `"Year (Newest First)"` puts a newer year above an older one; default Alphabetical is the initial order.
- Search expand/collapse: toggle reveals the field; typing a unique name (e.g. `Addams`) leaves that card and hides others; empty query restores the list; `#machine-search-empty` appears for a nonsense query.
- View toggle: clicking adds `list-view` on `#machine-grid`, swaps the icon to `grid_view`, and sets `aria-pressed="true"`; clicking again reverses it.

### 0d. Fetch-failure characterization (current behavior, then update later)

Home and machines currently log to console and leave an empty grid. Add tests that abort `machines.json` and assert `#featured-machines-grid` / `#machine-grid .list` stay empty. The later `error-states` todo will change this on purpose and update those two assertions to expect the new visible message. Menu already has fallback coverage via the Google Sheet abort.

### 0e. Cheap Node unit tests (no browser)

[`js/drink-menu.js`](js/drink-menu.js) already exports `parseCsv`. Add [`tests/drink-menu.test.js`](tests/drink-menu.test.js) for quoted fields, commas, and escaped quotes. After `js/utils.js` exists, add a small `escapeHtml` unit test there as part of that todo — not before, since the function is not exported today.

### What not to add

- Pixel/screenshot diffs (this is a class-extraction refactor, not a visual redesign).
- Assertions on long Tailwind class strings or `style.css` vs `css/pages/machines.css` hrefs.
- Tests of prototyping/ stitch files.

`npm test` must be green at the end of this phase, **then** the CSS/JS extraction starts.

## Guiding principle (matches what the codebase already does in `js/partials.js` and `css/style.css`)

- Chrome that's byte-identical on every page (nav, footer) → JS custom element (`<site-header>`/`<site-footer>`, already done).
- A visual pattern reused with page-specific content (hero shells, eyebrow labels, containers) → a named CSS class in `css/style.css`, same as the existing `.glass-card` / `.neon-text-red` / `.hero-bg-*` classes. Since Tailwind is loaded via the Play CDN (no build step), these are hand-written plain CSS, not `@apply` — Play CDN cannot process an external linked stylesheet.
- Logic duplicated across JS modules (e.g. `escapeHtml`) → one shared module, imported everywhere.
- Interactive UI state (e.g. filter button active/inactive) must have exactly one source of truth, not "HTML's initial markup happens to match a JS constant."
- Per "rule of three"/YAGNI: only extract patterns that already repeat in ≥2 files today. Single-page styles (e.g. home's CTA buttons, menu's subheading) stay inline — extracting them now would be premature abstraction.
- **Consolidation is not the goal by itself — matching intent is.** Two things that render identically today but represent conceptually different elements (e.g. a hero's badge-pill eyebrow vs. a plain section-header eyebrow) stay as separate classes even if their current Tailwind strings overlap, so each is free to evolve independently. Only merge things that are the same *thing* wearing the same clothes, not things that coincidentally match right now.
- **File boundaries should mirror actual sharing.** Something used by 2+ pages/components belongs in a shared file (`css/style.css`, `js/utils.js`, `js/machine-card.js`). Something that only ever applies to one page/section belongs in its own file scoped to that page, not bolted onto the shared file where every other page pays the cost of loading/parsing CSS it never uses. `js/pages/home.js` / `machines.js` / `menu.js` already follow this for JS (page-specific orchestration, importing shared logic from `machine-card.js`/`drink-menu.js`); CSS currently does not (everything lives in one `css/style.css` regardless of scope) — fixed below.

## 1. New shared CSS classes in `css/style.css`

Add these alongside the existing `.glass-card`/`.neon-*` classes (hand-written CSS, values taken from `js/tailwind-config.js` tokens):

- `.section-container` — replaces `max-w-[1440px] mx-auto px-margin-mobile lg:px-margin-desktop`, repeated 7+ times across pages plus twice inside `js/partials.js` (nav bar, footer).
- `.hero-shell` — the part of the hero `<section>` recipe that's identical on all 4 pages (`relative w-full overflow-hidden flex flex-col -mt-20 pt-40 pb-32`). Page-specific bits (`min-h-screen`, alignment, `text-center`) stay as ordinary utility classes layered alongside it, since those differences are intentional per-page design, not drift.
- `.hero-bg-layer` — replaces `w-full h-full bg-cover bg-center scale-105 blur-sm opacity-30`, pairs with the existing `.hero-bg-home/machines/menu` image classes (4 pages, verbatim).
- `.hero-gradient-scrim` — replaces `absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background` (4 pages, byte-identical).
- `.decorative-vertical-text` — replaces the already-identical vertical sidebar class string (4 pages) added when fixing the original "Insert Coin" bug.
- `.hero-eyebrow-label` — the hero-context eyebrow (`font-label-sm text-label-sm text-accent-red uppercase tracking-[0.3em] neon-text-red`), used by home's hero badge-pill, machines' hero, and menu's hero — these 3 are already byte-identical, so this is pure dedup with **zero visual change**.
- `.section-eyebrow-label` — the plain section-header eyebrow (`font-label-sm text-label-sm text-accent-red uppercase tracking-widest neon-text-red`), used by home's Featured Machines header and events' hero — already byte-identical between those two, **zero visual change**. Kept as a genuinely separate class from `.hero-eyebrow-label` per the pill-badge vs. plain-header distinction, even though both are "an eyebrow label" conceptually — no forced merge, no visual change to either group.
- `.hero-heading-sub`, `.hero-lede`, `.hero-left-container` — the subpage hero heading/paragraph/container, byte-identical today between `machines/index.html` and `menu/index.html`. Kept as small, single-purpose classes (typography only, spacing only, layout only) rather than one bundled "hero block" class, specifically so that if machines or menu needs to diverge later, that page can add one extra utility class or override a single property without having to fork the whole block back into inline styles.
- `.hero-eyebrow-rule` — replaces the small red dash accent (`w-12 h-px bg-accent-red neon-glow-red`), byte-identical between `machines/index.html` and `menu/index.html`.
- `.section-accent-rule` — replaces the shared red 2px divider (`h-[2px] w-32 bg-accent-red self-center opacity-30`) used on `index.html` (Featured Machines) and `menu/index.html` (Alcoholic). Menu additionally keeps `hidden md:block` as a page-specific utility — those two are no longer byte-identical, so do not fold the hide-on-mobile behavior into the shared class.

Then update all 4 page files (and the two spots in `js/partials.js`) to use these classes instead of the inline strings. Every one of these extractions consolidates markup that is already byte-identical — none of them changes how any page currently looks.

### Split out the one genuinely page-specific chunk: `css/pages/machines.css`

`css/style.css` currently also contains a large machines-only block: `#machine-grid.list-view` and related selectors, the `.toolbar-*` / dropdown styles, `#machine-search-wrapper` expand, and `[data-tooltip]`. None of these apply on home/events/menu. Move that whole block into a new `css/pages/machines.css`, linked only from `machines/index.html` (mirroring the existing `js/pages/` convention). Everything else in `style.css` (reset, neon/glass effects, hero classes, the new shared classes above) is used by all 4 pages, so it correctly stays in the one shared file.

## 2. JS consolidation

- **New `js/utils.js`** exporting `escapeHtml()`. Remove the duplicate definitions from `js/machine-card.js` and `js/drink-menu.js` and import from here instead — one sanitization implementation instead of two.
- **Filter-button split-brain is already gone.** The machines toolbar rewrite replaced those JS class-string constants with CSS `.toolbar-btn.is-active` / `.is-open`. No further work on that.
- **Consistent empty/error states**: `js/pages/menu.js` already shows a friendly empty-state message; `js/pages/home.js` and `js/pages/machines.js` do not — on fetch failure they still log to console only and leave the grid blank. Add a small shared status-message renderer (in `js/utils.js`) and use it consistently so a failed fetch shows a visible message on every data-driven page, not just menu.
- **Cache-bust fix**: `menu/index.html` still loads `js/pages/menu.js?v=1` while every other page script is `?v=2` — align it, and bump the `?v=` on every file touched by this refactor (`style.css`, `home.js`, `machines.js`, `menu.js`) across all pages that reference them so GitHub Pages/browsers don't serve stale cached copies after deploy.
- **No JS restructuring needed for the shared-vs-modular split** — `js/pages/{home,machines,menu}.js` are already page-specific orchestration files, and `js/machine-card.js` (shared by home + machines) / `js/drink-menu.js` (menu's own data+render logic) / `js/partials.js` (site-wide chrome) are already correctly-scoped shared components. The remaining real duplication is the `escapeHtml()` copy-paste.

## 3. Document the convention

Add a short conventions note (new `CONVENTIONS.md` at repo root) capturing the "shared chrome → custom element, shared style → CSS class, shared logic → JS module, page-specific CSS/JS in `css/pages/` / `js/pages/`, one source of truth for UI state" rules from this plan, so future page additions follow it by default. Optionally also add a matching `.cursor/rules/` entry so agents in this repo apply the same convention automatically.

## 4. Verification

- Run `npm test` after the characterization phase (must be fully green) and again after each refactor step. The suite now pins visible copy, DOM IDs, featured-card count, machines toolbar interactions, and current blank-on-fetch-failure. Class-name / stylesheet-href changes must not fail tests. The only intentional assertion updates are the two fetch-failure tests when the `error-states` todo lands.
- Manually diff rendered output (open each page) to confirm every page is pixel-identical to before — this refactor is pure deduplication of already-matching markup/logic, not a redesign.

## Out of scope (flagged, not fixing now)

- Duplicated NAP (address/phone) between the home page contact block and the footer partial: both already match; converting the static home block into JS-rendered content to "de-duplicate" it would hurt local-SEO best practice (crawlers prefer static NAP text), so it's left as intentional parallel content.
- The machines-page vs menu-page "surface panel" background (`p-4` vs `p-8`, extra decorative blob) is a genuine design difference, not accidental drift — left alone.
- Imported ES modules (`machine-card.js`, `drink-menu.js`) aren't cache-busted at all today (only top-level `<script>` tags carry `?v=`) — a pre-existing gap, called out but not fixed here to avoid scope creep.
