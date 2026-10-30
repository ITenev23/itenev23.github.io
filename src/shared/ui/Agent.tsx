import { useReducedMotion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { usePointerLook } from "@/shared/lib/usePointerLook";

/**
 * Parts of the site's agent shared by his drawings (the hero scene and the docked companion):
 * drawn in hero coordinates (head at 80,46), so a drawing places him with a transform. Line
 * art in the current colour; the head turns through the --lx/--ly variables (styles.css).
 */

// Shapes in front of others are filled with the page colour, so lines behind them hide.
export const agentBg = { fill: "var(--color-bg)" };

export const agentHand = (x: number, y: number, r = 2.5) => (
  <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
);

/** Legs, suit and tie. */
export function AgentBody() {
  return (
    <>
      <path d="M74 106 L72 138 M86 106 L88 138" />
      <path d="M66 70 Q80 64 94 70 L92 106 H68 Z" style={agentBg} />
      <path d="M80 70 L77 84 L80 94 L83 84 Z" fill="currentColor" fillOpacity={0.6} />
    </>
  );
}

/** Head, sunglasses and earpiece; they turn towards wherever he is looking. */
export function AgentHead({ children }: { children?: ReactNode }) {
  return (
    <g className="agent-head">
      <circle cx={80} cy={46} r={13} style={agentBg} />
      {children}
      <g className="agent-eyes">
        <path
          d="M70 43 h8 v4 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 z M82 43 h8 v4 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 z"
          fill="currentColor"
        />
        <path d="M78 44.5 H82" />
      </g>
      <path d="M93 49 q5 8 0 16" strokeWidth={1} strokeOpacity={0.7} />
    </g>
  );
}

/** Just his head: the site's mark beside the name in the nav. It too follows the pointer. */
export function AgentMark({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion() ?? false;
  usePointerLook(svg, !reduced, 0.5, 0.5);
  return (
    <svg
      ref={svg}
      viewBox="63 31 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <AgentHead />
    </svg>
  );
}

/** The right arm raised and waving (the forearm swings: `.agent-wave` in styles.css). */
export function AgentWaveArm() {
  return (
    <>
      <path d="M93 74 L106 62" />
      <g className="agent-wave">
        <path d="M106 62 L112 42" />
        {agentHand(112, 42, 3)}
      </g>
    </>
  );
}
