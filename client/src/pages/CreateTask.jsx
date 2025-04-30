import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import { toast } from "react-hot-toast";

export default function CreateTask() {
  const navigate = useNavigate();
  const [task, setTask] = useState({
    id: Date.now().toString(),
    title: "",
    dueDate: "",
    category: "",
    priority: "",
    reminderTime: "",
    reminderFrequency: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    toast.success("Task created successfully!");
    navigate("/tasks"); 
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>
      <TaskForm task={task} onSubmit={setTask} buttonText="Create Task" />
    </div>
  );
}