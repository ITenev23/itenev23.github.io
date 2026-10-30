import { useRouterState } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { agentLines, projectBySlug } from "@/content";
import { setAgentShown, useAgentShown } from "@/shared/lib/agentDock";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import { usePointerLook } from "@/shared/lib/usePointerLook";
import { AgentBody, AgentHead, AgentWaveArm, agentBg, agentHand } from "@/shared/ui/Agent";

type State = "hidden" | "in" | "out";

/**
 * The agent as a companion on every page: he jumps into the right-hand page margin with his
 * laptop, turns to the content while you scroll, follows the pointer, and says a line when a
 * section reaches the top of the screen. Only where the margin has room for him, so he never
 * covers content; he steps aside while the hero (his home on the front page), the 404 page's
 * agent or a wide architecture board is on screen, and the visitor can hide him.
 */
export function AgentDock() {
  const roomy = useMediaQuery("(min-width: 1400px)");
  const shown = useAgentShown();
  return roomy && shown ? <Dock /> : null;
}

function Dock() {
  const reduced = useReducedMotion() ?? false;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const svg = useRef<SVGSVGElement>(null);
  // The head sits half across and a quarter down the drawing.
  const look = usePointerLook(svg, !reduced, 0.5, 0.25);
  const [blocked, setBlocked] = useState(true);
  const [state, setState] = useState<State>("hidden");
  const [line, setLine] = useState<string | null>(null);
  const [waving, setWaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const clicks = useRef(0);
  const lineTimer = useRef<number | undefined>(undefined);
  const waveTimer = useRef<number | undefined>(undefined);

  const say = useCallback((text: string, ms = 3200) => {
    setLine(text);
    window.clearTimeout(lineTimer.current);
    lineTimer.current = window.setTimeout(() => setLine(null), ms);
  }, []);

  const wave = useCallback((ms = 1600) => {
    setWaving(true);
    window.clearTimeout(waveTimer.current);
    waveTimer.current = window.setTimeout(() => setWaving(false), ms);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(lineTimer.current);
      window.clearTimeout(waveTimer.current);
    },
    [],
  );

  // Where he must not be. Pages mark it: `data-agent-home` (the hero, the 404 page) while
  // enough of it shows, `data-agent-avoid` (a wide board) while any of it does.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scan the page on navigation.
  useEffect(() => {
    let io: IntersectionObserver | undefined;
    const showing = new Set<Element>();
    const id = window.setTimeout(() => {
      const marked = document.querySelectorAll("[data-agent-home], [data-agent-avoid]");
      if (!marked.length) return setBlocked(false);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const home = e.target.hasAttribute("data-agent-home");
            if (home ? e.intersectionRatio > 0.15 : e.isIntersecting) showing.add(e.target);
            else showing.delete(e.target);
          }
          setBlocked(showing.size > 0);
        },
        { threshold: [0, 0.15, 0.3] },
      );
      for (const el of marked) io.observe(el);
    }, 300);
    return () => {
      window.clearTimeout(id);
      io?.disconnect();
    };
  }, [pathname]);

  // Jump in when the way is clear, out when it isn't; wave on every arrival, and greet a page
  // that has its own line, once per visit to it.
  useEffect(() => {
    setState((s) => (blocked ? (s === "in" ? "out" : s) : "in"));
  }, [blocked]);
  const greeted = useRef("");
  useEffect(() => {
    if (state !== "in") return;
    wave();
    const line = agentLines.pages[pathname];
    if (line && greeted.current !== pathname) say(line, 4500);
    greeted.current = pathname;
  }, [state, pathname, wave, say]);

  // A line when a section reaches the upper part of the screen. The last section may be too
  // short to get there, so reaching the bottom of the page counts for it too.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scan the page on navigation.
  useEffect(() => {
    let io: IntersectionObserver | undefined;
    let last = "";
    // A project gets its own line the first time, then the quips take turns.
    const seen = new Set<string>();
    let quip = 0;
    const projectLine = (slug: string) => {
      const own = seen.has(slug) ? undefined : agentLines.projects[slug];
      seen.add(slug);
      return own ?? agentLines.projectQuips[quip++ % agentLines.projectQuips.length];
    };
    const reach = (section: string) => {
      if (section === last) return;
      last = section;
      const slug = section.startsWith("p-") ? section.slice(2) : "";
      const text = projectBySlug.has(slug) ? projectLine(slug) : agentLines.sections[section];
      if (text) say(text);
    };
    const onScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 40;
      const sections = document.querySelectorAll("main section[id]");
      const final = sections[sections.length - 1];
      if (bottom && final) reach(final.id);
    };
    const id = window.setTimeout(() => {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) reach(e.target.id);
        },
        { rootMargin: "-15% 0px -70% 0px" },
      );
      for (const el of document.querySelectorAll("main section[id]")) io.observe(el);
      window.addEventListener("scroll", onScroll, { passive: true });
    }, 400);
    return () => {
      window.clearTimeout(id);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, say]);

  // While the page scrolls he turns to the content on his left, glancing the way it moves.
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const dy = window.scrollY - lastY;
        lastY = window.scrollY;
        if (Math.abs(dy) > 2) look(-1, dy > 0 ? 0.6 : -0.8, 900);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, look]);

  const react = () => {
    wave();
    say(agentLines.clicks[clicks.current % agentLines.clicks.length] ?? "", 2400);
    clicks.current += 1;
  };

  return (
    <div
      data-state={state}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && state === "out") setState("hidden");
      }}
      className="agent-dock group/dock fixed bottom-6 z-30 w-28 print:hidden"
      // Centred in the right-hand margin beside the 72rem content column.
      style={{ right: "max(0.5rem, calc((100vw - 72rem) / 4 - 3.5rem))" }}
    >
      {line && (
        <p
          key={line}
          aria-hidden="true"
          className="agent-bubble absolute right-0 bottom-full mb-1 w-max max-w-[9rem] rounded-xl border border-matrix/40 bg-bg/90 px-3 py-2 font-mono text-[11px] text-matrix leading-snug shadow-[0_0_24px_-10px_var(--color-matrix)] backdrop-blur"
        >
          {line}
        </p>
      )}
      <button
        type="button"
        onClick={react}
        onPointerEnter={() => {
          setHovered(true);
          say(agentLines.hover, 2600);
        }}
        onPointerLeave={() => setHovered(false)}
        aria-label="The agent: click for a reaction"
        className="block w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-matrix/60"
      >
        <svg
          ref={svg}
          viewBox="0 0 120 130"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="agent w-full text-matrix [filter:drop-shadow(0_0_8px_color-mix(in_oklab,var(--color-matrix)_40%,transparent))]"
        >
          <g transform="translate(-20 -18)">
            <ellipse
              cx={80}
              cy={140}
              rx={20}
              ry={3}
              fill="currentColor"
              fillOpacity={0.2}
              stroke="none"
            />
            <AgentBody />

            {/* Both hands under the laptop, or the right one waving. */}
            <path d="M67 74 L58 90 L62 104" />
            {agentHand(62, 104)}
            {waving || hovered ? (
              <AgentWaveArm />
            ) : (
              <>
                <path d="M93 74 L102 90 L98 104" />
                {agentHand(98, 104)}
              </>
            )}

            {/* The open laptop, its lid towards us. */}
            <rect x={60} y={78} width={40} height={26} rx={2.5} style={agentBg} />
            <path d="M57 104 H103" strokeWidth={3} />
            <text
              x={80}
              y={94}
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontFamily="JetBrains Mono, monospace"
              fontSize={8}
              fontWeight={700}
            >
              {"</>"}
            </text>

            {/* The screen's light on his face. */}
            <AgentHead>
              <ellipse
                className="agent-glow"
                cx={80}
                cy={53}
                rx={9}
                ry={4}
                fill="currentColor"
                fillOpacity={0.18}
                stroke="none"
              />
            </AgentHead>
          </g>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setAgentShown(false)}
        aria-label="Hide the agent"
        title="Hide the agent (Search brings him back)"
        className="absolute -top-1 -left-1 grid size-6 place-items-center rounded-full border border-line bg-bg text-muted text-xs opacity-0 transition-opacity hover:text-matrix focus-visible:opacity-100 group-hover/dock:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
