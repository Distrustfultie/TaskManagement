import { useState, useEffect } from "react";
import { Calendar } from "react-date-range";
import { useNavigate } from "react-router-dom";
import { fetchTasks, updateTask } from "../../api";
import TaskCard from "../../components/tasks/TaskCard";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("month");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  const taskDates = tasks
    .filter((t) => t.dueDate)
    .map((t) => new Date(t.dueDate).toDateString());

  const dailyTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  });

  const weekTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const diff = (d - date) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });

  const reminders = tasks.filter(
    (t) => t.reminderTime && t.reminderFrequency
  );

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const newDate = new Date(over.id);
    await updateTask(active.id, { dueDate: newDate });
    const refreshed = await fetchTasks();
    setTasks(refreshed);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Calendar</h1>
          <p className="text-sm text-accent">
            Tasks, reminders & deadlines
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1 rounded-lg text-sm ${view === "month" ? "bg-primary text-white" : "bg-dark/5"
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1 rounded-lg text-sm ${view === "week" ? "bg-primary text-white" : "bg-dark/5"
              }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-dark/5 shadow-sm p-6">
        <DndContext onDragEnd={handleDragEnd}>
          <Calendar
            date={date}
            onChange={setDate}
            color="#CD1C18"
            dayContentRenderer={(day) => {
              const hasTask = taskDates.includes(day.toDateString());
              return (
                <DayDropZone day={day}>
                  <span>{day.getDate()}</span>
                  {hasTask && (
                    <span className="block w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1" />
                  )}
                </DayDropZone>
              );
            }}
          />
        </DndContext>
      </div>

      {/* Content */}
      {view === "month" ? (
        <Section title={`Tasks on ${date.toDateString()}`}>
          {dailyTasks.length ? (
            dailyTasks.map((task) => (
              <DraggableTask key={task._id} task={task}>
                <TaskCard task={task} />
              </DraggableTask>
            ))
          ) : (
            <Empty text="No tasks for this day." />
          )}
        </Section>
      ) : (
        <Section title="This Week">
          {weekTasks.length ? (
            weekTasks.map((task) => (
              <DraggableTask key={task._id} task={task}>
                <TaskCard task={task} />
              </DraggableTask>
            ))
          ) : (
            <Empty text="No tasks this week." />
          )}
        </Section>
      )}

      {/* Reminders */}
      <Section title="Reminders">
        {reminders.length ? (
          reminders.map((r) => (
            <div
              key={r._id}
              onClick={() => navigate(`/dashboard/edit-task/${r._id}`)}
              className="p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 cursor-pointer"
            >
              <p className="font-medium text-dark">{r.title}</p>
              <p className="text-xs text-accent">
                {new Date(r.reminderTime).toLocaleTimeString()}
              </p>
            </div>
          ))
        ) : (
          <Empty text="No reminders scheduled." />
        )}
      </Section>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-dark/5 shadow-sm p-6 space-y-3">
      <h3 className="text-lg font-semibold text-dark">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-accent">{text}</p>;
}

function DayDropZone({ day, children }) {
  const { setNodeRef } = useDroppable({
    id: day.toDateString(),
  });

  return (
    <div ref={setNodeRef} className="relative text-center">
      {children}
    </div>
  );
}

function DraggableTask({ task, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}