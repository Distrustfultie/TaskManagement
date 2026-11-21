import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import TaskRow from "./TaskRow";
import { groupTasks } from "../../utils/dates";

/**
 * Tasks grouped by urgency (Overdue, Today, …, Completed). Completed is
 * collapsed unless `expandCompleted`. Optional multi-select for bulk actions.
 */
export default function TaskList({ tasks, showProject = true, expandCompleted = false, selected, onToggleSelect }) {
  const [showCompleted, setShowCompleted] = useState(false);
  const groups = useMemo(() => groupTasks(tasks), [tasks]);

  return (
    <div className="space-y-6">
      {groups.map(({ name, tasks: list }) => {
        const collapsible = name === "Completed" && !expandCompleted;
        const open = !collapsible || showCompleted;
        return (
          <section key={name} aria-label={name}>
            <h2 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-semibold">
              {collapsible ? (
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="inline-flex items-center gap-1 rounded text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-expanded={open}
                >
                  <ChevronRight size={15} className={`transition-transform ${open ? "rotate-90" : ""}`} />
                  {name}
                </button>
              ) : (
                <span className={name === "Overdue" ? "text-primary-ink" : "text-ink"}>{name}</span>
              )}
              <span className="font-normal text-faint">{list.length}</span>
            </h2>
            {open && (
              <div className="card divide-y divide-line overflow-hidden">
                {list.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    showProject={showProject}
                    selected={selected?.has(task._id)}
                    selecting={selected?.size > 0}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
