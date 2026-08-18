/* ==========================================================================
   Shared machine-card helpers — fetch, render, hover glow, search
   ========================================================================== */

const MACHINES_URL = new URL("../data/machines.json", import.meta.url);

const BADGE_CLASSES = {
  NEW: "bg-primary-container text-white",
  LEGEND: "bg-accent-red text-white",
  CLASSIC: "bg-surface-container-high text-on-surface border border-outline/50",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
  const extraCardClass = isFeatured && index === 1 ? " lg:-mt-12" : "";

  const borderClasses = isWhiteAccent
    ? "border-white/20 hover:border-white/50"
    : "border-primary-container/20 hover:border-primary-container/50";

  const buttonClasses = isWhiteAccent
    ? "border-primary-container/30 hover:border-primary-container text-primary-container"
    : "border-accent-red/30 hover:border-accent-red text-white";

  const iconClasses = isWhiteAccent
    ? "material-symbols-outlined text-[16px]"
    : "material-symbols-outlined text-[16px] text-accent-red";

  const aspectClass = isFeatured ? "aspect-[4/5]" : "aspect-[4/3]";
  const iconName = isFeatured ? "analytics" : "arrow_forward";
  const iconExtra = isFeatured ? "" : " group-hover/btn:translate-x-1 transition-transform";
  const buttonGroup = isFeatured ? "" : "group/btn ";

  const description = isFeatured && machine.description
    ? `<p class="font-body-md text-on-surface-variant line-clamp-2">${escapeHtml(machine.description)}</p>`
    : "";

  const badge = machine.badge
    ? `<div class="absolute top-4 right-4 ${BADGE_CLASSES[machine.badge] || BADGE_CLASSES.NEW} px-3 py-1 font-label-bold text-[10px] tracking-widest">${escapeHtml(machine.badge)}</div>`
    : "";

  return `
    <div class="glass-card group relative overflow-hidden rounded-xl transition-all hover:-translate-y-2 ${borderClasses}${extraCardClass}">
      <div class="${aspectClass} w-full relative overflow-hidden">
        <img
          src="${escapeHtml(machine.image)}"
          alt="${escapeHtml(machine.imageAlt || machine.name)}"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        ${badge}
      </div>
      <div class="p-8 space-y-4">
        <h3 class="font-headline-md text-headline-md text-white uppercase tracking-tight">
          ${escapeHtml(machine.name)}
        </h3>
        <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          ${escapeHtml(machine.manufacturer)} &middot; ${escapeHtml(machine.year)}
        </p>
        ${description}
        <button
          class="${buttonGroup}w-full py-3 border ${buttonClasses} transition-all font-label-sm text-label-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
          View Stats
          <span class="${iconClasses}${iconExtra}">${iconName}</span>
        </button>
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

export function initMachineSearch(gridEl) {
  const machineSearch = document.getElementById("machine-search");
  const machineSearchEmpty = document.getElementById("machine-search-empty");
  if (!machineSearch || !gridEl) return;

  machineSearch.addEventListener("input", () => {
    const query = machineSearch.value.trim().toLowerCase();
    const cards = Array.from(gridEl.children);
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matches = query === "" || text.includes(query);
      card.classList.toggle("hidden", !matches);
      if (matches) visibleCount += 1;
    });

    if (machineSearchEmpty) {
      machineSearchEmpty.classList.toggle("hidden", visibleCount !== 0);
    }
  });
}
