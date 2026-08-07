"use strict";

const puppeteer = require("puppeteer-core");
const { findChromeExecutable } = require("./chrome");

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: findChromeExecutable(),
    headless: "new",
  });
}

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  return page;
}

module.exports = { launchBrowser, newPage };
