import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { type CaseStudy, projectBySlug, skillById } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";

export function CaseStudyCard({ study: c, index }: { study: CaseStudy; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/projects/$project/$study"
        params={{ project: c.project, study: c.slug }}
        onMouseMove={trackSpotlight}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)]"
        style={{ "--accent": c.accent } as CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(400px circle at var(--x) var(--y), color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute top-0 right-8 left-8 h-px opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }}
        />
        <p className="relative font-mono text-xs" style={{ color: c.accent }}>
          {projectBySlug.get(c.project)?.name}
        </p>
        <h3 className="relative mt-3 font-semibold text-2xl leading-snug">{c.title}</h3>
        <p className="relative mt-2 text-muted leading-relaxed">{c.tagline}</p>

        <dl className="relative mt-6 grid grid-cols-2 gap-3">
          {c.outcomes.slice(0, 2).map((o) => (
            <div key={o.metric} className="flex flex-col-reverse rounded-lg bg-bg/60 px-3 py-2">
              <dt className="font-mono text-[10px] text-muted">{o.metric}</dt>
              <dd className="font-semibold text-lg" style={{ color: c.accent }}>
                {o.value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="relative mt-5 flex flex-wrap gap-1.5">
          {c.skills.slice(0, 5).map((id) => (
            <li
              key={id}
              className="rounded-full bg-bg/60 px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {skillById.get(id)?.name}
            </li>
          ))}
        </ul>
        <span className="relative mt-auto inline-block pt-7 font-mono text-sm transition-transform group-hover:translate-x-1">
          <span className="text-muted">{c.role}</span>
          <span className="ml-2" style={{ color: c.accent }}>
            →
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
