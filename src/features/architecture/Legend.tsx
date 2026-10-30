import type { Architecture, EdgeKind, NodeOwner } from "@/content";
import { edgeStyle, ownerStyle } from "@/shared/lib/architecture-style";

/** Only lists the owners and edge kinds this diagram actually uses. */
export function Legend({ architecture }: { architecture: Architecture }) {
  const owners = (Object.keys(ownerStyle) as NodeOwner[]).filter((o) =>
    architecture.nodes.some((n) => n.owner === o),
  );
  const kinds = (Object.keys(edgeStyle) as EdgeKind[]).filter((k) =>
    architecture.edges.some((e) => e.kind === k),
  );

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-muted">
      {owners.map((o) => (
        <span key={o} className="inline-flex items-center gap-2">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: ownerStyle[o].color, boxShadow: `0 0 8px ${ownerStyle[o].color}` }}
          />
          {ownerStyle[o].label}
        </span>
      ))}
      <span className="hidden h-4 w-px bg-line sm:inline-block" aria-hidden />
      {kinds.map((k) => (
        <span key={k} className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full" style={{ background: edgeStyle[k].color }} />
          {edgeStyle[k].label}
        </span>
      ))}
    </div>
  );
}
