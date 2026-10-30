import { clsx } from "clsx";
import { useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Architecture, NodeKind } from "@/content";
import { ownerStyle } from "@/shared/lib/architecture-style";
import { hasWebGL, modKey } from "@/shared/lib/env";
import { useHoverIntent } from "@/shared/lib/useHoverIntent";
import { useNear } from "@/shared/lib/useInView";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
import { FlowPicker, FlowStep } from "./FlowControls";
import { computeFocus } from "./focus";
import { Legend } from "./Legend";
import { NodeDetails } from "./NodeDetails";
import { useFlowPlayer } from "./useFlowPlayer";

// Both views are heavy and only needed here, so each gets its own chunk.
const ArchitectureScene = lazy(() => import("./ArchitectureScene"));
const ArchitectureDiagram = lazy(() => import("./ArchitectureDiagram"));

type Props = {
  architecture: Architecture;
  /** Deep links: a box to select, or a flow to play. */
  focus?: string;
  flow?: string;
};

// How each 3D shape reads, in legend order; only shapes on the board are listed.
const SHAPE_WORDS: [NodeKind, string][] = [
  ["service", "stacked blades are services"],
  ["function", "cubes Lambdas"],
  ["gateway", "boxes gateways"],
  ["bus", "the hexagon the event bus"],
  ["queue", "plates queues"],
  ["datastore", "cylinders data stores"],
  ["client", "flat tiles clients"],
  ["external", "dashed boxes third parties"],
];

const shapeLegend = (arch: Architecture) =>
  SHAPE_WORDS.filter(([kind]) => arch.nodes.some((n) => n.kind === kind))
    .map(([, words]) => words)
    .join(", ");

const matches = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

// Phones open on the 2D view: 28 boxes in 3D are too small to read there. 3D is one tap away.
const startIn3D = () =>
  !matches("(prefers-reduced-motion: reduce)") && !matches("(max-width: 640px)") && hasWebGL();

