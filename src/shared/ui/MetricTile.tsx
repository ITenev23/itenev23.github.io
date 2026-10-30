import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { trackSpotlight } from "@/shared/lib/spotlight";

type Props = { value: string; metric: string; accent?: string; className?: string };

/**
 * A number with its label, in the site's neon card style. Use as a direct child of a
 * <dl>: it is the one wrapper a <dt>/<dd> pair may have, so style it via className.
 *
 * Under the pointer the border and glow brighten and a spotlight follows the cursor; nothing
 * moves or resizes. It reacts to its own named group, `group/metric`, so tiles inside a card
 * that is itself a hover group light up one at a time. Border, shadow and glow are classes,
 * not inline styles, so the hover state can override them.
 */
export function MetricTile({ value, metric, accent = "#00ff41", className }: Props) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the pointer only moves a decorative spotlight; nothing here is interactive.
    <div
      onMouseMove={trackSpotlight}
      className={clsx(
        "group/metric relative flex flex-col-reverse overflow-hidden rounded-xl border bg-surface p-4 transition-[border-color,box-shadow] duration-300",
        "[border-color:color-mix(in_oklab,var(--accent)_30%,var(--color-line))] shadow-[0_0_32px_-16px_var(--accent),inset_0_1px_0_color-mix(in_oklab,var(--accent)_16%,transparent)]",
        "hover:[border-color:color-mix(in_oklab,var(--accent)_70%,var(--color-line))] hover:shadow-[0_0_46px_-12px_var(--accent),inset_0_1px_0_color-mix(in_oklab,var(--accent)_35%,transparent)]",
        className,
      )}
      style={{ "--accent": accent } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/metric:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--x) var(--y), color-mix(in oklab, var(--accent) 16%, transparent), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-6 top-0 h-px opacity-70 transition-opacity duration-300 group-hover/metric:opacity-100"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-6 size-28 rounded-full opacity-[0.18] blur-2xl transition-opacity duration-300 group-hover/metric:opacity-[0.4]"
        style={{ background: "var(--accent)" }}
      />
      <dt className="relative mt-1 text-muted text-sm leading-snug transition-colors duration-300 group-hover/metric:text-fg">
        {metric}
      </dt>
      <dd className="relative font-semibold text-2xl text-[var(--accent)] transition-[text-shadow] duration-300 [text-shadow:0_0_18px_color-mix(in_oklab,var(--accent)_45%,transparent)] group-hover/metric:[text-shadow:0_0_24px_var(--accent)]">
        {value}
      </dd>
    </div>
  );
}
