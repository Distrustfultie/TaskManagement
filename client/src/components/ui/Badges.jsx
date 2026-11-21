import { ArrowDown, ArrowUp, Equal } from "lucide-react";

export const STATUSES = ["To Do", "In Progress", "Done"];
export const PRIORITIES = ["Low", "Medium", "High"];

// Status colors come from the validated categorical tokens; each badge also
// carries its text label, so state never relies on color alone.
// Text stays in ink tokens (series colors are too light for small text); the dot carries identity.
export const STATUS_STYLE = {
  "To Do": { dot: "bg-status-todo" },
  "In Progress": { dot: "bg-status-progress" },
  Done: { dot: "bg-status-done" },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE["To Do"];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle px-2 py-0.5 text-xs font-medium text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

const PRIORITY_STYLE = {
  High: { icon: ArrowUp, cls: "text-primary-ink" },
  Medium: { icon: Equal, cls: "text-muted" },
  Low: { icon: ArrowDown, cls: "text-faint" },
};

/** Legacy tasks may have priority "Normal"; it reads as Medium. */
export const normalizePriority = (p) => (PRIORITIES.includes(p) ? p : "Medium");

export function PriorityBadge({ priority }) {
  const p = normalizePriority(priority);
  const { icon: Icon, cls } = PRIORITY_STYLE[p];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`} title={`${p} priority`}>
      <Icon size={13} strokeWidth={2.25} />
      {p}
    </span>
  );
}
