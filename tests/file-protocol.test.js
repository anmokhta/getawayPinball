"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { launchBrowser, newPage } = require("./support/browser");

const ROOT = path.join(__dirname, "..");
const fileUrl = (...segments) => pathToFileURL(path.join(ROOT, ...segments)).href;

describe("file:// browsing (opening index.html directly, no local server)", () => {
  let browser;
  let page;

  before(async () => {
    browser = await launchBrowser();
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await newPage(browser);
  });

  afterEach(async () => {
    await page.close();
  });

  const navPages = [
    { navPage: "machines", folder: "machines", heading: "Every Table" },
    { navPage: "events", folder: "events", heading: "Coming Soon" },
    { navPage: "menu", folder: "menu", heading: "Fuel Your" },
  ];

  for (const { navPage, folder, heading: expectedHeading } of navPages) {
    test(`clicking "${navPage}" in the nav lands directly on its index.html (not a folder listing)`, async () => {
      await page.goto(fileUrl("index.html"), { waitUntil: "networkidle0" });

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click(`site-header nav a[data-nav-page="${navPage}"]`),
      ]);

      assert.equal(page.url(), fileUrl(folder, "index.html"));
      const heading = await page.evaluate(() => document.querySelector("main h1")?.textContent.trim());
      assert.ok(
        heading?.startsWith(expectedHeading),
        `should render the actual page, not a directory listing (got: ${JSON.stringify(heading)})`
      );
    });
  }

  test('Home hero "View Events" button resolves straight to events/index.html', async () => {
    await page.goto(fileUrl("index.html"), { waitUntil: "networkidle0" });

    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("main a[href='events/']")]);
    assert.equal(page.url(), fileUrl("events", "index.html"));
  });

  test('Home hero "View Machines" button resolves straight to machines/index.html', async () => {
    await page.goto(fileUrl("index.html"), { waitUntil: "networkidle0" });

    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("main a[href='machines/']")]);
    assert.equal(page.url(), fileUrl("machines", "index.html"));
  });

  test("navigating between subpages (Machines -> Events) still resolves to index.html files", async () => {
    await page.goto(fileUrl("machines", "index.html"), { waitUntil: "networkidle0" });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click('site-header nav a[data-nav-page="events"]'),
    ]);
    assert.equal(page.url(), fileUrl("events", "index.html"));
  });

  test("Home nav link still works normally (untouched by the directory-link rewrite)", async () => {
    await page.goto(fileUrl("machines", "index.html"), { waitUntil: "networkidle0" });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click("site-header nav a[data-nav-home]"),
    ]);
    assert.equal(page.url(), fileUrl("index.html"));
  });
});
