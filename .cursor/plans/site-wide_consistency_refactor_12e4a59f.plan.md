---
name: Site-wide consistency refactor
overview: Extract the repeated, drift-prone Tailwind class strings and JS logic found across all four pages into single sources of truth (CSS component classes + shared JS utilities), following the pattern the site already uses for header/footer (js/partials.js) and effect classes (.glass-card, .neon-text-red) — with no build step added and the existing Puppeteer test suite (npm test) kept green.
todos:
  - id: css-classes
    content: Add new shared CSS classes to css/style.css (.section-container, .hero-shell, .hero-bg-layer, .hero-gradient-scrim, .decorative-vertical-text, .hero-eyebrow-label, .section-eyebrow-label, .hero-heading-sub, .hero-lede, .hero-left-container, .hero-eyebrow-rule, .section-accent-rule); also remove the dead commented-out old hero-menu.png line while in this file
    status: pending
  - id: apply-classes
    content: Update index.html, events/index.html, machines/index.html, menu/index.html, and js/partials.js to use the new classes instead of inline duplicated Tailwind strings
    status: pending
  - id: machines-css-split
    content: Move the #machine-grid.list-view rules out of css/style.css into a new css/pages/machines.css, linked only from machines/index.html
    status: pending
  - id: js-utils
    content: Create js/utils.js with shared escapeHtml() and a status-message renderer; update js/machine-card.js and js/drink-menu.js to import escapeHtml instead of redefining it
    status: pending
  - id: filter-source-of-truth
    content: Fix js/machine-card.js initMachineFilters() to apply FILTER_ACTIVE_CLASSES/FILTER_INACTIVE_CLASSES on init, not just on click
    status: pending
  - id: error-states
    content: Add consistent empty/error-state rendering to js/pages/home.js and js/pages/machines.js using the shared status-message renderer
    status: pending
  - id: cache-bust
    content: Fix menu.js?v=1 mismatch and bump ?v= on style.css/home.js/machines.js/menu.js references across all pages
    status: pending
  - id: conventions-doc
    content: Add CONVENTIONS.md documenting the shared-chrome/shared-style/shared-logic convention
    status: pending
  - id: verify
    content: Run npm test and manually diff all 4 pages to confirm zero visual changes anywhere
    status: pending
isProject: false
---


# Site-Wide Consistency Refactor

## Audit summary

Full audits of the 4 live pages (`index.html`, `events/index.html`, `machines/index.html`, `menu/index.html`) and all `js/` modules turned up the same failure mode as the "Insert Coin // Play Again" bug: **the same visual pattern or logic is hand-copied into multiple files instead of living in one place**, so edits silently drift out of sync. Full findings are in subagents [Audit HTML pages for duplication](5b6bf33c-d53f-4b42-b02f-309cb39ecee7) and [Audit CSS and config for inconsistency](bed89e3a-89a7-42fc-ad3c-af5390bb8fdf).

Note: no README/AGENTS.md/.cursor/rules exist today, so there's no written convention — this plan also proposes writing one down.

## Updates to the site since this plan was first drafted

There are uncommitted working-tree changes (`git diff --stat`: `css/style.css`, `index.html`, `js/machine-card.js`, `menu/index.html`) plus two untracked files, made after the audit above. None of them change this plan's scope, but they touch some of the same files, so noting them explicitly:

- **`css/style.css`** — the `#machine-grid.list-view` rules (the block this plan moves to `css/pages/machines.css`) were reworked further: `.glass-card` in list view now goes fully transparent/borderless instead of just trimming borders, spacing shrank (`gap: 0` → `4px`, `padding: 20px 8px` → `14px 4px`), and two new selectors were added (`.card-body > *` margin reset, `.card-badge-inline`, plus a hover-color rule for `.name`/`.card-meta`). All of this is still page-specific list-view styling, so it just means a slightly larger block moves into `css/pages/machines.css` than originally scoped — no change to the plan step itself.
- **`css/style.css`** — `.hero-bg-menu`'s image swapped to a new `hero-menu-retrowave.png` (the old `hero-menu.png` line was commented out, not removed). Unrelated to this refactor, but since this plan already touches that file, worth deleting the dead commented-out line as a drive-by cleanup.
- **`index.html`** — `id="location"` moved from the `<section>` wrapper onto the inner content `<div>` (likely a scroll-anchor fix). Doesn't conflict with anything this plan changes — the hero/Featured-Machines edits are all above this section.
- **`js/machine-card.js`** — gained an inline list-view badge (`inlineBadge` / `.card-badge-inline`, reusing the existing `BADGE_CLASSES` map) shown next to the machine name, plus `transition-colors` on the name/meta for the new list-view hover effect. No new duplication introduced (same `BADGE_CLASSES` source used for both the corner badge and the inline one) — just means the `escapeHtml`-import and filter-button fixes in this plan will land on a slightly larger file than originally read.
- **`menu/index.html`** — the Non-Alcoholic panel's `lg:sticky lg:top-32` wrapper `<div>` was removed (panel no longer sticks on scroll); the panel's own classes are unchanged. Doesn't affect this plan — Non-Alcoholic panel isn't touched by any planned edit.
- **New untracked `data/machines-skeleton.json`** — byte-identical to `data/machines.json` today; not referenced by any code (`machine-card.js` still fetches `data/machines.json` only). Appears to be prep for the separate, unrelated "Game List v2.0" plan (Pinball Map + daily GitHub Action sync — see `.cursor/plans/game_list_v2.0_plan_f2c719da.plan.md`, currently a documentation-only plan with no code yet). No overlap with this refactor.

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
- `.section-accent-rule` — replaces the red 2px divider (`h-[2px] w-32 bg-accent-red self-center hidden md:block opacity-30`), byte-identical between `index.html` (Featured Machines) and `menu/index.html` (Alcoholic).

