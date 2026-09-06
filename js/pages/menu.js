import { fetchDrinksMenu, renderAlcoholicItem, renderNonAlcoholicItem } from "../drink-menu.js";
import { renderStatusMessage } from "../utils.js";

async function renderDrinkMenu() {
  const alcoholicList = document.getElementById("alcoholic-list");
  const nonAlcoholicList = document.getElementById("non-alcoholic-list");
  if (!alcoholicList || !nonAlcoholicList) return;

  try {
    const { alcoholic, nonAlcoholic } = await fetchDrinksMenu();

    alcoholicList.innerHTML = alcoholic.length
      ? alcoholic.map(renderAlcoholicItem).join("")
      : renderStatusMessage("Check back soon — the menu is being restocked.", { asListItem: true });

    nonAlcoholicList.innerHTML = nonAlcoholic.length
      ? nonAlcoholic.map(renderNonAlcoholicItem).join("")
      : renderStatusMessage("Check back soon — the menu is being restocked.", { asListItem: true });
  } catch (error) {
    console.error("Failed to render drink menu:", error);
    const message = renderStatusMessage("Couldn't load the menu — please try again later.", {
      asListItem: true,
    });
    alcoholicList.innerHTML = message;
    nonAlcoholicList.innerHTML = message;
  }
}

renderDrinkMenu();
