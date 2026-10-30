import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type CSSProperties, lazy, Suspense, useMemo, useState } from "react";
import {
  boardNodesByStudy,
  type CaseStudy,
  caseStudies,
  caseStudyBySlug,
  projectBySlug,
  skillById,
} from "@/content";
import { computeFocus } from "@/features/architecture/focus";
import { Legend } from "@/features/architecture/Legend";
import { NodeDetails } from "@/features/architecture/NodeDetails";
import { skillCategories } from "@/shared/lib/skill-categories";
import { useHoverIntent } from "@/shared/lib/useHoverIntent";
import { useTitle } from "@/shared/lib/useTitle";
import { MetricTile } from "@/shared/ui/MetricTile";
import { SectionRail } from "@/shared/ui/SectionRail";

// React Flow is only needed on case-study pages that have a diagram.
const ArchitectureDiagram = lazy(() => import("@/features/architecture/ArchitectureDiagram"));

export const Route = createFileRoute("/projects/$project/$study")({
  loader: ({ params }) => {
    const study = caseStudyBySlug.get(params.study);
    if (!study || study.project !== params.project) throw notFound();
    return study;
  },
  component: CaseStudyRoute,
});

function CaseStudyRoute() {
  const c = Route.useLoaderData();
  // Keyed so diagram selection resets when moving between case studies.
  return <CaseStudyPage key={c.slug} c={c} />;
}

const heading = "font-mono text-sm text-[var(--accent)]";

