"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./support/server");
const { launchBrowser, newPage } = require("./support/browser");

describe("Machines page", () => {
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
  });

  afterEach(async () => {
    await page.close();
  });

  test('shows the hero heading and eyebrow', async () => {
    const heading = await page.evaluate(() => document.querySelector("main h1")?.textContent.replace(/\s+/g, " ").trim());
    assert.equal(heading, "Every Table We've Got");

    const eyebrow = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main span")).find((s) => s.textContent.trim())?.textContent.trim()
    );
    assert.equal(eyebrow, "— The Arsenal");
  });

  test("lists machine cards with manufacturers", async () => {
    const bodyText = await page.evaluate(() => document.querySelector("main")?.textContent || "");
    assert.match(bodyText, /Godzilla/);
    assert.match(bodyText, /Medieval Madness/);
    assert.match(bodyText, /Stern Pinball/);
    assert.match(bodyText, /Williams/);
  });
});

describe("Events placeholder page", () => {
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

  test('events/ loads and shows a "Coming Soon" placeholder', async () => {
    const response = await page.goto(`${server.url}/events/`, { waitUntil: "networkidle0" });
    assert.equal(response.status(), 200);

    const heading = await page.evaluate(() => document.querySelector("main h1")?.textContent.trim());
    assert.equal(heading, "Coming Soon");

    const label = await page.evaluate(() => document.querySelector("main span")?.textContent.trim());
    assert.equal(label, "— The Circuit");
  });
});

describe("Menu page", () => {
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
    // The menu page's live fetch normally hits the published Google Sheet
    // directly; block that here so the test deterministically exercises the
    // committed data/drinks.json fallback instead of depending on network
    // access or the sheet's current live contents.
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().includes("docs.google.com")) {
        request.abort();
      } else {
        request.continue();
      }
    });
    await page.goto(`${server.url}/menu/`, { waitUntil: "networkidle0" });
  });

  afterEach(async () => {
    await page.close();
  });

  test("shows the hero heading and eyebrow", async () => {
    const heading = await page.evaluate(() => document.querySelector("main h1")?.textContent.replace(/\s+/g, " ").trim());
    assert.equal(heading, "Fuel Your Next Run");

    const eyebrow = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main span")).find((s) => s.textContent.trim())?.textContent.trim()
    );
    assert.equal(eyebrow, "— The Refill");
  });

  test("lists alcoholic and non-alcoholic drinks from the fallback menu data", async () => {
    const alcoholicText = await page.evaluate(
      () => document.querySelector("#alcoholic-list")?.textContent || ""
    );
    assert.match(alcoholicText, /Paperback Bunny With A Chainsaw/);
    assert.match(alcoholicText, /\$11/);

    const nonAlcoholicText = await page.evaluate(
      () => document.querySelector("#non-alcoholic-list")?.textContent || ""
    );
    assert.match(nonAlcoholicText, /Liquid Death/);
    assert.match(nonAlcoholicText, /\$3/);
  });
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
