#!/usr/bin/env node
"use strict";

/*
  Syncs data/machines.json from Pinball Map (location 30142 — The Getaway)
  and resolves translite images from OPDB's public HTML.

  Run manually with `npm run sync-machines`, or automatically via the
  scheduled GitHub Action in .github/workflows/sync-machines.yml.

  Token: PINBALLMAP_API_TOKEN env var, or .env in the repo root (gitignored).
  Never hardcode the token. Never call this API from the browser.
*/

const fs = require("node:fs");
const path = require("node:path");

const LOCATION_ID = 30142;
const ROOT = path.join(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "data", "machines.json");
const REVIEW_PATH = path.join(ROOT, "data", "machines-images-needs-review.md");
const ENV_PATH = path.join(ROOT, ".env");
const USER_AGENT =
  "GetawayPinball-sync-machines/1.0 (+https://github.com; local arcade site sync)";
const OPDB_DELAY_MS = 350;
/** Typical OPDB translite/backglass landscape ratio (width/height). */
const TARGET_TRANSLITE_RATIO = 1.55;

function log(...args) {
  console.log("[sync-machines]", ...args);
}

function logWarn(...args) {
  console.warn("[sync-machines]", ...args);
}

const MANUFACTURER_SLUGS = {
  stern: "stern",
  "stern pinball": "stern",
  williams: "williams",
  bally: "bally",
  sega: "sega",
  "sega pinball": "sega",
  gottlieb: "gottlieb",
  dataeast: "data-east",
  "data east": "data-east",
  jerseyjack: "jersey-jack",
  "jersey jack": "jersey-jack",
  "jersey jack pinball": "jersey-jack",
  chicago: "chicago-gaming",
  "chicago gaming": "chicago-gaming",
  "chicago gaming company": "chicago-gaming",
};

/**
 * Load KEY=VALUE pairs from .env into process.env when the key is unset.
 * Does not override existing env vars (so GitHub Actions / shell export win).
 */
function loadDotEnv(filePath = ENV_PATH) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getApiToken() {
  loadDotEnv();
  const token = (process.env.PINBALLMAP_API_TOKEN || "").trim();
  if (!token) {
    throw new Error(
      "PINBALLMAP_API_TOKEN is not set. Add it to .env (see .env.example) or export it in your shell / GitHub Actions secret."
    );
  }
  return token;
}

function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function manufacturerSlug(manufacturer) {
  const key = String(manufacturer || "")
    .trim()
    .toLowerCase();
  if (MANUFACTURER_SLUGS[key]) return MANUFACTURER_SLUGS[key];
  return slugify(manufacturer) || "unknown";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, { redirect = "follow" } = {}) {
  const response = await fetch(url, {
    redirect,
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/json" },
  });
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return { text: await response.text(), url: response.url, response };
}

async function fetchJson(url) {
  const { text } = await fetchText(url);
  return JSON.parse(text);
}

function pinballMapUrl(pathname, token) {
  const url = new URL(`https://pinballmap.com/api/v1${pathname}`);
  url.searchParams.set("api_token", token);
  return url.toString();
}

function isoDateFromTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function editionKeywords(name) {
  const keywords = [];
  const patterns = [
    /\bpro\b/i,
    /\bpremium\b/i,
    /\ble\b/i,
    /\blimited edition\b/i,
    /\bvault edition\b/i,
    /\bblood red kiss\b/i,
    /\b70th anniversary\b/i,
    /\baniversary\b/i,
  ];
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) keywords.push(match[0].toLowerCase());
  }
  // Also pull parenthetical edition tags like "(Pro)"
  const paren = name.match(/\(([^)]+)\)/g) || [];
  for (const chunk of paren) {
    const inner = chunk.slice(1, -1).trim().toLowerCase();
    if (inner && !keywords.includes(inner)) keywords.push(inner);
  }
  return keywords;
}

/**
 * Parse OPDB /images page for Backglass/translite candidates.
 * Returns { urls: string[], captionsNeeded: boolean } where urls are -large.jpg.
 */
