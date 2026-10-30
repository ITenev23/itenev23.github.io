import {
  caseStudies,
  mainProjects,
  mentoring,
  type Project,
  profile,
  sideProjects,
} from "@/content";
import { MetricTile } from "@/shared/ui/MetricTile";
import { ProjectTile } from "./ProjectTile";

/** The portfolio at a glance, before any one project takes over. */
export function PortfolioCounts() {
  // The mentoring number is a stronger signal than the side-project count, when it exists.
  const mentored = mentoring[0]?.footprint[0];
  const counts = [
    { value: String(mainProjects.length), metric: "projects, out of many" },
    { value: String(caseStudies.length), metric: "feature case studies" },
    mentored
      ? { value: mentored.value, metric: mentored.metric }
      : { value: String(sideProjects.length), metric: "side projects" },
    { value: `${profile.yearsOfExperience}+`, metric: "years of professional experience" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {counts.map((c) => (
        <MetricTile key={c.metric} value={c.value} metric={c.metric} />
      ))}
    </dl>
  );
}

/** Projects one per row, in the order given. */
export function ProjectGrid({ items }: { items: Project[] }) {
  return (
    <ol className="space-y-4">
      {items.map((p, i) => (
        <ProjectTile key={p.slug} project={p} index={i} />
      ))}
    </ol>
  );
}
