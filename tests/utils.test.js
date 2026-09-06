"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

describe("utils escapeHtml", () => {
  test("escapes &, <, >, quotes", async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, "..", "js", "utils.js")).href;
    const { escapeHtml } = await import(moduleUrl);

    assert.equal(escapeHtml(`a&b<c>"d"'e'`), "a&amp;b&lt;c&gt;&quot;d&quot;&#39;e&#39;");
  });

  test("renderStatusMessage escapes content and can wrap as a list item", async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, "..", "js", "utils.js")).href;
    const { renderStatusMessage } = await import(moduleUrl);

    assert.match(renderStatusMessage("Hello <world>"), /Hello &lt;world&gt;/);
    assert.match(renderStatusMessage("Empty", { asListItem: true }), /^<li /);
  });
});
