import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { caseStudyBySlug, principles } from "@/content";
import { trackSpotlight } from "@/shared/lib/spotlight";
import { HudCorners } from "@/shared/ui/HudCorners";

/**
 * Engineering rules, each linked to the case study that taught or proved it. Each card is
 * frosted glass with HUD corners and a green spotlight under the pointer.
 */
export function Principles() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {principles.map((p, i) => (
        <motion.div
          key={p.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
        >
          <Link
            to="/projects/$project/$study"
            params={{ project: caseStudyBySlug.get(p.study)?.project ?? "", study: p.study }}
            onMouseMove={trackSpotlight}
            className="group/hud relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/75 p-6 transition-[border-color,box-shadow] duration-300 hover:border-matrix/50 hover:shadow-[0_0_40px_-18px_var(--color-matrix)] lg:bg-surface/55 lg:backdrop-blur-sm"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/hud:opacity-100"
              style={{
                background:
                  "radial-gradient(360px circle at var(--x) var(--y), color-mix(in oklab, var(--color-matrix) 10%, transparent), transparent 60%)",
              }}
            />
            <HudCorners />
            <span className="relative font-mono text-matrix text-xs [text-shadow:0_0_10px_var(--color-matrix)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="relative mt-3 font-semibold text-lg leading-snug transition-colors group-hover/hud:text-matrix">
              {p.title}
            </h3>
            <p className="relative mt-2 text-[15px] text-muted leading-relaxed">{p.body}</p>
            <span className="relative mt-auto pt-5 font-mono text-muted text-xs transition-colors group-hover/hud:text-matrix">
              ↳ {caseStudyBySlug.get(p.study)?.title}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
