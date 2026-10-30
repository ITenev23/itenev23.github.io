import { agentLines as rawAgentLines } from "./agent";
import { education as rawEducation, roles as rawRoles } from "./career";
import { agenticEngineering } from "./case-studies/agentic-engineering";
import { aiEvaluation } from "./case-studies/ai-evaluation";
import { apiDeprecation } from "./case-studies/api-deprecation";
import { backgroundRemoval } from "./case-studies/background-removal";
import { callbackDispatcher } from "./case-studies/callback-dispatcher";
import { chunkedZipExport } from "./case-studies/chunked-zip-export";
import { crmSync } from "./case-studies/crm-sync";
import { durableDeletionJobs } from "./case-studies/durable-deletion-jobs";
import { insuranceApiPlatform } from "./case-studies/insurance-api-platform";
import { integrationDiagnostics } from "./case-studies/integration-diagnostics";
import { itemGridConcurrency } from "./case-studies/item-grid-concurrency";
import { java21Migration } from "./case-studies/java21-migration";
import { legacyMigration } from "./case-studies/legacy-migration";
import { moduleCohesion } from "./case-studies/module-cohesion";
import { piqIntegration } from "./case-studies/piq-integration";
import { productionInvestigations } from "./case-studies/production-investigations";
import { resumableExports } from "./case-studies/resumable-exports";
import { credentials as rawCredentials } from "./credentials";
import { principles as rawPrinciples } from "./principles";
import { profile as rawProfile } from "./profile";
import { auctionSaas } from "./projects/auction-saas";
import { automotiveCollaboration } from "./projects/automotive-collaboration";
import { codexioConsulting } from "./projects/codexio-consulting";
import { codexioInternship } from "./projects/codexio-internship";
import { insuranceApi } from "./projects/insurance-api";
import { interviewReady } from "./projects/interview-ready";
import { investing } from "./projects/investing";
import { mediaMigration } from "./projects/media-migration";
import { paysafeMentoring } from "./projects/paysafe-mentoring";
import { waterManagement } from "./projects/water-management";
import {
  agentLinesSchema,
  caseStudySchema,
  credentialSchema,
  educationSchema,
  principleSchema,
  profileSchema,
  projectSchema,
  roleSchema,
  skillSchema,
} from "./schema";
import { skills as rawSkills } from "./skills";

// Parsing here means invalid content fails loudly in dev, tests and CI.
export const profile = profileSchema.parse(rawProfile);
export const skills = skillSchema.array().parse(rawSkills);
export const principles = principleSchema.array().parse(rawPrinciples);
export const credentials = credentialSchema.array().parse(rawCredentials);
export const roles = roleSchema.array().parse(rawRoles);
export const education = educationSchema.array().parse(rawEducation);
export const agentLines = agentLinesSchema.parse(rawAgentLines);

/** Every project: main work (newest first), then side projects, then mentoring. */
export const projects = projectSchema
  .array()
  .parse([
    auctionSaas,
    insuranceApi,
    mediaMigration,
    automotiveCollaboration,
    waterManagement,
    codexioConsulting,
    codexioInternship,
    interviewReady,
    investing,
    paysafeMentoring,
  ]);

export const mainProjects = projects.filter((p) => p.kind === "work");
export const sideProjects = projects.filter((p) => p.kind === "side");
export const mentoring = projects.filter((p) => p.kind === "mentoring");

/** Case studies in display order: the strongest first. */
export const caseStudies = caseStudySchema
  .array()
  .parse([
    resumableExports,
    chunkedZipExport,
    durableDeletionJobs,
    productionInvestigations,
    agenticEngineering,
    piqIntegration,
    integrationDiagnostics,
    aiEvaluation,
    itemGridConcurrency,
    backgroundRemoval,
    crmSync,
    insuranceApiPlatform,
    java21Migration,
    callbackDispatcher,
    apiDeprecation,
    moduleCohesion,
    legacyMigration,
  ]);

export const skillById = new Map(skills.map((s) => [s.id, s]));
export const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
export const caseStudyBySlug = new Map(caseStudies.map((c) => [c.slug, c]));

export const caseStudiesByProject = new Map(
  projects.map((p) => [p.slug, caseStudies.filter((c) => c.project === p.slug)]),
);

/** Reverse index: which case studies prove a skill. Powers the evidence graph. */
export const caseStudiesBySkill = new Map(
  skills.map((s) => [s.id, caseStudies.filter((c) => c.skills.includes(s.id))]),
);

/** Reverse index: which projects used a skill, for skills no case study covers. */
export const projectsBySkill = new Map(
  skills.map((s) => [s.id, projects.filter((p) => p.skills.includes(s.id))]),
);

/** Boxes on a project's architecture board that a case study explains. */
export const boardNodesByStudy = new Map(
  caseStudies.map((c) => [
    c.slug,
    (projectBySlug.get(c.project)?.architecture?.nodes ?? [])
      .filter((n) => n.caseStudy === c.slug)
      .map((n) => n.id),
  ]),
);

/** The project whose board is the site's signature visual. */

export type * from "./schema";
