/* ==========================================================================
   Shared utilities — sanitization and status messages
   ========================================================================== */

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Plain status/empty message for list or grid containers. */
export function renderStatusMessage(message, { asListItem = false } = {}) {
  const safe = escapeHtml(message);
  if (asListItem) {
    return `<li class="font-body-md text-on-surface-variant py-4">${safe}</li>`;
  }
  return `<p class="font-body-md text-on-surface-variant text-center py-16">${safe}</p>`;
}
