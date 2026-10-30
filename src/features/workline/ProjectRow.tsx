import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { caseStudiesByProject, type Project } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";

/**
 * A project told in one row on the work line: name, role, one or two lines of summary.
 * Its own page holds the rest, so the home page stays a short read. Under the pointer the
 * row lights up in the project's accent.
 */
export function ProjectRow({ project: p }: { project: Project }) {
  const studies = caseStudiesByProject.get(p.slug) ?? [];
  // What waits on the project's page: its board, its case studies.
  const meta = [
    p.architecture && "◆ architecture",
    studies.length > 0 && `${studies.length} case ${studies.length === 1 ? "study" : "studies"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li id={`p-${p.slug}`} className="scroll-mt-24">
      <Link
        to="/projects/$project"
        params={{ project: p.slug }}
        onMouseMove={trackSpotlight}
        className="light group relative grid gap-x-8 gap-y-2 overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--accent)_18%,var(--color-line))] bg-surface/75 p-5 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--accent)_55%,transparent)] hover:shadow-[0_0_36px_-16px_var(--accent)] md:grid-cols-[15rem_minmax(0,1fr)_auto] md:items-center lg:bg-surface/55 lg:backdrop-blur-sm"
        style={{ "--accent": p.accent } as CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklab, var(--accent) 11%, transparent), transparent 60%)",
          }}
        />
        <div className="relative">
          <h3 className="font-semibold text-lg leading-snug transition-colors group-hover:text-[var(--accent)]">
            {p.name}
          </h3>
          <p className="mt-0.5 font-mono text-[12px]" style={{ color: p.accent }}>
            {p.role}
          </p>
        </div>
        <p className="relative line-clamp-2 text-[15px] text-fg/85 leading-relaxed">{p.summary}</p>
        <span className="relative font-mono text-muted text-xs transition-colors group-hover:text-[var(--accent)]">
          {meta || "view project"} →
        </span>
      </Link>
    </li>
  );
}
