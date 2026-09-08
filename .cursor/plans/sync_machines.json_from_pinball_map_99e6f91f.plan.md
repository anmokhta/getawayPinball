---
name: Sync machines.json from Pinball Map
overview: Add a deterministic, no-AI sync script (mirroring scripts/sync-drinks.js) that pulls The Getaway's real machine lineup from the Pinball Map API and enriches each entry with a translite image scraped from OPDB's public HTML, running on a daily GitHub Action.
todos:
  - id: get-token
    content: User stores PINBALLMAP_API_TOKEN as a GitHub Actions secret and in a gitignored local .env
    status: completed
  - id: env-files
    content: Add gitignored .env, committed .env.example, and block .env from the local static server
    status: completed
  - id: sync-script
    content: Write scripts/sync-machines.js (fetch Pinball Map roster, resolve images via OPDB HTML, merge descriptions, write machines.json + review file)
    status: completed
  - id: workflow
    content: Add .github/workflows/sync-machines.yml (daily cron + workflow_dispatch, commit-if-changed)
    status: completed
  - id: package-script
    content: Add npm run sync-machines to package.json
    status: completed
  - id: sources-doc
    content: Write data/machines-SOURCES.md documenting the ongoing methodology
    status: completed
  - id: attribution
    content: Add Pinball Map attribution link to machines/index.html
    status: completed
  - id: test-load-button
    content: Temporary Load button that POSTs to local-only /__dev/sync-machines (reads .env, runs same script); marked for deletion with the extra route
    status: completed
  - id: first-run
    content: Run the script once token exists, review data/machines-images-needs-review.md, manually resolve any flagged images
    status: completed
isProject: false
---

# Sync `data/machines.json` from Pinball Map

## Prerequisite (blocking — do this first)

Pinball Map now requires a manually-approved `api_token` on every API call (enforced since July 30, 2026). Never commit the token, never put it in `data/`, HTML, or JS, and never paste it into chat.

### Where to put the token

**GitHub Actions (needed for the daily sync):**

1. Open the repo on GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name (exact): `PINBALLMAP_API_TOKEN`
4. Value: the token Pinball Map gave you
5. Save

The workflow will inject it as `process.env.PINBALLMAP_API_TOKEN` when it runs `node scripts/sync-machines.js`.

**Local `.env` (needed only to run `npm run sync-machines` on your machine):**

- Committed: [`.env.example`](.env.example) with `PINBALLMAP_API_TOKEN=` (empty placeholder, no secret).
- Local only: copy to `.env` and paste the real token. Add `.env` to [`.gitignore`](.gitignore) so git never tracks it.
- `scripts/sync-machines.js` reads `.env` itself (tiny KEY=VALUE parser, no extra npm package). A real `process.env.PINBALLMAP_API_TOKEN` still wins if both are set.

`npm run dev` and opening the HTML as static files **do not use this token.** The machines page already loads [`data/machines.json`](data/machines.json) in the browser. Previewing the site just serves that snapshot. Sync first (Node, with the token), then refresh the local site to see the new JSON.

**Do not let the local server serve `.env`.** [`scripts/dev-server.js`](scripts/dev-server.js) serves the repo root, so `http://127.0.0.1:8080/.env` would leak the token in the browser if we ignored this. [`scripts/static-server.js`](scripts/static-server.js) will 404 any path whose basename is `.env` or starts with `.env.` (covers `.env.local` etc.). GitHub Pages would also serve a committed `.env` as a public file — gitignore is the other half of that.

Do **not** put the token in `.github/workflows/sync-machines.yml` as a literal string. Reference `secrets.PINBALLMAP_API_TOKEN` only.

## Architecture (mirrors the existing drinks pipeline)

```mermaid
flowchart LR
    cron[Daily GitHub Action] --> script[scripts/sync-machines.js]
    script --> pm["Pinball Map API\nmachine_details + location show\n(api_token from secret)"]
    script --> opdb["opdb.org HTML\n(public, unauthenticated)"]
    script --> merge["Merge with existing\ndata/machines.json\n(carry forward description)"]
    merge --> out1[data/machines.json]
    merge --> out2["data/machines-images-needs-review.md\n(only if any unresolved)"]
    out1 --> commit[git commit if changed]
    out2 --> commit
```

Unlike `js/drink-menu.js`, the **shipped site** never calls Pinball Map or OPDB — not on page load, not from a timer. GitHub Pages is static; there is no server to hide the token. Visitors only read the committed snapshot via `fetch("../data/machines.json")`.

**Local testing is different:** `npm run dev` can run the same Node sync behind a localhost-only route, reading `.env`. That path exists only while you are testing and is deleted with the button.

