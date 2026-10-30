import { z } from "zod";

/**
 * Content is plain typed data validated at test/build time. Rendering code never
 * hard-codes copy, so the portfolio can be updated by editing data files only.
 */

const slug = z.string().regex(/^[a-z0-9-]+$/);

export const skillCategory = z.enum([
  "architecture",
  "backend",
  "frontend",
  "cloud",
  "data",
  "messaging",
  "ai",
  "practices",
]);

export const skillSchema = z.object({
  id: slug,
  name: z.string(),
  category: skillCategory,
  /** 1-5: how deep, not how long. Drives emphasis in the evidence graph. */
  depth: z.number().int().min(1).max(5),
});

/** What a box in a diagram is. Drives its icon. */
export const nodeKind = z.enum([
  "client",
  "gateway",
  "service",
  "function",
  "bus",
  "queue",
  "datastore",
  "external",
]);

/**
 * Who built it. Every diagram is coloured by this, so the site never implies
 * ownership of another team's work.
 */
export const nodeOwner = z.enum(["built", "contributed", "integrated", "platform", "external"]);

/** How two boxes talk. Mirrors the legend of the internal architecture diagram. */
export const edgeKind = z.enum(["http", "event", "queue", "invoke", "ai", "data"]);

const archNodeSchema = z.object({
  id: slug,
  label: z.string(),
  /** Shorter label for dense views such as the 3D board. */
  short: z.string().optional(),
  sub: z.string().optional(),
  kind: nodeKind,
  owner: nodeOwner,
  /** Grid units. Columns for x; for top-to-bottom diagrams y is the lane row. */
  x: z.number(),
  y: z.number(),
  /** One-line summary shown at the top of the details panel. */
  note: z.string().optional(),
  /** Details as points, not prose: what it does, what it runs on, what part is mine. */
  features: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  myWork: z.array(z.string()).default([]),
  /** Slug of the case study that explains this box. */
  caseStudy: slug.optional(),
});

const archEdgeSchema = z.object({
  from: slug,
  to: slug,
  kind: edgeKind,
  label: z.string().optional(),
});

const laneSchema = z.object({ label: z.string(), y: z.number() });

/** A group of consecutive lanes drawn as one region, e.g. an AWS account or another team. */
const zoneSchema = z.object({
  label: z.string(),
  from: z.number(),
  to: z.number(),
  tone: z.enum(["primary", "team", "external"]),
});

/** A request walked step by step through the diagram ("play a flow"). */
const flowSchema = z.object({
  id: slug,
  label: z.string(),
  steps: z.array(z.object({ from: slug, to: slug, caption: z.string() })).min(1),
});

export const architectureSchema = z.object({
  /** LR: data flows left → right (case studies). TB: layered, top → bottom (platform). */
  direction: z.enum(["LR", "TB"]).default("LR"),
  lanes: z.array(laneSchema).default([]),
  zones: z.array(zoneSchema).default([]),
  nodes: z.array(archNodeSchema).min(1),
  edges: z.array(archEdgeSchema),
  flows: z.array(flowSchema).default([]),
});

const metricSchema = z.object({ metric: z.string(), value: z.string() });

const accent = z.string().regex(/^#[0-9a-f]{6}$/i);

/** A deep dive into one piece of work inside a project. */
export const caseStudySchema = z.object({
  slug,
  /** Slug of the project (engagement) this case study belongs to. */
  project: slug,
  title: z.string(),
  tagline: z.string(),
  role: z.string(),
  featured: z.boolean().default(false),
  accent,
  skills: z.array(z.string()).min(1),
  links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
  /** Every case study answers the same questions. */
  context: z.string(),
  constraints: z.array(z.string()),
  approach: z.array(z.string()).min(1),
  decisions: z.array(z.object({ title: z.string(), why: z.string(), tradeoff: z.string() })),
  outcomes: z.array(metricSchema),
  /** Incidents owned and what I'd change: the part most portfolios leave out. */
  retrospective: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  architecture: architectureSchema.optional(),
});

/** Work that commit history doesn't show: investigations, docs, unreleased upgrades. */
const deliveredSchema = z.object({
  title: z.string(),
  body: z.string(),
  status: z.enum(["shipped", "ready", "ongoing"]),
});

/** A project (engagement): a product or client I worked on, holding its case studies. */
export const projectSchema = z.object({
  slug,
  /** Main work, a side project, or mentoring. */
  kind: z.enum(["work", "side", "mentoring"]).default("work"),
  /** A flagship project: it gets the longer entry on the CV (full summary, more highlights). */
  featured: z.boolean().default(false),
  name: z.string(),
  domain: z.string(),
  role: z.string(),
  accent,
  summary: z.string(),
  highlights: z.array(z.string()),
  skills: z.array(z.string()).min(1),
  /** Public pages about the product, such as its website. */
  links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
  footprint: z.array(metricSchema).default([]),
  delivered: z.array(deliveredSchema).default([]),
  /** The whole system, drawn as an explorable board. */
  architecture: architectureSchema.optional(),
});

export const profileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  /** A playful line after the headline under the name in the hero, shown as a code comment. */
  tagline: z.string().optional(),
  location: z.string(),
  /** The one-line summary, said straight: the CV's opening line. */
  pitch: z.string(),
  /** The same idea with a wink, under the name in the hero. */
  intro: z.string(),
  /** The invitation at the top of the contact section. */
  invite: z.string(),
  yearsOfExperience: z.number().int(),
  /** Profile links for the contact section, the footer and search; `cv: false` keeps one off the CV. */
  socials: z.array(z.object({ label: z.string(), href: z.url(), cv: z.boolean().optional() })),
  email: z.email().optional(),
  /** Career facts no single project shows: mentoring over the years, unlisted projects,
   * hackathons. Shown under the counters on the home page and in the CV summary. */
  notes: z.array(z.string()).default([]),
});

