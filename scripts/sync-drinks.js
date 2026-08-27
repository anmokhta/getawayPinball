#!/usr/bin/env node
"use strict";

/*
  Syncs data/drinks.json from the "THE GETAWAY DRINKS MENU" Google Sheet.

  Run manually with `npm run sync-drinks`, or automatically via the
  scheduled GitHub Action in .github/workflows/sync-drinks.yml.

  This is the fallback snapshot used by js/drink-menu.js whenever the
  browser's live fetch of the published sheet fails.
*/

const fs = require("node:fs");
const path = require("node:path");

const SHEET_ID = "13sG85RrWNKItkQ7nmJqvWqSL9B7YgKsEmzrRoftITZk";
const ALCOHOLIC_GID = "0";
const NON_ALCOHOLIC_GID = "1770095770";
const OUTPUT_PATH = path.join(__dirname, "..", "data", "drinks.json");

function sheetCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

/**
 * Minimal RFC4180-style CSV parser — handles quoted fields, embedded
 * commas/newlines within quotes, and escaped ("") double quotes.
 *
 * Kept in sync (but duplicated, for CommonJS/ESM independence) with the
 * browser-side parser in js/drink-menu.js.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function rowsToDrinks(rows) {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows
    .slice(1)
    .map((cells) => {
      const drink = {};
      headers.forEach((header, index) => {
        const value = (cells[index] || "").trim();
        if (header === "drink") drink.name = value;
        else if (header === "size") drink.size = value;
        else if (header === "description") drink.description = value;
        else if (header === "price") drink.price = value;
      });
      return drink;
    })
    .filter((drink) => drink.name);
}

async function fetchTab(gid) {
  const response = await fetch(sheetCsvUrl(gid));
  if (!response.ok) {
    throw new Error(`Sheet tab ${gid} responded with ${response.status}`);
  }
  const text = await response.text();
  return rowsToDrinks(parseCsv(text));
}

async function main() {
  const [alcoholic, nonAlcoholic] = await Promise.all([
    fetchTab(ALCOHOLIC_GID),
    fetchTab(NON_ALCOHOLIC_GID),
  ]);

  if (alcoholic.length === 0 && nonAlcoholic.length === 0) {
    throw new Error("Refusing to write drinks.json: sheet returned no drinks in either tab.");
  }

  const data = { alcoholic, nonAlcoholic };
  const previous = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, "utf8") : null;
  const next = `${JSON.stringify(data, null, 2)}\n`;

  if (previous === next) {
    console.log("data/drinks.json is already up to date.");
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, next);
  console.log(
    `Wrote data/drinks.json (${alcoholic.length} alcoholic, ${nonAlcoholic.length} non-alcoholic drinks).`
  );
}

main().catch((error) => {
  console.error("Failed to sync drinks.json:", error);
  process.exit(1);
});