## Pinball Map endpoint (one location's machines)

Source of truth for the API surface is [pinballmap.com/llms.txt](https://pinballmap.com/llms.txt) (last updated 2026-08-06).

**The script hits these two endpoints** (both for location `30142` only — still well under Pinball Map's "fewer than 10 calls" guideline):

```
GET https://pinballmap.com/api/v1/locations/30142/machine_details.json?api_token=$PINBALLMAP_API_TOKEN
GET https://pinballmap.com/api/v1/locations/30142.json?api_token=$PINBALLMAP_API_TOKEN
```

`machine_details.json` is the dedicated "machines at this location" call. The JSON is a `machines` array of full catalog records (`name`, `manufacturer`, `year`, `opdb_id`, `opdb_img`, `ipdb_id`, `ipdb_link`, `is_active`, plus a catalog-level `created_at` that we **must not** treat as date-added).

`locations/30142.json` is the location show endpoint. Its default payload includes the venue's **location_machine_xrefs (LMXs)** — one record per machine *installed at this venue*. Each LMX has its own `created_at` (example: `"2023-05-07T16:57:26.948-07:00"`), which is when that machine was listed at The Getaway on Pinball Map. Join to `machine_details` by `machine.id` / LMX `machine_id`.

**Date-added field we store:** `pinballMapDateAdded` — ISO date (`YYYY-MM-DD`) taken from the matching LMX `created_at`. Not shown in the UI yet; extra JSON fields are ignored by `js/machine-card.js`.

**What this date is / is not:**
- It is "first listed at this location on Pinball Map."
- It is **not** physical arrival at the arcade, and **not** when the title was added to Pinball Map's global catalog (`Machine.created_at` on `machine_details.json` is that catalog date — do not use it).
- If a machine is removed from the listing and later re-added, LMX `created_at` resets to the re-add.

**Why not the other endpoints:**

- `GET /api/v1/locations.json?by_location_id=30142` is the bulk location index filtered to one venue. Do not use it; the two calls above already cover roster + LMX dates.
- `GET /api/v1/machines.json` is the **global** catalog of every machine in Pinball Map, not "what's on the floor here." Do not call it.
- Do **not** loop `GET /api/v1/location_machine_xrefs/:id.json` per machine — that's the N+1 anti-pattern Pinball Map forbids. The location show endpoint already returns all LMXs in one response.

Per Pinball Map's request-volume rules: two scheduled fetches of this single location, cache the result in `data/machines.json`, never call the API from a visitor's browser or per pageview.

## `scripts/sync-machines.js` (new, Node, no dependencies — matches `sync-drinks.js` style)

1. **Fetch the lineup** from both endpoints above in parallel (token read from `process.env.PINBALLMAP_API_TOKEN`; hard-fail with a clear message if unset — never hardcoded). Filter out `machine_details` entries with `is_active === false`.
2. **Map core fields** from the Machine schema plus the matching LMX:
   - `id`: deterministic slugify of `name` (strip `()`/`:`, lowercase, hyphenate) — matches existing ids like `black-knight-sword-of-rage-pro`.
   - `manufacturerSlug`: small lookup table (`Stern`/`Stern Pinball` → `stern`, `Williams` → `williams`, `Bally` → `bally`, etc.) with a generic slugify fallback for anything unlisted (falls into the existing "Others" filter pill automatically, per the comment in `js/machine-card.js`).
   - `year`: passed through.
   - `pinballMapDateAdded`: ISO date from LMX `created_at` (see endpoint section). Omit the field if no matching LMX is found.
   - Keep `opdbId` / `ipdbLink` in the output JSON (extra fields the renderer ignores) — needed as the merge key and useful for manual debugging/citations.
3. **Resolve the image, deterministically, no AI**:
   - Skip entirely if PM gave no `opdb_id`.
   - Fetch `https://opdb.org/machines/{opdb_id-resolved-numeric-page}/images` — resolved via `https://opdb.org/search?q={opdb_id}`, which 302-redirects straight to the canonical machine page (confirmed live against Aerosmith's `opdb_id`).
   - Parse the `<h5>Backglass/translite (N)</h5>` section (plain regex/string parsing, confirmed this grouping exists on OPDB's public, unauthenticated HTML).
     - `N === 1`: use it (convert the thumbnail's `-small.jpg` URL to `-large.jpg`, matching the convention already in `data/machines.json`).
     - `N === 0`: unresolved.
     - `N > 1`: fetch each candidate's caption (`<div class="card-header">…</div>`); if exactly one caption contains the machine's edition keyword (Pro/Premium/LE/etc.), use it; otherwise unresolved (this is the shared-"family"-page case, e.g. Godzilla 70th Anniversary, where OPDB's captions genuinely don't disambiguate and a human would need to look at the photo — confirmed live).
   - Add a short delay between requests and a descriptive `User-Agent` (courteous; `opdb.org/robots.txt` fully allows fetching, and this only runs once a day for ~20-30 machines).
   - Every unresolved machine gets no `image` field and is added to a generated `data/machines-images-needs-review.md` (same spirit as the existing `data/machines-new-arrivals-SOURCES.md`, listing each candidate photo URL found so a human can finish the call quickly).
4. **Merge with the current file** to avoid losing hand-written content: build a lookup from the existing `data/machines.json` keyed by `opdbId` (fallback: normalized `name`+`manufacturer`+`year`), and carry forward `description` for matches. `badge` is dropped from the schema entirely (per your call — it can't be derived deterministically and isn't worth faking).
5. **Sort** alphabetically by name (stable diffs) and write `data/machines.json` only if content changed (idempotent, same pattern as `sync-drinks.js`).

## `.github/workflows/sync-machines.yml` (new)

Same shape as `.github/workflows/sync-drinks.yml`. After you finish local testing, this is the **only** remaining way the Pinball Map API runs.

- `schedule`: once per 24 hours (`cron: "0 8 * * *"` UTC, ~1am Pacific — adjust if you want a different hour).
- `workflow_dispatch`: **Run workflow** in the GitHub Actions tab.
- `PINBALLMAP_API_TOKEN` from `secrets.PINBALLMAP_API_TOKEN`.
- Commit-if-changed on `data/machines.json` and `data/machines-images-needs-review.md`. GitHub Pages then serves the new snapshot.

The live site does not call the API on page load, on navigation, or on a timer.

## Local testing: `.env` + Load button (delete both when done)

The browser cannot read `.env`. The test button only works with `npm run dev` running, because the **dev server** (not the page) holds the key and runs the script.

**Setup**

1. Copy `.env.example` → `.env` (gitignored).
2. Put `PINBALLMAP_API_TOKEN=...` in `.env`.
3. `npm run dev`, open `/machines/`.

**Load button** — icon next to search in [`machines/index.html`](machines/index.html) (`refresh`, tooltip like "Sync from Pinball Map (local)"). Mark HTML + JS with `TODO(remove): local test sync button`.

On click it `POST`s to `http://127.0.0.1:<port>/__dev/sync-machines` (same origin as the preview). [`scripts/dev-server.js`](scripts/dev-server.js) / [`scripts/static-server.js`](scripts/static-server.js) handle that path **only on localhost**: load `.env` if needed, run the same `scripts/sync-machines.js` (or its exported `main`), write `data/machines.json`, return JSON `{ ok, count }` or an error. The page then re-fetches `machines.json` and re-renders.

If that route is hit on anything other than localhost, or `.env` / the env var is missing, return 404/500 and **do not** call Pinball Map. GitHub Pages has no such route, so a leftover button there would fail safely.

**When you are satisfied (you do this, or ask me):**

- Delete `.env`
- Remove the Load button and its click handler
- Remove the `/__dev/sync-machines` route
- Leave the GitHub Action + `npm run sync-machines` (Action still needs the script; you just won't use the button or `.env`)

Keep `.env.example` (empty placeholder) and the `.gitignore` entry so a future local run is still possible from the terminal without the button.

## `package.json`

Add `"sync-machines": "node scripts/sync-machines.js"`.

## Documentation

- New `data/machines-SOURCES.md` explaining the ongoing methodology (Pinball Map for the roster, OPDB's public HTML for images, the review-file fallback) — supersedes the one-time `data/machines-new-arrivals-SOURCES.md`, which stays as historical record of how the current 23 entries were originally seeded.

## Small site change (data-use-agreement attribution)

Pinball Map's terms require attributing the specific location shown. Add a small credit line/link to `machines/index.html` (e.g. near the footer of the machine grid) pointing to `https://pinballmap.com/map/?by_location_id=30142`.

## Open items / things you may want to revisit later (not blocking)

- `data/machines-BACKUP.json` and `data/machines-skeleton.json` look like stale scratch files (an old mockup and a backup with one stray diff already sitting in your working tree). Not touched by this plan — flagging in case you want them cleaned up separately.
- Kineticist has a promising images API as a possible 3rd image source, but requires yet another account/API key signup — left out of scope; can add later if OPDB's coverage proves insufficient once you see the real review-file output.
- New machines discovered by the sync that aren't in the current file will have no `description`; writing those blurbs is a separate, manual/editorial task outside this deterministic script.
