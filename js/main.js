/* ==========================================================================
   The Getaway Pinball Arcade — Page interactions
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Micro-interaction: brighten a card's "power meter" glow on hover.
  document.querySelectorAll(".glass-card").forEach((card) => {
    const primaryGlow = card.querySelector(".bg-primary-container");
    const redGlow = card.querySelector(".bg-accent-red");

    card.addEventListener("mouseenter", () => {
      if (primaryGlow) {
        primaryGlow.style.boxShadow = "0 0 30px rgba(227, 27, 35, 0.8)";
      }
      if (redGlow) {
        redGlow.style.boxShadow = "0 0 30px rgba(227, 27, 35, 0.8)";
      }
    });

    card.addEventListener("mouseleave", () => {
      if (primaryGlow) {
        primaryGlow.style.boxShadow = "none";
      }
      if (redGlow) {
        redGlow.style.boxShadow = "0 0 10px rgba(227, 27, 35, 0.3)";
      }
    });
  });
});
