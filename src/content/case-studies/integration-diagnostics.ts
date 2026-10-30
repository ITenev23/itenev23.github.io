import type { CaseStudyInput } from "../schema";

export const integrationDiagnostics: CaseStudyInput = {
  slug: "integration-diagnostics",
  project: "auction-saas",
  title: "Per-call diagnostics that can't leak secrets",
  tagline:
    "Replacing a 25 MB JSON blob with one row per external call, and making sure a vendor password never reaches the logs again.",
  role: "Designed and built",
  featured: true,
  accent: "#5cff8a",
  skills: ["observability", "mysql", "python", "java", "spring-boot", "api-security", "angular"],
  context:
    "Export diagnostics were one JSON document per export, patched with JSON_SET. Sections went missing silently, and a 1,000-lot export (10-25 MB) blew through MySQL's 4 MB max_allowed_packet. Separately, the SAM password turned up in CloudWatch: the SOAP library logged whole request envelopes at DEBUG.",
  constraints: [
    "Written by four export Lambdas and the JVM, in two languages",
    "Write-heavy: about 20,000 rows for one large export",
    "Logging must never fail an export",
    "Vendor credentials and tokens appear in headers, bodies and even URL query strings",
  ],
  approach: [
    "One row per external call in external_service_logs, with request, response, timing, retryable and commit certainty.",
    "Best-effort writes, batched by bytes (flushed around 1-2 MB) with a row cap.",
    "List queries never select payloads; five indexes chosen deliberately for a write-heavy table.",
    "A 30-day retention sweep, and an admin explorer with server-side filtering and CSV export.",
    "One redaction entry point that works on a deep copy, with a header allowlist, that fails closed.",
  ],
  decisions: [
    {
      title: "One row per call, not one document per export",
      why: "Appending rows can't lose sections and isn't bound by packet size. It also makes cross-export questions ('every 504 from this vendor this week') a query.",
      tradeoff:
        "Far more rows, so indexes and retention have to be designed rather than added later.",
    },
    {
      title: "Allowlist, not blocklist",
      why: "A blocklist leaks the next header nobody thought of. An allowlist leaks nothing new by default.",
      tradeoff: "Debugging a new vendor header means adding it on purpose.",
    },
    {
      title: "Fail closed",
      why: "If redaction throws, the payload is not logged. A missing log line is an inconvenience; a logged password is an incident.",
      tradeoff: "A redaction bug costs diagnostics until it is fixed.",
    },
  ],
  outcomes: [
    { metric: "old blob per large export", value: "10-25 MB" },
    { metric: "rows per large export", value: "~20k" },
    { metric: "writers", value: "4 Lambdas + JVM" },
    { metric: "retention", value: "30 days" },
  ],
  retrospective: [
    {
      title: "The same leak, twice",
      body: "After the SOAP envelope fix I found the same class of leak elsewhere: another vendor's token travelling in a URL query string. Redaction now covers URLs as well as headers and bodies.",
    },
  ],
  architecture: {
    direction: "LR",
    nodes: [
      {
        id: "lambdas",
        label: "Export Lambdas",
        sub: "×4 · Python",
        kind: "function",
        owner: "contributed",
        x: 0,
        y: 0,
      },
      {
        id: "backend",
        label: "AIM backend",
        sub: "JVM",
        kind: "service",
        owner: "contributed",
        x: 0,
        y: 1.4,
      },
      {
        id: "redactor",
        label: "Redactor",
        sub: "deep copy · allowlist · fail closed",
        kind: "service",
        owner: "built",
        x: 1.6,
        y: 0.7,
      },
      {
        id: "logs",
        label: "external_service_logs",
        sub: "MySQL · one row per call",
        kind: "datastore",
        owner: "built",
        x: 3.2,
        y: 0.7,
      },
      {
        id: "explorer",
        label: "Log explorer",
        sub: "admin · filters · CSV",
        kind: "client",
        owner: "built",
        x: 4.8,
        y: 0,
      },
      {
        id: "sweep",
        label: "Retention sweep",
        sub: "30 days",
        kind: "service",
        owner: "built",
        x: 4.8,
        y: 1.4,
      },
      {
        id: "vendors",
        label: "Vendor APIs",
        sub: "SOAP · REST · XML",
        kind: "external",
        owner: "external",
        x: -1.6,
        y: 0.7,
      },
    ],
    edges: [
      { from: "vendors", to: "lambdas", kind: "http", label: "responses" },
      { from: "lambdas", to: "redactor", kind: "data" },
      { from: "backend", to: "redactor", kind: "data" },
      { from: "redactor", to: "logs", kind: "data", label: "batched by bytes" },
      { from: "explorer", to: "logs", kind: "http", label: "no payloads in lists" },
      { from: "sweep", to: "logs", kind: "data" },
    ],
  },
};
