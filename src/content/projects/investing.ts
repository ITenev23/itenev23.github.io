import type { ProjectInput } from "../schema";

export const investing: ProjectInput = {
  slug: "investing",
  kind: "side",
  name: "Investing knowledge terminal",
  domain: "Side project · learning app for investing and trading",
  role: "Designed and built",
  accent: "#00e65c",
  summary:
    "A learning app for investing and trading: 81 cross-linked notes, calculators, a backtest lab, pattern and strategy atlases, and practice problems whose answers are pinned to the app's own formulas by tests. It runs offline from a single page, with no server and no install.",
  highlights: [
    "81 cross-linked notes built from Markdown, 20 step-by-step playbooks and 9 learning paths",
    "Calculators, a Monte Carlo risk simulator, and a backtest lab with costs, in- and out-of-sample splits and parameter sweeps",
    "126 practice problems and 1,501 automated checks that test the calculators and the backtest engine against the notes' own numbers",
    "Headless-Chrome smoke tests of every page at desktop and phone widths; optional live data from free public sources",
  ],
  skills: ["javascript", "testing", "ai-assisted", "documentation"],
  footprint: [
    { metric: "cross-linked notes", value: "81" },
    { metric: "automated checks", value: "1,501" },
  ],
};
