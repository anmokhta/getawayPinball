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
4. If `N > 1`, fetch each candidate’s caption; if exactly one caption matches an edition keyword from the machine name (Pro, Premium, LE, etc.), use it; otherwise leave `image` unset.

Unresolved machines are listed in `data/machines-images-needs-review.md` (generated when needed) with candidate URLs for a human to finish.

IPDB and Pinside are not used for automated image fetch (bot protection). Kineticist is out of scope for now (extra API key).

## Descriptions

`description` is editorial. The sync **carries forward** an existing description when the machine still matches by `opdbId` (fallback: name + manufacturer + year). New machines get no description until written by hand. `badge` is not synced.

## Local testing

1. Copy `.env.example` → `.env` and set `PINBALLMAP_API_TOKEN` (gitignored; never committed).
2. `npm run sync-machines`, or use the temporary Load button on `/machines/` while `npm run dev` is running (POST `/__dev/sync-machines` — localhost only).
3. When satisfied, delete `.env`, remove the Load button and the `/__dev/sync-machines` route, and rely on the GitHub Action.

## Attribution

Pinball Map data is [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The machines page links back to this location’s listing so people can update it there.
