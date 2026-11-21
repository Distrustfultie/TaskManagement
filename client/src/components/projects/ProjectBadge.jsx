import { projectColor } from "../../utils/projects";

export function ProjectDot({ color, size = 8 }) {
  return (
    <span
      className="inline-block shrink-0 rounded-[3px]"
      style={{ width: size, height: size, background: projectColor(color) }}
      aria-hidden="true"
    />
  );
}

/** Project name with its color swatch; text stays in ink tokens. */
export default function ProjectBadge({ project }) {
  if (!project) return null;
  return (
    <span className="inline-flex max-w-[12rem] items-center gap-1.5 text-xs font-medium text-muted">
      <ProjectDot color={project.color} />
      <span className="truncate">{project.name}</span>
    </span>
  );
}
