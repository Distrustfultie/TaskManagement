import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Segmented from "../ui/Segmented";
import ViewToggle from "./ViewToggle";
import Select from "../ui/Select";
import Checkbox from "../ui/Checkbox";
import { PRIORITY_OPTIONS, projectOptions } from "../../utils/options";
import { PRIORITIES, STATUSES, normalizePriority } from "../ui/Badges";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { refId } from "../../utils/projects";

const STATUS_FILTERS = ["All", ...STATUSES];

/** Filter state lives in the URL so views are linkable and survive reloads. */
export function useTaskFilters() {
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) ?? "";
  const filters = {
    q: get("q"),
    status: STATUS_FILTERS.includes(get("status")) ? get("status") : "All",
    priority: PRIORITIES.includes(get("priority")) ? get("priority") : "",
    project: get("project"),
    tag: get("tag"),
    mine: get("mine") === "1",
    view: get("view") === "board" ? "board" : "list",
  };
  const set = (key, value) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value && value !== "All" && value !== "list") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  const clear = () => setParams(filters.view === "board" ? { view: "board" } : {}, { replace: true });
  const active = Boolean(filters.q || filters.status !== "All" || filters.priority || filters.project || filters.tag || filters.mine);
  return { filters, set, clear, active, params, setParams };
}

export function applyTaskFilters(tasks, filters, userId, { ignoreStatus = false } = {}) {
  const q = filters.q.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      (ignoreStatus || filters.status === "All" || t.status === filters.status) &&
      (!filters.priority || normalizePriority(t.priority) === filters.priority) &&
      (!filters.project || (filters.project === "none" ? !refId(t.project) : refId(t.project) === filters.project)) &&
      (!filters.tag || (t.tags ?? []).includes(filters.tag)) &&
      (!filters.mine || refId(t.assignee) === userId) &&
      (!q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.tags ?? []).some((tag) => tag.includes(q.replace(/^#/, ""))))
  );
}

export default function TaskFilters({ tasks, filterApi, hideProject = false }) {
  const { filters, set } = filterApi;
  const { active: projects } = useProjects();
  const { user } = useAuth();

  const counts = useMemo(() => {
    const c = { All: tasks.length, "To Do": 0, "In Progress": 0, Done: 0 };
    tasks.forEach((t) => c[t.status] !== undefined && c[t.status]++);
    return c;
  }, [tasks]);

  const tags = useMemo(() => [...new Set(tasks.flatMap((t) => t.tags ?? []))].sort(), [tasks]);
  const anyAssigned = tasks.some((t) => refId(t.assignee) === user?._id);


  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search titles, notes, #tags"
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            aria-label="Search tasks"
          />
        </div>
        <ViewToggle value={filters.view} onChange={(v) => set("view", v)} />
      </div>

      <div className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5">
        {filters.view === "list" && (
          <Segmented
            label="Filter by status"
            size="sm"
            options={STATUS_FILTERS}
            value={filters.status}
            onChange={(v) => set("status", v)}
            renderOption={(o, isActive) => (
              <>
                {o.label}
                <span className={`text-[11px] ${isActive ? "text-muted" : "text-faint"}`}>{counts[o.value]}</span>
              </>
            )}
          />
        )}
        <div className="w-36 shrink-0">
          <Select
            size="sm"
            ariaLabel="Filter by priority"
            value={filters.priority}
            onChange={(v) => set("priority", v)}
            minWidth={170}
            options={[{ value: "", label: "Any priority" }, ...PRIORITY_OPTIONS.map((o) => ({ ...o, label: `${o.label} priority` }))]}
          />
        </div>
        {!hideProject && projects.length > 0 && (
          <div className="w-40 shrink-0">
            <Select
              size="sm"
              ariaLabel="Filter by project"
              value={filters.project}
              onChange={(v) => set("project", v)}
              minWidth={220}
              options={[{ value: "", label: "All projects" }, { value: "none", label: "No project" }, ...projectOptions(projects)]}
            />
          </div>
        )}
        {tags.length > 0 && (
          <div className="w-32 shrink-0">
            <Select
              size="sm"
              ariaLabel="Filter by tag"
              value={filters.tag}
              onChange={(v) => set("tag", v)}
              minWidth={180}
              options={[{ value: "", label: "Any tag" }, ...tags.map((t) => ({ value: t, label: `#${t}` }))]}
            />
          </div>
        )}
        {(anyAssigned || filters.mine) && (
          <div className="flex h-9 shrink-0 items-center rounded-lg border border-line bg-surface px-3 shadow-xs">
            <Checkbox checked={filters.mine} onChange={(c) => set("mine", c ? "1" : "")} label="Assigned to me" labelClassName="text-[13px] text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
