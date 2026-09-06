/* ==========================================================================
   Shared machine-card helpers — fetch, render, hover glow, search
   ========================================================================== */

import { escapeHtml } from "./utils.js";

const MACHINES_URL = new URL("../data/machines.json", import.meta.url);

const BADGE_CLASSES = {
  NEW: "bg-primary-container text-white",
  LEGEND: "bg-accent-red text-white",
  CLASSIC: "bg-surface-container-high text-on-surface border border-outline/50",
};

export async function fetchMachines() {
  const response = await fetch(MACHINES_URL);
  if (!response.ok) {
    throw new Error(`Failed to load machines.json (${response.status})`);
  }
  return response.json();
}

export function renderMachineCard(machine, { variant = "full", index = 0 } = {}) {
  const isFeatured = variant === "featured";
  const isWhiteAccent = index % 2 === 1;
  const extraCardClass = isFeatured && index === 1 ? " md:-mt-12" : "";

  const borderClasses = isWhiteAccent
    ? "border-white/20 hover:border-white/50"
    : "border-primary-container/20 hover:border-primary-container/50";

  // Featured cards are taller (4/5) in the 3-up layout. On small screens they
  // stack full-width, so match the machines-page table-view crop (4/3) instead.
  const aspectClass = isFeatured ? "aspect-[4/3] md:aspect-[4/5]" : "aspect-[4/3]";

  const description = isFeatured && machine.description
    ? `<p class="font-body-md text-on-surface-variant line-clamp-2">${escapeHtml(machine.description)}</p>`
    : "";

  const badge = machine.badge
    ? `<div class="absolute top-4 right-4 ${BADGE_CLASSES[machine.badge] || BADGE_CLASSES.NEW} px-3 py-1 font-label-bold text-[10px] tracking-widest">${escapeHtml(machine.badge)}</div>`
    : "";

  const inlineBadge = machine.badge
    ? `<span class="card-badge-inline hidden ${BADGE_CLASSES[machine.badge] || BADGE_CLASSES.NEW} px-2 py-0.5 rounded-full font-label-bold text-[9px] tracking-widest">${escapeHtml(machine.badge)}</span>`
    : "";

  return `
    <div class="glass-card group relative overflow-hidden rounded-xl transition-all hover:-translate-y-2 ${borderClasses}${extraCardClass}" data-manufacturer="${escapeHtml(machine.manufacturerSlug)}" data-year="${escapeHtml(machine.year)}">
      <div class="card-media ${aspectClass} w-full relative overflow-hidden">
        <img
          src="${escapeHtml(machine.image)}"
          alt="${escapeHtml(machine.imageAlt || machine.name)}"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        ${badge}
      </div>
      <div class="card-body p-8 space-y-4">
        <div class="flex items-center gap-2">
          <h3 class="name font-headline-md text-headline-md text-white uppercase tracking-tight transition-colors">
            ${escapeHtml(machine.name)}
          </h3>
          ${inlineBadge}
        </div>
        <p class="card-meta font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest transition-colors">
          ${escapeHtml(machine.manufacturer)} &middot; ${escapeHtml(machine.year)}
        </p>
        ${description}
      </div>
    </div>
  `;
}

export function initCardHoverGlow() {
  document.addEventListener("mouseover", (event) => {
    const card = event.target.closest(".glass-card");
    if (!card || card.contains(event.relatedTarget)) return;

    const primaryGlow = card.querySelector(".bg-primary-container");
    const redGlow = card.querySelector(".bg-accent-red");
    if (primaryGlow) {
      primaryGlow.style.boxShadow = "0 0 30px rgba(227, 27, 35, 0.8)";
    }
    if (redGlow) {
      redGlow.style.boxShadow = "0 0 30px rgba(227, 27, 35, 0.8)";
    }
  });

  document.addEventListener("mouseout", (event) => {
    const card = event.target.closest(".glass-card");
    if (!card || card.contains(event.relatedTarget)) return;

    const primaryGlow = card.querySelector(".bg-primary-container");
    const redGlow = card.querySelector(".bg-accent-red");
    if (primaryGlow) {
      primaryGlow.style.boxShadow = "none";
    }
    if (redGlow) {
      redGlow.style.boxShadow = "0 0 10px rgba(227, 27, 35, 0.3)";
    }
  });
}

// Generic open/close controller for the Filter and Sort button + dropdown-menu
// pairs. Only one such dropdown is ever open at a time.
// Note: this only tracks the *open/closed* visual state (via "is-open"),
// kept separate from "is-active" — which callers use to persist a
// "non-default option selected" indicator regardless of open/closed state.
function initDropdown(toggleButton, menuEl, { onOpen } = {}) {
  if (!toggleButton || !menuEl) return null;

  function close() {
    menuEl.classList.add("hidden");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.classList.remove("is-open");
  }

  function open() {
    closeAllDropdowns();
    menuEl.classList.remove("hidden");
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.classList.add("is-open");
    onOpen?.();
  }

  toggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
    if (isOpen) close();
    else open();
  });

  openDropdownClosers.push(close);
  return { open, close };
}

const openDropdownClosers = [];
function closeAllDropdowns() {
  openDropdownClosers.forEach((close) => close());
}

document.addEventListener("click", () => closeAllDropdowns());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllDropdowns();
});

