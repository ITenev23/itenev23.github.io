# Decisions

The significant choices behind this site, each with its context, the decision and its
consequences, so the reasoning outlives the code. When a later change revises a decision,
it is added as a dated update inside that decision instead of a new entry.

To record a new one, add a `##` section with the status and date, then **Context**,
**Decision** and **Consequences**.

- [SPA on GitHub Pages](#spa-on-github-pages)
- [Content as typed data](#content-as-typed-data)
- [WebGL as progressive enhancement](#webgl-as-progressive-enhancement)
- [One architecture model](#one-architecture-model)
- [A scroll-driven work line](#a-scroll-driven-work-line)

---

## SPA on GitHub Pages

**A client-rendered single-page app on GitHub Pages.** Accepted · 2026-10-04

### Context

Hosting must be free and live at `itenev23.github.io`. GitHub Pages serves static files
only: no SSR and no rewrite rules. The site is highly interactive (WebGL, diagrams,
search).

### Decision

Build a Vite + React SPA, deployed by GitHub Actions. Use clean URLs (browser history),
not hash URLs. `dist/index.html` is copied to `dist/404.html` so unknown paths still boot
the app and the router resolves them.

### Consequences

- ✅ Zero hosting cost, deploys gated on CI, clean URLs.
- ⚠️ Deep links are served with HTTP 404 status before the app takes over. Crawlers and
  link-preview bots see the generic `index.html` metadata only.
- Mitigation (roadmap): prerender known routes to static HTML at build time, so each
  page gets a real 200 response and its own meta tags.

---

## Content as typed data

**All content is Zod-validated TypeScript data.** Accepted · 2026-10-04

### Context

The site renders the same content in several views (cards, case studies, skill graph,
search, the CV). Copy will change often; the structure rarely will.

### Decision

All content lives in `src/content/*.ts`, typed by Zod schemas in `schema.ts` and parsed
once in `content/index.ts`. Derived indexes (`skillById`, `projectsBySkill`) are built in
the same place. Unit tests check referential integrity.

Considered: MDX (good for long prose, but weak structure for metrics and diagrams) and a
headless CMS (overkill for a single author, and it adds a runtime dependency).

### Consequences

- ✅ Renaming a field is a compile error, not a broken page; a bad reference fails CI.
- ✅ Views stay dumb, and new views (such as the CV page and its PDF) reuse the same data.
- ⚠️ Long-form prose in TS strings is awkward. If case studies grow beyond a few
  paragraphs, add MDX for the narrative body only and keep the metadata in TS.

---

### Update · 2026-10-30: credentials link out

Certifications, certificates and courses are content like everything else
(`credentials.ts`). The certificate files themselves are not published: each entry links
to the issuer's own verification page (Credly, Coursera, SoftUni), which a reader trusts
more than a copied PDF. Only the Oracle badge images are copied, resized to small WebP
files in `public/badges/`. A test fails if a certification has no verification link or
its badge file is missing.

### Update · 2026-10-30: the employer stays unnamed

Like the insurance and automotive clients, the employer's products aren't named or linked:
the project is "the auction SaaS" (slug `auction-saas`) with "the data platform" beside it.
The publishing-safety test fails if either product name appears in the content, so a
copied sentence can't bring it back.

## WebGL as progressive enhancement

**3D is decoration on top of content that works without it.** Accepted · 2026-10-04

### Context

The 3D hero is the "wow" moment, but three.js is about 245 KB gzipped, more than the rest
of the app combined. A slow hero would undercut the performance story the site is telling.

### Decision

- The hero text is plain DOM and paints immediately; the scene is `React.lazy` and sits
  behind the text.
- The scene is decorative (`aria-hidden`) and never needed for content or navigation.
- `prefers-reduced-motion` skips the scene entirely, and also disables motion transitions.
- The same rule applies to React Flow: it loads only where a diagram is shown.

### Consequences

- ✅ LCP doesn't depend on WebGL; low-end devices still get the full content.
- ⚠️ The scene appears a moment after first paint, so it fades in rather than popping in.

### Update · 2026-10-29

- Done: the hero canvas fades in.
- React Flow also loads on project pages, when a visitor switches the board to 2D, and is
  the fallback there when WebGL is missing or reduced motion is set.

### Update · 2026-10-29: measured, then fixed

- **A chunking bug defeated the decision.** A `manualChunks` rule put three.js in a "three"
  chunk, but it also pulled React into that chunk. The entry therefore imported it, and
  every page downloaded three.js (about 243 KB gz) and React Flow (about 57 KB gz) up front.
  The rule is gone. Both libraries are reached only through lazy imports now, and the
  bundler keeps them out of the entry.
- **The hero scene waits for the browser to be idle.** It is skipped on phones, on Save-Data
  connections and under reduced motion; those visitors get a static CSS grid.
- **A project's board loads when the visitor scrolls near it**, and phones open it in 2D.
- Lighthouse (mobile emulation), home page: performance 41 → 85, total blocking time
  1,580 → 180 ms.

### Update · 2026-10-30: no WebGL on the home page

The hero's 3D board was replaced by Matrix rain drawn on a plain 2D canvas: 24 frames a
second, paused off-screen and in background tabs, started once the page is idle, and a still
frame under reduced motion. three.js now loads only for a project's 3D board.

Later the same day the rain became the background of the whole site: one fixed canvas in the
root layout, so it keeps falling while you scroll and across page changes. It is vivid at the
top of the home page and fades to a quiet texture behind everything people read.

---

## One architecture model

**One architecture model for every view, with ownership on every box.** Accepted · 2026-10-29

### Context

The site draws the same kind of picture in several places: the hero background, the 3D
board on each project, its 2D view and each case study's diagram. The work shown is team
work: some services are mine, some I contributed to, some belong to other teams. A
portfolio diagram that leaves this out implies ownership it shouldn't. The source material
is internal diagrams full of hostnames, queue names and secret names that must not be
published.

### Decision

- One `architecture` schema: grid positions, optional lanes and zones, typed edges, flows,
  and node details as points (`features`, `tech`, `myWork`). Every view renders from it;
  `shared/lib/architecture-layout.ts` derives the 3D board layout and edge arcs as a pure
  function.
- Every node carries an `owner` (`built · contributed · integrated · platform · external`),
  and every view colours by it. The board can highlight only my work.
- The 3D view is an architecture board, not stacked layers: one floor, zones for each
  account or team, an orthographic camera at a fixed axonometric angle, and one symbol per
  component type (server blades, cubes, a hexagonal hub, message plates, database
  cylinders, dashed ghosts for third parties) drawn as dark glass with edge outlines. A
  first version stacked each lane as a translucent slab; it read as shelving rather than
  architecture and was replaced.
- 3D uses three.js addons directly (orbit controls, geometry merging, tubes) rather than a
  helper library. Labels are DOM buttons projected each frame, so they stay crisp and are
  keyboard-focusable. Floor text is canvas textures. Glow is additive sprites, not a
  post-processing pass.
- React Flow is the 2D view and the fallback when WebGL is missing or reduced motion is set.
- A content test rejects anything resembling an internal hostname, ARN, account ID,
  private IP, env-var or queue name, or ticket ID.

### Consequences

- ✅ A new case study or architecture change updates every view at once, and a box can't be
  rendered without stating who built it.
- ✅ The 3D board code adds about 11 KB gz on top of three.js.
- ⚠️ Positions are hand-placed grid units; a much larger graph would want auto-layout.
- ⚠️ Dense rows need `short` labels on the board (full names show on focus and in details).
- ⚠️ 28 boxes don't label legibly on a phone, so phones open the 2D view at a readable zoom.

### Update · 2026-10-30

The hero no longer draws a board (it shows Matrix rain), so the model now feeds the project
boards, their 2D views and the case-study diagrams.

---

## A scroll-driven work line

**The home page is one scroll-driven work line.** Accepted · 2026-10-29

### Context

The first version split the work across pages: the home page linked to `/projects`, and the
flagship project dominated. Visitors couldn't see how many projects there were, or follow
a career from start to finish. Progress while scrolling was wanted, but it had to stay cheap:
the home page already runs a WebGL hero.

### Decision

- The home page tells the work in order: client projects, then side projects, then
  mentoring, then principles, evidence and contact. Each is a chapter on one vertical
  line. Each project's own page keeps the deep dive (board, case studies, delivered work).
- The line's head rides at 45% of the screen. Each chapter's node, card edge and items light
  as the head reaches them, and **revert when the visitor scrolls back**. A first version
  that stayed lit once reached was rejected: the line must follow the scroll both ways.
- It is built with **CSS scroll-driven animations** (`animation-timeline: view()`,
  `animation-range` tied to the line's position), not a JavaScript scroll listener. The
  browser runs it off the main thread and nothing re-renders React while scrolling.
- Main projects carry no number or label: the name is enough. Side projects and mentoring
  are labelled.

### Consequences

- ✅ The whole career is one scroll; the line shows where you are and reverts on the way up.
- ✅ No per-frame JavaScript, no React state for scroll position.
- ⚠️ Browsers without `animation-timeline` (and reduced-motion users) get the page fully lit
  and static: complete, just without the effect.
- ⚠️ The home page carries all project content, so the content loads up front.

### Update · 2026-10-29: shorter, and no dimmed text

An external review pointed out that eight full chapters make the home page a long read
before a visitor can choose. For a while only the two flagship projects kept a full chapter
and every other project was one row. Lighting also stopped dimming text: `.light` items go
from grey to colour, and nodes and card edges carry the effect. Home accessibility went
from 86 to 100 in Lighthouse.

### Update · 2026-10-30: every client project in full

With an architecture board behind every client project, they all earn a full chapter again;
only side projects and mentoring stay one row each. `featured` now only marks the two
flagships that get the longer entry on the CV.

---

## Search as a bar, not a dialog

### Context

Search was a ⌘K command palette in a modal dialog. On a site of this size few visitors would
know the shortcut or open a dialog to look for something, and a pop-up interrupts reading.

### Decision

- A search bar in the middle of the nav. Typing shows matches in a list under it: pages,
  sections, projects, case studies, board walkthroughs, the CV and profiles. No dialog.
- Whole-word matching: each typed word must start a word in the result, and plurals count.
  cmdk's default fuzzy matching found "ai" inside "appraisal".
- Projects and case studies also match on their technologies, so "Kafka" finds the Kafka work.
- Below the large breakpoint the nav has no room, so a magnifier opens the bar across it.

### Consequences

- ✅ Visible and obvious: click and type. ⌘K / Ctrl K still jumps in.
- ✅ The idle placeholder can carry a Matrix line instead of instructions.
- ⚠️ The nav is fuller on mid-size screens; the bar shrinks before anything wraps.
