# Game List Tab: Non-Programmer Update Options

The site will be hosted on GitHub Pages (or similar static hosting), which has no server or database. To let a **non-programmer** keep the Game List tab current, the best approach is to point the site at a data source with a friendly editing UI, rather than requiring anyone to touch code or git directly. Below are the top 3 options, ranked roughly by setup effort.

## 1. Pinball Map as the Source of Truth (Recommended starting point)

[Pinball Map](https://pinballmap.com/map) is a crowdsourced database built specifically for this use case — arcades and bars already use it to keep their machine lineup current.

- **How editors update it:** Staff log into [pinballmap.com](https://pinballmap.com/) and manage the venue's machine list (add/remove machines, mark condition) through Pinball Map's own web UI. No code, no git, nothing custom to build.
- **How the site consumes it:** Pull data via the public API:
  - `GET https://pinballmap.com/api/v1/locations/:id/machine_details.json` returns a `machines` array (name, manufacturer, year, IPDB link).
  - A scheduled GitHub Action (e.g. hourly/daily) fetches that JSON, writes it into a `games.json` in the repo, commits, and GitHub Pages redeploys. This keeps the site fully static and avoids CORS issues (no client-side fetch needed).
- **Tradeoffs:** Limited to Pinball Map's schema — name, manufacturer, year, IPDB link. No custom photos, difficulty ratings, or "NEW"/"LEGEND" tags like the `stitch_prototyping` mockups show, unless layered on separately.
- **Bonus:** Also lists the venue on the public Pinball Map locator app/map — free marketing most arcades want anyway.

## 2. Git-Based CMS — Decap CMS (formerly Netlify CMS)

Add a `/admin` page backed by [Decap CMS](https://decapcms.org/), which provides a clean form UI (title, manufacturer, difficulty, description, photo upload) that commits directly to the GitHub repo via GitHub login/OAuth.

- **How editors update it:** Log in, fill out a form per machine, click "Publish." No git or markdown knowledge required.
- **How the site consumes it:** Decap writes structured content files (e.g. Markdown/JSON with front matter) straight into the repo; the site's build process picks them up on the next deploy.
- **Tradeoffs:** More setup work up front — a config file plus a small GitHub OAuth app — but no ongoing hosting cost, and it's open source.
- **Why it's a strong option:** Full control over exactly the fields shown in the design mockups (difficulty dots, "NEW"/"LEGEND" tags, photos, blurbs) — not limited to a third-party schema like Pinball Map.

## 3. Spreadsheet as the Data Source (Google Sheets / Airtable)

Store the machine list in a shared Google Sheet or Airtable base — an interface almost everyone already knows how to use.

- **How editors update it:** Edit rows/columns directly in the spreadsheet — add a machine, update a description, reorder rows.
- **How the site consumes it:** A GitHub Action (scheduled or manually triggered) pulls the sheet via the Sheets/Airtable API (or a published CSV URL), converts it to `games.json`, and commits it back to the repo.
- **Tradeoffs:** Requires one-time setup of a small script plus an API key/service account. After that, editors never touch anything but the spreadsheet.
- **Why it's a strong option:** Great middle ground between "zero custom UI" (Pinball Map) and "full custom field control" (Decap CMS) — arbitrary custom fields (difficulty, tags, blurbs) with minimal engineering investment.

## Recommendation

Start with **Pinball Map (#1)** for the raw machine list since it fits how arcades already operate day-to-day and needs no custom UI to be built. Layer in **Decap CMS (#2)** if/when richer per-machine content (photos, difficulty ratings, "NEW"/"LEGEND" tags matching the `stitch_prototyping/v1` and `v2 (mini)` mockups) becomes a priority — it stays fully no-code for editors while giving complete control over the card design.
