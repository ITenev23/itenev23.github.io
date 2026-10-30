import type { ArchitectureInput } from "../schema";

/**
 * The ERP from my internship at Codexio, reconstructed from memory: a team project built to
 * practise the decisions real systems need. Only what is remembered is drawn (an Angular web
 * app and a Flutter mobile app, inventory and sales services that talk over TCP, a WebSocket
 * chat, service discovery with an availability check, the ELK stack); other modules and the
 * data stores are left out rather than guessed. Every intern worked on every part, by design.
 */
export const codexioErpArchitecture: ArchitectureInput = {
  direction: "TB",
  lanes: [
    { label: "Users", y: 0 },
    { label: "Services", y: 1 },
    { label: "Platform", y: 2 },
  ],
  zones: [{ label: "ERP · internship team project", from: 0, to: 2, tone: "primary" }],
  nodes: [
    {
      id: "erp-web",
      label: "ERP web app",
      short: "Web app",
      sub: "Angular · REST and WebSocket",
      kind: "client",
      owner: "built",
      x: 2.4,
      y: 0,
      note: "Where users manage stock and orders, and talk to each other.",
      features: ["Inventory and order screens", "Chat, live over WebSocket"],
      tech: ["Angular", "WebSockets"],
      myWork: ["Worked on it as part of the team's rotation through every layer"],
    },
    {
      id: "erp-mobile",
      label: "ERP mobile app",
      short: "Mobile app",
      sub: "Flutter",
      kind: "client",
      owner: "built",
      x: 4,
      y: 0,
      note: "The ERP on phones.",
      features: ["The ERP's screens on a phone", "Drawn calling the same services as the web app"],
      tech: ["Flutter"],
      myWork: ["Worked on it as part of the team's rotation through every layer"],
    },
    {
      id: "sales",
      label: "Sales & orders service",
      short: "Sales",
      sub: "Java · Spring Boot · Docker",
      kind: "service",
      owner: "built",
      x: 1.6,
      y: 1,
      note: "Takes orders in, and checks stock with inventory before confirming them.",
      features: [
        "Orders and their status",
        "Checks that inventory is available, then asks it over TCP",
        "Logs every step to the ELK stack",
      ],
      tech: ["Java", "Spring Boot", "Docker"],
      myWork: ["Business logic and the TCP calls to other services"],
    },
    {
      id: "inventory",
      label: "Inventory & warehouse service",
      short: "Inventory",
      sub: "Java · Spring Boot · Docker",
      kind: "service",
      owner: "built",
      x: 3.2,
      y: 1,
      note: "Products and stock across warehouses.",
      features: [
        "Products, stock levels and warehouses",
        "Answers stock requests from other services over TCP",
        "Registers with discovery when it starts",
      ],
      tech: ["Java", "Spring Boot", "Docker"],
      myWork: ["Business logic and the TCP side that answers other services"],
    },
    {
      id: "chat",
      label: "Chat service",
      short: "Chat",
      sub: "WebSockets",
      kind: "service",
      owner: "built",
      x: 4.8,
      y: 1,
      note: "Messages between ERP users, delivered live.",
      features: [
        "Keeps a WebSocket open to every connected app",
        "Pushes each message to everyone in the conversation as it is sent",
      ],
      tech: ["Java", "WebSockets", "Docker"],
      myWork: ["Built parts of the chat, server and client side"],
    },
    {
      id: "discovery",
      label: "Service discovery",
      short: "Discovery",
      sub: "registry · availability check",
      kind: "service",
      owner: "built",
      x: 2.4,
      y: 2,
      note: "Knows which services are up, so nothing is sent to one that isn't.",
      features: [
        "Services register when they start",
        "Before sending an event or a request, the caller checks that the target is available",
        "A service that is down is known before the call, not after a timeout",
      ],
      myWork: ["Worked on the availability checks every service runs before it sends"],
    },
    {
      id: "elk",
      label: "ELK stack",
      short: "ELK",
      sub: "Logstash · Elasticsearch · Kibana",
      kind: "service",
      owner: "built",
      x: 4,
      y: 2,
      note: "Logs from every service in one place: where the debugging happened.",
      features: [
        "Every service ships its logs to Logstash",
        "Kibana follows one request across all the services",
      ],
      tech: ["Logstash", "Elasticsearch", "Kibana"],
      myWork: ["Set up and used the logging; debugged across services in Kibana"],
    },
  ],
  edges: [
    { from: "erp-web", to: "sales", kind: "http", label: "REST" },
    { from: "erp-web", to: "inventory", kind: "http", label: "REST" },
    { from: "erp-web", to: "chat", kind: "http", label: "WebSocket" },
    { from: "erp-mobile", to: "sales", kind: "http", label: "REST" },
    { from: "erp-mobile", to: "inventory", kind: "http", label: "REST" },
    { from: "erp-mobile", to: "chat", kind: "http", label: "WebSocket" },
    { from: "sales", to: "discovery", kind: "invoke", label: "check availability" },
    { from: "inventory", to: "discovery", kind: "invoke", label: "register" },
    { from: "chat", to: "discovery", kind: "invoke", label: "register" },
    { from: "sales", to: "inventory", kind: "invoke", label: "TCP" },
    { from: "sales", to: "elk", kind: "data", label: "logs" },
    { from: "inventory", to: "elk", kind: "data", label: "logs" },
    { from: "chat", to: "elk", kind: "data", label: "logs" },
  ],
  flows: [
    {
      id: "check-then-send",
      label: "Check, then send",
      steps: [
        {
          from: "erp-web",
          to: "sales",
          caption: "A user places an order in the ERP web app.",
        },
        {
          from: "sales",
          to: "discovery",
          caption:
            "Before calling inventory, the sales service asks discovery whether inventory is up. If it isn't, the request is never sent.",
        },
        {
          from: "sales",
          to: "inventory",
          caption:
            "It is: sales asks inventory over TCP to check the stock, and gets the answer on the same connection.",
        },
        {
          from: "sales",
          to: "elk",
          caption: "Sales logs each step to the ELK stack…",
        },
        {
          from: "inventory",
          to: "elk",
          caption: "…and so does inventory, so one search in Kibana shows the whole order.",
        },
      ],
    },
    {
      id: "chat-message",
      label: "Send a chat message",
      steps: [
        {
          from: "erp-web",
          to: "chat",
          caption:
            "A user sends a message over the app's open WebSocket; the chat service pushes it to everyone else in the conversation.",
        },
        {
          from: "chat",
          to: "elk",
          caption: "The delivery is logged like everything else.",
        },
      ],
    },
    {
      id: "debug-across-services",
      label: "Debug across services",
      steps: [
        {
          from: "inventory",
          to: "discovery",
          caption:
            "An order fails. First question: was inventory registered and up? Discovery knows.",
        },
        {
          from: "sales",
          to: "elk",
          caption: "Then the logs: sales recorded what it sent…",
        },
        {
          from: "inventory",
          to: "elk",
          caption:
            "…and inventory what it received. Kibana lines the two up, and the bug shows itself. Debugging like this was the daily exercise.",
        },
      ],
    },
  ],
};
