import type { ProjectInput } from "../schema";
import { codexioErpArchitecture } from "./codexio-erp-architecture";

export const codexioInternship: ProjectInput = {
  slug: "codexio-internship",
  name: "Codexio · ERP internship",
  domain: "Internship · ERP on a microservice architecture",
  role: "Software Engineering Intern",
  accent: "#5ef0a0",
  summary:
    "My internship at Codexio: a team of five to six building an ERP on a microservice architecture over three to four months, with an Angular web app and a Flutter mobile app. An ERP was chosen because it forces the decisions real systems need: services talking over TCP, a live chat, centralised logging in the ELK stack, and checking that a service is available before sending it an event or a request. Everyone worked on every part, and it laid the foundation for everything I built for clients after.",
  highlights: [
    "Built an ERP in a team of five to six: inventory & warehouse and sales & orders services, an Angular web app and a Flutter mobile app",
    "Services talked over TCP and registered with service discovery; every caller checked that its target was available before sending an event or a request",
    "A live chat between ERP users over WebSockets",
    "Centralised logging in the ELK stack, with Kibana to follow one request across services",
    "Worked on every part of the architecture, by design: the aim was breadth, and debugging across services was a daily exercise",
  ],
  skills: [
    "java",
    "spring-boot",
    "angular",
    "flutter",
    "websockets",
    "elasticsearch",
    "docker",
    "observability",
  ],
  footprint: [
    { value: "5-6", metric: "interns on the ERP team" },
    { value: "3-4 months", metric: "from the first service to the finished ERP" },
  ],
  architecture: codexioErpArchitecture,
};
