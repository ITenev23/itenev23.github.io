import { createFileRoute } from "@tanstack/react-router";
import { type CSSProperties, Fragment, type ReactNode } from "react";
import {
  caseStudies,
  credentials,
  education,
  mainProjects,
  type Project,
  profile,
  roles,
  type SkillCategory,
  skillById,
  skills,
} from "@/content";
import { skillCategories } from "@/shared/lib/skill-categories";
import { trackSpotlight } from "@/shared/lib/spotlight";
import { useTitle } from "@/shared/lib/useTitle";
import { DownloadCv } from "@/shared/ui/DownloadCv";

type Search = { pdf?: boolean };

export const Route = createFileRoute("/cv")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    pdf: s.pdf === 1 || s.pdf === "1" || s.pdf === true ? true : undefined,
  }),
  component: Cv,
});

// The PDF is printed from this page on a local server (scripts/build-resume.mjs opens
// /cv?pdf=1), so in that mode links point at the public site instead of the print host.
const SITE = "https://itenev23.github.io";

const sectionTitle =
  "mb-3 border-line border-b pb-1 font-mono text-matrix text-xs uppercase tracking-[0.18em] [text-shadow:0_0_14px_color-mix(in_oklab,var(--color-matrix)_45%,transparent)] print:border-neutral-300 print:text-[8.5pt] print:text-green-900 print:[text-shadow:none]";
const muted = "text-muted print:text-neutral-600";
// A word that lights up in its own colour (--c) when the pointer is on it. Screen only.
const glowWord =
  "transition-[color,text-shadow] duration-200 hover:text-[var(--c)] hover:[text-shadow:0_0_14px_var(--c)]";

/**
 * The CV, built only from the site's content: nothing here is typed twice. On screen the
 * skill rows and project entries light up under the pointer in their own neon colour; in
 * print it is plain A4 black on white, selectable text that applicant-tracking systems can
 * read. Languages are still to come; they appear as soon as they are in the content.
 */
