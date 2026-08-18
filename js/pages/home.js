import { fetchMachines, renderMachineCard, initCardHoverGlow } from "../machine-card.js";

const FEATURED_COUNT = 3;

async function renderFeaturedMachines() {
  const grid = document.getElementById("featured-machines-grid");
  if (!grid) return;

  const machines = await fetchMachines();
  grid.innerHTML = machines
    .slice(0, FEATURED_COUNT)
    .map((machine, index) => renderMachineCard(machine, { variant: "featured", index }))
    .join("");
}

initCardHoverGlow();
renderFeaturedMachines().catch((error) => {
  console.error("Failed to render featured machines:", error);
});
