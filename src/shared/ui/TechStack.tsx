import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { type SkillCategory, skillById } from "@/content";
import { skillCategories } from "@/shared/lib/skill-categories";

type Props = {
  /** Skill ids, in any order; they are grouped by area. */
  skills: string[];
  /** Smaller chips, for cards. */
  compact?: boolean;
  className?: string;
};

/**
 * A project's technologies grouped by area (architecture, backend, cloud…), each area
 * labelled in its own colour, and each chip lighting up in that colour on hover.
 */
export function TechStack({ skills, compact, className }: Props) {
  const groups = (Object.keys(skillCategories) as SkillCategory[])
    .map((cat) => ({
      cat,
      items: skills.flatMap((id) => {
        const s = skillById.get(id);
        return s?.category === cat ? [s] : [];
      }),
    }))
    .filter((g) => g.items.length);

  return (
    <div className={clsx("grid gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3", className)}>
      {groups.map(({ cat, items }) => (
        <div key={cat} style={{ "--c": skillCategories[cat].color } as CSSProperties}>
          <p className="flex items-center gap-2 font-mono text-[11px] text-[var(--c)] uppercase tracking-[0.16em]">
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ background: "var(--c)", boxShadow: "0 0 8px var(--c)" }}
            />
            {skillCategories[cat].label}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {items.map((s) => (
              <li
                key={s.id}
                className={clsx(
                  "rounded-full border border-line bg-bg/60 transition-[border-color,color,box-shadow] duration-200 hover:border-[color-mix(in_oklab,var(--c)_60%,transparent)] hover:text-[var(--c)] hover:shadow-[0_0_14px_-4px_var(--c)]",
                  compact ? "px-2.5 py-1 text-[13px]" : "px-3 py-1 text-sm",
                )}
              >
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
