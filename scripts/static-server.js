"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

/**
 * Minimal static file server that mirrors how GitHub Pages serves this site:
 *   - Directory URLs (e.g. "/machines/") resolve to that folder's index.html,
 *     instead of showing a raw file listing.
 *   - Directory URLs missing their trailing slash (e.g. "/machines") get a
 *     301 redirect to the slash-terminated URL first, so relative asset
 *     paths inside the page (e.g. "../css/style.css") resolve correctly.
 *
 * This is specifically to avoid the experience of opening pages via
 * `file://` (double-clicking index.html, or a plain non-Pages-aware static
 * server), where there's no server to do that resolution and clicking a nav
 * link just shows the OS/browser's raw folder contents.
 */
function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const fsPath = path.join(rootDir, safePath);

    fs.stat(fsPath, (statErr, stats) => {
      if (!statErr && stats.isDirectory()) {
        if (!urlPath.endsWith("/")) {
          res.writeHead(301, { Location: `${urlPath}/` });
          res.end();
          return;
        }
        return sendFile(res, path.join(fsPath, "index.html"));
      }
      return sendFile(res, fsPath);
    });
  });
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

module.exports = { createStaticServer };