/** A whole system to explore: 3D board or 2D diagram, flow playback, details as points. */
export function Explorer({ architecture: arch, focus: focusId, flow }: Props) {
  const reduced = useReducedMotion() ?? false;
  const touch = useMediaQuery("(pointer: coarse)");

  const [view, setView] = useState<"3d" | "2d">(() => (startIn3D() ? "3d" : "2d"));
  const [hovered, setHovered] = useHoverIntent();
  const [selected, setSelected] = useState<string | null>(() =>
    arch.nodes.some((n) => n.id === focusId) ? (focusId ?? null) : null,
  );
  const [mine, setMine] = useState(false);
  // The details panel can step aside so the board gets the full width.
  const [panel, setPanel] = useState(true);
  const frame = useRef<HTMLDivElement>(null);
  // The board's code (three.js or React Flow) loads only when the visitor gets near it.
  const near = useNear(frame);
  const [full, setFull] = useState(false);
  const player = useFlowPlayer(arch.flows, flow);
  const { start, stop } = player;

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFull = () => {
    // Browsers may refuse (iframes, permissions); the board then simply stays in the page.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else frame.current?.requestFullscreen().catch(() => {});
  };

  // Whatever needs the panel brings it back: a selection or a playing flow.
  useEffect(() => {
    if (selected || player.flow) setPanel(true);
  }, [selected, player.flow]);

  // Deep links (search, case-study links) can change while the page is open.
  useEffect(() => {
    if (flow && arch.flows.some((f) => f.id === flow)) start(flow);
  }, [arch, flow, start]);
  useEffect(() => {
    if (focusId && arch.nodes.some((n) => n.id === focusId)) {
      setSelected(focusId);
      stop();
    }
  }, [arch, focusId, stop]);

  const focus = useMemo(
    () => computeFocus(arch, { hovered, selected, step: player.step, mine }),
    [arch, hovered, selected, player.step, mine],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSelected(null);
      stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stop]);

  const select = (id: string | null) => {
    setSelected(id);
    if (id) stop();
  };

  const selectedNode = selected ? arch.nodes.find((n) => n.id === selected) : undefined;
  const builtByMe = arch.nodes.filter((n) => n.owner === "built");
  const toggle = "rounded-md px-3 py-1.5 font-mono text-xs transition-colors";

  return (
    <div
      ref={frame}
      // Wider than the text column: the docked agent steps aside while it is on screen.
      data-agent-avoid
      className={clsx(
        "rounded-2xl border border-matrix/15 p-3 shadow-[0_0_60px_-30px_var(--color-matrix)] md:p-4",
        full ? "overflow-auto bg-bg" : "bg-surface/40",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <fieldset className="flex rounded-lg border border-line p-0.5">
            <legend className="sr-only">View</legend>
            {(["3d", "2d"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={clsx(
                  toggle,
                  view === v ? "bg-matrix/15 text-matrix" : "text-muted hover:text-fg",
                )}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </fieldset>
          <button
            type="button"
            onClick={() => setMine(!mine)}
            aria-pressed={mine}
            className={clsx(
              toggle,
              "border",
              mine
                ? "border-matrix bg-matrix/10 text-matrix"
                : "border-line text-muted hover:text-fg",
            )}
          >
            {mine ? "◉" : "○"} highlight my work
          </button>
          <button
            type="button"
            onClick={() => setPanel(!panel)}
            aria-pressed={!panel}
            className={clsx(
              toggle,
              "hidden border border-line text-muted hover:text-fg lg:inline-block",
            )}
          >
            {panel ? "◧ hide panel" : "◨ show panel"}
          </button>
          {document.fullscreenEnabled && (
            <button
              type="button"
              onClick={toggleFull}
              aria-pressed={full}
              className={clsx(
                toggle,
                "hidden border border-line text-muted hover:text-fg sm:inline-block",
              )}
            >
              {full ? "⤡ exit full screen" : "⤢ full screen"}
            </button>
          )}
        </div>
        {arch.flows.length > 0 && <FlowPicker flows={arch.flows} player={player} />}
      </div>

      <div className={clsx("grid gap-3", panel && "lg:grid-cols-[minmax(0,1fr)_21rem]")}>
        <div
          className={clsx(
            "relative overflow-hidden rounded-xl border border-line bg-[radial-gradient(ellipse_at_50%_40%,#12201f_0%,var(--color-bg)_70%)]",
            // As tall as the screen allows (minus nav, toolbar and legend); full screen uses
            // everything. A phone gets a frame shaped like the 3D board instead of empty space.
            full
              ? "h-[calc(100vh-8rem)]"
              : view === "3d"
                ? "h-[95vw] min-h-[300px] sm:h-[calc(100svh-12rem)] sm:min-h-[520px]"
                : "h-[80svh] min-h-[460px] sm:h-[calc(100svh-12rem)] sm:min-h-[520px]",
          )}
        >
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-surface/40" />}>
            {!near ? (
              <div className="h-full w-full bg-surface/40" />
            ) : view === "3d" ? (
              <ArchitectureScene
                architecture={arch}
                focus={focus}
                selected={selected}
                activeStep={player.step}
                reduced={reduced}
                onHover={setHovered}
                onSelect={select}
              />
            ) : (
              <ArchitectureDiagram
                architecture={arch}
                focus={focus}
                selected={selected}
                onSelect={select}
                onHover={setHovered}
                edgeLabels={false}
                className="h-full rounded-none border-0"
              />
            )}
          </Suspense>
          <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] text-muted">
            {view === "2d"
              ? "drag to pan · pinch or +/− to zoom · click a box"
              : touch
                ? "swipe sideways to rotate · tap a box"
                : `drag to rotate · right-drag to pan · ${modKey} + scroll to zoom · click a box`}
          </p>
        </div>

        <aside
          className={clsx(
            "rounded-xl border border-line bg-bg p-5 lg:overflow-y-auto",
            full ? "lg:max-h-[calc(100vh-8rem)]" : "lg:max-h-[calc(100svh-12rem)]",
            !panel && "lg:hidden",
          )}
        >
          {player.flow ? (
            <FlowStep player={player} />
          ) : selectedNode ? (
            <NodeDetails node={selectedNode} architecture={arch} onSelect={select} />
          ) : (
            <div>
              <h3 className="font-semibold text-xl">How to read it</h3>
              <ul className="mt-4 space-y-3 text-[15px] text-muted leading-relaxed">
                {arch.zones.length > 0 && (
                  <li>
                    {arch.zones.length === 1
                      ? `One zone: ${arch.zones[0]?.label.split(" · ")[0]}.`
                      : `${arch.zones.length} zones: ${arch.zones.map((z) => z.label.split(" · ")[0]).join(", ")}.`}
                  </li>
                )}
                <li>Shapes are types: {shapeLegend(arch)}.</li>
                <li>
                  <span style={{ color: ownerStyle.built.color }}>Green</span> is what I built or
                  own, <span style={{ color: ownerStyle.contributed.color }}>violet</span> what I
                  contributed to. Grey is other teams' services and managed infrastructure.
                </li>
                {arch.flows.length > 0 && (
                  <li>Moving dots show traffic. Walk through a request to follow it end to end.</li>
                )}
              </ul>
              {builtByMe.length > 0 && (
                <>
                  <p className="mt-6 font-mono text-[11px] text-muted">
                    start with what I built or own
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {builtByMe.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => select(n.id)}
                        className="rounded-full border border-matrix/40 px-2.5 py-1 font-mono text-[11px] text-matrix transition-colors hover:bg-matrix/10"
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </div>

      <div className="pt-4">
        <Legend architecture={arch} />
      </div>
    </div>
  );
}
