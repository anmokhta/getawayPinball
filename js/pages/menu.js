import { fetchDrinksMenu, renderAlcoholicItem, renderNonAlcoholicItem } from "../drink-menu.js";

function renderEmptyState(message) {
  return `<li class="font-body-md text-on-surface-variant py-4">${message}</li>`;
}

async function renderDrinkMenu() {
  const alcoholicList = document.getElementById("alcoholic-list");
  const nonAlcoholicList = document.getElementById("non-alcoholic-list");
  if (!alcoholicList || !nonAlcoholicList) return;

  const { alcoholic, nonAlcoholic } = await fetchDrinksMenu();

  alcoholicList.innerHTML = alcoholic.length
    ? alcoholic.map(renderAlcoholicItem).join("")
    : renderEmptyState("Check back soon — the menu is being restocked.");

  nonAlcoholicList.innerHTML = nonAlcoholic.length
    ? nonAlcoholic.map(renderNonAlcoholicItem).join("")
    : renderEmptyState("Check back soon — the menu is being restocked.");
}

renderDrinkMenu().catch((error) => {
  console.error("Failed to render drink menu:", error);
});
