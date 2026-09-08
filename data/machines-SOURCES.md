# `machines.json` — data & image sources

Ongoing methodology for how [`data/machines.json`](machines.json) is built and kept current. The one-time seed notes in [`machines-new-arrivals-SOURCES.md`](machines-new-arrivals-SOURCES.md) remain historical only.

## Roster (Pinball Map)

Source of truth for which machines are on the floor is **The Getaway Pinball Arcade** on [Pinball Map](https://pinballmap.com/map/?by_location_id=30142) (location id `30142`).

`scripts/sync-machines.js` fetches (server-side only, with `PINBALLMAP_API_TOKEN`):

1. `GET /api/v1/locations/30142/machine_details.json` — full machine catalog fields (`name`, `manufacturer`, `year`, `opdb_id`, `ipdb_id` / `ipdb_link`, `is_active`, …). Entries with `is_active === false` are dropped.
2. `GET /api/v1/locations/30142.json` — location show payload, including **location_machine_xrefs (LMXs)**. Each LMX `created_at` is stored as `pinballMapDateAdded` (ISO date). That is “first listed at this venue on Pinball Map,” not physical arrival and not the global catalog `Machine.created_at`.

The live site never calls Pinball Map. A daily GitHub Action (plus manual **Run workflow**) writes the snapshot into this repo; the browser only reads `data/machines.json`.

## Images (OPDB public HTML)

Translite / backglass URLs are resolved from [opdb.org](https://opdb.org) without the OPDB API:

1. Search `https://opdb.org/search?q={opdb_id}` (redirects to the machine page).
2. Open that machine’s `/images` page and parse the `<h5>Backglass/translite (N)</h5>` section.
3. If `N === 1`, use that image (`-small.jpg` → `-large.jpg` on `img.opdb.org`).
4. If `N > 1`, fetch each candidate’s caption; prefer a unique edition-keyword match, then a unique Translite/Backglass label.
5. If still tied, download each candidate’s dimensions and pick the one whose aspect ratio is closest to **1.55** (typical landscape translite; measured from known-good OPDB backglasses).
6. If OPDB still can’t produce an image, keep any existing `image` already in `machines.json` (manual override).
7. Only if there is still no image is the machine listed in `data/machines-images-needs-review.md`.

IPDB and Pinside are not used for automated image fetch (bot protection). Kineticist is out of scope for now (extra API key).

## Descriptions

`description` is editorial. The sync **carries forward** an existing description when the machine still matches by `opdbId` (fallback: slug `id`, then name + manufacturer + year). New machines get no description until written by hand. `badge` is not synced.

**Manual image overrides:** edit `image` on a machine in `machines.json` (e.g. after picking from the review file). The next sync keeps that URL whenever OPDB still can’t choose uniquely.

## Updating the list

The live site never calls Pinball Map. A daily GitHub Action (plus manual **Run workflow** under Actions → Sync machines list) writes `data/machines.json`. Optionally run `npm run sync-machines` locally with `PINBALLMAP_API_TOKEN` set (env var or a gitignored `.env` from `.env.example`).

## Attribution

Pinball Map data is [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The machines page links back to this location’s listing so people can update it there.
