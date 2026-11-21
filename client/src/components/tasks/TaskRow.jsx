import { memo } from "react";
import { AlertCircle, BellRing, Check, CheckSquare, Clock, MessageSquare, Pencil, Repeat, Timer, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTasks } from "../../context/TasksContext";
import { useTaskForm } from "../../context/TaskFormContext";
import { useProjects } from "../../context/ProjectsContext";
import { PriorityBadge, StatusBadge } from "../ui/Badges";
import Avatar from "../ui/Avatar";
import Checkbox from "../ui/Checkbox";
import ProjectBadge from "../projects/ProjectBadge";
import { formatDue, formatDuration, isDone, isOverdue } from "../../utils/dates";
import { refId } from "../../utils/projects";

function TaskRow({ task, compact = false, showProject = true, selected = false, selecting = false, onToggleSelect }) {
  const { updateTask } = useTasks();
  const { openEdit, confirmDelete } = useTaskForm();
  const { byId } = useProjects();
  const done = isDone(task);
  const overdue = isOverdue(task);
  const project = showProject ? byId[refId(task.project)] : null;
  const subtasks = task.subtasks ?? [];
  const subDone = subtasks.filter((s) => s.done).length;
  const assignee = task.assignee && typeof task.assignee === "object" ? task.assignee : null;

  const toggleDone = async () => {
    const next = done ? "To Do" : "Done";
    try {
      await updateTask(task._id, { status: next }, { silent: true });
      toast.success(next === "Done" ? "Nice — task completed" : "Moved back to To Do");
    } catch {
      /* rolled back + toast in context */
    }
  };

  return (
    <div className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-subtle/60 ${selected ? "bg-primary-soft/40" : ""}`}>
      {onToggleSelect && (
        <Checkbox
          checked={selected}
          onChange={() => onToggleSelect(task._id)}
          ariaLabel={`Select “${task.title}”`}
          className={`mt-px shrink-0 transition-opacity ${
            selected || selecting ? "" : "sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100"
          }`}
        />
      )}
      <button
        onClick={toggleDone}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            done
              ? "border-status-done bg-status-done text-white"
              : "border-line-strong text-transparent hover:border-status-done hover:text-status-done"
          }`}
        aria-label={done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
        aria-pressed={done}
      >
        <Check size={12} strokeWidth={3} />
      </button>

      <button
        onClick={() => openEdit(task)}
        className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <p className={`truncate font-medium ${done ? "text-faint line-through" : "text-ink"}`}>{task.title}</p>
        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 ${overdue ? "font-medium text-primary-ink" : ""}`}>
                {overdue ? <AlertCircle size={13} /> : <Clock size={13} className="text-faint" />}
                {overdue ? "Overdue · " : ""}
                {formatDue(task.dueDate)}
              </span>
            )}
            {!done && <PriorityBadge priority={task.priority} />}
            {task.status === "In Progress" && <StatusBadge status={task.status} />}
            {project && <ProjectBadge project={project} />}
            {task.category && task.category !== "General" && (
              <span className="rounded-md bg-subtle px-1.5 py-0.5 font-medium text-muted">{task.category}</span>
            )}
            {task.tags?.slice(0, 3).map((t) => (
              <span key={t} className="font-medium text-faint">
                #{t}
              </span>
            ))}
            {subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1" title="Subtasks done">
                <CheckSquare size={12} className="text-faint" />
                {subDone}/{subtasks.length}
              </span>
            )}
            {task.commentCount > 0 && (
              <span className="inline-flex items-center gap-1" title="Comments">
                <MessageSquare size={12} className="text-faint" />
                {task.commentCount}
              </span>
            )}
            {task.timeSpent > 0 && (
              <span className="inline-flex items-center gap-1" title="Time tracked">
                <Timer size={12} className="text-faint" />
                {formatDuration(task.timeSpent)}
              </span>
            )}
            {task.recurrence && task.recurrence !== "none" && (
              <span className="inline-flex items-center text-faint" title={`Repeats ${task.recurrence}`}>
                <Repeat size={12} />
                <span className="sr-only">Repeats {task.recurrence}</span>
              </span>
            )}
            {task.reminderTime && !done && (
              <span className="inline-flex items-center text-faint" title="Email reminder set">
                <BellRing size={12} />
                <span className="sr-only">Reminder set</span>
              </span>
            )}
          </div>
        )}
        {compact && task.dueDate && (
          <p className={`mt-0.5 text-xs ${overdue ? "font-medium text-primary-ink" : "text-muted"}`}>
            {overdue ? "Overdue · " : ""}
            {formatDue(task.dueDate)}
          </p>
        )}
      </button>

      {assignee && (
        <span className="mt-0.5 shrink-0" title={`Assigned to ${assignee.firstName} ${assignee.lastName}`}>
          <Avatar user={assignee} size={22} />
        </span>
      )}

      <div className="flex shrink-0 items-center gap-0.5 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        <button onClick={() => openEdit(task)} className="btn btn-ghost btn-icon btn-sm" aria-label={`Edit “${task.title}”`}>
          <Pencil size={15} />
        </button>
        <button
          onClick={() => confirmDelete(task)}
          className="btn btn-ghost btn-icon btn-sm hover:bg-primary-soft hover:text-primary-ink"
          aria-label={`Delete “${task.title}”`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default memo(TaskRow);
