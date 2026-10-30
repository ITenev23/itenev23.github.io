import type { ProjectInput } from "../schema";
import { mediaArchitecture } from "./media-architecture";

export const mediaMigration: ProjectInput = {
  slug: "media-migration",
  name: "Media management platform",
  domain: "Images & video · legacy modernisation",
  role: "Full-Stack Engineer · migration lead",
  accent: "#2bdc6a",
  summary:
    "Modernisation of a legacy servlet-based Java platform for managing images and videos onto a new Spring Boot foundation, written from scratch around the existing business logic. I started it alone and led it until the team grew; the data moved with a migration tool I built, then a direct switch.",
  highlights: [
    "Started alone for the first month: technical assessment, migration plan and the new Spring Boot foundation",
    "Rewrote the platform from scratch on Spring Boot, porting the core controllers, endpoints and business logic",
    "Built a data-migration tool that converted the old data for a standalone Elasticsearch: run in dev, then production, then a direct switch",
    "Supported the move from Apache Shiro to Keycloak",
    "Led the work until managers and more developers joined; presented findings, risks and trade-offs to management",
  ],
  skills: [
    "java",
    "spring-boot",
    "elasticsearch",
    "api-security",
    "postgresql",
    "aws",
    "angular",
    "integration-design",
  ],
  footprint: [
    { value: "1 month", metric: "alone at the start: assessment, plan and foundation" },
    { value: "6-8 months", metric: "the whole migration, start to switch" },
  ],
  architecture: mediaArchitecture,
};
