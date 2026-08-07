"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./support/server");
const { launchBrowser, newPage } = require("./support/browser");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("cross-page nav click behavior (js/nav.js)", () => {
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

  describe('"Home" nav link and header logo', () => {
    test("on Home: scrolls to top in place instead of reloading/navigating", async () => {
      await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });
      await page.evaluate(() => window.scrollTo(0, 1500));
      await sleep(200);

      await page.click("site-header nav a[data-nav-home]");
      await sleep(900);

      assert.equal(page.url(), `${server.url}/index.html`);
      const scrollY = await page.evaluate(() => window.scrollY);
      assert.ok(scrollY < 5, `expected scrollY near 0, got ${scrollY}`);
    });

    test("clicking the logo on Home also scrolls to top in place", async () => {
      await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });
      await page.evaluate(() => window.scrollTo(0, 1500));
      await sleep(200);

      await page.click('site-header img[alt="The Getaway Logo"]');
      await sleep(900);

      assert.equal(page.url(), `${server.url}/index.html`);
      const scrollY = await page.evaluate(() => window.scrollY);
      assert.ok(scrollY < 5, `expected scrollY near 0, got ${scrollY}`);
    });

    test("from Machines: navigates to index.html instead of doing nothing", async () => {
      await page.goto(`${server.url}/machines/`, { waitUntil: "networkidle0" });
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("site-header nav a[data-nav-home]"),
      ]);
      assert.equal(page.url(), `${server.url}/index.html`);
    });

    test("from Events: clicking the logo navigates to index.html", async () => {
      await page.goto(`${server.url}/events/`, { waitUntil: "networkidle0" });
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click('site-header img[alt="The Getaway Logo"]'),
      ]);
      assert.equal(page.url(), `${server.url}/index.html`);
    });
  });

  describe('"Location" nav link', () => {
    test("on Home: smooth-scrolls down to the #location section in place", async () => {
      await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(200);

      await page.click("site-header nav a[data-nav-location]");
      await sleep(900);

      assert.equal(page.url(), `${server.url}/index.html`);
      const { scrollY, rectTop } = await page.evaluate(() => ({
        scrollY: window.scrollY,
        rectTop: document.getElementById("location").getBoundingClientRect().top,
      }));
      assert.ok(scrollY > 500, `expected to have scrolled down, got scrollY=${scrollY}`);
      assert.ok(
        rectTop >= 0 && rectTop < 300,
        `#location should be visible just below the sticky header, got rectTop=${rectTop}`
      );
    });

    test("from Machines: navigates to index.html#location and lands below the sticky header", async () => {
      await page.goto(`${server.url}/machines/`, { waitUntil: "networkidle0" });
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("site-header nav a[data-nav-location]"),
      ]);

      assert.equal(page.url(), `${server.url}/index.html#location`);
      const rectTop = await page.evaluate(() => document.getElementById("location").getBoundingClientRect().top);
      assert.ok(
        rectTop >= -50 && rectTop < 300,
        `#location should not be hidden under the sticky header, got rectTop=${rectTop}`
      );
    });
  });
});
