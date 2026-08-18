/* ==========================================================================
   The Getaway Pinball Arcade — Shared header/footer templates
   Loaded synchronously in <head> (before <body> is parsed) so these
   elements are defined before the browser encounters <site-header> /
   <site-footer> in the markup. That avoids any flash of empty content and
   needs no build step or fetch()/CORS setup — it works even opened as a
   plain local file.

   To change the nav or footer on every page, edit the markup below only.
   ========================================================================== */

/*
  Pages live at different folder depths (e.g. "index.html" at the site root,
  "machines/index.html" one level down), so every page includes this script
  with a path relative to its own location — same as it already does for
  "css/style.css", "js/tailwind-config.js", etc:
    - Site root:      <script src="js/partials.js"></script>
    - "machines/", "events/": <script src="../js/partials.js"></script>
  We read that same relative path back off the <script> tag and reuse it as
  the prefix for every link/asset below, so the templates work unmodified
  from any depth.
*/
const SITE_BASE = (() => {
  const scriptSrc = document.currentScript?.getAttribute("src") || "js/partials.js";
  return scriptSrc.replace(/js\/partials\.js$/, "");
})();

const NAV_LINK_CLASSES =
  "font-label-sm text-label-sm text-on-surface-variant hover:text-accent-red transition-all uppercase tracking-widest";
const NAV_LINK_ACTIVE_CLASSES = "font-label-sm text-label-sm text-accent-red neon-text-red uppercase tracking-widest";

// Which nav item corresponds to the page currently being viewed. Only
// Home/Machines/Events/Menu are real pages — "Location" is just a section
// of Home, so it's never marked active.
function getCurrentNavPage() {
  const path = window.location.pathname;
  if (path.includes("/machines/")) return "machines";
  if (path.includes("/events/")) return "events";
  if (path.includes("/menu/")) return "menu";
  return "home";
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <!--
          Promo Announcement Banner — temporary, pre-opening only.
          To remove once the arcade is open: delete this whole "#promo-banner" block, nothing else needs to change.
        -->
        <div
          id="promo-banner"
          class="w-full bg-accent-red py-3 px-margin-mobile lg:px-margin-desktop flex items-center justify-center shadow-[0_0_20px_rgba(227,27,35,0.6)] animate-pulse"
        >
          <span class="font-headline-md text-white uppercase tracking-widest text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Coming to Downtown Dublin August 2026!
          </span>
        </div>

        <div class="h-20 max-w-[1440px] mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between">
          <a href="${SITE_BASE}index.html" data-nav-home class="flex items-center gap-4">
            <img
              src="${SITE_BASE}assets/full_logo_crop_wordmark.png"
              alt="The Getaway Logo"
              class="h-12 w-auto object-contain logo-neon-red"
            />
            <span class="font-headline-md text-headline-md text-primary-container tracking-tighter uppercase italic sr-only">THE GETAWAY</span>
          </a>

          <nav class="hidden lg:flex items-center gap-gutter">
            <a href="${SITE_BASE}index.html" data-nav-home data-nav-page="home" class="${NAV_LINK_CLASSES}">Home</a>
            <a href="${SITE_BASE}machines/" data-nav-page="machines" class="${NAV_LINK_CLASSES}">Machines</a>
            <a href="${SITE_BASE}events/" data-nav-page="events" class="${NAV_LINK_CLASSES}">Events</a>
            <a href="${SITE_BASE}menu/" data-nav-page="menu" class="${NAV_LINK_CLASSES}">Menu</a>
            <a href="${SITE_BASE}index.html#location" data-nav-location class="${NAV_LINK_CLASSES}">Location</a>
          </nav>
        </div>
      </header>
    `;

    const activeLink = this.querySelector(`nav a[data-nav-page="${getCurrentNavPage()}"]`);
    if (activeLink) {
      activeLink.className = NAV_LINK_ACTIVE_CLASSES;
      activeLink.setAttribute("aria-current", "page");
    }
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="w-full bg-surface-container-lowest py-margin-desktop mt-gutter border-t border-white/5">
        <div class="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin-desktop">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div class="space-y-4">
              <h4 class="font-headline-md text-headline-md text-primary-container">Arcade Hours</h4>
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide leading-relaxed">
                MON - THU: 4PM - 12AM<br />
                FRI: 4PM - 2AM<br />
                SAT: 12PM - 2AM<br />
                SUN: 12PM - 10PM
              </p>
            </div>

            <div class="space-y-4">
              <h4 class="font-headline-md text-headline-md text-accent-red neon-text-red">Join the Circuit</h4>
              <div class="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter email for news..."
                  class="bg-surface-container-high border-b border-outline p-2 font-body-md text-on-surface focus:border-accent-red focus:outline-none transition-all placeholder:text-outline-variant"
                />
                <button class="bg-primary-container text-white font-label-bold text-label-bold py-3 px-4 uppercase tracking-tighter neon-glow-primary transition-all">
                  Subscribe
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="font-headline-md text-headline-md text-primary-container">Connect</h4>
              <div class="flex gap-4">
                <span class="material-symbols-outlined text-on-surface-variant hover:text-accent-red cursor-pointer transition-colors">share</span>
                <span class="material-symbols-outlined text-on-surface-variant hover:text-accent-red cursor-pointer transition-colors">forum</span>
                <span class="material-symbols-outlined text-on-surface-variant hover:text-accent-red cursor-pointer transition-colors">play_circle</span>
              </div>
              <p class="font-body-md text-on-surface-variant">6890 Village Parkway, Dublin, CA 94568</p>
            </div>
          </div>

          <div class="pt-8 border-t border-white/5 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            © 2026 THE GETAWAY
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
