import type { CaseStudyInput } from "../schema";

export const apiDeprecation: CaseStudyInput = {
  slug: "api-deprecation",
  project: "insurance-api",
  title: "Removing endpoints nobody dared to touch",
  tagline:
    "A written deletion plan, consumer confirmation per endpoint, and small commits: 25 of 26 deprecated endpoints gone, with the last one kept on purpose.",
  role: "Led the programme",
  accent: "#5cff8a",
  skills: ["integration-design", "java", "spring-boot", "testing", "documentation"],
  context:
    "The business API carried many deprecated v1 and v2 endpoints. Removing them was risky because their consumers (portals, the affiliation backend, the master data, the CRM) were not always known, so they stayed, along with their DTOs, routes, fixtures and docs.",
  constraints: [
    "Consumers were not always known",
    "A removed endpoint that someone still calls is an outage",
    "Each endpoint drags along a controller method, an interactor, DTOs, routes, client methods, fixtures and docs",
  ],
  approach: [
    "Wrote a deletion plan listing every endpoint and every artifact to remove, with a per-endpoint checklist.",
    "Confirmed the consumers of each endpoint before touching it.",
    "Deleted in small commits, one endpoint at a time.",
    "Consolidated duplicate variants into the unified v3, for example the v2 website and ticketing upload endpoints.",
    "Kept one endpoint that still has an active consumer, and documented why.",
  ],
  decisions: [
    {
      title: "Evidence before deletion",
      why: "Each removal was backed by a confirmed consumer list, so no consumer broke.",
      tradeoff: "Slower than deleting on a hunch; much cheaper than an outage.",
    },
    {
      title: "One endpoint per commit",
      why: "Small commits are easy to review and, if needed, to revert one at a time.",
      tradeoff: "Many commits for one programme.",
    },
    {
      title: "Keep the one that's still used, and say so",
      why: "A tracked, named blocker beats a half-finished cleanup that someone later 'finishes' by breaking a consumer.",
      tradeoff: "The programme isn't formally complete.",
    },
  ],
  outcomes: [
    { metric: "planned deletions done", value: "25 / 26" },
    { metric: "endpoint kept on purpose, documented", value: "1" },
    { metric: "variants merged into", value: "v3" },
  ],
};
