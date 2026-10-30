import type { Skill } from "./schema";

// `depth` is how deep, not how long. Every skill should be proven by a case study
// or a role in experience.ts; the evidence graph shows which.
export const skills: Skill[] = [
  { id: "resilience", name: "Resilience & idempotency", category: "architecture", depth: 5 },
  { id: "event-driven", name: "Event-driven architecture", category: "architecture", depth: 5 },
  {
    id: "integration-design",
    name: "API & integration design",
    category: "architecture",
    depth: 5,
  },
  { id: "multi-tenant", name: "Multi-tenant SaaS", category: "architecture", depth: 4 },
  { id: "cqrs", name: "CQRS & read models", category: "architecture", depth: 3 },
  {
    id: "api-security",
    name: "API security · OAuth, Keycloak",
    category: "architecture",
    depth: 3,
  },

  { id: "java", name: "Java", category: "backend", depth: 5 },
  { id: "spring-boot", name: "Spring Boot", category: "backend", depth: 5 },
  { id: "python", name: "Python", category: "backend", depth: 4 },
  { id: "graphql", name: "GraphQL", category: "backend", depth: 2 },
  { id: "websockets", name: "WebSockets", category: "backend", depth: 3 },

  { id: "angular", name: "Angular", category: "frontend", depth: 4 },
  { id: "javascript", name: "JavaScript", category: "frontend", depth: 4 },
  { id: "typescript", name: "TypeScript", category: "frontend", depth: 4 },
  { id: "ag-grid", name: "AG Grid", category: "frontend", depth: 3 },
  { id: "react", name: "React", category: "frontend", depth: 3 },
  { id: "flutter", name: "Flutter", category: "frontend", depth: 2 },

  { id: "aws-lambda", name: "AWS Lambda", category: "cloud", depth: 4 },
  { id: "aws", name: "AWS · S3, ECS, Secrets Manager", category: "cloud", depth: 4 },
  { id: "docker", name: "Docker", category: "cloud", depth: 4 },
  { id: "azure", name: "Azure & Azure Pipelines", category: "cloud", depth: 3 },
  { id: "kubernetes", name: "Kubernetes", category: "cloud", depth: 2 },

  { id: "mysql", name: "MySQL", category: "data", depth: 4 },
  { id: "mongodb", name: "MongoDB", category: "data", depth: 4 },
  { id: "redis", name: "Redis", category: "data", depth: 4 },
  { id: "postgresql", name: "PostgreSQL", category: "data", depth: 4 },
  { id: "gis", name: "GIS · PostGIS, GeoServer, OpenLayers", category: "data", depth: 3 },
  { id: "elasticsearch", name: "Elasticsearch · ELK", category: "data", depth: 3 },

  { id: "eventbridge-sqs", name: "EventBridge · SQS", category: "messaging", depth: 4 },
  { id: "rabbitmq", name: "RabbitMQ", category: "messaging", depth: 4 },
  { id: "kong", name: "Kong API Gateway", category: "messaging", depth: 3 },
  { id: "kafka", name: "Kafka", category: "messaging", depth: 2 },

  { id: "feature-flags", name: "Feature-flag rollouts", category: "practices", depth: 4 },
  { id: "ai-assisted", name: "Agentic development · Claude Code", category: "ai", depth: 4 },
  {
    id: "context-engineering",
    name: "Context engineering · CLAUDE.md, rules",
    category: "ai",
    depth: 4,
  },
  { id: "ai-evaluation", name: "AI & model evaluation", category: "ai", depth: 3 },
  { id: "ai-integration", name: "AI service integration", category: "ai", depth: 4 },

  {
    id: "investigations",
    name: "Production investigations · CloudWatch",
    category: "practices",
    depth: 5,
  },
  { id: "observability", name: "Logging & diagnostics", category: "practices", depth: 4 },
  {
    id: "testing",
    name: "Testing · JUnit, pytest, WireMock, PIT",
    category: "practices",
    depth: 4,
  },
  { id: "code-quality", name: "Code quality · SonarQube", category: "practices", depth: 4 },
  { id: "documentation", name: "Technical documentation", category: "practices", depth: 4 },
  { id: "mentoring", name: "Mentoring", category: "practices", depth: 4 },
  { id: "ci-cd", name: "CI/CD", category: "practices", depth: 4 },
];