function CaseStudyPage({ c }: { c: CaseStudy }) {
  useTitle(c.title);
  const project = projectBySlug.get(c.project);
  const i = caseStudies.findIndex((x) => x.slug === c.slug);
  const [prev, next] = [caseStudies[i - 1], caseStudies[i + 1]];
  const boardNode = boardNodesByStudy.get(c.slug)?.[0];

  const sections = [
    { id: "outcomes", label: "outcomes" },
    ...(c.architecture ? [{ id: "architecture", label: "architecture" }] : []),
    { id: "stack", label: "technologies" },
    { id: "context", label: "context" },
    { id: "approach", label: "approach" },
    { id: "decisions", label: "decisions" },
    ...(c.retrospective.length ? [{ id: "looking-back", label: "retrospective" }] : []),
  ];

  return (
    <article
      className="mx-auto max-w-5xl px-6 pt-32 pb-24"
      style={{ "--accent": c.accent } as CSSProperties}
    >
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 font-mono text-muted text-sm">
        <Link to="/projects" className="hover:text-matrix">
          projects
        </Link>
        <span>/</span>
        {project && (
          <Link
            to="/projects/$project"
            params={{ project: project.slug }}
            className="hover:text-matrix"
          >
            {project.name}
          </Link>
        )}
      </nav>
      <p className="mt-8 font-mono text-[var(--accent)] text-sm">{c.role}</p>
      <h1 className="mt-3 max-w-4xl font-extrabold text-4xl tracking-tight md:text-6xl">
        {c.title}
      </h1>
      <p className="mt-5 max-w-3xl text-muted text-xl leading-relaxed">{c.tagline}</p>

      <dl id="outcomes" className="mt-10 grid scroll-mt-24 grid-cols-2 gap-3 md:grid-cols-4">
        {c.outcomes.map((o) => (
          <MetricTile key={o.metric} value={o.value} metric={o.metric} accent={c.accent} />
        ))}
      </dl>

      {boardNode && project && (
        <Link
          to="/projects/$project"
          params={{ project: project.slug }}
          search={{ focus: boardNode }}
          hash="architecture"
          className="mt-6 inline-flex items-center gap-2 font-mono text-muted text-sm transition-colors hover:text-[var(--accent)]"
        >
          ◇ see where this sits on the {project.name} board →
        </Link>
      )}

      {c.architecture && <Diagram c={c} />}

      <section id="stack" className="mt-12 scroll-mt-24">
        <h2 className={heading}>technologies</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {c.skills.map((id) => {
            const s = skillById.get(id);
            return (
              <li
                key={id}
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm"
              >
                {s && (
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: skillCategories[s.category].color }}
                  />
                )}
                {s?.name ?? id}
              </li>
            );
          })}
        </ul>
      </section>

      <section id="context" className="mt-16 grid scroll-mt-24 gap-10 md:grid-cols-[1fr_18rem]">
        <div>
          <h2 className={heading}>context</h2>
          <p className="mt-4 text-lg leading-relaxed">{c.context}</p>
        </div>
        <div>
          <h2 className={heading}>constraints</h2>
          <ul className="mt-4 space-y-3 text-muted text-sm leading-relaxed">
            {c.constraints.map((x) => (
              <li key={x} className="border-[var(--accent)]/40 border-l-2 pl-3">
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="approach" className="mt-16 scroll-mt-24">
        <h2 className={heading}>approach</h2>
        <ol className="mt-6 space-y-4">
          {c.approach.map((a, n) => (
            <li key={a} className="grid grid-cols-[2.5rem_1fr] gap-2 leading-relaxed">
              <span className="font-mono text-[var(--accent)] text-sm">
                {String(n + 1).padStart(2, "0")}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="decisions" className="mt-16 scroll-mt-24">
        <h2 className={heading}>key decisions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {c.decisions.map((d, n) => (
            <div
              key={d.title}
              className="relative overflow-hidden rounded-xl border border-line bg-surface p-6"
            >
              <div
                aria-hidden
                className="absolute inset-x-6 top-0 h-px opacity-70"
                style={{
                  background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
                }}
              />
              <p className="font-mono text-[var(--accent)] text-xs">
                ADR-{String(n + 1).padStart(3, "0")}
              </p>
              <h3 className="mt-1 font-semibold text-lg">{d.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed">
                <span className="text-muted">Why · </span>
                {d.why}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed">
                <span className="text-muted">Trade-off · </span>
                {d.tradeoff}
              </p>
            </div>
          ))}
        </div>
      </section>

      {c.retrospective.length > 0 && (
        <section id="looking-back" className="mt-16 scroll-mt-24">
          <h2 className={heading}>retrospective</h2>
          <div className="mt-6 space-y-4">
            {c.retrospective.map((r) => (
              <div
                key={r.title}
                className="rounded-r-xl border-[var(--accent)] border-l-2 bg-surface/60 py-5 pr-6 pl-6"
              >
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-2 text-[15px] text-muted leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <nav
        className="mt-16 grid gap-4 border-line border-t pt-8 md:grid-cols-2"
        aria-label="More case studies"
      >
        {prev ? <Neighbour c={prev} dir="prev" /> : <span />}
        {next && <Neighbour c={next} dir="next" />}
      </nav>

      <SectionRail sections={sections} hideOn={["architecture"]} />
    </article>
  );
}

function Diagram({ c }: { c: CaseStudy }) {
  const arch = c.architecture;
  const [hovered, setHovered] = useHoverIntent();
  const [selected, setSelected] = useState<string | null>(null);
  const focus = useMemo(
    () => (arch ? computeFocus(arch, { hovered, selected, step: null, mine: false }) : null),
    [arch, hovered, selected],
  );
  if (!arch) return null;
  const node = selected ? arch.nodes.find((n) => n.id === selected) : undefined;

  return (
    <section id="architecture" className="mt-14 scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={heading}>architecture</h2>
        <p className="font-mono text-[11px] text-muted">click a box for details</p>
      </div>
      {/* Breaks out of the text column: wide diagrams stay legible. */}
      <div className="relative left-1/2 mt-4 w-[min(92rem,calc(100vw-2rem))] -translate-x-1/2">
        <Suspense
          fallback={
            <div className="h-[80svh] animate-pulse rounded-xl bg-surface sm:h-[min(72svh,46rem)] sm:min-h-[30rem]" />
          }
        >
          <ArchitectureDiagram
            architecture={arch}
            focus={focus}
            selected={selected}
            onSelect={setSelected}
            onHover={setHovered}
            className="h-[80svh] border-[color-mix(in_oklab,var(--accent)_25%,var(--color-line))] shadow-[0_0_60px_-34px_var(--accent)] sm:h-[min(72svh,46rem)] sm:min-h-[30rem]"
          />
        </Suspense>
      </div>
      {node && (
        <div className="mt-3 rounded-xl border border-line bg-surface p-5">
          <NodeDetails
            node={node}
            architecture={arch}
            onSelect={setSelected}
            currentSlug={c.slug}
          />
        </div>
      )}
      <div className="mt-4">
        <Legend architecture={arch} />
      </div>
    </section>
  );
}

function Neighbour({ c, dir }: { c: CaseStudy; dir: "prev" | "next" }) {
  return (
    <Link
      to="/projects/$project/$study"
      params={{ project: c.project, study: c.slug }}
      className={`group rounded-xl border border-line p-5 transition-colors hover:border-[var(--accent)] ${dir === "next" ? "md:text-right" : ""}`}
    >
      <p className="font-mono text-muted text-xs">{dir === "prev" ? "← previous" : "next →"}</p>
      <p className="mt-1 font-semibold group-hover:text-fg">{c.title}</p>
    </Link>
  );
}
