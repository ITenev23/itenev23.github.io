import { createFileRoute, Link } from "@tanstack/react-router";
import { caseStudiesByProject, mainProjects, mentoring, projects, sideProjects } from "@/content";
import { PortfolioCounts, ProjectGrid } from "@/features/projects/ProjectGrid";
import { useTitle } from "@/shared/lib/useTitle";
import { Section } from "@/shared/ui/Section";
import { SectionRail } from "@/shared/ui/SectionRail";

export const Route = createFileRoute("/projects/")({ component: Projects });

function Projects() {
  useTitle("Projects");
  return (
    <div className="pt-16">
      <Section id="projects" eyebrow="~/projects" title="Projects">
        <p className="-mt-6 mb-10 max-w-2xl text-lg text-muted">
          Newest first. There have been others; these show the most of how I work. Each project page
          covers its context, its architecture and its case studies.
        </p>
        <PortfolioCounts />
        <div className="mt-10">
          <ProjectGrid items={mainProjects} />
        </div>
      </Section>

      <Section id="side-projects" eyebrow="~/side-projects" title="Side projects">
        <p className="-mt-6 mb-10 max-w-2xl text-lg text-muted">
          Built in my own time and held to the same standard: validators, test suites and
          headless-browser checks.
        </p>
        <ProjectGrid items={sideProjects} />
      </Section>

      <Section id="mentoring" eyebrow="~/mentoring" title="Mentoring">
        <ProjectGrid items={mentoring} />
      </Section>

      <Section id="case-studies" eyebrow="index" title="All case studies, by project">
        <div className="space-y-10">
          {projects.map((p) => {
            const studies = caseStudiesByProject.get(p.slug) ?? [];
            if (!studies.length) return null;
            return (
              <div key={p.slug}>
                <Link
                  to="/projects/$project"
                  params={{ project: p.slug }}
                  className="font-mono text-sm hover:underline"
                  style={{ color: p.accent }}
                >
                  {p.name} · {studies.length}
                </Link>
                <ul className="mt-3 divide-y divide-line border-line border-y">
                  {studies.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/projects/$project/$study"
                        params={{ project: p.slug, study: c.slug }}
                        className="group grid gap-1 py-4 transition-colors md:grid-cols-[22rem_1fr_auto] md:gap-6"
                      >
                        <span className="font-semibold group-hover:text-matrix">{c.title}</span>
                        <span className="text-muted text-sm leading-relaxed">{c.tagline}</span>
                        <span className="hidden font-mono text-matrix transition-transform group-hover:translate-x-1 md:block">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <SectionRail
        sections={[
          { id: "projects", label: "projects" },
          { id: "side-projects", label: "side projects" },
          { id: "mentoring", label: "mentoring" },
          { id: "case-studies", label: "case studies" },
        ]}
      />
    </div>
  );
}
