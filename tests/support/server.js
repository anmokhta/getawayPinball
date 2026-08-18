"use strict";

const path = require("node:path");
const { createStaticServer } = require("../../scripts/static-server");

const ROOT = path.join(__dirname, "..", "..");

/** Starts the same static server used by `npm run dev`, on a random free
 *  port, for use in tests. */
function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer(ROOT);

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

module.exports = { startServer };
