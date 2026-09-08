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
  ".md": "text/markdown; charset=utf-8",
};

function isEnvFileBasename(name) {
  if (name === ".env.example") return false;
  return name === ".env" || name.startsWith(".env.");
}

function isLocalhost(req) {
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  const remote = req.socket?.remoteAddress || "";
  const localHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
  const localRemotes = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
  return localHosts.has(host) && localRemotes.has(remote);
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

/**
 * Minimal static file server that mirrors how GitHub Pages serves this site:
 *   - Directory URLs (e.g. "/machines/") resolve to that folder's index.html,
 *     instead of showing a raw file listing.
 *   - Directory URLs missing their trailing slash (e.g. "/machines") get a
 *     301 redirect to the slash-terminated URL first, so relative asset
 *     paths inside the page (e.g. "../css/style.css") resolve correctly.
 *   - Dotenv files (.env, .env.*) are never served.
 *
 * Optional `onRequest` can short-circuit specific paths. Return true if the
 * request was handled.
 */
function createStaticServer(rootDir, { onRequest } = {}) {
  return http.createServer(async (req, res) => {
    try {
      if (onRequest && (await onRequest(req, res))) return;

      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
      const fsPath = path.join(rootDir, safePath);
      const base = path.basename(fsPath);

      if (isEnvFileBasename(base)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }

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
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal server error");
    }
  });
}

function sendFile(res, filePath) {
  if (isEnvFileBasename(path.basename(filePath))) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

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

module.exports = { createStaticServer, isLocalhost, sendJson, isEnvFileBasename };
