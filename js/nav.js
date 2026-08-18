/* ==========================================================================
   The Getaway Pinball Arcade — Cross-page nav behavior

   Links are matched by data attribute (not href) because the shared header
   in js/partials.js prefixes every href with a base path that varies by
   page depth (e.g. "index.html" at the root vs. "../index.html" inside
   "machines/"), so the literal href string differs per page.

   "Location" link (data-nav-location) always points at "#location" on Home.
   - On the Home page (where the #location section actually lives), we
     intercept the click and smooth-scroll instead of letting the browser
     jump instantly.
   - On any other page, there's nothing to intercept, so the browser just
     navigates to Home and lands on that section normally.

   Both the "Home" nav link and the header logo (data-nav-home) point at Home.
   - If already on the Home page, clicking either would otherwise just
     reload (or do nothing) — instead, intercept it and smooth-scroll to
     the top.
   - On any other page, let the browser navigate to Home as normal.

   Directory-style links (e.g. "machines/") opened via file:// (double-
   clicking index.html, rather than going through a real web server) don't
   auto-resolve to that folder's index.html the way a server does — the
   browser just shows its raw folder listing. There's no server on
   file:// to fix that server-side, so when we detect that protocol we
   rewrite these clicks in JS to go straight to the actual "index.html"
   file instead. This is a no-op on http(s):// (GitHub Pages, `npm run
   dev`, etc.), where the browser already gets this right on its own.
   ========================================================================== */

function isRelativeDirectoryLink(href) {
  if (!href || href.startsWith("#")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false; // absolute URL (http:, mailto:, etc.)
  return href.endsWith("/");
}

document.addEventListener("click", (event) => {
  const locationLink = event.target.closest("a[data-nav-location]");
  if (locationLink) {
    const target = document.getElementById("location");
    if (!target) return; // Not on the Home page — let the normal navigation happen.

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const homeLink = event.target.closest("a[data-nav-home]");
  if (homeLink) {
    // The #location section only exists on Home, so its presence doubles
    // as a reliable "are we already on Home?" check (a pathname check like
    // path.endsWith("/index.html") would wrongly also match
    // "machines/index.html").
    if (!document.getElementById("location")) return; // Not on the Home page — let the normal navigation happen.

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (window.location.protocol === "file:") {
    const link = event.target.closest("a[href]");
    const href = link?.getAttribute("href");
    if (isRelativeDirectoryLink(href)) {
      event.preventDefault();
      window.location.href = href + "index.html";
    }
  }
});
