import { Link } from "@tanstack/react-router";
import { type Architecture, type ArchNode, caseStudyBySlug } from "@/content";
import { edgeStyle, kindIcon, ownerStyle } from "@/shared/lib/architecture-style";

type Props = {
  node: ArchNode;
  architecture: Architecture;
  onSelect: (id: string | null) => void;
  /** Hide the case-study link when already on that case study. */
  currentSlug?: string;
};

const heading = "font-mono text-[11px] text-muted uppercase tracking-[0.14em]";

/** A box's details as points: what it does, what it runs on, my part, what it talks to. */
export function NodeDetails({ node, architecture, onSelect, currentSlug }: Props) {
  const owner = ownerStyle[node.owner];
  const byId = new Map(architecture.nodes.map((n) => [n.id, n]));
  const links = [
    ...architecture.edges
      .filter((e) => e.from === node.id)
      .map((e) => ({ e, peer: e.to, out: true })),
    ...architecture.edges
      .filter((e) => e.to === node.id)
      .map((e) => ({ e, peer: e.from, out: false })),
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs" style={{ color: owner.color }}>
            {kindIcon[node.kind]} {owner.label}
          </p>
          <h3 className="mt-1 font-semibold text-xl">{node.label}</h3>
          {node.note && <p className="mt-1 text-muted text-sm">{node.note}</p>}
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Close details"
          className="rounded-md border border-line px-2 py-0.5 font-mono text-muted text-xs hover:text-fg"
        >
          esc
        </button>
      </div>

      {node.features.length > 0 && (
        <section className="mt-5">
          <h4 className={heading}>What it does</h4>
          <ul className="mt-2 space-y-1.5 text-[14px] leading-snug">
            {node.features.map((f) => (
              <li key={f} className="grid grid-cols-[0.9rem_1fr]">
                <span className="text-muted">·</span>
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {node.myWork.length > 0 && (
        <section className="mt-5">
          <h4 className={heading}>My contribution</h4>
          <ul className="mt-2 space-y-1.5 text-[14px] leading-snug">
            {node.myWork.map((w) => (
              <li key={w} className="grid grid-cols-[0.9rem_1fr]">
                <span style={{ color: ownerStyle.built.color }}>▸</span>
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {node.tech.length > 0 && (
        <section className="mt-5">
          <h4 className={heading}>Technologies</h4>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {node.tech.map((t) => (
              <li
                key={t}
                className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-fg/80"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {links.length > 0 && (
        <section className="mt-5">
          <h4 className={heading}>Connections</h4>
          <ul className="mt-2 divide-y divide-line/60">
            {links.map(({ e, peer, out }) => (
              <li key={`${e.from}>${e.to}`} className="flex items-center gap-2 py-1.5 text-sm">
                <span className="w-3 font-mono text-muted">{out ? "→" : "←"}</span>
                <button
                  type="button"
                  onClick={() => onSelect(peer)}
                  className="truncate text-left transition-colors hover:text-matrix"
                >
                  {byId.get(peer)?.label ?? peer}
                </button>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted">
                  <span
                    className="h-0.5 w-3 rounded-full"
                    style={{ background: edgeStyle[e.kind].color }}
                  />
                  {e.label ?? edgeStyle[e.kind].label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {node.caseStudy && node.caseStudy !== currentSlug && (
        <Link
          to="/projects/$project/$study"
          params={{
            project: caseStudyBySlug.get(node.caseStudy)?.project ?? "",
            study: node.caseStudy,
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-matrix px-4 py-2 font-medium text-bg text-sm transition-transform hover:translate-x-0.5"
        >
          Read the case study →
        </Link>
      )}
    </div>
  );
}