export function initMachineFilters(gridContainerEl) {
  if (!gridContainerEl || typeof List === "undefined") return null;

  const searchInput = document.getElementById("machine-search");
  const emptyMessage = document.getElementById("machine-search-empty");

  const machineList = new List(gridContainerEl.id, {
    valueNames: ["name", { data: ["manufacturer", "year"] }],
  });

  // --- Filter (dropdown of manufacturer options) --------------------------
  const filterToggle = document.getElementById("machine-filter-toggle");
  const filterMenu = document.getElementById("machine-filter-menu");
  const filterItems = Array.from(filterMenu?.querySelectorAll(".toolbar-dropdown-item") || []);

  // Manufacturer slugs that have their own dedicated filter option. "Others"
  // catches everything that doesn't match one of these (e.g. Sega titles),
  // so it stays correct automatically if named filters are added/removed.
  const namedManufacturerFilters = filterItems
    .map((item) => item.dataset.filter)
    .filter((filter) => filter && filter !== "all" && filter !== "others");

  let activeFilter = "all";

  function applyFilters() {
    const query = (searchInput?.value || "").trim().toLowerCase();

    machineList.filter((item) => {
      const values = item.values();
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "others"
          ? !namedManufacturerFilters.includes(values.manufacturer)
          : values.manufacturer === activeFilter);
      const matchesQuery = query === "" || values.name.trim().toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });

    emptyMessage?.classList.toggle("hidden", machineList.matchingItems.length !== 0);
  }

  const filterDropdown = initDropdown(filterToggle, filterMenu);

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      activeFilter = item.dataset.filter;
      filterItems.forEach((otherItem) => {
        otherItem.setAttribute("aria-checked", String(otherItem === item));
      });
      filterToggle?.classList.toggle("is-active", activeFilter !== "all");
      filterDropdown?.close();
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);

  // --- Sort (dropdown of sort options) -------------------------------------
  const sortToggle = document.getElementById("machine-sort-toggle");
  const sortMenu = document.getElementById("machine-sort-menu");
  const sortItems = Array.from(sortMenu?.querySelectorAll(".toolbar-dropdown-item") || []);

  const SORT_HANDLERS = {
    alphabetical: () => machineList.sort("name", { order: "asc" }),
    "reverse-alphabetical": () => machineList.sort("name", { order: "desc" }),
    "year-oldest": () => machineList.sort("year", { order: "asc" }),
    "year-newest": () => machineList.sort("year", { order: "desc" }),
  };

  const sortDropdown = initDropdown(sortToggle, sortMenu);

  sortItems.forEach((item) => {
    item.addEventListener("click", () => {
      sortItems.forEach((otherItem) => {
        otherItem.setAttribute("aria-checked", String(otherItem === item));
      });
      sortToggle?.classList.toggle("is-active", item.dataset.sort !== "alphabetical");
      sortDropdown?.close();
      SORT_HANDLERS[item.dataset.sort]?.();
    });
  });

  // Apply the default sort (Alphabetical, matching the pre-checked menu item)
  // to the initial render for consistency.
  SORT_HANDLERS.alphabetical();

  // --- Search (icon expands in place into a text field) -------------------
  const searchTooltipWrapper = document.getElementById("machine-search-tooltip-wrapper");
  const searchWrapper = document.getElementById("machine-search-wrapper");
  const searchToggle = document.getElementById("machine-search-toggle");
  const searchToggleIcon = document.getElementById("machine-search-toggle-icon");

  function collapseSearch() {
    searchWrapper?.classList.remove("is-expanded");
    searchToggle?.setAttribute("aria-expanded", "false");
    searchTooltipWrapper?.removeAttribute("data-tooltip-hidden");
    if (searchToggleIcon) searchToggleIcon.textContent = "search";
    if (searchInput) searchInput.value = "";
    applyFilters();
  }

  function expandSearch() {
    searchWrapper?.classList.add("is-expanded");
    searchToggle?.setAttribute("aria-expanded", "true");
    // Once expanded, the input's own placeholder makes the tooltip redundant.
    searchTooltipWrapper?.setAttribute("data-tooltip-hidden", "true");
    if (searchToggleIcon) searchToggleIcon.textContent = "close";
    searchInput?.focus();
  }

  searchToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = searchToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) collapseSearch();
    else expandSearch();
  });

  searchWrapper?.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchToggle?.getAttribute("aria-expanded") === "true") {
      collapseSearch();
    }
  });

  // --- View (grid <-> list) -------------------------------------------------
  const viewToggleButton = document.getElementById("machine-view-toggle");
  const viewToggleIcon = viewToggleButton?.querySelector(".material-symbols-outlined");

  viewToggleButton?.addEventListener("click", () => {
    const isListView = gridContainerEl.classList.toggle("list-view");
    const label = isListView ? "Switch to grid view" : "Switch to list view";
    if (viewToggleIcon) viewToggleIcon.textContent = isListView ? "grid_view" : "view_list";
    viewToggleButton.classList.toggle("is-active", isListView);
    viewToggleButton.setAttribute("aria-pressed", String(isListView));
    viewToggleButton.setAttribute("aria-label", label);
    viewToggleButton.setAttribute("data-tooltip", label);
  });

  return machineList;
}
