import { fetchMachines, renderMachineCard, initCardHoverGlow, initMachineSearch } from "../machine-card.js";

async function renderMachineGrid() {
  const grid = document.getElementById("machine-grid");
  if (!grid) return;

  const machines = await fetchMachines();
  grid.innerHTML = machines
    .map((machine, index) => renderMachineCard(machine, { variant: "full", index }))
    .join("");

  initMachineSearch(grid);
}

initCardHoverGlow();
renderMachineGrid().catch((error) => {
  console.error("Failed to render machines:", error);
});
