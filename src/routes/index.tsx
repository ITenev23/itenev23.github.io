import { createFileRoute, Link } from "@tanstack/react-router";
import {
  caseStudies,
  mainProjects,
  mentoring,
  type Project,
  profile,
  sideProjects,
} from "@/content";
import { Career } from "@/features/career/Career";
import { Credentials } from "@/features/credentials/Credentials";
import { Hero } from "@/features/hero/Hero";
import { Principles } from "@/features/principles/Principles";
import { PortfolioCounts } from "@/features/projects/ProjectGrid";
import { EvidenceGraph } from "@/features/skills/EvidenceGraph";
import { Chapter } from "@/features/workline/Chapter";
import { ProjectChapter } from "@/features/workline/ProjectChapter";
import { ProjectRow } from "@/features/workline/ProjectRow";
import { WorkLine } from "@/features/workline/WorkLine";
import { useTitle } from "@/shared/lib/useTitle";
import { DownloadCv } from "@/shared/ui/DownloadCv";

export const Route = createFileRoute("/")({ component: Home });

/**
 * One page, read along a line: every main project in full, side projects and mentoring
 * one row each, then problem solving, skills, experience, certifications and contact.
 */
function Home() {
  useTitle();
  return (
    <>
      <Hero />

      <WorkLine>
        <Chapter id="work" eyebrow="~/work" title="Selected work">
          <p className="-mt-2 mb-8 max-w-2xl text-lg text-muted">
            My projects in detail, then side projects and mentoring. Every project has its own page,
            with its architecture and case studies.
          </p>
          <PortfolioCounts />
          {profile.notes.length > 0 && (
            <ul className="light mt-6 space-y-1.5 text-[15px] text-fg/85">
              {profile.notes.map((n) => (
                <li key={n} className="grid grid-cols-[1.1rem_1fr] leading-relaxed">
                  <span className="text-matrix">▸</span>
                  {n}
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/projects"
            hash="case-studies"
            className="mt-6 inline-block font-mono text-matrix text-sm hover:underline"
          >
            browse all {caseStudies.length} case studies →
          </Link>
        </Chapter>

        {mainProjects.map((p) => (
          <ProjectChapter key={p.slug} project={p} />
        ))}
        <RowChapter id="side-projects" title="Side projects" items={sideProjects} />
        <RowChapter id="mentoring" title="Mentoring" items={mentoring} />

        <Chapter id="problem-solving" eyebrow="~/problem-solving" title="Problem solving">
          <Principles />
        </Chapter>

        <Chapter id="skills" eyebrow="~/evidence" title="Skills, and the work that proves them">
          <EvidenceGraph />
        </Chapter>

        <Chapter id="experience" eyebrow="~/experience" title="Experience and education">
          <Career />
        </Chapter>

        <Chapter id="certifications" eyebrow="~/certifications" title="Certifications and courses">
          <Credentials />
          <Link
            to="/certifications"
            className="mt-8 inline-block font-mono text-matrix text-sm hover:underline"
          >
            all certifications and courses, on their own page →
          </Link>
        </Chapter>

        <Chapter id="contact" eyebrow="~/contact" title="Get in touch">
          <p className="max-w-xl text-lg text-muted">{profile.invite}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <DownloadCv className="rounded-full bg-matrix px-5 py-2 font-medium text-bg text-sm">
              Grab my CV ↓
            </DownloadCv>
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full bg-matrix px-5 py-2 font-medium text-bg text-sm"
              >
                {profile.email}
              </a>
            )}
            {profile.socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-matrix/40 px-5 py-2 font-mono text-matrix text-sm hover:bg-matrix/10"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </Chapter>
      </WorkLine>
    </>
  );
}

/** A stop on the line holding several projects, one row each. */
function RowChapter({ id, title, items }: { id: string; title: string; items: Project[] }) {
  if (!items.length) return null;
  return (
    <Chapter id={id} title={title}>
      <ul className="space-y-3">
        {items.map((p) => (
          <ProjectRow key={p.slug} project={p} />
        ))}
      </ul>
    </Chapter>
  );
}
