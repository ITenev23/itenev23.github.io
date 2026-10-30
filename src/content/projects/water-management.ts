import type { ProjectInput } from "../schema";
import { waterArchitecture } from "./water-architecture";

export const waterManagement: ProjectInput = {
  slug: "water-management",
  name: "National water management system",
  domain: "Public sector · water infrastructure & GIS",
  role: "Software Engineer",
  accent: "#00c43a",
  summary:
    "A national-scale system for water infrastructure and resources management, combining backend services, GIS data, event-driven processing and client-facing workflows. Domain, security and integration services talk through Kafka, and the maps come from PostGIS through GeoServer.",
  highlights: [
    "Spring Boot domain and integration services that talk through Kafka: pub-sub topics, consumer groups, retries and dead-letter topics",
    "Geospatial features with PostGIS, GeoServer, OpenLayers, Heron.JS and QGIS",
    "Security services with Spring Security and JWT; integration with other national systems",
    "Live chat, notifications and map refreshes over WebSocket",
    "ELK and Grafana monitoring; client-facing testing, production issue analysis and release preparation",
  ],
  skills: [
    "java",
    "spring-boot",
    "kafka",
    "event-driven",
    "gis",
    "postgresql",
    "integration-design",
    "websockets",
    "elasticsearch",
    "observability",
  ],
  architecture: waterArchitecture,
};
