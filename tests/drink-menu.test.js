"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

describe("drink-menu parseCsv", () => {
  let parseCsv;

  test("loads the ES module export", async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, "..", "js", "drink-menu.js")).href;
    ({ parseCsv } = await import(moduleUrl));
    assert.equal(typeof parseCsv, "function");
  });

  test("parses simple comma-separated rows", async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, "..", "js", "drink-menu.js")).href;
    ({ parseCsv } = await import(moduleUrl));

    assert.deepEqual(parseCsv("a,b,c\n1,2,3\n"), [
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  test("keeps commas inside quoted fields", async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, "..", "js", "drink-menu.js")).href;
    ({ parseCsv } = await import(moduleUrl));

    assert.deepEqual(parseCsv('name,desc\n"Sour Ale, Guava",tasty\n'), [
      ["name", "desc"],
      ["Sour Ale, Guava", "tasty"],
    ]);
  });

  test("unescapes doubled quotes inside quoted fields", async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, "..", "js", "drink-menu.js")).href;
    ({ parseCsv } = await import(moduleUrl));

    assert.deepEqual(parseCsv('name\n"She said ""hi"""\n'), [["name"], ['She said "hi"']]);
  });
});
