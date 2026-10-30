import { clsx } from "clsx";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const FRAMES = 18;
const FRAME_MS = 50;
// Only what is on screen when a visit starts decodes; anything mounted later (navigating
// back to the home page, say) shows its text straight away.
const INITIAL_LOAD_MS = 4000;

// Letters and digits turn into noise; spaces and punctuation keep the shape of the words.
const scramble = (text: string, settled: number) =>
  [...text]
    .map((ch, i) =>
      i < settled || !/[a-z0-9]/i.test(ch)
        ? ch
        : (NOISE[Math.floor(Math.random() * NOISE.length)] ?? ch),
    )
    .join("");

// One timer drives every decoding text on the page, so a dozen of them update in a single
// pass per frame instead of a dozen separate tasks while the page is still loading.
type Job = { el: HTMLElement; text: string; start: number; frame: number; done: () => void };
const jobs = new Set<Job>();
let ticker = 0;

function tick() {
  const now = performance.now();
  for (const job of jobs) {
    if (now < job.start) continue;
    job.frame++;
    if (job.frame >= FRAMES) {
      jobs.delete(job);
      job.done();
    } else {
      job.el.textContent = scramble(job.text, Math.floor((job.frame / FRAMES) * job.text.length));
    }
  }
  if (!jobs.size) {
    window.clearInterval(ticker);
    ticker = 0;
  }
}

function enqueue(job: Job) {
  jobs.add(job);
  if (!ticker) ticker = window.setInterval(tick, FRAME_MS);
  return () => {
    jobs.delete(job);
  };
}

/**
 * Text that resolves from random letters and digits into itself, left to right, once, on
 * the first screen of a visit. While it runs, the real text holds the layout without being
 * drawn and the noise is drawn over it, clipped to the same box, so nothing shifts even in a
 * proportional font; screen readers get the real text throughout. Frames write straight to
 * the DOM, not through React, from one shared timer.
 *
 * `delay` staggers several of them; `wrap` lets the noise wrap like a paragraph (single
 * lines don't); `overlayClassName` styles the noise when the text's look comes from its own
 * box (a gradient clipped to the text). Reduced motion skips the effect.
 */
export function DecodeText({
  text,
  delay = 0,
  wrap = false,
  className,
  overlayClassName,
}: {
  text: string;
  delay?: number;
  wrap?: boolean;
  className?: string;
  overlayClassName?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const [late] = useState(
    () => typeof performance === "undefined" || performance.now() > INITIAL_LOAD_MS,
  );
  const [done, setDone] = useState(false);
  const overlay = useRef<HTMLSpanElement>(null);
  const still = done || late || reduced;

  useEffect(() => {
    const el = overlay.current;
    if (still || !el) return;
    return enqueue({
      el,
      text,
      start: performance.now() + delay,
      frame: 0,
      done: () => setDone(true),
    });
  }, [still, text, delay]);

  return (
    <span className={clsx("relative inline-block", className)}>
      {still ? (
        text
      ) : (
        <>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true" className="invisible">
            {text}
          </span>
          <span
            ref={overlay}
            aria-hidden="true"
            className={clsx(
              "absolute inset-0 overflow-hidden",
              !wrap && "whitespace-nowrap",
              overlayClassName,
            )}
          >
            {scramble(text, 0)}
          </span>
        </>
      )}
    </span>
  );
}
