import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Architecture,
  agentLines,
  caseStudies,
  caseStudyBySlug,
  credentials,
  principles,
  projectBySlug,
  projects,
  roles,
  skillById,
  skills,
} from "./index";

const diagrams: [string, Architecture][] = [
  ...projects.flatMap((p) =>
    p.architecture ? [[p.slug, p.architecture] as [string, Architecture]] : [],
  ),
  ...caseStudies.flatMap((c) =>
    c.architecture ? [[c.slug, c.architecture] as [string, Architecture]] : [],
  ),
];

const contentDir = join(process.cwd(), "src/content");
const sources = ["", "projects", "case-studies"]
  .flatMap((dir) =>
    readdirSync(join(contentDir, dir))
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f) => join(dir, f)),
  )
  .map((f) => ({ file: f, text: readFileSync(join(contentDir, f), "utf8") }));

describe("content integrity", () => {
  it("case studies and projects reference only known skills", () => {
    for (const c of caseStudies) {
      for (const id of c.skills) expect(skillById.has(id), `${c.slug} → ${id}`).toBe(true);
    }
    for (const p of projects) {
      for (const id of p.skills) expect(skillById.has(id), `${p.slug} → ${id}`).toBe(true);
    }
  });

  it("every case study belongs to an existing project", () => {
    for (const c of caseStudies) expect(projectBySlug.has(c.project), c.slug).toBe(true);
  });

  it("every skill is proven somewhere", () => {
    const unproven = [...skillById.keys()].filter(
      (id) =>
        !caseStudies.some((c) => c.skills.includes(id)) &&
        !projects.some((p) => p.skills.includes(id)),
    );
    expect(unproven).toEqual([]);
  });

  it("principles link to existing case studies", () => {
    for (const p of principles) expect(caseStudyBySlug.has(p.study), p.title).toBe(true);
  });

  it("ids and slugs are unique", () => {
    expect(skillById.size).toBe(skills.length);
    expect(projectBySlug.size).toBe(projects.length);
    expect(caseStudyBySlug.size).toBe(caseStudies.length);
  });

  it("every featured case study has a diagram and outcomes", () => {
    for (const c of caseStudies.filter((c) => c.featured)) {
      expect(c.architecture, c.slug).toBeDefined();
      expect(c.outcomes.length, c.slug).toBeGreaterThan(0);
    }
  });

  it("the agent's project lines belong to existing projects", () => {
    for (const slug of Object.keys(agentLines.projects))
      expect(projectBySlug.has(slug), slug).toBe(true);
  });

  it("roles link to existing projects", () => {
    for (const r of roles) {
      for (const slug of r.projects)
        expect(projectBySlug.has(slug), `${r.company} → ${slug}`).toBe(true);
    }
  });

  it("credential badges exist and certifications link to their verification", () => {
    for (const c of credentials) {
      if (c.badge) expect(existsSync(join(process.cwd(), "public", c.badge)), c.name).toBe(true);
      if (c.kind === "certification") expect(c.href, c.name).toBeDefined();
    }
  });
});

describe.each(diagrams)("diagram %s", (_, arch) => {
  const ids = new Set(arch.nodes.map((n) => n.id));
  const edgeKeys = new Set(arch.edges.map((e) => `${e.from}>${e.to}`));

  it("has unique node ids", () => {
    expect(ids.size).toBe(arch.nodes.length);
  });

  it("edges point at existing nodes", () => {
    for (const e of arch.edges) {
      expect(ids.has(e.from) && ids.has(e.to), `${e.from}→${e.to}`).toBe(true);
    }
  });

  it("flow steps follow existing edges", () => {
    for (const f of arch.flows) {
      for (const s of f.steps)
        expect(edgeKeys.has(`${s.from}>${s.to}`), `${f.id}: ${s.from}→${s.to}`).toBe(true);
    }
  });

  it("nodes sit on a lane when lanes are drawn", () => {
    if (!arch.lanes.length) return;
    const rows = new Set(arch.lanes.map((l) => l.y));
    for (const n of arch.nodes) expect(rows.has(n.y), n.id).toBe(true);
  });

  it("zones cover existing lanes without overlapping", () => {
    const rows = new Set(arch.lanes.map((l) => l.y));
    const seen = new Set<number>();
    for (const z of arch.zones) {
      expect(z.from <= z.to, z.label).toBe(true);
      for (const y of rows) {
        if (y < z.from || y > z.to) continue;
        expect(seen.has(y), `${z.label} overlaps row ${y}`).toBe(false);
        seen.add(y);
      }
      expect(rows.has(z.from) && rows.has(z.to), z.label).toBe(true);
    }
  });

  it("node case-study links resolve", () => {
    for (const n of arch.nodes) {
      if (n.caseStudy) expect(caseStudyBySlug.has(n.caseStudy), n.id).toBe(true);
    }
  });
});

describe("publishing safety", () => {
  it("has no placeholder copy left", () => {
    for (const { file, text } of sources)
      expect(text, file).not.toMatch(/TODO\(content\)|Placeholder|coming soon/i);
  });

  // The site is public: internal infrastructure identifiers must never ship.
  const forbidden: [string, RegExp][] = [
    ["internal hostname", /\.(dataref|assettrax)\.com|amazonaws\.com/i],
    ["ARN", /arn:aws:/],
    ["AWS account id", /\b\d{12}\b/],
    ["env var or queue name", /\b[A-Z][A-Z0-9]*_(QUEUE|URL|KEY|SECRET|TOKEN|BUS)\b/],
    ["private address", /\b(10|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d+\.\d+/],
    ["ticket id", /\b[A-Z]{2,6}-\d{2,6}\b/],
    // The employer's products stay unnamed, like the other clients.
    ["employer product name", /assettrax|dataref/i],
  ];

  it.each(forbidden)("contains no %s", (_, pattern) => {
    for (const { file, text } of sources) expect(text, file).not.toMatch(pattern);
  });
});
