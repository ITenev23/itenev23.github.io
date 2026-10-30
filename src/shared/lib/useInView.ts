import { type RefObject, useEffect, useState } from "react";

/** True while the element is on screen. Used to pause WebGL render loops off-screen. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "100px"): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

/**
 * Becomes true once the element comes within `rootMargin` of the screen, then stays
 * true. Used to load heavy views (the 3D board) only when the visitor gets near them.
 */
export function useNear(ref: RefObject<Element | null>, rootMargin = "600px"): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);

  return near;
}
