import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useLayoutEffect, useRef, useState } from "react";
import {
  caseStudies,
  caseStudiesBySkill,
  caseStudyBySlug,
  projectsBySkill,
  type SkillCategory,
  skillById,
  skills,
} from "@/content";
import { skillCategories } from "@/shared/lib/skill-categories";

const categories = skillCategories;

type Wire = { key: string; d: string; color: string; start: [number, number] };

/**
 * Skills on the left, case studies on the right, wires between them. Hover a
 * skill to see where it was proven; hover a case study to see what it proves.
 * No self-rated bars: the evidence is the rating.
 */
export function EvidenceGraph() {
  const [skill, setSkill] = useState<string>("resilience");
  const [project, setProject] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const chips = useRef(new Map<string, HTMLElement>());
  const cards = useRef(new Map<string, HTMLElement>());
  const [wires, setWires] = useState<Wire[]>([]);

  const litSkills = new Set(project ? (caseStudyBySlug.get(project)?.skills ?? []) : [skill]);
  const litProjects = new Set(
    project ? [project] : (caseStudiesBySkill.get(skill) ?? []).map((p) => p.slug),
  );

  // Wires are measured from the real DOM, so they follow any wrapping or resize.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure only when the lit sets change.
  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const measure = () => {
      const r = root.getBoundingClientRect();
      const next: Wire[] = [];
      for (const slug of litProjects) {
        const card = cards.current.get(slug)?.getBoundingClientRect();
        const p = caseStudyBySlug.get(slug);
        if (!card || !p) continue;
        for (const id of p.skills) {
          if (!litSkills.has(id)) continue;
          const chip = chips.current.get(id)?.getBoundingClientRect();
          const s = skillById.get(id);
          if (!chip || !s) continue;
          // Start at the column edge, not the chip, so a wire never looks like it
          // leaves a neighbouring chip on the same row.
          const edge = column.current?.getBoundingClientRect().right ?? chip.right;
          const [x1, y1] = [edge - r.left + 14, chip.top + chip.height / 2 - r.top];
          const [x2, y2] = [card.left - r.left, card.top + card.height / 2 - r.top];
          const dx = Math.max(60, (x2 - x1) / 2);
          next.push({
            key: `${id}-${slug}`,
            d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`,
            color: categories[s.category].color,
            start: [x1, y1],
          });
        }
      }
      setWires(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [skill, project]);

  const usedAt = project ? [] : (projectsBySkill.get(skill) ?? []).map((p) => p.name);

  return (
    <div ref={box} className="relative grid gap-10 md:grid-cols-[1fr_19rem] md:gap-28">
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        aria-hidden
      >
        {wires.map((w) => (
          <g key={w.key}>
            <path d={w.d} fill="none" stroke={w.color} strokeOpacity={0.55} strokeWidth={1.25} />
            <circle cx={w.start[0]} cy={w.start[1]} r={3} fill={w.color} />
          </g>
        ))}
      </svg>

      <div ref={column} className="relative space-y-6">
        {(Object.keys(categories) as SkillCategory[]).map((cat) => (
          <div key={cat}>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.16em]"
              style={{ color: categories[cat].color }}
            >
              {categories[cat].label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills
                .filter((s) => s.category === cat)
                .map((s) => {
                  const lit = litSkills.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      ref={(el) => {
                        if (el) chips.current.set(s.id, el);
                        else chips.current.delete(s.id);
                      }}
                      onMouseEnter={() => {
                        setProject(null);
                        setSkill(s.id);
                      }}
                      onFocus={() => {
                        setProject(null);
                        setSkill(s.id);
                      }}
                      onClick={() => {
                        setProject(null);
                        setSkill(s.id);
                      }}
                      aria-pressed={lit}
                      className={clsx(
                        "rounded-full border bg-bg px-3 py-1.5 text-sm transition-colors",
                        lit ? "text-fg" : s.depth >= 4 ? "text-fg/80" : "text-muted",
                      )}
                      style={{
                        borderColor: lit ? categories[cat].color : "var(--color-line)",
                        boxShadow: lit ? `0 0 16px -4px ${categories[cat].color}` : undefined,
                      }}
                    >
                      {s.name}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        {/* A fixed two-line height: if this line wrapped on hover, the list would shift under
            the pointer, end the hover, shift back and flicker. */}
        <p
          className="line-clamp-2 h-8 font-mono text-[11px] text-muted leading-4"
          aria-live="polite"
        >
          {project
            ? `${caseStudyBySlug.get(project)?.title} proves ${litSkills.size} skills`
            : `${skillById.get(skill)?.name}: ${litProjects.size} case ${litProjects.size === 1 ? "study" : "studies"}`}
        </p>
        <ul className="mt-3 space-y-2">
          {caseStudies.map((p) => {
            const lit = litProjects.has(p.slug);
            return (
              <li key={p.slug}>
                <Link
                  to="/projects/$project/$study"
                  params={{ project: p.project, study: p.slug }}
                  ref={(el) => {
                    if (el) cards.current.set(p.slug, el);
                    else cards.current.delete(p.slug);
                  }}
                  onMouseEnter={() => setProject(p.slug)}
                  onMouseLeave={() => setProject(null)}
                  className={clsx(
                    "block rounded-lg border bg-bg px-3 py-2 text-sm transition-all",
                    // Unlit cards recede by colour only; their text keeps readable contrast.
                    lit ? "text-fg" : "border-line text-muted",
                  )}
                  style={lit ? { borderColor: p.accent } : undefined}
                >
                  {p.title}
                </Link>
              </li>
            );
          })}
        </ul>
        {usedAt.length > 0 && (
          <p className="mt-4 text-muted text-xs leading-relaxed">
            <span className="font-mono">also used at</span> · {usedAt.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
