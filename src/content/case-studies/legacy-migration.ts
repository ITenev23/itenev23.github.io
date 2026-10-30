import type { CaseStudyInput } from "../schema";

export const legacyMigration: CaseStudyInput = {
  slug: "legacy-migration",
  project: "media-migration",
  title: "From servlets to Spring Boot",
  tagline:
    "A rewrite from scratch around the existing logic, a purpose-built data migration and one direct switch, started alone.",
  role: "Migration lead",
  accent: "#5cff8a",
  skills: ["java", "spring-boot", "api-security", "elasticsearch", "integration-design"],
  context:
    "A platform for managing images and videos ran on a legacy, servlet-based Java architecture, with Elasticsearch embedded in the application and Apache Shiro for security. It needed a modern foundation without losing the business logic it relied on. I started the migration alone; as its scope became clear, managers and more developers joined.",
  constraints: [
    "A short timeline: 6-8 months for the whole move",
    "The old platform stayed in use until the switch",
    "The search data had to arrive in the new cluster complete before the switch",
    "One developer at the start, a larger team later, so the plan had to survive the hand-over",
  ],
  approach: [
    "First month, alone: assessed the legacy architecture and wrote the migration plan.",
    "Started a new Spring Boot project from scratch and ported the core controllers, endpoints and business logic onto it.",
    "Built a small migration project that converted the old data for the standalone Elasticsearch.",
    "Ran it in dev first, then in production, followed by a direct switch to the new platform.",
    "Supported the move from Apache Shiro to Keycloak.",
    "Led the work until managers and more developers joined; presented findings, risks and trade-offs to management.",
  ],
  decisions: [
    {
      title: "Rewrite from scratch, keep the logic",
      why: "A clean Spring Boot structure instead of adapting servlet plumbing; what the business relied on, its logic, was carried over.",
      tradeoff: "No gradual cutover: everything had to be ready, and correct, by the switch.",
    },
    {
      title: "A separate migration tool, rehearsed in dev",
      why: "Converting the data in its own project kept legacy formats out of the new application, and running it in dev first rehearsed the production move.",
      tradeoff: "A one-way switch: the dev rehearsal was the safety net.",
    },
    {
      title: "Standalone search instead of embedded",
      why: "Search gets its own lifecycle, scaling and upgrades, independent of application deploys.",
      tradeoff: "New infrastructure to operate, and the data migration to plan.",
    },
  ],
  outcomes: [
    { metric: "the whole migration, start to switch", value: "6-8 months" },
    { metric: "alone at the start, before the team grew", value: "1 month" },
    { metric: "direct switch, after a dev rehearsal", value: "1" },
  ],
  architecture: {
    direction: "LR",
    nodes: [
      {
        id: "legacy",
        label: "Legacy servlets",
        sub: "embedded search · Shiro",
        kind: "service",
        owner: "platform",
        x: 0,
        y: 1,
      },
      {
        id: "app",
        label: "Spring Boot app",
        sub: "written from scratch",
        kind: "service",
        owner: "built",
        x: 2,
        y: 1,
      },
      {
        id: "tool",
        label: "Migration tool",
        sub: "dev, then production",
        kind: "function",
        owner: "built",
        x: 2,
        y: 2.2,
      },
      {
        id: "keycloak",
        label: "Keycloak",
        sub: "OIDC",
        kind: "external",
        owner: "platform",
        x: 4,
        y: 0,
      },
      {
        id: "es",
        label: "Elasticsearch",
        sub: "standalone",
        kind: "datastore",
        owner: "platform",
        x: 4,
        y: 2.2,
      },
    ],
    edges: [
      { from: "legacy", to: "app", kind: "invoke", label: "logic ported" },
      { from: "legacy", to: "tool", kind: "data", label: "old data" },
      { from: "tool", to: "es", kind: "data", label: "converted data" },
      { from: "app", to: "keycloak", kind: "http", label: "auth" },
      { from: "app", to: "es", kind: "data", label: "search" },
    ],
  },
};
