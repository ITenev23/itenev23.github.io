import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { scrollToId } from "@/shared/lib/scroll";

type Props = {
  sections: { id: string; label: string }[];
  /** Full-width sections (big diagrams) the rail steps aside for. */
  hideOn?: string[];
};

/**
 * "You are here" for long pages: a numbered rail on the right edge that tracks the
 * section in view and jumps to any other. Desktop only.
 */
export function SectionRail({ sections, hideOn = [] }: Props) {
  const [active, setActive] = useState(sections[0]?.id);
  const key = sections.map((s) => s.id).join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-observe only when the section ids change.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [key]);

  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === active),
  );

  return (
    <nav
      aria-label="On this page"
      className={clsx(
        "fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 transition-opacity duration-300 min-[1400px]:block",
        active && hideOn.includes(active) && "pointer-events-none opacity-0",
      )}
    >
      <p className="mb-4 text-right font-mono text-[11px] text-matrix">
        {String(index + 1).padStart(2, "0")}
        <span className="text-muted"> / {String(sections.length).padStart(2, "0")}</span>
      </p>
      <ol className="space-y-2.5">
        {sections.map((s, i) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToId(s.id)}
                aria-current={on ? "location" : undefined}
                className="group flex w-full items-center justify-end gap-3 font-mono text-[11px]"
              >
                <span
                  className={clsx(
                    "transition-opacity",
                    on ? "text-matrix opacity-100" : "text-muted opacity-0 group-hover:opacity-100",
                  )}
                >
                  {s.label}
                </span>
                <span
                  className={clsx(
                    "h-0.5 rounded-full transition-all duration-300",
                    on
                      ? "w-7 bg-matrix shadow-[0_0_10px_var(--color-matrix)]"
                      : i < index
                        ? "w-4 bg-matrix/50"
                        : "w-4 bg-line group-hover:bg-muted",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
