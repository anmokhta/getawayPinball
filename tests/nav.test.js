"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./support/server");
const { launchBrowser, newPage } = require("./support/browser");

describe("shared header/footer template (js/partials.js)", () => {
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

  const pages = [
    { path: "index.html", depthPrefix: "", activePage: "home" },
    { path: "machines/", depthPrefix: "../", activePage: "machines" },
    { path: "events/", depthPrefix: "../", activePage: "events" },
    { path: "menu/", depthPrefix: "../", activePage: "menu" },
  ];

  for (const { path: pagePath, depthPrefix, activePage } of pages) {
    test(`${pagePath}: renders header nav, footer, and promo banner`, async () => {
      const response = await page.goto(`${server.url}/${pagePath}`, { waitUntil: "networkidle0" });
      assert.equal(response.status(), 200);

      const navLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll("site-header nav a")).map((a) => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
          page: a.getAttribute("data-nav-page"),
        }))
      );
      assert.deepEqual(
        navLinks.map((l) => ({ text: l.text, href: l.href })),
        [
          { text: "Home", href: `${depthPrefix}index.html` },
          { text: "Machines", href: `${depthPrefix}machines/` },
          { text: "Events", href: `${depthPrefix}events/` },
          { text: "Menu", href: `${depthPrefix}menu/` },
          { text: "Location", href: `${depthPrefix}index.html#location` },
        ],
        `nav hrefs should be prefixed with "${depthPrefix}" on ${pagePath}`
      );

      const bannerText = await page.evaluate(() => document.querySelector("#promo-banner")?.textContent.trim());
      assert.match(bannerText, /Coming to Downtown Dublin/);

      const footerText = await page.evaluate(() => document.querySelector("site-footer footer")?.textContent || "");
      assert.match(footerText, /6890 Village Parkway/);

      const logoLoaded = await page.evaluate(() => {
        const img = document.querySelector("site-header img");
        return Boolean(img && img.complete && img.naturalWidth > 0);
      });
      assert.ok(logoLoaded, "header logo image should load without 404ing");
    });

    test(`${pagePath}: highlights "${activePage}" as the active nav link`, async () => {
      await page.goto(`${server.url}/${pagePath}`, { waitUntil: "networkidle0" });

      const state = await page.evaluate(() =>
        Array.from(document.querySelectorAll("site-header nav a")).map((a) => ({
          page: a.getAttribute("data-nav-page"),
          isRed: a.classList.contains("text-accent-red"),
          ariaCurrent: a.getAttribute("aria-current"),
        }))
      );

      const activeLinks = state.filter((s) => s.isRed);
      assert.equal(activeLinks.length, 1, "exactly one nav link should be highlighted red");
      assert.equal(activeLinks[0].page, activePage);
      assert.equal(activeLinks[0].ariaCurrent, "page");

      // Location is a section of Home, not its own page, and should never be highlighted.
      const locationLink = state.find((s) => s.page === null);
      assert.equal(locationLink.isRed, false);
    });
  }
});
