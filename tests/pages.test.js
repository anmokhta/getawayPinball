"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./support/server");
const { launchBrowser, newPage } = require("./support/browser");

describe("Machines / Events placeholder pages", () => {
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
  });

  afterEach(async () => {
    await page.close();
  });

  const placeholders = [
    { path: "machines/", eyebrow: "— The Arsenal" },
    { path: "events/", eyebrow: "— The Circuit" },
  ];

  for (const { path: pagePath, eyebrow } of placeholders) {
    test(`${pagePath} loads and shows a "Coming Soon" placeholder`, async () => {
      const response = await page.goto(`${server.url}/${pagePath}`, { waitUntil: "networkidle0" });
      assert.equal(response.status(), 200);

      const heading = await page.evaluate(() => document.querySelector("main h1")?.textContent.trim());
      assert.equal(heading, "Coming Soon");

      const label = await page.evaluate(() => document.querySelector("main span")?.textContent.trim());
      assert.equal(label, eyebrow);
    });
  }
});

describe("Home hero CTA buttons", () => {
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
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });
  });

  afterEach(async () => {
    await page.close();
  });

  test('"View Events" links to events/ and navigates there on click', async () => {
    const href = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main a")).find((a) => a.textContent.trim() === "View Events")?.getAttribute("href")
    );
    assert.equal(href, "events/");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click("main a[href='events/']"),
    ]);
    assert.equal(page.url(), `${server.url}/events/`);
  });

  test('"View Machines" links to machines/ and navigates there on click', async () => {
    const href = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main a")).find((a) => a.textContent.trim() === "View Machines")?.getAttribute("href")
    );
    assert.equal(href, "machines/");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click("main a[href='machines/']"),
    ]);
    assert.equal(page.url(), `${server.url}/machines/`);
  });
});
