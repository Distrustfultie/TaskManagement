import React, { useEffect, useState } from "react";
import { fetchTasks, deleteTask } from "../api";
import TaskCard from "../components/TaskCard";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
        toast.error("Error fetching tasks.");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleDelete = async (id) => {
    const success = await deleteTask(id);
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      toast.success("Task deleted successfully!");
    } else {
      toast.error("Failed to delete task. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
        <Link
          to="/tasks/create"
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
        >
          + Create Task
        </Link>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500 text-center">Loading tasks...</p>}

      {/* Error State */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Show Tasks or Empty State */}
      {!loading && !error && (
        <ul className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task._id} task={task} onDelete={handleDelete} />
            ))
          ) : (
            <p className="text-gray-500 text-center">No tasks found.</p>
          )}
        </ul>
      )}
    </div>
  );
}