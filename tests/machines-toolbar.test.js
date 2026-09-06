"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./support/server");
const { launchBrowser, newPage } = require("./support/browser");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function visibleCardNames(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("#machine-grid .list .glass-card"))
      .filter((card) => card.style.display !== "none")
      .map((card) => card.querySelector(".name")?.textContent.trim())
  );
}

async function visibleCardYears(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("#machine-grid .list .glass-card"))
      .filter((card) => card.style.display !== "none")
      .map((card) => Number(card.dataset.year))
  );
}

describe("Machines page toolbar", () => {
  let server;
  let browser;
  let page;

  before(async () => {
    server = await startServer();
    browser = await launchBrowser();
  });

  after(async () => {
    await browser.close();
    await server.close();
  });

  beforeEach(async () => {
    page = await newPage(browser);
    await page.goto(`${server.url}/machines/`, { waitUntil: "networkidle0" });
    await page.waitForSelector("#machine-grid .list .glass-card");
  });

  afterEach(async () => {
    await page.close();
  });

  test("Filter dropdown: Stern hides non-Stern; All restores; is-active only when non-default", async () => {
    const filterToggle = await page.$("#machine-filter-toggle");
    assert.equal(await page.evaluate((el) => el.classList.contains("is-active"), filterToggle), false);

    await filterToggle.click();
    await page.waitForSelector("#machine-filter-menu:not(.hidden)");
    await page.click('#machine-filter-menu [data-filter="stern"]');
    await sleep(100);

    const sternOnly = await visibleCardNames(page);
    assert.ok(sternOnly.length > 0);
    const allStern = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#machine-grid .list .glass-card"))
        .filter((card) => card.style.display !== "none")
        .every((card) => card.dataset.manufacturer === "stern")
    );
    assert.ok(allStern, "every visible card should be Stern");
    assert.equal(await page.evaluate((el) => el.classList.contains("is-active"), filterToggle), true);

    await filterToggle.click();
    await page.waitForSelector("#machine-filter-menu:not(.hidden)");
    await page.click('#machine-filter-menu [data-filter="all"]');
    await sleep(100);

    const restored = await visibleCardNames(page);
    assert.ok(restored.length > sternOnly.length, "All Machines should restore the full list");
    assert.equal(await page.evaluate((el) => el.classList.contains("is-active"), filterToggle), false);
  });

  test("Sort dropdown: Year (Newest First) puts a newer year above an older one", async () => {
    const initialYears = await visibleCardYears(page);
    assert.ok(initialYears.length > 1);

    await page.click("#machine-sort-toggle");
    await page.waitForSelector("#machine-sort-menu:not(.hidden)");
    await page.click('#machine-sort-menu [data-sort="year-newest"]');
    await sleep(100);

    const sortedYears = await visibleCardYears(page);
    assert.ok(sortedYears[0] >= sortedYears[sortedYears.length - 1]);
    assert.ok(
      sortedYears.some((year, index) => index > 0 && year < sortedYears[0]),
      "newest-first sort should place a newer year before an older one"
    );

    const sortToggleActive = await page.evaluate(
      () => document.getElementById("machine-sort-toggle")?.classList.contains("is-active")
    );
    assert.equal(sortToggleActive, true);
  });

  test("Search expand/collapse filters by name and shows empty state", async () => {
    await page.click("#machine-search-toggle");
    await sleep(100);

    const expanded = await page.evaluate(() =>
      document.getElementById("machine-search-wrapper")?.classList.contains("is-expanded")
    );
    assert.equal(expanded, true);

    await page.type("#machine-search", "Addams");
    await sleep(150);

    const filtered = await visibleCardNames(page);
    assert.deepEqual(filtered, ["The Addams Family"]);

    await page.click("#machine-search");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    // Also clear via evaluate for reliability across platforms
    await page.evaluate(() => {
      const input = document.getElementById("machine-search");
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await sleep(100);

    const restored = await visibleCardNames(page);
    assert.ok(restored.length > 1);

    await page.type("#machine-search", "zzzz-no-such-machine");
    await sleep(150);

    const emptyVisible = await page.evaluate(
      () => !document.getElementById("machine-search-empty")?.classList.contains("hidden")
    );
    assert.equal(emptyVisible, true);
    assert.deepEqual(await visibleCardNames(page), []);
  });

  test("View toggle switches list-view on #machine-grid and updates aria/icon", async () => {
    const viewToggle = await page.$("#machine-view-toggle");

    await viewToggle.click();
    await sleep(50);

    const listState = await page.evaluate(() => {
      const grid = document.getElementById("machine-grid");
      const button = document.getElementById("machine-view-toggle");
      const icon = button?.querySelector(".material-symbols-outlined");
      return {
        hasListView: grid?.classList.contains("list-view"),
        ariaPressed: button?.getAttribute("aria-pressed"),
        icon: icon?.textContent.trim(),
      };
    });
    assert.equal(listState.hasListView, true);
    assert.equal(listState.ariaPressed, "true");
    assert.equal(listState.icon, "grid_view");

    await viewToggle.click();
    await sleep(50);

    const gridState = await page.evaluate(() => {
      const grid = document.getElementById("machine-grid");
      const button = document.getElementById("machine-view-toggle");
      const icon = button?.querySelector(".material-symbols-outlined");
      return {
        hasListView: grid?.classList.contains("list-view"),
        ariaPressed: button?.getAttribute("aria-pressed"),
        icon: icon?.textContent.trim(),
      };
    });
    assert.equal(gridState.hasListView, false);
    assert.equal(gridState.ariaPressed, "false");
    assert.equal(gridState.icon, "view_list");
  });
});
