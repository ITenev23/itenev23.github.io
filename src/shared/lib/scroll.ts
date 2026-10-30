/**
 * Scroll to an element by id. Native scrolling only: the target's scroll-margin keeps it
 * below the fixed nav, and reduced-motion users jump instead of gliding.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}
