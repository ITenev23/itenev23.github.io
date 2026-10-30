import { education, roles } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";
import { HudCorners } from "@/shared/ui/HudCorners";

type Entry = { title: string; place: string; href?: string; text?: string; points?: string[] };

/**
 * Earlier roles and education side by side, as neon cards without dates. A role with its
 * own projects is left out: those projects are full chapters further up the home page.
 */
export function Career() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <CareerColumn
        title="Earlier roles"
        entries={roles
          .filter((r) => !r.projects.length)
          .map((r) => ({
            title: r.title,
            place: `${r.company} · ${r.location}`,
            href: r.href,
            text: r.summary,
            points: r.highlights,
          }))}
      />
      <CareerColumn
        title="Education"
        entries={education.map((e) => ({
          title: e.degree,
          place: [e.school, e.location].filter(Boolean).join(" · "),
          href: e.href,
          text: e.note,
          points: e.highlights,
        }))}
      />
    </div>
  );
}

function CareerColumn({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div>
      <h3 className="mb-4 font-mono text-matrix text-xs uppercase tracking-[0.18em]">{title}</h3>
      <ul className="space-y-4">
        {entries.map((e) => (
          <li key={`${e.title} ${e.place}`}>
            {/* biome-ignore lint/a11y/noStaticElementInteractions: the pointer only moves a decorative spotlight; the link inside is the interaction. */}
            <div
              onMouseMove={trackSpotlight}
              className="group/hud relative overflow-hidden rounded-2xl border border-line bg-surface/75 p-5 transition-[border-color,box-shadow] duration-300 hover:border-matrix/50 hover:shadow-[0_0_40px_-18px_var(--color-matrix)] lg:bg-surface/55 lg:backdrop-blur-sm"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/hud:opacity-100"
                style={{
                  background:
                    "radial-gradient(320px circle at var(--x) var(--y), color-mix(in oklab, var(--color-matrix) 11%, transparent), transparent 60%)",
                }}
              />
              <HudCorners />
              <p className="relative font-semibold text-lg leading-snug transition-colors group-hover/hud:text-matrix">
                {e.title}
              </p>
              <p className="relative mt-1 font-mono text-muted text-xs">
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noreferrer" className="hover:text-matrix">
                    {e.place} ↗
                  </a>
                ) : (
                  e.place
                )}
              </p>
              {e.text && <p className="relative mt-3 text-[15px] text-fg/85">{e.text}</p>}
              {e.points && e.points.length > 0 && (
                <ul className="relative mt-3 space-y-1.5 text-[15px] text-fg/85">
                  {e.points.map((point) => (
                    <li key={point} className="grid grid-cols-[1.1rem_1fr] leading-snug">
                      <span className="text-matrix">▸</span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
