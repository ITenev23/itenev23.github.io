import { createFileRoute } from "@tanstack/react-router";
import { useTitle } from "@/shared/lib/useTitle";
import { Section } from "@/shared/ui/Section";

export const Route = createFileRoute("/colophon")({ component: Colophon });

// The site is itself a case study: say how it's built and why.
const stack = [
  ["Build", "Vite 8 · TypeScript (strict) · pnpm"],
  [
    "UI",
    "React 19 · Tailwind CSS 4 · Motion · native scrolling · self-hosted Inter Tight and JetBrains Mono",
  ],
  ["Routing", "TanStack Router: file-based, type-safe links and search params, auto code-split"],
  [
    "Work line",
    "The home page is one scroll. The green line, its head and every chapter's glow are CSS scroll-driven animations: no JavaScript runs per frame, and the line follows the scroll both ways.",
  ],
  [
    "3D",
    "three.js + React Three Fiber, no helper library. Each project's architecture is a board under an orthographic camera: one symbol per component type with edge outlines, zones and titles printed on the floor, arcs with moving packets, flows you can play step by step. Labels are DOM buttons projected every frame; glow is additive sprites, not a post-processing pass. Screen-sized, full screen on demand, lazy-loaded and paused off-screen.",
  ],
  [
    "Agent",
    "The hero's agent, his docked twin and the 404 page's lost one are hand-drawn SVG with CSS keyframes, no animation library. He waves, types, follows the pointer and reacts to the buttons; on wide screens he jumps into the page margin with a laptop, turns to what you scroll to and comments on each section. He arrives once the page is idle, never covers content, pauses off-screen and keeps still for reduced motion.",
  ],
  [
    "Background",
    "Matrix rain on one fixed 2D canvas behind every page: it keeps falling as you scroll and across page changes, vivid behind the hero and quiet behind text. 24 frames a second, started once the page is idle, hidden in print. No WebGL on the home page.",
  ],
  [
    "Diagrams",
    "React Flow renders the same architecture data in 2D: the board's 2D tab, every case-study diagram, and the fallback when WebGL or motion is off",
  ],
  [
    "Search",
    "A bar in the nav, no dialog (cmdk underneath): type, and pages, projects, case studies and board walkthroughs appear under it, matched by whole words. ⌘K jumps in; on phones a magnifier opens it.",
  ],
  [
    "Content",
    "Typed data + Zod schemas. 143 tests check every reference and fail the build on placeholder copy, on anything that looks like an internal hostname, ARN, secret name or ticket ID, and on the employer's product names.",
  ],
  ["Theme", "Matrix green (#00ff41) on green-black, as design tokens in one CSS @theme block"],
  [
    "CV",
    "The /cv page is built from the same content, and the build prints it to a PDF with headless Chrome, so the download can never drift from the site",
  ],
  ["Quality", "Biome · tsc · Vitest · GitHub Actions gate before every deploy"],
  ["Hosting", "GitHub Pages via Actions, SPA deep-link fallback"],
] as const;

function Colophon() {
  useTitle("How this site is built");
  return (
    <div className="pt-16">
      <Section id="colophon" eyebrow="~/colophon" title="How this site is built">
        <dl className="divide-y divide-line border-line border-y">
          {stack.map(([k, v]) => (
            <div key={k} className="grid gap-2 py-4 md:grid-cols-[12rem_1fr]">
              <dt className="font-mono text-matrix text-sm">{k}</dt>
              <dd className="leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-muted">
          One architecture model drives the 3D boards and every 2D diagram. Each box carries who
          built it, so no view can imply ownership of another team's work. Decisions are recorded,
          with their trade-offs, in{" "}
          <a
            className="text-matrix hover:underline"
            href="https://github.com/ITenev23/itenev23.github.io/blob/master/docs/DECISIONS.md"
          >
            docs/DECISIONS.md
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
