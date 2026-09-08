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

// TODO(remove): local test sync button — also remove /__dev/sync-machines in scripts/dev-server.js
function initLocalSyncTestButton() {
  const button = document.getElementById("machine-sync-test-toggle");
  if (!button) return;

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      const response = await fetch("/__dev/sync-machines", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || `Sync failed (${response.status})`);
      }
      // Full reload so List.js filters re-bind cleanly against the new snapshot.
      window.location.reload();
    } catch (error) {
      console.error("Local Pinball Map sync failed:", error);
      window.alert(
        `Local sync failed.\n\n${error.message}\n\nUse npm run dev with a .env token, or run npm run sync-machines.`
      );
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
}

initCardHoverGlow();
initLocalSyncTestButton();
renderMachineGrid();
