import { useState } from "react";
import { createTask } from "../api";
import { toast } from "react-hot-toast";

export default function TaskFormModal({ isOpen, onClose, onSuccess }) {
  const [task, setTask] = useState({
    title: "",
    status: "To Do",
    dueDate: "",
    priority: "Medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(task);
      toast.success("Task created");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to create task");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold mb-4">New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Task title"
            className="w-full px-3 py-2 border rounded-lg"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />

          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={task.status}
            onChange={(e) => setTask({ ...task, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded-lg"
            value={task.dueDate}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
          />

          <button className="w-full bg-primary text-white py-2 rounded-lg">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}