function parseOpdbImagesPage(html) {
  const sectionMatch = html.match(
    /<h5>\s*Backglass\/translite\s*\((\d+)\)\s*<\/h5>([\s\S]*?)(?=<h5>|$)/i
  );
  if (!sectionMatch) {
    return { count: 0, candidates: [] };
  }
  const count = Number(sectionMatch[1]);
  const section = sectionMatch[2];
  const candidates = [];
  const linkRe =
    /href="(https:\/\/opdb\.org\/machines\/\d+\/images\/\d+)"[^>]*style="background-image:\s*url\((https:\/\/img\.opdb\.org\/[^)]+)\)"/gi;
  let match;
  while ((match = linkRe.exec(section)) !== null) {
    const detailUrl = match[1];
    const thumbUrl = match[2];
    const imageUrl = thumbUrl.replace(/-small(\.[a-z]+)$/i, "-large$1");
    candidates.push({ detailUrl, imageUrl });
  }
  return { count, candidates };
}

async function fetchImageCaption(detailUrl) {
  await sleep(OPDB_DELAY_MS);
  const { text } = await fetchText(detailUrl);
  const header = text.match(/<div class="card-header">([^<]*)<\/div>/i);
  return (header?.[1] || "").trim();
}

/**
 * Read width/height from a JPEG (or PNG) by fetching the image bytes.
 * Returns { width, height, ratio } or null.
 */
async function fetchImageDimensions(imageUrl) {
  await sleep(OPDB_DELAY_MS);
  const response = await fetch(imageUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
  });
  if (!response.ok) return null;
  const buf = Buffer.from(await response.arrayBuffer());

  // PNG: IHDR at byte 16
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width > 0 && height > 0) {
      return { width, height, ratio: width / height };
    }
  }

  // JPEG: scan for SOF0–SOF3
  for (let i = 0; i < buf.length - 9; i++) {
    if (buf[i] !== 0xff) continue;
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      if (width > 0 && height > 0) {
        return { width, height, ratio: width / height };
      }
    }
  }
  return null;
}

/**
 * Among candidates, pick the one whose aspect ratio is closest to a typical
 * landscape translite. Returns null if dimensions can't be read for any.
 */
async function pickClosestTransliteRatio(candidates) {
  let best = null;
  for (const candidate of candidates) {
    const dims = await fetchImageDimensions(candidate.imageUrl);
    if (!dims) continue;
    const distance = Math.abs(dims.ratio - TARGET_TRANSLITE_RATIO);
    const scored = { ...candidate, ...dims, distance };
    if (!best || scored.distance < best.distance) best = scored;
  }
  return best;
}

async function resolveOpdbImage(opdbId, machineName) {
  if (!opdbId) {
    return { image: null, reason: "no opdb_id", candidates: [] };
  }

  await sleep(OPDB_DELAY_MS);
  const searchUrl = `https://opdb.org/search?q=${encodeURIComponent(opdbId)}`;
  const { url: machineUrl } = await fetchText(searchUrl);
  if (!/\/machines\/\d+/.test(machineUrl)) {
    return {
      image: null,
      reason: `OPDB search for ${opdbId} did not resolve to a machine page (${machineUrl})`,
      candidates: [],
    };
  }

  const imagesUrl = machineUrl.replace(/\/?$/, "") + "/images";
  await sleep(OPDB_DELAY_MS);
  const { text: imagesHtml } = await fetchText(imagesUrl);
  const { count, candidates } = parseOpdbImagesPage(imagesHtml);

  if (count === 0 || candidates.length === 0) {
    return {
      image: null,
      reason: "no Backglass/translite images on OPDB",
      candidates: [],
      opdbImagesUrl: imagesUrl,
    };
  }

  if (candidates.length === 1) {
    return {
      image: candidates[0].imageUrl,
      reason: null,
      candidates,
      opdbImagesUrl: imagesUrl,
    };
  }

  // Multiple candidates: try caption edition keyword match, then prefer
  // explicitly labeled Translite / Backglass over generic "Image".
  const keywords = editionKeywords(machineName);
  const labeled = [];
  for (const candidate of candidates) {
    const caption = await fetchImageCaption(candidate.detailUrl);
    labeled.push({ ...candidate, caption });
  }

  let pool = labeled;
  if (keywords.length > 0) {
    const matching = labeled.filter((c) => {
      const cap = c.caption.toLowerCase();
      return keywords.some((kw) => cap.includes(kw));
    });
    if (matching.length === 1) {
      return {
        image: matching[0].imageUrl,
        reason: null,
        candidates: labeled,
        opdbImagesUrl: imagesUrl,
      };
    }
    if (matching.length > 1) pool = matching;
  }

  const pickByCaptionWord = (word) =>
    pool.filter((c) => new RegExp(`\\b${word}\\b`, "i").test(c.caption));

  for (const word of ["translite", "backglass"]) {
    const hits = pickByCaptionWord(word);
    if (hits.length === 1) {
      return {
        image: hits[0].imageUrl,
        reason: null,
        candidates: labeled,
        opdbImagesUrl: imagesUrl,
      };
    }
    if (hits.length > 1) pool = hits;
  }

  // Last resort: pick the candidate closest to a typical translite aspect ratio.
  log(
    `  … ${pool.length} candidates still tied; picking closest to ratio ${TARGET_TRANSLITE_RATIO}`
  );
  const byRatio = await pickClosestTransliteRatio(pool);
  if (byRatio) {
    log(
      `  … chose ${byRatio.width}×${byRatio.height} (ratio ${byRatio.ratio.toFixed(3)})`
    );
    return {
      image: byRatio.imageUrl,
      reason: null,
      candidates: labeled,
      opdbImagesUrl: imagesUrl,
      pickedByRatio: true,
    };
  }

  return {
    image: null,
    reason: `multiple Backglass/translite images (${pool.length}); captions and ratios do not uniquely identify one`,
    candidates: labeled,
    opdbImagesUrl: imagesUrl,
  };
}

