import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus, SearchX, X } from "lucide-react";
import { useTasks } from "../../context/TasksContext";
import { useTaskForm } from "../../context/TaskFormContext";
import { useAuth } from "../../context/AuthContext";
import TaskFilters, { applyTaskFilters, useTaskFilters } from "./TaskFilters";
import TaskList from "./TaskList";
import TaskBoard from "./TaskBoard";
import BulkBar from "./BulkBar";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import { TaskListSkeleton } from "../ui/Skeleton";

/**
 * Filters + list/board for a set of tasks. `projectId` scopes new tasks
 * (and hides the project filter/badges) when shown inside a project.
 */
export default function TaskWorkspace({ tasks, projectId = null }) {
  const { loading, error, refresh } = useTasks();
  const { openNew, openEdit } = useTaskForm();
  const { user } = useAuth();
  const filterApi = useTaskFilters();
  const { filters, clear, active, params, setParams } = filterApi;
  const [selected, setSelected] = useState(() => new Set());

  // Deep link from notifications / overview: ?edit=<id>
  const editId = params.get("edit");
  useEffect(() => {
    if (!editId || loading) return;
    const task = tasks.find((t) => t._id === editId);
    if (task) openEdit(task);
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.delete("edit");
        return n;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, loading]);

  const filtered = useMemo(
    () => applyTaskFilters(tasks, filters, user?._id, { ignoreStatus: filters.view === "board" }),
    [tasks, filters, user?._id]
  );

  // Drop selections that are no longer visible
  useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(filtered.map((t) => t._id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const defaults = projectId ? { project: projectId } : undefined;

  let body;
  if (loading) body = <TaskListSkeleton />;
  else if (error) body = <ErrorState message={error} onRetry={refresh} />;
  else if (tasks.length === 0)
    body = (
      <div className="card">
        <EmptyState
          icon={ClipboardList}
          title={projectId ? "No tasks in this project yet" : "No tasks yet"}
          description={projectId ? "Add the first task to get this project moving." : "Create your first task to start planning your week."}
          action={
            <button className="btn btn-primary" onClick={() => openNew(defaults)}>
              <Plus size={16} strokeWidth={2.5} /> New task
            </button>
          }
        />
      </div>
    );
  else if (filters.view === "board") body = <TaskBoard tasks={filtered} showProject={!projectId} newTaskDefaults={defaults} />;
  else if (filtered.length === 0)
    body = (
      <div className="card">
        <EmptyState
          icon={SearchX}
          title="No matching tasks"
          description="Try a different search or clear the filters."
          action={
            active && (
              <button className="btn btn-secondary" onClick={clear}>
                <X size={15} /> Clear filters
              </button>
            )
          }
        />
      </div>
    );
  else
    body = (
      <TaskList
        tasks={filtered}
        showProject={!projectId}
        expandCompleted={filters.status === "Done"}
        selected={selected}
        onToggleSelect={toggleSelect}
      />
    );

  return (
    <div className="space-y-5">
      <TaskFilters tasks={tasks} filterApi={filterApi} hideProject={!!projectId} />
      {body}
      {filters.view === "list" && <BulkBar selected={selected} onClear={() => setSelected(new Set())} />}
    </div>
  );
}
