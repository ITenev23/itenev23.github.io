import type { ProjectInput } from "../schema";
import { automotiveArchitecture } from "./automotive-architecture";

export const automotiveCollaboration: ProjectInput = {
  slug: "automotive-collaboration",
  name: "Automotive collaboration platform",
  domain: "Automotive · documentation & requirements exchange",
  role: "Full-Stack Engineer",
  accent: "#9cff57",
  summary:
    "An enterprise platform for documentation exchange, requirements collaboration and feedback workflows between companies and branches in an automotive ecosystem. Three Spring Boot services talk to each other only through Kafka events, with writes and reads split (CQRS) across PostgreSQL and MongoDB.",
  highlights: [
    "Event-driven on Kafka: three Spring Boot services that communicate only through published events (pub-sub)",
    "CQRS: commands write to PostgreSQL; events keep MongoDB read models that the GraphQL API queries",
    "Document pipeline: Excel and legacy formats converted to PDF and Word and stored as structured entities",
    "Live review status across companies and branches over WebSockets; React screens for review and feedback",
    "ELK stack for logs; Kibana for debugging and production investigations",
  ],
  skills: [
    "java",
    "spring-boot",
    "kafka",
    "event-driven",
    "cqrs",
    "graphql",
    "websockets",
    "postgresql",
    "mongodb",
    "react",
    "elasticsearch",
  ],
  architecture: automotiveArchitecture,
};
