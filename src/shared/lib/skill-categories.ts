import type { SkillCategory } from "@/content";

/** Display order, label and colour for each skill category. */
export const skillCategories: Record<SkillCategory, { label: string; color: string }> = {
  architecture: { label: "Architecture", color: "#00ff41" },
  backend: { label: "Backend", color: "#8b7bff" },
  frontend: { label: "Frontend", color: "#ff7ab6" },
  cloud: { label: "Cloud", color: "#5cc8ff" },
  data: { label: "Data", color: "#ffc75c" },
  messaging: { label: "Messaging & gateways", color: "#f6a96b" },
  ai: { label: "AI & agents", color: "#c792ea" },
  practices: { label: "Practices", color: "#9cff57" },
};
