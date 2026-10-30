import type { CaseStudyInput } from "../schema";

export const aiEvaluation: CaseStudyInput = {
  slug: "ai-evaluation",
  project: "auction-saas",
  title: "Evaluating AI before it ships",
  tagline:
    "Price prediction and condition grading: reading model results against what the product can honestly promise.",
  role: "Requirements and evaluation · not the modelling code",
  accent: "#c3ff4a",
  skills: ["ai-evaluation", "ai-integration", "integration-design", "python"],
  context:
    "The company's data platform runs its own AI services, built by another team. On the Price Predictor I was involved from kickoff on the requirements and evaluation side: a service that prices industrial equipment from about 620,000 historical sales, using depreciation curves, calibrated intervals, and LLM-based feature discovery. On ConditionIQ, a vision model that grades an asset's condition from its photos, I reviewed the results.",
  constraints: [
    "Users act on a price: a confident wrong number is worse than none",
    "Ground truth is scarce and expensive to collect",
    "In-sample numbers flatter every model",
  ],
  approach: [
    "Translated client and domain-expert requirements into testable acceptance criteria.",
    "Reviewed model and agent output to decide whether it was ready for production.",
    "Helped redesign the refusal path after evaluation showed users reading low-confidence fallback prices as real predictions: the contract now returns no price, with a reason.",
    "Reviewed a head-to-head of two frontier models on the same feature-discovery task, scored against two independent sources of ground truth.",
    "ConditionIQ: checked cross-validated results against the agreed acceptance gate, which the model did not pass, and reviewed fine-tuning runs that made generalisation worse.",
  ],
  decisions: [
    {
      title: "No price beats a wrong price",
      why: "A fallback number shown with a confidence label still reads as a prediction. Refusing with a reason keeps the product's word worth something.",
      tradeoff: "A large share of requests now return no price, by design.",
    },
    {
      title: "Agreement is not accuracy",
      why: "The two models agreed with each other 80-90% of the time but matched ground truth only about a third of the time. Consensus between models measures shared bias, not correctness.",
      tradeoff: "Real ground truth is needed, and it is slow to build.",
    },
    {
      title: "Judge on cross-validation",
      why: "ConditionIQ's in-sample score was far higher than its 16% exact cross-validated score. Only the second predicts production.",
      tradeoff: "Less flattering numbers, and a model that did not ship.",
    },
  ],
  outcomes: [
    { metric: "historical sales behind the predictor", value: "~620k" },
    { metric: "model-to-model agreement", value: "80-90%" },
    { metric: "agreement with ground truth", value: "~⅓" },
    { metric: "ConditionIQ exact, cross-validated", value: "16%" },
  ],
  retrospective: [
    {
      title: "The check I now run everywhere",
      body: "When two models, or a model and an agent, agree, that is a reason to look at ground truth, not a reason to stop looking.",
    },
  ],
  architecture: {
    direction: "LR",
    nodes: [
      {
        id: "criteria",
        label: "Acceptance criteria",
        sub: "from client requirements",
        kind: "client",
        owner: "built",
        x: 0,
        y: 0.7,
      },
      {
        id: "model-a",
        label: "Frontier model A",
        kind: "external",
        owner: "external",
        x: 1.7,
        y: 0,
      },
      {
        id: "model-b",
        label: "Frontier model B",
        kind: "external",
        owner: "external",
        x: 1.7,
        y: 1.4,
      },
      {
        id: "predictor",
        label: "Price Predictor",
        sub: "other team",
        kind: "service",
        owner: "integrated",
        x: 1.7,
        y: 2.8,
      },
      {
        id: "truth",
        label: "Ground truth",
        sub: "two independent sources",
        kind: "datastore",
        owner: "integrated",
        x: 3.4,
        y: 2.1,
      },
      {
        id: "evaluation",
        label: "Evaluation",
        sub: "agreement · CV · refusals",
        kind: "service",
        owner: "built",
        x: 3.4,
        y: 0.7,
      },
      {
        id: "decision",
        label: "Ship or not",
        sub: "with a reason",
        kind: "client",
        owner: "built",
        x: 5.1,
        y: 0.7,
      },
    ],
    edges: [
      { from: "criteria", to: "evaluation", kind: "http" },
      { from: "model-a", to: "evaluation", kind: "ai" },
      { from: "model-b", to: "evaluation", kind: "ai" },
      { from: "predictor", to: "evaluation", kind: "ai" },
      { from: "truth", to: "evaluation", kind: "data" },
      { from: "evaluation", to: "decision", kind: "http" },
    ],
  },
};
