import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../../components/TaskForm';
import { fetchTasks, deleteTask } from '../../api';
import { groupTasksByDate } from '../../utils/taskGrouping';
import TaskCard from '../../components/tasks/TaskCard';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(toDeleteId);
      toast.success('Task deleted');
      loadTasks();
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const handleEdit = (task) => {
    navigate(`/dashboard/edit-task/${task._id}`);
  };

  const grouped = groupTasksByDate(tasks);

  return (
    <div className="p-6">
      <button
        onClick={() => setModalOpen(true)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        + Add Task
      </button>

      <TaskForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          loadTasks();
        }}
      />

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{group}</h3>
          <div className="space-y-4">
            {items.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={() => handleDeleteClick(task._id)}
                onEdit={() => navigate(`/dashboard/edit-task/${task._id}`)}
              />
            ))}

            <ConfirmModal
              isOpen={confirmOpen}
              message="Are you sure you want to delete this task?"
              onCancel={() => setConfirmOpen(false)}
              onConfirm={handleDeleteConfirm}
            />

          </div>
        </div>
      ))}
    </div>
  );
}