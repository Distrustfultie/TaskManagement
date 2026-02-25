import { useState, useEffect } from "react";
import { fetchTasks, deleteTask } from "../../api";
import TaskCard from "../../components/tasks/TaskCard";
import TaskFormModal from "../../components/TaskForm";
import { toast } from "react-hot-toast";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">My Tasks</h1>
          <p className="text-sm text-accent">
            Create, edit, and manage your tasks
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          disabled={open}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition disabled:opacity-50"
        >
          + New Task
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-accent">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dark/5 p-6 text-center">
          <p className="text-dark font-medium">
            No tasks yet
          </p>
          <p className="text-sm text-accent mt-1">
            Click “New Task” to create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={async (id) => {
                await deleteTask(id);
                toast.success("Task deleted");
                load();
              }}
              onUpdated={load}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <TaskFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={load}
      />
    </div>
  );
}