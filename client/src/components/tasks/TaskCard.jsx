import { useState } from 'react';
import { updateTask } from '../../api';
import { toast } from 'react-hot-toast';

export default function TaskCard({ task, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ ...task });

  const handleSave = async () => {
    try {
      await updateTask(task._id, draft);
      toast.success('Task updated');
      setIsEditing(false);
    } catch {
      toast.error('Task Update failed');
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-accent">
      {!isEditing ? (
        <>
          <div className="flex justify-between">
            <h3 className="font-bold">{task.title}</h3>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(true)} className='hover:bg-secondary'>✏️</button>
              <button onClick={() => onDelete(task._id)} className='hover:bg-secondary'>🗑️</button>
            </div>
          </div>
          <p>Status: {task.status}</p>
          <p>Due: {new Date(task.dueDate).toLocaleString()}</p>
        </>
      ) : (
        <>
          <input
            type="text"
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            className="w-full mb-2 border px-2 py-1 rounded"
          />
          <select
            value={draft.status}
            onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
            className="w-full mb-2 border px-2 py-1 rounded"
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <input
            type="datetime-local"
            value={draft.dueDate}
            onChange={e => setDraft(d => ({ ...d, dueDate: e.target.value }))}
            className="w-full mb-2 border px-2 py-1 rounded"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1 bg-primary text-white rounded">Save</button>
          </div>
        </>
      )}
    </div>
  );
}
