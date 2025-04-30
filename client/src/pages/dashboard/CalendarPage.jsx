import { useState, useEffect } from "react";
import { Calendar } from "react-date-range";
import { fetchTasks } from "../../api";
import TaskCard from "../../components/tasks/TaskCard";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  // Filter tasks whose dueDate is the selected day
  const dailyTasks = tasks.filter(t => {
    const d = new Date(t.dueDate);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  });

  // If you have events (e.g. createdAt or other), similar filtering
  const events = tasks.filter(t => t.reminderFrequency && t.reminderTime);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <Calendar
          date={date}
          onChange={setDate}
          className="!w-96 !h-auto mx-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Tasks */}
        <div className="bg-secondary/10 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-accent mb-4">Daily Tasks</h3>
          {dailyTasks.length
            ? dailyTasks.map(t => <TaskCard key={t._id} task={t} />)
            : <p>No tasks for this date.</p>}
        </div>

        {/* Events */}
        <div className="bg-secondary/10 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-accent mb-4">Events</h3>
          {events.length
            ? events.map(e => <p key={e._id}>{e.title} at {new Date(e.reminderTime).toLocaleTimeString()}</p>)
            : <p>No events scheduled.</p>}
        </div>
      </div>
    </div>
  );
}
