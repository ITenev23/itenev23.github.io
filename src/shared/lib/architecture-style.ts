import type { EdgeKind, NodeKind, NodeOwner } from "@/content";

/** One visual language for every diagram, 2D or 3D. */
export const ownerStyle: Record<NodeOwner, { label: string; color: string }> = {
  built: { label: "Built or owned by me", color: "#00ff41" },
  contributed: { label: "I contributed", color: "#8b7bff" },
  integrated: { label: "Other team · I integrated", color: "#8f9c92" },
  platform: { label: "Managed infrastructure", color: "#52665a" },
  external: { label: "Third-party", color: "#f6a96b" },
};

export const edgeStyle: Record<EdgeKind, { label: string; color: string; animated: boolean }> = {
  http: { label: "HTTPS / REST", color: "#5cc8ff", animated: false },
  event: { label: "Event", color: "#a78bfa", animated: true },
  queue: { label: "Queue", color: "#ffc75c", animated: true },
  invoke: { label: "Invoke / call", color: "#ff7ab6", animated: true },
  ai: { label: "AI / internal API", color: "#9cff57", animated: false },
  data: { label: "Read / write", color: "#67786b", animated: false },
};

export const kindIcon: Record<NodeKind, string> = {
  client: "◐",
  gateway: "⇥",
  service: "◆",
  function: "λ",
  bus: "✳",
  queue: "≋",
  datastore: "▤",
  external: "◌",
};

export const edgeKey = (e: { from: string; to: string }) => `${e.from}>${e.to}`;
