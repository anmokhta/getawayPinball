import { fetchMachines, renderMachineCard, initCardHoverGlow } from "../machine-card.js";
import { renderStatusMessage } from "../utils.js";

const FEATURED_COUNT = 3;

async function renderFeaturedMachines() {
  const grid = document.getElementById("featured-machines-grid");
  if (!grid) return;

  try {
    const machines = await fetchMachines();
    grid.innerHTML = machines
      .slice(0, FEATURED_COUNT)
      .map((machine, index) => renderMachineCard(machine, { variant: "featured", index }))
      .join("");
  } catch (error) {
    console.error("Failed to render featured machines:", error);
    grid.innerHTML = renderStatusMessage("Couldn't load machines — please try again later.");
  }
}

initCardHoverGlow();
renderFeaturedMachines();
