#!/usr/bin/env node
"use strict";

/*
  Local preview server — run with `npm run dev`.

  Serves the site the same way GitHub Pages does: directory URLs like
  "/machines/" resolve to their index.html automatically. This avoids the
  broken-links experience of opening the HTML files directly via `file://`
  (double-clicking index.html), where there's no server to do that
  resolution and clicking a nav link just shows the OS/browser's raw
  folder listing instead of the page.

  TODO(remove): local test sync button — also remove the /__dev/sync-machines
  handler below when the temporary Load button on /machines/ is deleted.
*/

const path = require("node:path");
const { createStaticServer, isLocalhost, sendJson } = require("./static-server");
const { syncMachines } = require("./sync-machines");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 8080;

let syncInFlight = null;

async function handleDevRoutes(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  // TODO(remove): local test sync button
  if (urlPath === "/__dev/sync-machines") {
    if (!isLocalhost(req)) {
      sendJson(res, 404, { ok: false, error: "Not found" });
      return true;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "POST required" });
      return true;
    }

    try {
      if (!syncInFlight) {
        syncInFlight = syncMachines().finally(() => {
          syncInFlight = null;
        });
      }
      const result = await syncInFlight;
      sendJson(res, 200, {
        ok: true,
        count: result.count,
        written: result.written,
        unresolvedCount: result.unresolvedCount,
      });
    } catch (error) {
      console.error("Local sync-machines failed:", error);
      sendJson(res, 500, {
        ok: false,
        error: error.message || String(error),
      });
    }
    return true;
  }

  return false;
}

const server = createStaticServer(ROOT, { onRequest: handleDevRoutes });

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use. Try: PORT=8081 npm run dev\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\nThe Getaway Pinball Arcade — local preview`);
  console.log(`  ➜  http://127.0.0.1:${PORT}/\n`);
  console.log("Press Ctrl+C to stop.\n");
});