function loadExistingMachines() {
  if (!fs.existsSync(OUTPUT_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
  } catch {
    return [];
  }
}

function existingLookup(existing) {
  const byOpdb = new Map();
  const byId = new Map();
  const byKey = new Map();
  for (const machine of existing) {
    if (machine.opdbId) byOpdb.set(machine.opdbId, machine);
    if (machine.id) byId.set(machine.id, machine);
    const key = [
      String(machine.name || "")
        .trim()
        .toLowerCase(),
      String(machine.manufacturer || "")
        .trim()
        .toLowerCase(),
      String(machine.year || ""),
    ].join("|");
    byKey.set(key, machine);
  }
  return { byOpdb, byId, byKey };
}

function buildReviewMarkdown(unresolved) {
  const lines = [
    "# Machines needing image review",
    "",
    "Generated by `scripts/sync-machines.js` when a translite could not be",
    "chosen deterministically from OPDB. Pick one Backglass/translite URL",
    "and either add it via a future override file or fix the OPDB captions.",
    "",
  ];

  for (const item of unresolved) {
    lines.push(`## ${item.name}`);
    lines.push("");
    lines.push(`- Manufacturer: ${item.manufacturer}`);
    lines.push(`- Year: ${item.year}`);
    if (item.opdbId) lines.push(`- OPDB ID: \`${item.opdbId}\``);
    if (item.opdbImagesUrl) lines.push(`- Images page: ${item.opdbImagesUrl}`);
    lines.push(`- Reason: ${item.reason}`);
    lines.push("");
    if (item.candidates?.length) {
      lines.push("Candidates:");
      lines.push("");
      for (const c of item.candidates) {
        const cap = c.caption ? ` — ${c.caption}` : "";
        lines.push(`- ${c.imageUrl}${cap}`);
        if (c.detailUrl) lines.push(`  - detail: ${c.detailUrl}`);
      }
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

/**
 * Run the full sync. Returns { machines, written, unresolvedCount }.
 */
async function syncMachines() {
  log("Starting sync for Pinball Map location", LOCATION_ID);
  const token = getApiToken();
  log("API token loaded");

  log("Fetching machine_details.json and location.json…");
  const [details, location] = await Promise.all([
    fetchJson(pinballMapUrl(`/locations/${LOCATION_ID}/machine_details.json`, token)),
    fetchJson(pinballMapUrl(`/locations/${LOCATION_ID}.json`, token)),
  ]);
  log("Pinball Map responses received");

  const rawMachines = details.machines || details.location?.machines || [];
  if (!Array.isArray(rawMachines) || rawMachines.length === 0) {
    throw new Error("Pinball Map returned no machines for this location.");
  }

  const locationRecord = location.location || location;
  const lmxList =
    locationRecord.location_machine_xrefs ||
    location.location_machine_xrefs ||
    [];

  const lmxByMachineId = new Map();
  for (const lmx of lmxList) {
    const machineId = lmx.machine_id ?? lmx.machine?.id;
    if (machineId != null) {
      lmxByMachineId.set(machineId, lmx);
    }
  }

  const active = rawMachines.filter((m) => m.is_active !== false);
  log(
    `Roster: ${rawMachines.length} listed, ${active.length} active, ${lmxList.length} LMX date records`
  );

  const existing = loadExistingMachines();
  const { byOpdb, byId, byKey } = existingLookup(existing);
  log(`Existing snapshot: ${existing.length} machine(s) for description merge`);

  const machines = [];
  const unresolved = [];

  for (let i = 0; i < active.length; i++) {
    const raw = active[i];
    const name = raw.name;
    const manufacturer = raw.manufacturer || "";
    const year = raw.year;
    const opdbId = raw.opdb_id || null;
    const ipdbLink =
      raw.ipdb_link ||
      (raw.ipdb_id ? `https://www.ipdb.org/machine.cgi?id=${raw.ipdb_id}` : null);

    const lmx = lmxByMachineId.get(raw.id);
    const pinballMapDateAdded = isoDateFromTimestamp(lmx?.created_at);
    const id = slugify(name);

    const prev =
      (opdbId && byOpdb.get(opdbId)) ||
      byId.get(id) ||
      byKey.get(
        [
          String(name || "")
            .trim()
            .toLowerCase(),
          String(manufacturer || "")
            .trim()
            .toLowerCase(),
          String(year || ""),
        ].join("|")
      );

    log(`[${i + 1}/${active.length}] ${name} — resolving OPDB image…`);
    const imageAlt = `${name} pinball machine translite`;
    const resolved = await resolveOpdbImage(opdbId, name);
    // Prefer a fresh OPDB pick; if OPDB can't decide, keep a manual/prior image
    // so re-running sync does not wipe conflict resolutions in machines.json.
    let image = resolved.image || null;

    if (image) {
      log(`  ✓ image ok (opdb)`);
    } else if (prev?.image) {
      image = prev.image;
      log(`  ✓ kept existing image (manual/prior)`);
    } else {
      logWarn(`  ✗ no image (${resolved.reason || "unknown"})`);
      unresolved.push({
        name,
        manufacturer,
        year,
        opdbId,
        reason: resolved.reason || "unknown",
        candidates: resolved.candidates || [],
        opdbImagesUrl: resolved.opdbImagesUrl,
      });
    }

    const entry = {
      id,
      name,
      manufacturer,
      manufacturerSlug: manufacturerSlug(manufacturer),
      year,
      imageAlt,
    };

    if (image) entry.image = image;
    if (opdbId) entry.opdbId = opdbId;
    if (ipdbLink) entry.ipdbLink = ipdbLink;
    if (pinballMapDateAdded) entry.pinballMapDateAdded = pinballMapDateAdded;
    if (prev?.description) entry.description = prev.description;

    machines.push(entry);
  }

  machines.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const next = `${JSON.stringify(machines, null, 2)}\n`;
  const previous = fs.existsSync(OUTPUT_PATH)
    ? fs.readFileSync(OUTPUT_PATH, "utf8")
    : null;
  const written = previous !== next;
  if (written) {
    fs.writeFileSync(OUTPUT_PATH, next);
    log(`Wrote ${OUTPUT_PATH} (${machines.length} machines)`);
  } else {
    log(`${OUTPUT_PATH} unchanged (${machines.length} machines)`);
  }

  if (unresolved.length > 0) {
    fs.writeFileSync(REVIEW_PATH, buildReviewMarkdown(unresolved));
    logWarn(
      `${unresolved.length} machine(s) need image review → ${path.relative(ROOT, REVIEW_PATH)}`
    );
  } else if (fs.existsSync(REVIEW_PATH)) {
    fs.unlinkSync(REVIEW_PATH);
    log("Removed stale machines-images-needs-review.md (all images resolved)");
  }

  log("Sync finished");
  return {
    machines,
    count: machines.length,
    written,
    unresolvedCount: unresolved.length,
    reviewPath: unresolved.length > 0 ? REVIEW_PATH : null,
  };
}

async function main() {
  const result = await syncMachines();
  if (result.unresolvedCount > 0) {
    log(
      `${result.unresolvedCount} machine(s) need image review — see data/machines-images-needs-review.md`
    );
  }
  return result;
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Failed to sync machines.json:", error);
    process.exit(1);
  });
}

module.exports = { syncMachines, main, loadDotEnv, getApiToken };
