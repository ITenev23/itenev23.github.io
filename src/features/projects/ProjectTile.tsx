import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { caseStudiesByProject, type Project, skillById } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";

type Props = { project: Project; index: number };

/**
 * One main project as a full-width row: who I was on it, what it was, and how
 * much detail sits behind it. Stacks into a card on narrow screens.
 */
export function ProjectTile({ project: p, index }: Props) {
  const studies = caseStudiesByProject.get(p.slug) ?? [];

  return (
    <motion.li
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/projects/$project"
        params={{ project: p.slug }}
        onMouseMove={trackSpotlight}
        className="group relative grid gap-6 overflow-hidden rounded-2xl border bg-surface p-6 transition-colors md:p-7 lg:grid-cols-[3.5rem_17rem_minmax(0,1fr)_11rem] lg:gap-8"
        style={
          {
            "--accent": p.accent,
            borderColor: "color-mix(in oklab, var(--accent) 22%, var(--color-line))",
          } as CSSProperties
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(520px circle at var(--x) var(--y), color-mix(in oklab, var(--accent) 14%, transparent), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-y-6 left-0 w-0.5 rounded-full"
          style={{ background: p.accent, boxShadow: `0 0 14px ${p.accent}` }}
        />

        <p
          className="relative font-mono text-3xl leading-none"
          style={{
            color: p.accent,
            textShadow: `0 0 18px color-mix(in oklab, ${p.accent} 45%, transparent)`,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </p>

        <div className="relative">
          <h3 className="font-semibold text-xl leading-snug">{p.name}</h3>
          <p className="mt-1 font-mono text-[12px]" style={{ color: p.accent }}>
            {p.role}
          </p>
          <p className="mt-1 text-muted text-sm">{p.domain}</p>
        </div>

        <div className="relative">
          <p className="line-clamp-3 text-[15px] text-fg/85 leading-relaxed">{p.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.skills.slice(0, 7).map((id) => (
              <li
                key={id}
                className="rounded-full bg-bg/60 px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {skillById.get(id)?.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs lg:flex-col lg:items-end lg:justify-between lg:text-right">
          <div className="space-y-1.5">
            {studies.length > 0 && (
              <p className="text-fg">
                <span style={{ color: p.accent }}>{studies.length}</span> case{" "}
                {studies.length === 1 ? "study" : "studies"}
              </p>
            )}
            {p.architecture && <p className="text-matrix">◆ interactive architecture</p>}
          </div>
          <span
            className="ml-auto transition-transform group-hover:translate-x-1 lg:ml-0"
            style={{ color: p.accent }}
          >
            open project →
          </span>
        </div>
      </Link>
    </motion.li>
  );
}
