import { fetchMachines, renderMachineCard, initCardHoverGlow, initMachineFilters } from "../machine-card.js";
import { renderStatusMessage } from "../utils.js";

async function renderMachineGrid() {
  const grid = document.getElementById("machine-grid");
  const listEl = grid?.querySelector(".list");
  if (!grid || !listEl) return;

  try {
    const machines = await fetchMachines();
    listEl.innerHTML = machines
      .map((machine, index) => renderMachineCard(machine, { variant: "full", index }))
      .join("");

    initMachineFilters(grid);
  } catch (error) {
    console.error("Failed to render machines:", error);
    listEl.innerHTML = renderStatusMessage("Couldn't load machines — please try again later.");
  }
}

initCardHoverGlow();
renderMachineGrid();
