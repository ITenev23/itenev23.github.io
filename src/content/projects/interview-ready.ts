import type { ProjectInput } from "../schema";

export const interviewReady: ProjectInput = {
  slug: "interview-ready",
  kind: "side",
  name: "Interview Ready",
  domain: "Side project · training app for senior engineering interviews",
  role: "Designed and built",
  accent: "#9cff57",
  summary:
    "A training app for senior engineering interviews: 27 tracks in 7 groups, from Java and Spring to distributed systems, AWS, security and AI engineering. Its code blocks actually run: JavaScript and TypeScript in the browser, SQL on a real PostgreSQL compiled to WebAssembly, and Java and Python outputs verified offline.",
  highlights: [
    "27 tracks in 7 groups; cross-cutting tracks reuse sections from other tracks instead of copying them",
    "Runnable code: JS/TS in the browser, SQL on PostgreSQL 18 in WebAssembly, Java 25 and Python verified by the validator",
    "Spaced-repetition flashcards, mock interviews with a timer and follow-up questions, and a skill graph with prerequisites",
    "A validator that executes every runnable block, plus a headless-Chrome check that the browser shows the same results",
  ],
  skills: [
    "javascript",
    "typescript",
    "postgresql",
    "java",
    "python",
    "testing",
    "ai-assisted",
    "documentation",
  ],
  footprint: [
    { metric: "tracks in 7 groups", value: "27" },
    { metric: "languages executed and verified", value: "4" },
  ],
};
