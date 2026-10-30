import type { AgentLines } from "./schema";

// What the docked agent says. Short on purpose: a speech bubble in the page margin.
export const agentLines: AgentLines = {
  // When he jumps in on a page, by its path.
  pages: {
    "/cv": "Let's work together and build something awesome!",
    "/colophon": "Yes, I built this too.",
  },
  // When a section reaches the top of the screen, by its id. Sections not listed stay quiet.
  sections: {
    work: "Here's what I've built ↓",
    projects: "Newest first",
    "side-projects": "Built after hours",
    mentoring: "Paying it forward",
    "problem-solving": "How I think",
    skills: "Try hovering a skill ←",
    experience: "Where it all started",
    certifications: "All verifiable ✓",
    "case-studies": "The deep dives",
    contact: "Say hi!",
  },
  // The first time a main project's chapter reaches the top of the home page: a joke that
  // fits the project, not a fact the page already shows.
  projects: {
    "auction-saas": "Going once, going twice… deployed!",
    "insurance-api": "Insurance: now with test coverage too.",
    "media-migration": "Servlets walked so Spring Boot could run.",
    "automotive-collaboration": "The Excel files went in. Nobody cried.",
    "water-management": "My code, finally going with the flow.",
    "codexio-consulting": "Parachuted into new codebases. Always landed.",
    "codexio-internship": "I'd tell you a UDP joke, but you might not get it.",
  },
  // For a project seen again (scrolling back), or one without its own line: in turn.
  projectQuips: [
    "This was a cool project",
    "Awesome project, honestly",
    "The architecture on this one was nice",
    "It works on my machine. And in production.",
    "Coffee in, features out.",
  ],
  // A click or tap on him plays the next one.
  clicks: ["Hi there!", "✓ tests pass", "// coffee", "✓ deployed"],
  // While the pointer is on him, or on his head beside the name in the nav.
  hover: "the chosen one",
};
