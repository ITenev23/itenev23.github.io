import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { type CaseStudy, caseStudiesByProject, type Project } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";
import { HudCorners } from "@/shared/ui/HudCorners";
import { MetricTile } from "@/shared/ui/MetricTile";
import { TechStack } from "@/shared/ui/TechStack";
import { Chapter } from "./Chapter";

// A soft light in the card's accent that follows the pointer (see trackSpotlight).
const spotlight = (size: number, strength: number): CSSProperties => ({
  background: `radial-gradient(${size}px circle at var(--x) var(--y), color-mix(in oklab, var(--accent) ${strength}%, transparent), transparent 60%)`,
});

/**
 * A main project told in full on the home page; its own page holds the deep dive. Its name
 * is the chapter title, with no label: the name is enough. The card is frosted glass over
 * the rain, with HUD corners and a spotlight in the project's accent under the pointer.
 */
export function ProjectChapter({ project: p }: { project: Project }) {
  const studies = caseStudiesByProject.get(p.slug) ?? [];
  const shown = [...studies.filter((c) => c.featured), ...studies.filter((c) => !c.featured)].slice(
    0,
    4,
  );

  return (
    <Chapter id={`p-${p.slug}`} title={p.name}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the pointer only moves a decorative spotlight; the links inside are the interaction. */}
      <div
        onMouseMove={trackSpotlight}
        className="group/hud charge-top relative rounded-2xl border border-line bg-surface/75 p-6 transition-[border-color,box-shadow] duration-500 hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:shadow-[0_0_70px_-28px_var(--accent)] md:p-8 lg:bg-surface/55 lg:backdrop-blur-sm"
        style={{ "--accent": p.accent } as CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/hud:opacity-100"
          style={spotlight(640, 9)}
        />
        <HudCorners />

        <div className="relative">
          <p className="font-mono text-matrix text-sm [text-shadow:0_0_14px_color-mix(in_oklab,var(--color-matrix)_45%,transparent)]">
            {p.role}
          </p>
          <p className="mt-1 text-muted text-sm">{p.domain}</p>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed">{p.summary}</p>

          {p.footprint.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {p.footprint.map((f) => (
                <MetricTile
                  key={f.metric}
                  value={f.value}
                  metric={f.metric}
                  accent={p.accent}
                  className="light"
                />
              ))}
            </dl>
          )}

          {p.highlights.length > 0 && (
            <ul className="mt-8 grid gap-x-10 gap-y-3 md:grid-cols-2">
              {p.highlights.map((h) => (
                <li
                  key={h}
                  className="light grid grid-cols-[1.1rem_1fr] text-[15px] leading-relaxed"
                >
                  <span className="text-matrix [text-shadow:0_0_10px_var(--color-matrix)]">▸</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-10 font-mono text-muted text-xs">technologies</p>
          <TechStack skills={p.skills} compact className="light mt-3" />

          {shown.length > 0 && (
            <div className="mt-10">
              <p className="font-mono text-muted text-xs">
                case studies · <span className="text-matrix">{studies.length}</span>
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {shown.map((c) => (
                  <StudyLink key={c.slug} c={c} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/projects/$project"
              params={{ project: p.slug }}
              className="rounded-full bg-matrix px-4 py-2 font-medium text-bg text-sm shadow-[0_0_28px_-10px_var(--color-matrix)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_0_36px_-6px_var(--color-matrix)]"
            >
              View project →
            </Link>
            {p.architecture && (
              <Link
                to="/projects/$project"
                params={{ project: p.slug }}
                hash="architecture"
                className="rounded-full border border-matrix/40 px-4 py-2 text-matrix text-sm transition-[background-color,box-shadow] hover:bg-matrix/10 hover:shadow-[0_0_24px_-10px_var(--color-matrix)]"
              >
                Explore the architecture
              </Link>
            )}
            {p.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line px-4 py-2 font-mono text-muted text-sm transition-colors hover:border-matrix/60 hover:text-matrix"
              >
                {l.label} ↗
              </a>
            ))}
            {studies.length > shown.length && (
              <Link
                to="/projects/$project"
                params={{ project: p.slug }}
                hash="case-studies"
                className="font-mono text-muted text-sm hover:text-matrix"
              >
                all {studies.length} case studies →
              </Link>
            )}
          </div>
        </div>
      </div>
    </Chapter>
  );
}

/** A case study inside the card: it lights up in its own accent under the pointer. */
function StudyLink({ c }: { c: CaseStudy }) {
  const top = c.outcomes[0];
  return (
    <Link
      to="/projects/$project/$study"
      params={{ project: c.project, study: c.slug }}
      onMouseMove={trackSpotlight}
      className="light group/study relative block overflow-hidden rounded-xl border border-line bg-bg/60 p-4 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--accent)_55%,transparent)] hover:shadow-[0_0_28px_-12px_var(--accent)]"
      style={{ "--accent": c.accent } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/study:opacity-100"
        style={spotlight(320, 14)}
      />
      <p className="relative font-semibold leading-snug transition-colors group-hover/study:text-[var(--accent)]">
        {c.title}
      </p>
      <p className="relative mt-1 line-clamp-2 text-muted text-sm leading-relaxed">{c.tagline}</p>
      {top && (
        <p className="relative mt-3 font-mono text-xs">
          <span style={{ color: c.accent }}>{top.value}</span>{" "}
          <span className="text-muted">{top.metric}</span>
        </p>
      )}
    </Link>
  );
}