Then update all 4 page files (and the two spots in `js/partials.js`) to use these classes instead of the inline strings. Every one of these extractions consolidates markup that is already byte-identical — none of them changes how any page currently looks.

### Split out the one genuinely page-specific chunk: `css/pages/machines.css`

`css/style.css` currently also contains `#machine-grid.list-view` and its four related selectors (`.list`, `.glass-card` border override, `.card-media`, `.card-body`) — these only ever apply on `machines/index.html`'s grid/list view toggle; no other page has a `#machine-grid`. Move that block into a new `css/pages/machines.css`, linked only from `machines/index.html` (mirroring the existing `js/pages/` convention). Everything else in `style.css` (reset, neon/glass effects, hero classes, the new shared classes above) is used by all 4 pages, so it correctly stays in the one shared file — this isn't a call to fragment `style.css` further, just to stop shipping machines-only CSS to every page.

## 2. JS consolidation

- **New `js/utils.js`** exporting `escapeHtml()`. Remove the duplicate definitions from `js/machine-card.js` and `js/drink-menu.js` and import from here instead — one sanitization implementation instead of two.
- **Fix the filter-button split-brain** in `js/machine-card.js`: today `FILTER_ACTIVE_CLASSES`/`FILTER_INACTIVE_CLASSES` are only applied on click; the *initial* "All" button state is just hand-authored HTML in `machines/index.html` that happens to match. Make `initMachineFilters()` apply the correct class set to the initial active button on setup too, so the JS constants are the only source of truth going forward.
- **Consistent empty/error states**: `js/pages/menu.js` already shows a friendly empty-state message; `js/pages/home.js` and `js/pages/machines.js` do not — on fetch failure they log to console only and leave the grid stuck on whatever was in the static HTML (for machines/home, that's a blank `<div>`, since there's no "Loading…" placeholder there like menu.js has). Add a small shared status-message renderer (in `js/utils.js`) and use it consistently so a failed fetch shows a visible message on every data-driven page, not just menu.
- **Cache-bust fix**: `menu/index.html` loads `js/pages/menu.js?v=1` while every other page script is `?v=2` — align it, and bump the `?v=` on every file touched by this refactor (`style.css`, `home.js`, `machines.js`, `menu.js`) across all pages that reference them so GitHub Pages/browsers don't serve stale cached copies after deploy.
- **No JS restructuring needed for the shared-vs-modular split** — `js/pages/{home,machines,menu}.js` are already page-specific orchestration files, and `js/machine-card.js` (shared by home + machines) / `js/drink-menu.js` (menu's own data+render logic) / `js/partials.js` (site-wide chrome) are already correctly-scoped shared components. The only real duplication was the `escapeHtml()` copy-paste (fixed above) and the filter-button split-brain (fixed above) — the file boundaries themselves are already right.

## 3. Document the convention

Add a short conventions note (new `CONVENTIONS.md` at repo root, matching the project's existing habit of loose root-level markdown docs like `GAME_LIST_UPDATE_OPTIONS.md`) capturing the "shared chrome → custom element, shared style → CSS class, shared logic → JS module, one source of truth for UI state" rules from this plan, so future page additions follow it by default. Optionally also add a matching `.cursor/rules/` entry so agents in this repo apply the same convention automatically.

## 4. Verification

- Run `npm test` (Puppeteer suite in `tests/`) after each phase. Tests assert exact visible text (hero eyebrows/headings), `data-nav-page` classes, and DOM IDs (`#promo-banner`, `#location`, `#alcoholic-list`, `#machine-grid`, etc.) — none of those are changing, only the class attributes that carry styling, so this should stay green throughout.
- Manually diff rendered output (open each page) to confirm every page is pixel-identical to before — this refactor is pure deduplication of already-matching markup/logic, not a redesign.

## Out of scope (flagged, not fixing now)

- Duplicated NAP (address/phone) between the home page contact block and the footer partial: both already match; converting the static home block into JS-rendered content to "de-duplicate" it would hurt local-SEO best practice (crawlers prefer static NAP text), so it's left as intentional parallel content.
- The machines-page vs menu-page "surface panel" background (`p-4` vs `p-8`, extra decorative blob) is a genuine design difference, not accidental drift — left alone.
- Imported ES modules (`machine-card.js`, `drink-menu.js`) aren't cache-busted at all today (only top-level `<script>` tags carry `?v=`) — a pre-existing gap, called out but not fixed here to avoid scope creep.
