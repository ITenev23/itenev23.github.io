import { type Credential, credentials } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";
import { HudCorners } from "@/shared/ui/HudCorners";

const groups: [Credential["kind"], string][] = [
  ["certificate", "Professional certificates"],
  ["course", "Courses"],
  ["event", "Events"],
];

/**
 * Certifications as badge cards, each opening its public verification page; certificates,
 * courses and events underneath. The home page keeps them in one compact list; the
 * certifications page (`grouped`) splits them by kind and lists a certificate's courses.
 */
export function Credentials({ grouped = false }: { grouped?: boolean }) {
  const certifications = credentials.filter((c) => c.kind === "certification");
  const rest = credentials.filter((c) => c.kind !== "certification");

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {certifications.map((c) => (
          <li key={c.name}>
            <a
              href={c.href}
              target="_blank"
              rel="noreferrer"
              onMouseMove={trackSpotlight}
              className="group/hud relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-line bg-surface/75 p-5 text-center transition-[border-color,box-shadow] duration-300 hover:border-matrix/50 hover:shadow-[0_0_40px_-18px_var(--color-matrix)] lg:bg-surface/55 lg:backdrop-blur-sm"
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
              {c.badge && (
                <img
                  src={c.badge}
                  alt={`${c.name} badge`}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="relative size-28 transition-transform duration-300 [filter:drop-shadow(0_0_18px_color-mix(in_oklab,var(--color-matrix)_25%,transparent))] group-hover/hud:scale-105"
                />
              )}
              <p className="relative mt-4 font-semibold text-[15px] leading-snug transition-colors group-hover/hud:text-matrix">
                {c.name}
              </p>
              <p className="relative mt-auto pt-3 font-mono text-muted text-xs">
                {c.issuer} · {c.year} ·{" "}
                <span className="group-hover/hud:text-matrix">verify ↗</span>
              </p>
            </a>
          </li>
        ))}
      </ul>

      {grouped ? (
        groups.map(([kind, label]) => {
          const items = rest.filter((c) => c.kind === kind);
          if (!items.length) return null;
          return (
            <section key={kind} className="mt-14">
              <h3 className="mb-5 font-mono text-matrix text-xs uppercase tracking-[0.18em]">
                {label} · {items.length}
              </h3>
              <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
                {items.map((c) => (
                  <CredentialRow key={c.name} c={c} detailed />
                ))}
              </ul>
            </section>
          );
        })
      ) : (
        <ul className="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {rest.map((c) => (
            <CredentialRow key={c.name} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** One credential: name, then issuer and year. `detailed` lists a certificate's courses. */
function CredentialRow({ c, detailed = false }: { c: Credential; detailed?: boolean }) {
  const parts = detailed ? (c.parts ?? []) : [];
  const meta = (
    <span className="mt-0.5 block font-mono text-muted text-xs">
      {c.issuer} · {c.year}
      {c.note && !parts.length ? ` · ${c.note}` : ""}
    </span>
  );
  return (
    <li className="light grid grid-cols-[1.1rem_1fr] text-[15px] leading-snug">
      <span className="text-matrix [text-shadow:0_0_10px_var(--color-matrix)]">▸</span>
      <div>
        {c.href ? (
          <a href={c.href} target="_blank" rel="noreferrer" className="group">
            <span className="font-medium transition-colors group-hover:text-matrix">{c.name}</span>{" "}
            <span className="text-muted text-xs transition-colors group-hover:text-matrix">↗</span>
            {meta}
          </a>
        ) : (
          <>
            <span className="font-medium">{c.name}</span>
            {meta}
          </>
        )}
        {parts.length > 0 && (
          <ul className="mt-2 space-y-1 border-line border-l pl-4 text-sm">
            {parts.map((p) => (
              <li key={p.name}>
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noreferrer" className="group">
                    <span className="transition-colors group-hover:text-matrix">{p.name}</span>{" "}
                    <span className="text-muted text-xs transition-colors group-hover:text-matrix">
                      ↗
                    </span>
                  </a>
                ) : (
                  p.name
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
