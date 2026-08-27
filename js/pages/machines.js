import { fetchMachines, renderMachineCard, initCardHoverGlow, initMachineFilters } from "../machine-card.js";

async function renderMachineGrid() {
  const grid = document.getElementById("machine-grid");
  const listEl = grid?.querySelector(".list");
  if (!grid || !listEl) return;

  const machines = await fetchMachines();
  listEl.innerHTML = machines
    .map((machine, index) => renderMachineCard(machine, { variant: "full", index }))
    .join("");

  initMachineFilters(grid);
}

initCardHoverGlow();
renderMachineGrid().catch((error) => {
  console.error("Failed to render machines:", error);
});
