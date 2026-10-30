import type { Architecture, NodeOwner } from "@/content";
import { edgeKey } from "@/shared/lib/architecture-style";

/** What is emphasised right now. null = nothing, everything renders normally. */
export type Focus = { nodes: Set<string>; edges: Set<string> } | null;
export type EmphasisState = "normal" | "active" | "dim";

const MINE: ReadonlySet<NodeOwner> = new Set(["built", "contributed"]);

type Inputs = {
  hovered: string | null;
  selected: string | null;
  step: { from: string; to: string } | null;
  /** "Highlight my work" toggle. */
  mine: boolean;
};

/** One rule for both the 2D and 3D views: a flow step beats hover, hover beats selection. */
export function computeFocus(arch: Architecture, { hovered, selected, step, mine }: Inputs): Focus {
  if (step) return { nodes: new Set([step.from, step.to]), edges: new Set([edgeKey(step)]) };

  const id = hovered ?? selected;
  if (id) {
    const touching = arch.edges.filter((e) => e.from === id || e.to === id);
    return {
      nodes: new Set([id, ...touching.flatMap((e) => [e.from, e.to])]),
      edges: new Set(touching.map(edgeKey)),
    };
  }

  if (mine) {
    const nodes = new Set(arch.nodes.filter((n) => MINE.has(n.owner)).map((n) => n.id));
    const edges = arch.edges.filter((e) => nodes.has(e.from) || nodes.has(e.to)).map(edgeKey);
    return { nodes, edges: new Set(edges) };
  }

  return null;
}

export const nodeState = (focus: Focus, id: string): EmphasisState =>
  !focus ? "normal" : focus.nodes.has(id) ? "active" : "dim";

export const edgeState = (focus: Focus, key: string): EmphasisState =>
  !focus ? "normal" : focus.edges.has(key) ? "active" : "dim";
