import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTasks, updateTask } from '../api';
import { toast } from 'react-hot-toast';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const tasks = await fetchTasks();
        const t = tasks.find((t) => t._id === id);
        if (t) setTask(t);
        else toast.error('Task not found');
      } catch (err) {
        toast.error('Error loading task');
      }
    };
    load();
  }, [id]);

  if (!task) return <p>Loading...</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTask(id, task);
      toast.success('Task updated');
      navigate('/dashboard/tasks');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Title</label>
          <input
            name="title"
            value={task.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Due Date</label>
          <input
            name="dueDate"
            type="datetime-local"
            value={task.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Category</label>
          <input
            name="category"
            value={task.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Priority</label>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}