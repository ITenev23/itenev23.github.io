import type { MouseEvent } from "react";

/**
 * Feeds the pointer position inside an element to CSS as --x / --y, so a radial-gradient
 * spotlight can follow the cursor. Use as `onMouseMove={trackSpotlight}`.
 */
export const trackSpotlight = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
};
