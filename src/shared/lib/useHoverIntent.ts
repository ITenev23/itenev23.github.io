import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hover state that clears after a short grace period. Moving between a shape and
 * its label, or a re-render under a resting pointer, then can't toggle the
 * highlight on and off every frame (the blinking-diagram bug).
 */
export function useHoverIntent(delay = 140) {
  const [hovered, setHovered] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const set = useCallback(
    (id: string | null) => {
      clearTimeout(timer.current);
      if (id) setHovered(id);
      else timer.current = setTimeout(() => setHovered(null), delay);
    },
    [delay],
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return [hovered, set] as const;
}
