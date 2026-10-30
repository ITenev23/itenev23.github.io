import { useEffect, useState } from "react";

/**
 * True once the browser is idle after the first paint, or after `timeout` ms at the
 * latest. Heavy, decorative work waits for it so it never delays the content.
 */
export function useIdle(timeout = 2500): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    // Safari has no requestIdleCallback; a short timer stands in for it.
    if (typeof window.requestIdleCallback !== "function") {
      const id = window.setTimeout(() => setIdle(true), 1200);
      return () => window.clearTimeout(id);
    }
    const id = window.requestIdleCallback(() => setIdle(true), { timeout });
    return () => window.cancelIdleCallback(id);
  }, [timeout]);

  return idle;
}
