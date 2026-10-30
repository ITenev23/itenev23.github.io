import { useEffect, useRef } from "react";
import { createRain } from "@/shared/lib/rain";

const FPS = 24;

type Props = {
  /** False paints one still frame: reduced motion. */
  animate: boolean;
  className?: string;
};

/**
 * The site's background: Matrix rain on a screen-sized canvas. Cheap by design: at most one
 * glyph per column per step, 24 steps a second, paused off-screen and in background tabs.
 */
export function MatrixRain({ animate, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const rain = createRain(ctx, {
      bg: css.getPropertyValue("--color-bg").trim() || "#050805",
      green: css.getPropertyValue("--color-matrix").trim() || "#00ff41",
      size: canvas.clientWidth < 640 ? 14 : 16,
    });

    const reset = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rain.reset(canvas.clientWidth, canvas.clientHeight);
      // A still frame: run the rain for a while, then stop.
      if (!animate) for (let n = 0; n < 90; n++) rain.step();
    };
    reset();
    const ro = new ResizeObserver(reset);
    ro.observe(canvas);
    if (!animate) return () => ro.disconnect();

    let raf = 0;
    let previous = 0;
    let visible = true;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden || t - previous < 1000 / FPS) return;
      previous = t;
      rain.step();
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [animate]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
