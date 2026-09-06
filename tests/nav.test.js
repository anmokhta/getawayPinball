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
    { path: "index.html", depthPrefix: "", activePage: "home", homeHref: "" },
    { path: "machines/", depthPrefix: "../", activePage: "machines", homeHref: "../" },
    { path: "events/", depthPrefix: "../", activePage: "events", homeHref: "../" },
    { path: "menu/", depthPrefix: "../", activePage: "menu", homeHref: "../" },
  ];

  for (const { path: pagePath, depthPrefix, activePage, homeHref } of pages) {
    test(`${pagePath}: renders header nav, footer, and promo banner`, async () => {
      const response = await page.goto(`${server.url}/${pagePath}`, { waitUntil: "networkidle0" });
      assert.equal(response.status(), 200);

      // Desktop nav only — mobile panel duplicates the same destinations.
      const navLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll("site-header nav:not([data-nav-panel]) a")).map((a) => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
          page: a.getAttribute("data-nav-page"),
        }))
      );
      assert.deepEqual(
        navLinks.map((l) => ({ text: l.text, href: l.href })),
        [
          { text: "Home", href: homeHref },
          { text: "Machines", href: `${depthPrefix}machines/` },
          { text: "Menu", href: `${depthPrefix}menu/` },
          { text: "Events", href: `${depthPrefix}events/` },
          { text: "Location", href: `${depthPrefix}index.html#location` },
        ],
        `desktop nav hrefs should be prefixed with "${depthPrefix}" on ${pagePath}`
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
          inMobile: Boolean(a.closest("[data-nav-panel]")),
        }))
      );

      // Desktop + mobile both mark the current page active.
      const activeLinks = state.filter((s) => s.isRed);
      assert.equal(activeLinks.length, 2, "desktop and mobile nav should each highlight the active page");
      assert.ok(activeLinks.every((s) => s.page === activePage && s.ariaCurrent === "page"));

      // Location is a section of Home, not its own page, and should never be highlighted.
      const locationLinks = state.filter((s) => s.page === null);
      assert.ok(locationLinks.length >= 1);
      assert.ok(locationLinks.every((s) => s.isRed === false));
    });
  }
});
