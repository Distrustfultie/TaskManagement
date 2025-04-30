import { useState } from "react";
import { toast } from "react-hot-toast";
import { createTask, fetchTasks } from "../api";

export default function TaskFormModal({ isOpen, onClose, onSuccess }) {
  const [task, setTask] = useState({
    title: "",
    dueDate: "",
    category: "",
    priority: "",
    reminderTime: "",
    reminderFrequency: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("Saving task:", task);
    try {
      const created = await createTask(task);
      console.log("Backend responded:", created);
      if (created) {
        toast.success("Task created successfully!");
        onClose();
        onSuccess();
      } else {
        throw new Error("No task returned");
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Error creating task");
    }
  }; 

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600"
        >
          ✖️
        </button>
        <h2 className="text-xl font-semibold mb-4">Add Task</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="Task Title"
            className="w-full border px-3 py-2 rounded" required
          />
          <input
            name="dueDate"
            type="datetime-local"
            value={task.dueDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="category"
            value={task.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border px-3 py-2 rounded"
          />
          <label className="block text-gray-700">Status</label>
          <select 
             name="status"
             value={task.status}
             onChange={handleChange}
             className="w-full border px-3 py-2 rounded"
             required
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <input
            name="reminderTime"
            type="datetime-local"
            value={task.reminderTime}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <select
            name="reminderFrequency"
            value={task.reminderFrequency}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Reminder Frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <input
            name="email"
            type="email"
            value={task.email}
            onChange={handleChange}
            placeholder="Email for reminders"
            className="w-full border px-3 py-2 rounded" required
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded"
          >
            Save Task
          </button>
        </form>
      </div>
    </div>
  );
}