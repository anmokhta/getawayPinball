"use strict";

const fs = require("node:fs");

// This project has no bundled browser (keeps `npm install` fast/offline-friendly),
// so tests drive whatever Chrome/Chromium/Edge is already installed on the
// machine. Override the path explicitly with CHROME_PATH if yours isn't found here.
const CANDIDATE_PATHS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

function findChromeExecutable() {
  const found = CANDIDATE_PATHS.find((candidate) => candidate && fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      "Could not find a Chrome/Chromium/Edge install for the browser tests to drive.\n" +
        "Set the CHROME_PATH environment variable to your browser's executable path and re-run."
    );
  }
  return found;
}

module.exports = { findChromeExecutable };
