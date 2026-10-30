import { type RefObject, useCallback, useEffect, useRef } from "react";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function setLook(el: SVGSVGElement, x: number, y: number) {
  el.style.setProperty("--lx", clamp(x).toFixed(2));
  el.style.setProperty("--ly", clamp(y).toFixed(2));
}

/**
 * Turns the agent's head towards the pointer: writes --lx/--ly (-1..1) on the SVG, so React
 * never re-renders. `head` is where the head sits in the drawing, as fractions of its box.
 * Returns `look(x, y, ms)` to point the head somewhere else for a while (e.g. while scrolling).
 */
export function usePointerLook(
  ref: RefObject<SVGSVGElement | null>,
  enabled: boolean,
  headX: number,
  headY: number,
) {
  const holdUntil = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (performance.now() < holdUntil.current) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setLook(
          el,
          (e.clientX - (r.left + r.width * headX)) / 400,
          (e.clientY - (r.top + r.height * headY)) / 400,
        );
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ref, enabled, headX, headY]);

  return useCallback(
    (x: number, y: number, ms: number) => {
      const el = ref.current;
      if (!el || !enabled) return;
      holdUntil.current = performance.now() + ms;
      setLook(el, x, y);
    },
    [ref, enabled],
  );
}
