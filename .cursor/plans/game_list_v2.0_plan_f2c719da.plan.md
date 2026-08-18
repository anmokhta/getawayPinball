---
name: Game List v2.0 Plan
overview: Restructure GAME_LIST_UPDATE_OPTIONS.md to preserve the existing options as "v1.0" and add a new "v2.0" section detailing a concrete Pinball Map + daily GitHub Action implementation plan, including an augmented games.json schema with translite image and dateAdded.
todos: []
isProject: false
---

# Update GAME_LIST_UPDATE_OPTIONS.md with v1.0 / v2.0 sections

This is a documentation-only change to [GAME_LIST_UPDATE_OPTIONS.md](GAME_LIST_UPDATE_OPTIONS.md). No code, no `games.json`, and no GitHub Action will actually be created yet — this plan just documents the v2.0 approach for later implementation.

## 1. Wrap existing content as "v1.0"

Keep the current intro paragraph and all three options (Pinball Map, Decap CMS, Spreadsheet) plus the "Recommendation" exactly as-is, but nest them under a new top-level heading:

```markdown
## v1.0 — Initial Options Considered
```

(All existing `##` option headings become `###` under it, so the doc's heading hierarchy stays valid.)

## 2. Add a new "v2.0" section

Add `## v2.0 — Pinball Map + Daily GitHub Action (Implementation Plan)` after the v1.0 section, covering:

**Approach**
- One Pinball Map *location* (the arcade) is the source of truth for the machine lineup — staff keep editing it in Pinball Map's own UI as described in v1.0 option #1.
- A GitHub Action runs on a daily `cron` schedule, calls `GET https://pinballmap.com/api/v1/locations/:id/machine_details.json`, transforms the result, and commits an updated `games.json` to the repo (only committing when content actually changed) so GitHub Pages redeploys.

**Schema (games.json)** — extends v1.0's base fields (`name`, `manufacturer`, `year`, `ipdbLink`) with:
- `translite` — image URL for the machine's translite/backglash art (see augmentation below for source).
- `dateAdded` — ISO date the machine first appeared in this repo's `games.json` (see below for why this must be tracked locally rather than trusted from the API).

Example entry:

```json
{
  "opdbId": "G43W4-MdEZ8",
  "name": "Medieval Madness",
  "manufacturer": "Williams",
  "year": 1997,
  "ipdbLink": "https://www.ipdb.org/machine.cgi?id=3842",
  "translite": "https://opdb.org/images/.../backglass.jpg",
  "dateAdded": "2026-08-17"
}
```

**Why `dateAdded` can't just come from the Pinball Map API**
- Pinball Map's machine `created_at`/`updated_at` timestamps describe the global machine catalog record, not "when this location added the machine" — so they're not reliable for a per-venue "new arrival" date.
- Instead, the Action's transform script should merge against the previously committed `games.json`: if a machine (by `opdb_id`/`ipdb_id`) already exists, carry forward its stored `dateAdded`; if it's new, stamp today's date.

**Augmenting the translite/headboard image**
- Pinball Map's `machine_details.json` already includes `opdb_img`, `opdb_img_height`, `opdb_img_width` per machine, but these are frequently `null`.
- Fallback: call the free [OPDB API](https://opdb.org/api) `GET /api/machines/{opdb_id}` (requires a free OPDB API token, stored as a GitHub Actions secret) — it returns an `images` array with backglass/translite, playfield, and cabinet photos. Prefer the backglass/translite image for the headboard.
- If no `opdb_id` is available, fall back to linking out via `ipdb_link` without an inline image.

**Other Pinball Map fields worth pulling in while we're already fetching (optional, layer in as useful)**
- `machine_type` (`em`/`ss`/etc.) and `machine_display` (`reels`/`dmd`/`lcd`) — could power a "classic vs modern" badge/filter.
- `is_active` — filter out machines Pinball Map users have flagged as pulled/broken.
- `machine_group_id` — group re-themes/LE variants under one card if desired.
- `ic_eligible` — flag machines that support Insider Connected (could show a small badge).
- `GET /api/v1/locations/:id/picture_details.json` — real on-site photos taken at this venue, as a nicer alternative/supplement to generic translite art.

**Workflow outline**
1. New workflow file (e.g. `.github/workflows/update-games.yml`) on a daily `schedule` trigger (+ `workflow_dispatch` for manual runs).
2. Script (Node, matching the repo's existing JS tooling) fetches Pinball Map data, optionally enriches via OPDB, merges `dateAdded` from the previous `games.json`, and writes the new file.
3. Commit-if-changed step (e.g. `git diff --quiet || git commit`) pushes back to the default branch.
4. Note: fields not available from Pinball Map (difficulty ratings, "NEW"/"LEGEND" tags, custom blurbs) remain a manual/future layer — could still be added later via v1.0's Decap CMS option if richer per-machine content becomes a priority.

## 3. File to edit
- [GAME_LIST_UPDATE_OPTIONS.md](GAME_LIST_UPDATE_OPTIONS.md) — restructure + append as above. No other files are touched by this plan.
