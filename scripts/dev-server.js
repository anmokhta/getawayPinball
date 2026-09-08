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
*/

const path = require("node:path");
const { createStaticServer } = require("./static-server");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 8080;

const server = createStaticServer(ROOT);

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
