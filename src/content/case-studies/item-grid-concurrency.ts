import type { CaseStudyInput } from "../schema";

export const itemGridConcurrency: CaseStudyInput = {
  slug: "item-grid-concurrency",
  project: "auction-saas",
  title: "Two people, one item, no lost edits",
  tagline:
    "Per-field optimistic concurrency on the item grid, and keyset paging that stays fast on large workspaces.",
  role: "Concurrency and paging on a teammate's grid core",
  accent: "#39ff14",
  skills: [
    "angular",
    "typescript",
    "ag-grid",
    "java",
    "spring-boot",
    "mongodb",
    "integration-design",
  ],
  context:
    "The item grid (AG Grid) is where users edit thousands of items inline. A teammate built the grid core; I hardened it for concurrent editing and moved the Workspaces list onto it. On the backend, large item lists were paged with count + skip, which scales linearly on DocumentDB.",
  constraints: [
    "Several users edit the same workspace at once, often the same item",
    "Items are MongoDB documents with per-company dynamic attributes, so adding a version field is a schema change everywhere",
    "DocumentDB compatibility: no $facet, and count is expensive",
  ],
  approach: [
    "The client sends the values it last saw (expectedFieldValues); the server returns a CONFLICT per cell when the stored value has changed since.",
    "A refused field keeps what the user typed, and a second, deliberate Save overwrites.",
    "Lenient equality so formatting never fakes a conflict: null ≡ '', '23' ≡ '23.0', sets compared regardless of order.",
    "An unsaved-changes guard covering four exits: route change, grid refetch, bulk action and tab close. Save-all sends requests three at a time.",
    "Keyset (cursor) paging with a multi-column sort and an _id tiebreaker instead of count + skip; $facet replaced by separate pipelines.",
  ],
  decisions: [
    {
      title: "Value-based, per field, not a row version",
      why: "Two users editing different fields of the same item shouldn't conflict. A row version would produce false conflicts and needs a schema change in Mongo.",
      tradeoff: "The equality rules have to be maintained as field types evolve.",
    },
    {
      title: "Keyset paging over offsets",
      why: "Cost stays flat however deep the user scrolls, and inserts don't shift pages under them.",
      tradeoff: "No jumping straight to page N.",
    },
  ],
  outcomes: [
    { metric: "conflict granularity", value: "per field" },
    { metric: "exit paths guarded", value: "4" },
    { metric: "save-all concurrency", value: "3" },
  ],
  retrospective: [
    {
      title: "Where I'd do the opposite",
      body: "For money-like values, such as a balance, value-based merging is wrong. There you want a version column or a conditional update, or better an append-only ledger.",
    },
  ],
  architecture: {
    direction: "LR",
    nodes: [
      {
        id: "user-a",
        label: "User A",
        sub: "edits price",
        kind: "client",
        owner: "external",
        x: 0,
        y: 0,
      },
      {
        id: "user-b",
        label: "User B",
        sub: "edits price + title",
        kind: "client",
        owner: "external",
        x: 0,
        y: 1.4,
      },
      {
        id: "grid",
        label: "Item grid",
        sub: "unsaved guard · save-all ×3",
        kind: "client",
        owner: "contributed",
        x: 1.6,
        y: 0.7,
      },
      {
        id: "api",
        label: "Compare-and-set",
        sub: "per field · lenient equality",
        kind: "service",
        owner: "built",
        x: 3.2,
        y: 0.7,
      },
      {
        id: "mongo",
        label: "MongoDB",
        sub: "items · keyset paging",
        kind: "datastore",
        owner: "platform",
        x: 4.8,
        y: 0.7,
      },
    ],
    edges: [
      { from: "user-a", to: "grid", kind: "http" },
      { from: "user-b", to: "grid", kind: "http" },
      { from: "grid", to: "api", kind: "http", label: "expectedFieldValues" },
      { from: "api", to: "mongo", kind: "data", label: "CONFLICT per cell" },
    ],
  },
};
