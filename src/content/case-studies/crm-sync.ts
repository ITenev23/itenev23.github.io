import type { CaseStudyInput } from "../schema";

export const crmSync: CaseStudyInput = {
  slug: "crm-sync",
  project: "auction-saas",
  title: "Product usage, synced into the CRM",
  tagline:
    "A scheduled Lambda that turns two products' databases into HubSpot company properties the sales team can act on.",
  role: "Sole author",
  accent: "#b5ffcb",
  skills: ["python", "aws-lambda", "mysql", "mongodb", "postgresql", "integration-design", "aws"],
  context:
    "Sales and account managers live in HubSpot, but usage lives in the products: the SaaS in MySQL and MongoDB, the data platform in PostgreSQL. They needed per-company activity in the CRM without anyone exporting spreadsheets.",
  constraints: [
    "Two products, three database engines, one CRM",
    "Company names differ between the products and the CRM",
    "No credentials in code or configuration files",
  ],
  approach: [
    "One Lambda with pluggable database handlers: MySQL enriched with MongoDB aggregations for the SaaS, a single CTE query for the data platform.",
    "Index every HubSpot company first, then match by UUID, falling back to a normalised name.",
    "Type-safe property mapping for text, boolean, date and numeric fields.",
    "Time-period metrics (month to date, previous month, year to date, previous year), AI-run counts and lot statistics.",
    "Credentials from Secrets Manager; a run report lists updated, unmatched and skipped companies.",
  ],
  decisions: [
    {
      title: "Match on UUID, fall back to name",
      why: "UUIDs are exact but older CRM records lack them. A normalised-name fallback covers the history without manual mapping.",
      tradeoff:
        "Name matches can be wrong, so unmatched and fallback matches are reported every run.",
    },
    {
      title: "One function, two engines",
      why: "The sync, matching and mapping logic is identical; only the source query differs.",
      tradeoff: "Handlers must keep returning the same shape as the products evolve.",
    },
  ],
  outcomes: [
    { metric: "products synced", value: "2" },
    { metric: "database engines", value: "3" },
    { metric: "commits, of 76", value: "70" },
  ],
  architecture: {
    direction: "LR",
    nodes: [
      {
        id: "schedule",
        label: "Schedule",
        sub: "periodic run",
        kind: "bus",
        owner: "platform",
        x: 0,
        y: 1,
      },
      {
        id: "lambda",
        label: "CRM sync",
        sub: "Python Lambda",
        kind: "function",
        owner: "built",
        x: 1.6,
        y: 1,
      },
      {
        id: "mysql",
        label: "MySQL",
        sub: "SaaS companies",
        kind: "datastore",
        owner: "platform",
        x: 3.2,
        y: 0,
      },
      {
        id: "mongo",
        label: "MongoDB",
        sub: "AI runs · lots",
        kind: "datastore",
        owner: "platform",
        x: 3.2,
        y: 1,
      },
      {
        id: "postgres",
        label: "PostgreSQL",
        sub: "Data-platform activity",
        kind: "datastore",
        owner: "integrated",
        x: 3.2,
        y: 2,
      },
      {
        id: "hubspot",
        label: "HubSpot",
        sub: "company properties",
        kind: "external",
        owner: "external",
        x: 4.8,
        y: 1,
      },
    ],
    edges: [
      { from: "schedule", to: "lambda", kind: "event" },
      { from: "lambda", to: "mysql", kind: "data" },
      { from: "lambda", to: "mongo", kind: "data" },
      { from: "lambda", to: "postgres", kind: "data" },
      { from: "lambda", to: "hubspot", kind: "http", label: "match · PATCH" },
    ],
  },
};
