import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import {
  caseStudiesByProject,
  type Delivered,
  type Project,
  projectBySlug,
  projects,
} from "@/content";
import { Explorer } from "@/features/architecture/Explorer";
import { CaseStudyCard } from "@/features/projects/CaseStudyCard";
import { useTitle } from "@/shared/lib/useTitle";
import { MetricTile } from "@/shared/ui/MetricTile";
import { SectionRail } from "@/shared/ui/SectionRail";
import { TechStack } from "@/shared/ui/TechStack";

type Search = { focus?: string; flow?: string };

export const Route = createFileRoute("/projects/$project/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    focus: typeof s.focus === "string" ? s.focus : undefined,
    flow: typeof s.flow === "string" ? s.flow : undefined,
  }),
  loader: ({ params }) => {
    const project = projectBySlug.get(params.project);
    if (!project) throw notFound();
    return project;
  },
  component: ProjectRoute,
});

function ProjectRoute() {
  const p = Route.useLoaderData();
  return <ProjectPage key={p.slug} p={p} />;
}

const eyebrow = "font-mono text-matrix text-sm";
const heading = "mt-2 font-extrabold text-3xl tracking-tight md:text-4xl";

const status: Record<Delivered["status"], { label: string; color: string }> = {
  shipped: { label: "shipped", color: "#00ff41" },
  ready: { label: "ready · awaiting deployment", color: "#ffc75c" },
  ongoing: { label: "ongoing", color: "#00e65c" },
};

function ProjectPage({ p }: { p: Project }) {
  useTitle(p.name);
  const search = Route.useSearch();
  const studies = caseStudiesByProject.get(p.slug) ?? [];
  const i = projects.findIndex((x) => x.slug === p.slug);
  const [prev, next] = [projects[i - 1], projects[i + 1]];

  const sections = [
    { id: "overview", label: "overview" },
    { id: "technologies", label: "technologies" },
    ...(p.architecture ? [{ id: "architecture", label: "architecture" }] : []),
    ...(studies.length ? [{ id: "case-studies", label: "case studies" }] : []),
    ...(p.delivered.length ? [{ id: "delivered", label: "also delivered" }] : []),
  ];

  return (
    <article className="pt-28 pb-24" style={{ "--accent": p.accent } as CSSProperties}>
      <div className="mx-auto max-w-6xl px-6">
        <Link
          to="/"
          hash={`p-${p.slug}`}
          className="font-mono text-muted text-sm hover:text-matrix"
        >
          ← all work
        </Link>

        <section id="overview" className="scroll-mt-24">
          {p.kind !== "work" && (
            <p className="mt-8 font-mono text-[var(--accent)] text-sm">
              {p.kind === "side" ? "side project" : "mentoring"}
            </p>
          )}
          <h1 className="mt-8 max-w-4xl font-extrabold text-4xl tracking-tight md:text-6xl">
            {p.name}
          </h1>
          <p className="mt-3 font-mono text-[var(--accent)] text-sm">{p.role}</p>
          <p className="mt-1 text-muted">{p.domain}</p>
          {p.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-matrix/40 px-3 py-1 font-mono text-matrix text-sm transition-colors hover:bg-matrix/10"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
          <p className="mt-6 max-w-3xl text-lg leading-relaxed">{p.summary}</p>

          {p.footprint.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {p.footprint.map((f) => (
                <MetricTile key={f.metric} value={f.value} metric={f.metric} accent={p.accent} />
              ))}
            </dl>
          )}

          <ul className="mt-10 grid gap-x-10 gap-y-3 md:grid-cols-2">
            {p.highlights.map((h) => (
              <li key={h} className="grid grid-cols-[1.1rem_1fr] text-[15px] leading-relaxed">
                <span className="text-matrix">▸</span>
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section id="technologies" className="mt-24 scroll-mt-24">
          <p className={eyebrow}>technologies</p>
          <h2 className={heading}>Technology stack</h2>
          <TechStack skills={p.skills} className="mt-8" />
        </section>
      </div>

      {p.architecture && (
        <section
          id="architecture"
          className="mx-auto mt-24 max-w-[120rem] scroll-mt-24 px-4 md:px-6"
        >
          <div className="mx-auto mb-6 max-w-6xl px-2">
            <p className={eyebrow}>architecture</p>
            <h2 className={heading}>System architecture</h2>
          </div>
          <Explorer architecture={p.architecture} focus={search.focus} flow={search.flow} />
        </section>
      )}

      <div className="mx-auto max-w-6xl px-6">
        {studies.length > 0 && (
          <section id="case-studies" className="mt-24 scroll-mt-24">
            <p className={eyebrow}>case studies</p>
            <h2 className={heading}>
              {studies.length} in-depth {studies.length === 1 ? "case study" : "case studies"}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {studies.map((c, n) => (
                <CaseStudyCard key={c.slug} study={c} index={n} />
              ))}
            </div>
          </section>
        )}

        {p.delivered.length > 0 && (
          <section id="delivered" className="mt-24 scroll-mt-24">
            <p className={eyebrow}>also delivered</p>
            <h2 className={heading}>Beyond the commit history</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Investigations, documentation and upgrades that live in tickets, pull requests and
              reports rather than merged commits.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {p.delivered.map((d) => (
                <div
                  key={d.title}
                  className="relative overflow-hidden rounded-xl border border-line bg-surface p-5"
                >
                  <div
                    aria-hidden
                    className="absolute inset-y-4 left-0 w-0.5 rounded-full"
                    style={{
                      background: status[d.status].color,
                      boxShadow: `0 0 12px ${status[d.status].color}`,
                    }}
                  />
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold">{d.title}</h3>
                    <span
                      className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px]"
                      style={{
                        color: status[d.status].color,
                        borderColor: `color-mix(in oklab, ${status[d.status].color} 45%, transparent)`,
                      }}
                    >
                      {status[d.status].label}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] text-muted leading-relaxed">{d.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <nav
          className="mt-24 grid gap-4 border-line border-t pt-8 md:grid-cols-2"
          aria-label="More projects"
        >
          {prev ? <Neighbour p={prev} dir="prev" /> : <span />}
          {next && <Neighbour p={next} dir="next" />}
        </nav>
      </div>

      <SectionRail sections={sections} hideOn={["architecture"]} />
    </article>
  );
}

function Neighbour({ p, dir }: { p: Project; dir: "prev" | "next" }) {
  return (
    <Link
      to="/projects/$project"
      params={{ project: p.slug }}
      className={`group rounded-xl border border-line p-5 transition-colors hover:border-matrix/60 ${dir === "next" ? "md:text-right" : ""}`}
    >
      <p className="font-mono text-muted text-xs">
        {dir === "prev" ? "← previous project" : "next project →"}
      </p>
      <p className="mt-1 font-semibold group-hover:text-matrix">{p.name}</p>
    </Link>
  );
}
