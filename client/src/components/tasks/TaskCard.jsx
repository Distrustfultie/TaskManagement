import { useState } from "react";
import {
  Pencil,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { updateTask } from "../../api";
import { toast } from "react-hot-toast";

/**
 * TaskCard
 * Features:
 * - Priority chips
 * - Inline edit (title, status, due date)
 * - Overdue indicator
 * - Bulk select support (optional)
 * - Works with Kanban + Calendar + Drag & Drop
 */
export default function TaskCard({
  task,
  onDelete,
  onUpdated,
  selected = [],
  toggle,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task);

  const handleSave = async () => {
    try {
      await updateTask(task._id, draft);
      toast.success("Task updated");
      setEditing(false);
      onUpdated?.();
    } catch {
      toast.error("Update failed");
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "Done";

  const statusBorder = {
    "To Do": "border-yellow-400",
    "In Progress": "border-blue-500",
    "Done": "border-green-500",
  };

  const priorityStyle = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <div
      className={`bg-white rounded-xl border-l-4 shadow-sm p-4 transition
        ${
          isOverdue
            ? "border-red-500 bg-red-50"
            : statusBorder[task.status]
        }
      `}
    >
      {/* VIEW MODE */}
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Bulk checkbox (optional) */}
            {toggle && (
              <input
                type="checkbox"
                checked={selected.includes(task._id)}
                onChange={() => toggle(task._id)}
                className="mt-1"
              />
            )}

            <div className="space-y-1">
              {/* Title + Priority */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-dark">
                  {task.title}
                </h3>

                {task.priority && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyle[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                )}

                {isOverdue && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={12} />
                    Overdue
                  </span>
                )}
              </div>

              <p className="text-xs text-accent">
                Status: {task.status}
              </p>

              {task.dueDate && (
                <p className="text-xs text-accent">
                  Due:{" "}
                  {new Date(task.dueDate).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg hover:bg-secondary/20 transition"
              aria-label="Edit task"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() => onDelete?.(task._id)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition"
              aria-label="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <div className="space-y-3">
          <input
            value={draft.title}
            onChange={(e) =>
              setDraft({ ...draft, title: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Task title"
          />

          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <select
            value={draft.priority || ""}
            onChange={(e) =>
              setDraft({ ...draft, priority: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <input
            type="datetime-local"
            value={draft.dueDate || ""}
            onChange={(e) =>
              setDraft({ ...draft, dueDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-accent hover:underline"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition"
            >
              <CheckCircle size={14} />
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}