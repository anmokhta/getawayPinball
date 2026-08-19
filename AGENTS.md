# AGENTS.md

## Cursor Cloud specific instructions

This repo is **The Getaway Pinball Arcade** — a single, zero-backend static marketing
site (plain HTML/CSS/vanilla-JS ES modules). There is **no build step, no database, and
no server-side code** in production (deploys to GitHub Pages). Tailwind is loaded at
runtime via the Play CDN, so styling requires outbound network access to
`cdn.tailwindcss.com` and Google Fonts.

Standard commands live in `package.json`:

- Run the site locally: `npm run dev` → serves at `http://127.0.0.1:8080/` (override
  with `PORT`). Use this rather than opening files via `file://`, because directory
  URLs like `/machines/` only resolve to their `index.html` when served over HTTP (see
  `scripts/dev-server.js`). The machines grid also `fetch()`es `data/machines.json`,
  which only works over HTTP.
- Run tests: `npm test` (`node --test` driving Puppeteer browser tests in `tests/`).

Non-obvious notes:

- The Puppeteer tests use `puppeteer-core` with **no bundled browser**; they drive a
  system-installed Chrome auto-detected in `tests/support/chrome.js`. On this VM Chrome
  is at `/usr/bin/google-chrome` (already a detected path), so tests run without extra
  config. If detection ever fails, set `CHROME_PATH` to the browser executable.
- Known pre-existing test state: the 8 tests in `tests/nav.test.js` currently fail
  because the `site-header` template in `js/partials.js` renders **two** `<nav>`
  elements (a desktop nav and a mobile panel), so the test selector `site-header nav a`
  matches 10 links / 2 active links instead of the expected 5 / 1. This is an app/test
  mismatch, not an environment problem — the other suites (`pages`, `scroll`,
  `file-protocol`, and the nav click-behavior suite) pass.
- The manufacturer filter buttons (Stern/Williams/Bally) on the machines page are
  intentionally decorative and not wired up (see the comment in `machines/index.html`).
  The `#machine-search` box is the working filter (`initMachineSearch` in
  `js/machine-card.js`).
