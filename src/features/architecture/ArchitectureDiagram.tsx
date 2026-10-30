import {
  Background,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { clsx } from "clsx";
import { useEffect, useMemo, useRef } from "react";
import type { Architecture, ArchNode } from "@/content";
import { edgeKey, edgeStyle, kindIcon, ownerStyle } from "@/shared/lib/architecture-style";
import { useNarrow } from "@/shared/lib/useMediaQuery";
import { type EmphasisState, edgeState, type Focus, nodeState } from "./focus";

type SystemData = {
  node: ArchNode;
  state: EmphasisState;
  selected: boolean;
  direction: Architecture["direction"];
};
type LaneData = { label: string };
type SystemNode = Node<SystemData, "system">;
type LaneNode = Node<LaneData, "lane">;

const NODE_W = 176;
const GRID = { LR: { col: 215, row: 100 }, TB: { col: 205, row: 150 } } as const;
const TRANSPOSED = { col: 200, row: 125 } as const;

const nodeTypes = { system: SystemBox, lane: LaneBand };
const FIT = { padding: 0.08, maxZoom: 1.1 };
// A whole board fitted to a phone is unreadably small. There it starts at a readable
// zoom, centred, and the visitor pans and pinches for the rest.
const PHONE_FIT = { ...FIT, minZoom: 0.45 };

type Props = {
  architecture: Architecture;
  focus: Focus;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onHover?: (id: string | null) => void;
  /** Busy diagrams hide edge labels until an edge is in focus. */
  edgeLabels?: boolean;
  className?: string;
};

/** Interactive 2D view of the same architecture data the 3D explorer renders. */
export default function ArchitectureDiagram({
  architecture,
  focus,
  selected,
  onSelect,
  onHover,
  edgeLabels = true,
  className,
}: Props) {
  const narrow = useNarrow();
  const fit = narrow ? PHONE_FIT : FIT;
  // On phones, left-to-right diagrams turn top-to-bottom so they fill a tall frame.
  const transpose = narrow && architecture.direction === "LR";
  const direction = transpose ? "TB" : architecture.direction;
  const grid = transpose ? TRANSPOSED : GRID[architecture.direction];

  const nodes = useMemo<(SystemNode | LaneNode)[]>(() => {
    const xs = architecture.nodes.map((n) => n.x * grid.col);
    const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
    const lanes: LaneNode[] = architecture.lanes.map((l) => ({
      id: `lane-${l.y}`,
      type: "lane",
      position: { x: minX - 36, y: l.y * grid.row - 34 },
      data: { label: l.label },
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: -1,
      // Bands are decoration: they must never take the pointer from a box.
      style: { width: maxX - minX + NODE_W + 72, height: 112, pointerEvents: "none" },
    }));
    const systems: SystemNode[] = architecture.nodes.map((n) => ({
      id: n.id,
      type: "system",
      position: transpose
        ? { x: n.y * grid.col, y: n.x * grid.row }
        : { x: n.x * grid.col, y: n.y * grid.row },
      data: { node: n, state: nodeState(focus, n.id), selected: selected === n.id, direction },
      draggable: false,
    }));
    return [...lanes, ...systems];
  }, [architecture, focus, selected, direction, grid, transpose]);

  const edges = useMemo<Edge[]>(
    () =>
      architecture.edges.map((e) => {
        const key = edgeKey(e);
        const s = edgeStyle[e.kind];
        const st = edgeState(focus, key);
        return {
          id: key,
          source: e.from,
          target: e.to,
          animated: s.animated && st !== "dim",
          label: edgeLabels || st === "active" ? e.label : undefined,
          // Edges are never interactive. Raising a highlighted edge above the boxes, or
          // giving it a hit area, let it steal the pointer from the hovered box, which
          // ended the hover, which lowered the edge again: the blinking loop.
          interactionWidth: 0,
          markerEnd: { type: MarkerType.ArrowClosed, color: s.color, width: 14, height: 14 },
          style: {
            stroke: s.color,
            strokeWidth: st === "active" ? 2.4 : 1.4,
            opacity: st === "dim" ? 0.1 : st === "active" ? 1 : 0.65,
          },
          labelStyle: { fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" },
          labelBgStyle: { fill: "var(--color-bg)" },
          labelBgPadding: [4, 2] as [number, number],
        };
      }),
    [architecture, focus, edgeLabels],
  );

  // Re-fit whenever the frame changes size (full screen, panel hidden, window resized).
  const box = useRef<HTMLDivElement>(null);
  const flow = useRef<ReactFlowInstance<SystemNode | LaneNode, Edge> | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => flow.current?.fitView(fit));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  return (
    <div
      ref={box}
      className={clsx("overflow-hidden rounded-xl border border-line bg-bg", className)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          flow.current = instance;
        }}
        fitView
        fitViewOptions={fit}
        minZoom={0.15}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        // Let the page scroll; zoom with pinch, Ctrl/⌘ + scroll or the controls.
        zoomOnScroll={false}
        preventScrolling={false}
        colorMode="dark"
        onNodeClick={(_, n) => {
          if (n.type === "system") onSelect(n.id === selected ? null : n.id);
        }}
        onNodeMouseEnter={(_, n) => {
          if (n.type === "system") onHover?.(n.id);
        }}
        onNodeMouseLeave={() => onHover?.(null)}
        onPaneClick={() => onSelect(null)}
      >
        <Background gap={24} color="#16261a" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}

function SystemBox({ data }: NodeProps<SystemNode>) {
  const { node, state, selected, direction } = data;
  const owner = ownerStyle[node.owner];
  const mine = node.owner === "built" || node.owner === "contributed";
  const [inPos, outPos] =
    direction === "TB" ? [Position.Top, Position.Bottom] : [Position.Left, Position.Right];

  return (
    <div
      className={clsx(
        "cursor-pointer rounded-xl border bg-surface px-3 py-2 transition-[opacity,box-shadow] duration-300",
        state === "dim" && "opacity-25",
        node.owner === "integrated" && "border-dashed",
      )}
      style={{
        width: NODE_W,
        borderColor: mine || state === "active" || selected ? owner.color : "var(--color-line)",
        boxShadow:
          selected || state === "active"
            ? `0 0 0 1px ${owner.color}, 0 0 28px -6px ${owner.color}`
            : node.owner === "built"
              ? `0 0 22px -10px ${owner.color}`
              : undefined,
      }}
    >
      <Handle type="target" position={inPos} isConnectable={false} className="!opacity-0" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm" style={{ color: owner.color }} aria-hidden>
          {kindIcon[node.kind]}
        </span>
        <span className="font-medium text-[14px] text-fg leading-tight">{node.label}</span>
      </div>
      {node.sub && (
        <div className="mt-1 font-mono text-[11px] text-muted leading-snug">{node.sub}</div>
      )}
      <Handle type="source" position={outPos} isConnectable={false} className="!opacity-0" />
    </div>
  );
}

function LaneBand({ data }: NodeProps<LaneNode>) {
  return (
    <div className="pointer-events-none h-full w-full rounded-2xl border border-line/70 border-dashed bg-surface/30">
      <span className="absolute top-2 left-4 font-mono text-[10px] text-muted uppercase tracking-[0.18em]">
        {data.label}
      </span>
    </div>
  );
}