export const principleSchema = z.object({
  title: z.string(),
  body: z.string(),
  /** Slug of the case study that taught or proved it. */
  study: slug,
});

/** The docked agent's speech bubbles. */
export const agentLinesSchema = z.object({
  /** By page path: said when he jumps in on that page. */
  pages: z.record(z.string().startsWith("/"), z.string()),
  /** By section id: said when that section reaches the top of the screen. */
  sections: z.record(z.string(), z.string()),
  /** By project slug: said the first time that project's chapter reaches the top. */
  projects: z.record(z.string(), z.string()),
  /** Taking turns: for a project seen again, or one without its own line. */
  projectQuips: z.array(z.string()).min(1),
  /** A click or tap plays the next one. */
  clicks: z.array(z.string()).min(1),
  /** While the pointer is on him, or on his head beside the name in the nav. */
  hover: z.string(),
});

/** A certification, certificate, course or event, linked to where it can be checked. */
export const credentialSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  kind: z.enum(["certification", "certificate", "course", "event"]),
  /** The year it was earned. */
  year: z.number().int(),
  /** Public verification page (Credly, Coursera, SoftUni). */
  href: z.url().optional(),
  /** Badge image path under public/, for certifications that have one. */
  badge: z.string().optional(),
  /** A short extra fact, such as a grade or what a certificate covers. */
  note: z.string().optional(),
  /** The courses that make up a certificate, each with its own verification page. */
  parts: z.array(z.object({ name: z.string(), href: z.url().optional() })).optional(),
});

/** A job held before the current one. Shown without dates, like the projects. */
export const roleSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  /** The employer's public website. */
  href: z.url().optional(),
  /** What the work was, in a sentence or two. The CV shows only this. */
  summary: z.string().optional(),
  /** More detail for the home page card. */
  highlights: z.array(z.string()).default([]),
  /** Slugs of the project pages that cover this role in detail. */
  projects: z.array(slug).default([]),
  /** Listed on the CV. Seasonal and student jobs can stay on the site only. */
  cv: z.boolean().default(true),
});

/** A degree or a programme of study. Shown without dates. */
export const educationSchema = z.object({
  /** The degree and field, or what was studied. */
  degree: z.string(),
  school: z.string(),
  location: z.string().optional(),
  href: z.url().optional(),
  /** A grade or another short fact. The CV shows this, not the highlights. */
  note: z.string().optional(),
  /** More detail for the home page card. */
  highlights: z.array(z.string()).default([]),
  /** Listed on the CV. */
  cv: z.boolean().default(true),
});

export type Skill = z.infer<typeof skillSchema>;
export type SkillCategory = z.infer<typeof skillCategory>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type CaseStudyInput = z.input<typeof caseStudySchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = z.input<typeof projectSchema>;
export type Delivered = Project["delivered"][number];
export type Profile = z.infer<typeof profileSchema>;
export type Principle = z.infer<typeof principleSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type RoleInput = z.input<typeof roleSchema>;
export type AgentLines = z.infer<typeof agentLinesSchema>;
export type EducationInput = z.input<typeof educationSchema>;
export type Architecture = z.infer<typeof architectureSchema>;
export type ArchitectureInput = z.input<typeof architectureSchema>;
export type ArchNode = Architecture["nodes"][number];
export type ArchFlow = Architecture["flows"][number];
export type ArchZone = Architecture["zones"][number];
export type NodeKind = z.infer<typeof nodeKind>;
export type NodeOwner = z.infer<typeof nodeOwner>;
export type EdgeKind = z.infer<typeof edgeKind>;
