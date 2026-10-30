import type { CaseStudyInput } from "../schema";

export const moduleCohesion: CaseStudyInput = {
  slug: "module-cohesion",
  project: "insurance-api",
  title: "Every integration in its own module",
  tagline:
    "Moving the HTTP client configuration for each external system out of the core and into its own module, in 26 small reviewable commits.",
  role: "Designed and executed the refactor",
  accent: "#a3ffbe",
  skills: ["java", "spring-boot", "integration-design", "testing", "documentation"],
  context:
    "A single configuration class in the core module declared the HTTP clients for many external systems. That broke the intended dependency direction (the core knew infrastructure details) and turned every integration change into a cross-module change.",
  constraints: [
    "Many integrations in production, with traffic that never stops",
    "A missing client bean only shows up at runtime",
    "Large refactors are hard to review in one go",
  ],
  approach: [
    "Moved each system's client configuration (CRM, master data, ticketing, payments, archive, HR, marketing, the SOAP systems and others) into its own datasource module.",
    "Did it in 26 small, reviewable commits.",
    "Extracted the shared interceptor lookup into the common module.",
    "Added a safety-net E2E test that asserts every expected client bean exists.",
    "Documented the rule in the project guidelines: client beans are never declared in the core module.",
  ],
  decisions: [
    {
      title: "One module owns everything about its system",
      why: "Client, configuration, service, DTOs and error mapping in one place: adding a system adds a module, retiring one is a deletion.",
      tradeoff: "More modules to navigate.",
    },
    {
      title: "A test that fails on a missing bean",
      why: "Without it, a forgotten client only fails in production. With it, it fails the build.",
      tradeoff: "The test needs updating whenever a system is added or retired.",
    },
  ],
  outcomes: [
    { metric: "small, reviewable commits", value: "26" },
    { metric: "client beans left in the core", value: "0" },
  ],
};
