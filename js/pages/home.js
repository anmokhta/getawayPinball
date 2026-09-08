import { fetchMachines, renderMachineCard, initCardHoverGlow } from "../machine-card.js";
import { renderStatusMessage } from "../utils.js";

const FEATURED_COUNT = 3;

/** Return `count` distinct random items from `items` (order shuffled). */
function pickRandom(items, count) {
  const pool = items.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

async function renderFeaturedMachines() {
  const grid = document.getElementById("featured-machines-grid");
  if (!grid) return;

  try {
    const machines = await fetchMachines();
    const featured = pickRandom(machines, FEATURED_COUNT);
    grid.innerHTML = featured
      .map((machine, index) => renderMachineCard(machine, { variant: "featured", index }))
      .join("");
  } catch (error) {
    console.error("Failed to render featured machines:", error);
    grid.innerHTML = renderStatusMessage("Couldn't load machines — please try again later.");
  }
}

initCardHoverGlow();
renderFeaturedMachines();
