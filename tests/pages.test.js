"use strict";

const { test, describe, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./support/server");
const { launchBrowser, newPage } = require("./support/browser");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function abortMachinesJson(page) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().includes("machines.json")) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

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
  });

  afterEach(async () => {
    await page.close();
  });

  test("shows the hero heading, eyebrow, lede, and decorative side text", async () => {
    await page.goto(`${server.url}/machines/`, { waitUntil: "networkidle0" });

    const heading = await page.evaluate(() =>
      document.querySelector("main h1")?.textContent.replace(/\s+/g, " ").trim()
    );
    assert.equal(heading, "Every Machine We've Got");

    const eyebrow = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main span"))
        .find((s) => s.textContent.trim() === "— The Arsenal")
        ?.textContent.trim()
    );
    assert.equal(eyebrow, "— The Arsenal");

    const bodyText = await page.evaluate(() => document.querySelector("main")?.textContent || "");
    assert.match(bodyText, /World-class tables/);
    assert.match(bodyText, /Multiball \/\/ Tournament Ready/);
  });

  test("lists machine cards with manufacturers", async () => {
    await page.goto(`${server.url}/machines/`, { waitUntil: "networkidle0" });

    const bodyText = await page.evaluate(() => document.querySelector("main")?.textContent || "");
    assert.match(bodyText, /The Addams Family/);
    assert.match(bodyText, /Godzilla \(Pro\)/);
    assert.match(bodyText, /Stern Pinball/);
    assert.match(bodyText, /Williams/);
  });

  test("shows a visible error when machines.json fails to load", async () => {
    await abortMachinesJson(page);
    await page.goto(`${server.url}/machines/`, { waitUntil: "networkidle0" });
    await sleep(300);

    const cardCount = await page.evaluate(
      () => document.querySelectorAll("#machine-grid .list .glass-card").length
    );
    assert.equal(cardCount, 0);

    const listText = await page.evaluate(() => document.querySelector("#machine-grid .list")?.textContent || "");
    assert.match(listText, /Couldn't load machines/);
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

  test('events/ loads and shows a "Coming Soon" placeholder with side text', async () => {
    const response = await page.goto(`${server.url}/events/`, { waitUntil: "networkidle0" });
    assert.equal(response.status(), 200);

    const heading = await page.evaluate(() => document.querySelector("main h1")?.textContent.trim());
    assert.equal(heading, "Coming Soon");

    const label = await page.evaluate(() => document.querySelector("main span")?.textContent.trim());
    assert.equal(label, "— The Circuit");

    const bodyText = await page.evaluate(() => document.querySelector("main")?.textContent || "");
    assert.match(bodyText, /League Nights \/\/ Soon/);
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

  test("shows the hero heading, eyebrow, side text, and section headings", async () => {
    const heading = await page.evaluate(() =>
      document.querySelector("main h1")?.textContent.replace(/\s+/g, " ").trim()
    );
    assert.equal(heading, "Fuel Your Next Run");

    const eyebrow = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main span"))
        .find((s) => s.textContent.trim() === "— The Refill")
        ?.textContent.trim()
    );
    assert.equal(eyebrow, "— The Refill");

    const bodyText = await page.evaluate(() => document.querySelector("main")?.textContent || "");
    assert.match(bodyText, /Last Call \/\/ Stay Charged/);
    assert.match(bodyText, /Alcoholic Beverages/);
    assert.match(bodyText, /Non-Alcoholic Beverages/);
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

describe("Home page", () => {
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

  test("shows the hero copy, decorative side text, and featured section headings", async () => {
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });

    const bodyText = await page.evaluate(() => document.querySelector("main")?.textContent || "");
    assert.match(bodyText, /The High Score Starts Here/);
    assert.match(bodyText, /This is your/);
    assert.match(bodyText, /Getaway/);
    assert.match(bodyText, /Everyone deserves a place to escape/);
    assert.match(bodyText, /Insert Coin \/\/ Play Again/);
    assert.match(bodyText, /— The Arsenal/);
    assert.match(bodyText, /Elite Playfields/);
  });

  test("renders three featured machine cards from the start of machines.json", async () => {
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });
    await page.waitForSelector("#featured-machines-grid .glass-card");

    const names = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#featured-machines-grid .name")).map((el) =>
        el.textContent.trim()
      )
    );
    assert.equal(names.length, 3);
    assert.equal(names[0], "The Addams Family");
    assert.equal(names[1], "Aerosmith (Pro)");
    assert.equal(names[2], "Avengers: Infinity Quest (Pro)");
  });

  test("shows location address and phone inside #location", async () => {
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });

    const locationText = await page.evaluate(() => document.getElementById("location")?.textContent || "");
    assert.match(locationText, /6890 Village Parkway/);
    assert.match(locationText, /555-GETAWAY/);
  });

  test("shows a visible error when machines.json fails to load", async () => {
    await abortMachinesJson(page);
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });
    await sleep(300);

    const cardCount = await page.evaluate(
      () => document.querySelectorAll("#featured-machines-grid .glass-card").length
    );
    assert.equal(cardCount, 0);

    const gridText = await page.evaluate(
      () => document.getElementById("featured-machines-grid")?.textContent || ""
    );
    assert.match(gridText, /Couldn't load machines/);
  });

  test('"View Events" links to events/ and navigates there on click', async () => {
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });

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
    await page.goto(`${server.url}/index.html`, { waitUntil: "networkidle0" });

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
