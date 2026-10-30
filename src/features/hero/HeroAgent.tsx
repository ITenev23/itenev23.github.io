import { useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { agentLines } from "@/content";
import { usePointerLook } from "@/shared/lib/usePointerLook";
import { AgentBody, AgentHead, AgentWaveArm, agentBg, agentHand } from "@/shared/ui/Agent";

/** What the hero's buttons ask the agent to do while they are hovered or focused. */
export type AgentCue = "point" | "paper" | null;

type Pose = "work" | "wave" | "chosen" | "point" | "paper" | "thumbs" | "coffee" | "deploy";

// Each click or tap plays the next one.
const reactions: Pose[] = ["thumbs", "coffee", "deploy", "wave"];

const screenText: Partial<Record<Pose, string>> = {
  wave: "> hi there",
  chosen: agentLines.hover,
  point: "↓ my work",
  paper: "CV.pdf ↓",
  thumbs: "✓ tests pass",
  coffee: "// coffee",
  deploy: "✓ deployed",
};

// Six code lines, repeated, so the scrolling screen loops without a seam.
const code = [
  { w: 52, indent: 0 },
  { w: 34, indent: 8 },
  { w: 64, indent: 8 },
  { w: 28, indent: 16 },
  { w: 46, indent: 8 },
  { w: 58, indent: 0 },
];

/**
 * The hero's agent, the same character as the 404 page: he waves hello, then types at a
 * holographic keyboard while code scrolls on a floating screen. His head follows the
 * pointer, the hero's buttons cue him to point down or hold up the CV, and a click or tap
 * plays a reaction. Line art in the current colour; the motion lives in styles.css
 * (`.agent-*`), pauses off-screen and stays still for people who prefer reduced motion.
 */
export function HeroAgent({ cue }: { cue: AgentCue }) {
  const reduced = useReducedMotion() ?? false;
  const [greeting, setGreeting] = useState(!reduced);
  const [reaction, setReaction] = useState<Pose | null>(null);
  const [hovered, setHovered] = useState(false);
  const next = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const svg = useRef<SVGSVGElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Wave hello once, then get to work.
  useEffect(() => {
    if (!greeting) return;
    const id = window.setTimeout(() => setGreeting(false), 2600);
    return () => window.clearTimeout(id);
  }, [greeting]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The head follows the pointer; it sits about a third across and a third down the drawing.
  usePointerLook(svg, !reduced, 1 / 3, 1 / 3);

  // No animation runs while the hero is scrolled away.
  useEffect(() => {
    const el = button.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      svg.current?.toggleAttribute("data-paused", !entries.some((e) => e.isIntersecting));
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const react = () => {
    setGreeting(false);
    setReaction(reactions[next.current % reactions.length] ?? "wave");
    next.current += 1;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setReaction(null), 2400);
  };

  // A click or a button cue wins; while the pointer is on him he says his hover line.
  const pose: Pose = cue ?? reaction ?? (hovered ? "chosen" : greeting ? "wave" : "work");
  const message = screenText[pose];

  return (
    <button
      ref={button}
      type="button"
      onClick={react}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-label="The agent: click for a reaction"
      className="block w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-matrix/60"
    >
      <svg
        ref={svg}
        viewBox="0 0 240 150"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="agent w-full text-matrix [filter:drop-shadow(0_0_10px_color-mix(in_oklab,var(--color-matrix)_40%,transparent))]"
      >
        <defs>
          <clipPath id="agent-screen">
            <rect x={136} y={48} width={88} height={70} />
          </clipPath>
        </defs>

        <path d="M10 140 H230" strokeOpacity={0.3} />
        <ellipse
          cx={80}
          cy={141}
          rx={22}
          ry={3}
          fill="currentColor"
          fillOpacity={0.2}
          stroke="none"
        />

        {/* The floating screen, linked to the keyboard by a faint beam. */}
        <path
          d="M104 115 C118 118 124 112 132 104"
          strokeWidth={1}
          strokeOpacity={0.4}
          strokeDasharray="2 3"
        />
        <g>
          <rect
            x={132}
            y={30}
            width={96}
            height={92}
            rx={6}
            fill="currentColor"
            fillOpacity={0.06}
          />
          <path d="M132 42 H228" strokeOpacity={0.4} strokeWidth={1} />
          {[140, 147, 154].map((x) => (
            <circle key={x} cx={x} cy={36} r={1.5} fill="currentColor" stroke="none" />
          ))}
          <g clipPath="url(#agent-screen)" opacity={message ? 0.2 : 1}>
            <g className="agent-code">
              {[...code, ...code, ...code].map((l, i) => (
                <rect
                  // biome-ignore lint/suspicious/noArrayIndexKey: a fixed, repeated pattern; the index is the line.
                  key={i}
                  x={140 + l.indent}
                  y={54 + i * 8}
                  width={l.w - l.indent}
                  height={3}
                  rx={1.5}
                  fill="currentColor"
                  fillOpacity={0.55}
                  stroke="none"
                />
              ))}
            </g>
          </g>
          {message && (
            <text
              x={140}
              y={88}
              fill="currentColor"
              stroke="none"
              fontFamily="JetBrains Mono, monospace"
              fontSize={message.length > 12 ? 9 : 10}
              fontWeight={600}
            >
              {message}
              {(pose === "wave" || pose === "chosen") && <tspan className="agent-caret">_</tspan>}
            </text>
          )}
        </g>

        <AgentBody />

        {/* The holographic keyboard. */}
        <rect
          x={56}
          y={112}
          width={48}
          height={6}
          rx={2}
          strokeOpacity={0.7}
          fill="currentColor"
          fillOpacity={0.08}
        />

        <Arms pose={pose} />

        <AgentHead />
      </svg>
    </button>
  );
}

/** The arms for each pose; the props they hold come with them. */
function Arms({ pose }: { pose: Pose }): ReactNode {
  const relaxedLeft = (
    <>
      <path d="M67 74 L62 94 L64 112" />
      {agentHand(64, 112)}
    </>
  );
  switch (pose) {
    case "work":
      return (
        <>
          <g className="agent-type-l">
            <path d="M67 74 L60 96 L70 111" />
            {agentHand(70, 111)}
          </g>
          <g className="agent-type-r">
            <path d="M93 74 L100 96 L90 111" />
            {agentHand(90, 111)}
          </g>
        </>
      );
    case "wave":
    case "chosen":
      return (
        <>
          {relaxedLeft}
          <AgentWaveArm />
        </>
      );
    case "point":
      return (
        <>
          <path d="M67 74 L52 92 L38 106 L33 110" />
          {agentHand(38, 106)}
          <path d="M93 74 L98 94 L96 112" />
          {agentHand(96, 112)}
        </>
      );
    case "paper":
      return (
        <>
          {relaxedLeft}
          <rect x={104} y={18} width={24} height={30} rx={2} style={agentBg} />
          <path d="M109 34 H123 M109 39 H123 M109 44 H118" strokeWidth={1} strokeOpacity={0.7} />
          <text
            x={109}
            y={29}
            fill="currentColor"
            stroke="none"
            fontFamily="JetBrains Mono, monospace"
            fontSize={8}
            fontWeight={700}
          >
            CV
          </text>
          <path d="M93 74 L106 70 L112 50" />
          {agentHand(112, 50)}
        </>
      );
    case "thumbs":
      return (
        <>
          {relaxedLeft}
          <path d="M93 74 L106 86 L108 70 M108 66 V59" />
          {agentHand(108, 68, 3)}
        </>
      );
    case "coffee":
      return (
        <>
          {relaxedLeft}
          <path d="M93 74 L104 90 L98 63" />
          <rect x={92} y={52} width={9} height={10} rx={1.5} style={agentBg} />
          <path d="M101 55 q4 2 0 5" />
          <g className="agent-steam">
            <path d="M95 48 q-2 -3 0 -6 M98 48 q-2 -3 0 -6" strokeWidth={1} />
          </g>
        </>
      );
    case "deploy":
      return (
        <>
          <path d="M67 74 L56 58 L52 40" />
          {agentHand(52, 40)}
          <path d="M93 74 L104 58 L108 40" />
          {agentHand(108, 40)}
        </>
      );
  }
}
