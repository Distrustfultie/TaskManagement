import { useParams, useNavigate } from "react-router-dom";

export function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find((t) => t.id === id);

  if (!task) return <p className="text-center text-red-500">Task not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{task.title}</h2>
      <p className="text-gray-600 mb-2">Due Date: {task.dueDate || "Not set"}</p>
      <p className="text-gray-600 mb-2">Category: {task.category || "General"}</p>
      <p className="text-gray-600 mb-4">Priority: {task.priority || "Normal"}</p>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Back
      </button>
    </div>
  );
}

export default TaskDetails;