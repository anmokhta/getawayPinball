/* ==========================================================================
   Drinks menu — fetch (live sheet + local fallback), parse, render
   ========================================================================== */

const SHEET_ID = "13sG85RrWNKItkQ7nmJqvWqSL9B7YgKsEmzrRoftITZk";
const ALCOHOLIC_GID = "0";
const NON_ALCOHOLIC_GID = "1770095770";
const LIVE_FETCH_TIMEOUT_MS = 5000;

const FALLBACK_URL = new URL("../data/drinks.json", import.meta.url);

function sheetCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Minimal RFC4180-style CSV parser — handles quoted fields, embedded
 * commas/newlines within quotes, and escaped ("") double quotes.
 */
export function parseCsv(text) {
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
  return rows.slice(1).map((cells) => {
    const drink = {};
    headers.forEach((header, index) => {
      const value = (cells[index] || "").trim();
      if (header === "drink") drink.name = value;
      else if (header === "size") drink.size = value;
      else if (header === "description") drink.description = value;
      else if (header === "price") drink.price = value;
    });
    return drink;
  }).filter((drink) => drink.name);
}

async function fetchCsvTab(gid, signal) {
  const response = await fetch(sheetCsvUrl(gid), { signal });
  if (!response.ok) {
    throw new Error(`Sheet tab ${gid} responded with ${response.status}`);
  }
  const text = await response.text();
  return rowsToDrinks(parseCsv(text));
}

export async function fetchLiveDrinksMenu() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIVE_FETCH_TIMEOUT_MS);

  try {
    const [alcoholic, nonAlcoholic] = await Promise.all([
      fetchCsvTab(ALCOHOLIC_GID, controller.signal),
      fetchCsvTab(NON_ALCOHOLIC_GID, controller.signal),
    ]);

    if (alcoholic.length === 0 && nonAlcoholic.length === 0) {
      throw new Error("Live sheet returned no drinks");
    }

    return { alcoholic, nonAlcoholic };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchFallbackDrinksMenu() {
  const response = await fetch(FALLBACK_URL);
  if (!response.ok) {
    throw new Error(`Failed to load drinks.json (${response.status})`);
  }
  return response.json();
}

export async function fetchDrinksMenu() {
  try {
    return await fetchLiveDrinksMenu();
  } catch (error) {
    console.warn("Falling back to cached drinks menu:", error);
    return fetchFallbackDrinksMenu();
  }
}

export function renderAlcoholicItem(drink) {
  const meta = [drink.size, drink.description].filter(Boolean).join(" - ");

  return `
    <li class="group">
      <div class="flex items-center justify-between gap-4 mb-1">
        <span
          class="font-headline text-lg font-bold uppercase text-on-surface group-hover:text-accent-red transition-colors"
          >${escapeHtml(drink.name)}</span
        >
        <span
          class="font-headline text-lg text-on-surface-variant group-hover:text-accent-red transition-colors whitespace-nowrap"
          >${escapeHtml(drink.price)}</span
        >
      </div>
      <p class="font-body-md text-on-surface-variant">
        ${escapeHtml(meta)}
      </p>
    </li>
  `;
}

export function renderNonAlcoholicItem(drink) {
  return `
    <li class="group">
      <div class="flex items-center justify-between mb-1">
        <span
          class="font-headline text-lg font-bold uppercase text-on-surface group-hover:text-accent-red transition-colors"
          >${escapeHtml(drink.name)}</span
        >
        <span
          class="font-headline text-lg text-on-surface-variant group-hover:text-accent-red transition-colors whitespace-nowrap"
          >${escapeHtml(drink.price)}</span
        >
      </div>
      <p class="font-body-md text-on-surface-variant">
        ${escapeHtml(drink.size)}
      </p>
    </li>
  `;
}