function Cv() {
  const { pdf } = Route.useSearch();
  const href = (path: string) => (pdf ? `${SITE}${path}` : path);

  // The PDF takes its title from the document.
  useTitle("CV");

  const contacts = [
    { label: SITE.replace(/^https:\/\//, ""), href: SITE },
    ...(profile.email ? [{ label: profile.email, href: `mailto:${profile.email}` }] : []),
    ...profile.socials
      .filter((s) => s.cv !== false)
      .map((s) => ({
        label: s.href.replace(/^https?:\/\/(www\.)?/, ""),
        href: s.href,
      })),
  ];

  const skillGroups = (Object.keys(skillCategories) as SkillCategory[])
    .map((cat) => ({
      cat,
      names: skills
        .filter((s) => s.category === cat)
        .sort((a, b) => b.depth - a.depth)
        .map((s) => s.name),
    }))
    .filter((g) => g.names.length);

  // A project that belongs to an earlier role is told under that role, not twice.
  const roleProjects = new Set(roles.flatMap((r) => r.projects));
  // Graded courses by name; the rest are counted and live on the certifications page.
  const courses = credentials.filter((c) => c.kind === "course");
  const graded = courses.filter((c) => c.note);

  return (
    <article
      data-cv
      className="mx-auto max-w-3xl px-6 pt-28 pb-24 print:max-w-none print:p-0 print:text-[9.5pt] print:text-neutral-900 print:leading-snug"
    >
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface/60 p-4 print:hidden">
        {/* A Jedi mind trick for the download. Screen only: the banner never prints. */}
        <p className="font-mono text-matrix text-sm [text-shadow:0_0_14px_color-mix(in_oklab,var(--color-matrix)_45%,transparent)]">
          This is the CV you're looking for.
        </p>
        <DownloadCv className="rounded-full bg-matrix px-4 py-2 font-medium text-bg text-sm shadow-[0_0_28px_-10px_var(--color-matrix)] transition-transform hover:-translate-y-0.5">
          Grab it ↓
        </DownloadCv>
      </div>

      <header>
        <h1 className="font-extrabold text-4xl tracking-tight print:text-[22pt]">{profile.name}</h1>
        <p className="mt-1 font-mono text-matrix [text-shadow:0_0_18px_color-mix(in_oklab,var(--color-matrix)_50%,transparent)] print:text-[11pt] print:text-green-900 print:[text-shadow:none]">
          {profile.headline}
        </p>
        <p
          className={`mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm print:text-[9pt] ${muted}`}
          style={{ "--c": "var(--color-matrix)" } as CSSProperties}
        >
          <span>{profile.location}</span>
          <span aria-hidden>·</span>
          <span>{profile.yearsOfExperience}+ years</span>
          {contacts.map((c) => (
            <span key={c.href} className="contents">
              <span aria-hidden>·</span>
              <a href={c.href} className={glowWord}>
                {c.label}
              </a>
            </span>
          ))}
        </p>
      </header>

      <CvSection title="Summary">
        <p className="leading-relaxed print:leading-snug">{profile.pitch}</p>
        {profile.notes.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 marker:text-matrix print:marker:text-neutral-500">
            {profile.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        {/* The skills section already lists the focus; this line points at the evidence. */}
        <p className={`mt-1 ${muted}`}>
          Interactive architecture boards and all {caseStudies.length} case studies:{" "}
          <a href={SITE} className="text-matrix print:text-green-900">
            {SITE.replace(/^https:\/\//, "")}
          </a>
        </p>
      </CvSection>

      <CvSection title="Skills">
        <dl className="-mx-3 space-y-0.5 print:mx-0 print:space-y-0">
          {skillGroups.map((g) => (
            <SkillRow key={g.cat} cat={g.cat} names={g.names} />
          ))}
        </dl>
      </CvSection>

      <CvSection title="Selected projects">
        <div className="-mx-4 space-y-3 print:mx-0 print:space-y-3.5">
          {mainProjects
            .filter((p) => !roleProjects.has(p.slug))
            .map((p) => (
              <ProjectEntry key={p.slug} p={p} href={href(`/projects/${p.slug}`)} />
            ))}
        </div>
      </CvSection>

      <div className="grid gap-x-8 sm:grid-cols-2 print:grid-cols-2">
        <CvSection title="Earlier roles">
          <ul className="space-y-1.5">
            {roles
              .filter((r) => r.cv)
              .map((r) => (
                <li key={r.company} className="break-inside-avoid">
                  <span className="font-semibold">{r.title}</span>
                  <span className={muted}>
                    {" "}
                    —{" "}
                    {r.projects.length ? (
                      <a href={href(`/projects/${r.projects[0]}`)} className="hover:text-matrix">
                        {r.company}
                      </a>
                    ) : (
                      r.company
                    )}
                    , {r.location}
                  </span>
                  {r.summary && <p className={`text-sm print:text-[9pt] ${muted}`}>{r.summary}</p>}
                </li>
              ))}
          </ul>
        </CvSection>
        <CvSection title="Education">
          <ul className="space-y-1.5">
            {education
              .filter((e) => e.cv)
              .map((e) => (
                <li key={e.school} className="break-inside-avoid">
                  <span className="font-semibold">{e.degree}</span>
                  <span className={muted}>
                    {" "}
                    — {[e.school, e.location].filter(Boolean).join(", ")}
                    {e.note ? ` · ${e.note}` : ""}
                  </span>
                </li>
              ))}
          </ul>
        </CvSection>
      </div>

      <CvSection title="Certifications and courses">
        <ul className="space-y-1">
          {credentials
            .filter((c) => c.kind === "certification" || c.kind === "certificate")
            .map((c) => (
              <li key={c.name} className="break-inside-avoid">
                <a href={c.href} className="font-semibold hover:text-matrix">
                  {c.name}
                </a>
                <span className={muted}>
                  {" "}
                  — {c.issuer}, {c.year}
                </span>
              </li>
            ))}
        </ul>
        <p className={`mt-2 text-sm print:text-[9pt] ${muted}`}>
          <span className="font-semibold text-fg print:text-neutral-900">Courses: </span>
          {graded.map((c) => `${c.name} (${c.note})`).join(" · ")}
          {courses.length > graded.length && ` and ${courses.length - graded.length} more`}, each
          with its verification at{" "}
          <a href={href("/certifications")} className="text-matrix print:text-green-900">
            {SITE.replace(/^https:\/\//, "")}/certifications
          </a>
        </p>
      </CvSection>
    </article>
  );
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 print:mt-5">
      <h2 className={`${sectionTitle} break-after-avoid`}>{title}</h2>
      {children}
    </section>
  );
}

/** One skill area. Under the pointer the row glows in the area's colour, and each skill on its own. */
function SkillRow({ cat, names }: { cat: SkillCategory; names: string[] }) {
  const { label, color } = skillCategories[cat];
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the pointer only moves a decorative spotlight; nothing here is interactive.
    <div
      onMouseMove={trackSpotlight}
      className="group/row relative grid overflow-hidden rounded-lg px-3 py-1.5 transition-colors sm:grid-cols-[11rem_1fr] print:grid-cols-[9.5rem_1fr] print:overflow-visible print:rounded-none print:p-0"
      style={{ "--c": color } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/row:opacity-100 print:hidden"
        style={{
          background:
            "radial-gradient(320px circle at var(--x) var(--y), color-mix(in oklab, var(--c) 16%, transparent), transparent 65%)",
          boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--c) 35%, transparent)",
        }}
      />
      <dt className="relative flex items-center gap-2 font-semibold transition-[color,text-shadow] duration-200 group-hover/row:text-[var(--c)] group-hover/row:[text-shadow:0_0_14px_var(--c)] print:block">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full print:hidden"
          style={{ background: "var(--c)", boxShadow: "0 0 8px var(--c)" }}
        />
        {label}
      </dt>
      <dd className={`relative ${muted}`}>
        {names.map((n, i) => (
          <Fragment key={n}>
            <span className={glowWord}>{n}</span>
            {i < names.length - 1 && ", "}
          </Fragment>
        ))}
      </dd>
    </div>
  );
}

/**
 * Featured projects show their full summary and more highlights; the rest keep the first
 * sentence and three highlights. Footprint numbers are left out: the highlights and
 * summaries already carry them. On screen the entry is a card that lights up in the
 * project's accent under the pointer.
 */
function ProjectEntry({ p, href }: { p: Project; href: string }) {
  const summary = p.featured ? p.summary : firstSentence(p.summary);
  const stack = p.skills
    .slice(0, p.featured ? 10 : 6)
    .flatMap((id) => skillById.get(id)?.name ?? []);

  return (
    // Long entries may split across pages; the heading stays with its text.
    // biome-ignore lint/a11y/noStaticElementInteractions: the pointer only moves a decorative spotlight; the link inside is the interaction.
    <div
      onMouseMove={trackSpotlight}
      className="group/card relative overflow-hidden rounded-xl border border-transparent p-4 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--c)_45%,transparent)] hover:shadow-[0_0_40px_-14px_var(--c)] print:overflow-visible print:rounded-none print:border-0 print:p-0 print:shadow-none"
      style={{ "--c": p.accent } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 print:hidden"
        style={{
          background:
            "radial-gradient(460px circle at var(--x) var(--y), color-mix(in oklab, var(--c) 13%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-4 left-0 w-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 print:hidden"
        style={{ background: "var(--c)", boxShadow: "0 0 14px var(--c)" }}
      />

      <div className="relative">
        <h3 className="break-after-avoid font-semibold text-lg print:text-[11pt]">
          <a
            href={href}
            className="transition-[color,text-shadow] duration-200 group-hover/card:text-[var(--c)] group-hover/card:[text-shadow:0_0_18px_color-mix(in_oklab,var(--c)_60%,transparent)]"
          >
            {p.name}
          </a>
          <span className={`font-normal ${muted}`}> — {p.role}</span>
        </h3>
        <p className={`break-after-avoid text-sm italic print:text-[9pt] ${muted}`}>{p.domain}</p>
        <p className="mt-1.5 leading-relaxed print:leading-snug">{summary}</p>
        {p.highlights.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 marker:text-muted group-hover/card:marker:text-[var(--c)] print:marker:text-neutral-500">
            {p.highlights.slice(0, p.featured ? 5 : 3).map((h) => (
              <li key={h} className="break-inside-avoid">
                {h}
              </li>
            ))}
          </ul>
        )}
        {stack.length > 0 && (
          <p className="mt-1.5 text-sm print:text-[9pt]">
            <span className="font-semibold">Stack: </span>
            <span className={muted}>
              {stack.map((n, i) => (
                <Fragment key={n}>
                  <span className={glowWord}>{n}</span>
                  {i < stack.length - 1 && ", "}
                </Fragment>
              ))}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function firstSentence(text: string) {
  const end = text.search(/\.\s/);
  return end === -1 ? text : text.slice(0, end + 1);
}
