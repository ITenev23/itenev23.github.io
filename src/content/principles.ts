import type { Principle } from "./schema";

// Problem solving: each rule tied to the case study where it was learned or proven.
export const principles: Principle[] = [
  {
    title: "Retry only what provably didn't commit",
    body: "A blind retry after a timeout is how duplicates are made. Classify each failure by whether the other side could have committed; retry only the certain ones and reconcile the rest.",
    study: "resumable-exports",
  },
  {
    title: "Write the intent in the same transaction",
    body: "If a side effect must follow a commit, record that it is owed inside the transaction and finish it asynchronously. In-memory events and 'publish after commit and hope' fail silently.",
    study: "durable-deletion-jobs",
  },
  {
    title: "Make idempotency structural",
    body: "It can't depend on every code path remembering a flag. I learned that from an incident where one skipped branch turned 9 lots into 297 listings.",
    study: "resumable-exports",
  },
  {
    title: "Measure before you change",
    body: "A census of 144 buckets showed the orphaned files weren't a cost problem at all. 132,000 world-readable objects made them a data-protection problem.",
    study: "durable-deletion-jobs",
  },
  {
    title: "Redact once, allowlist, fail closed",
    body: "Logs are a data store. One redaction entry point, an allowlist rather than a blocklist, and if redaction throws, the payload is not logged.",
    study: "integration-diagnostics",
  },
  {
    title: "Roll out per tenant, fail safe",
    body: "Business-critical paths move behind per-company flags with the old path kept as a fallback. Unknown routes to the legacy path, never to the new one.",
    study: "resumable-exports",
  },
  {
    title: "Logs should answer the client's question",
    body: "Warnings for what matters, durations for long jobs, the export and lot on every line. The next investigation should be one query, not an afternoon.",
    study: "production-investigations",
  },
  {
    title: "Verify the agent against the system",
    body: "A coding agent's output can compile, pass and still be wrong. The diff, the test suite and the real environment decide, never the agent's own summary.",
    study: "agentic-engineering",
  },
  {
    title: "Agreement is not accuracy",
    body: "Two models agreeing 80-90% of the time while matching ground truth a third of the time measures shared bias. Check ground truth before trusting either.",
    study: "ai-evaluation",
  },
];
