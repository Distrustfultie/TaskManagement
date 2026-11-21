import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CalendarPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTasks } from "../../context/TasksContext";
import { useTaskForm } from "../../context/TaskFormContext";
import TaskRow from "../../components/tasks/TaskRow";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { STATUS_STYLE } from "../../components/ui/Badges";
import { byDueDate, isDone, isOverdue, parseDate } from "../../utils/dates";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayKey = (d) => format(d, "yyyy-MM-dd");
const MAX_CHIPS = 3;

function Chip({ task, overlay = false, onOpen }) {
  const done = isDone(task);
  const overdue = isOverdue(task);
  return (
    <div
      onClick={onOpen}
      className={`flex w-full cursor-grab items-center gap-1.5 rounded-md px-1.5 py-[3px] text-left text-[12px] leading-tight transition-colors active:cursor-grabbing ${
        overlay ? "w-44 border border-line bg-surface shadow-pop" : "hover:bg-subtle"
      } ${overdue ? "text-primary-ink" : done ? "text-faint" : "text-ink"}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_STYLE[task.status]?.dot ?? "bg-faint"}`} />
      <span className={`truncate ${done ? "line-through" : ""}`}>{task.title}</span>
    </div>
  );
}

function DraggableChip({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task._id, data: { task } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`${task.title}. Drag to reschedule, or press Enter to edit.`}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isDragging ? "opacity-30" : ""}`}
    >
      <Chip task={task} onOpen={onOpen} />
    </div>
  );
}

function DayCell({ day, month, tasks, selected, onSelect, onAdd, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey(day) });
  const inMonth = isSameMonth(day, month);
  const today = isToday(day);
  const extra = tasks.length - MAX_CHIPS;

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelect(day)}
      className={`group relative flex min-h-[3.25rem] cursor-pointer flex-col border-b border-r border-line p-1 transition-colors md:min-h-[7rem] md:p-1.5
        ${inMonth ? "bg-surface" : "bg-subtle/50"}
        ${isOver ? "!bg-primary-soft" : "hover:bg-subtle/60"}
        ${selected ? "ring-2 ring-inset ring-primary" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium md:text-[13px]
            ${today ? "bg-primary text-white" : inMonth ? "text-ink" : "text-faint"}`}
        >
          {format(day, "d")}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(day);
          }}
          className="hidden h-6 w-6 items-center justify-center rounded-md text-faint opacity-0 hover:bg-subtle hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 md:flex"
          aria-label={`Add task on ${format(day, "MMMM d")}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Desktop: draggable chips */}
      <div className="mt-1 hidden space-y-0.5 md:block">
        {tasks.slice(0, MAX_CHIPS).map((t) => (
          <DraggableChip key={t._id} task={t} onOpen={() => onOpen(t)} />
        ))}
        {extra > 0 && <p className="px-1.5 text-[11px] font-medium text-muted">+{extra} more</p>}
      </div>

      {/* Mobile: dots */}
      {tasks.length > 0 && (
        <div className="mt-auto flex justify-center gap-0.5 pb-0.5 md:hidden">
          {tasks.slice(0, 3).map((t) => (
            <span key={t._id} className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[t.status]?.dot ?? "bg-faint"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const { tasks, error, refresh, updateTask } = useTasks();
  const { openNew, openEdit } = useTaskForm();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [dragging, setDragging] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month]
  );

  const tasksByDay = useMemo(() => {
    const map = {};
    for (const t of [...tasks].sort(byDueDate)) {
      const d = parseDate(t.dueDate);
      if (!d) continue;
      (map[dayKey(d)] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDay[dayKey(selected)] ?? [];

  const addOn = (day) => {
    const d = new Date(day);
    d.setHours(9, 0, 0, 0);
    openNew({ dueDate: d });
  };

  const handleDragEnd = async ({ active, over }) => {
    setDragging(null);
    if (!over) return;
    const task = active.data.current.task;
    const from = parseDate(task.dueDate);
    const [y, m, d] = over.id.split("-").map(Number);
    if (from && from.getFullYear() === y && from.getMonth() === m - 1 && from.getDate() === d) return;

    const next = new Date(y, m - 1, d, from?.getHours() ?? 9, from?.getMinutes() ?? 0);
    try {
      await updateTask(task._id, { dueDate: format(next, "yyyy-MM-dd'T'HH:mm") }, { silent: true });
      toast.success(`Moved to ${format(next, "EEE, MMM d")}`);
      setSelected(next);
    } catch {
      /* rolled back + toast in context */
    }
  };

  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        {/* Month header */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="flex-1 text-base font-semibold text-ink">{format(month, "MMMM yyyy")}</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setMonth(startOfMonth(new Date()));
              setSelected(new Date());
            }}
          >
            Today
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-line bg-subtle/50">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-faint">
              {d}
            </div>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={({ active }) => setDragging(active.data.current.task)}
          onDragCancel={() => setDragging(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="-mb-px -mr-px grid grid-cols-7">
            {days.map((day) => (
              <DayCell
                key={dayKey(day)}
                day={day}
                month={month}
                tasks={tasksByDay[dayKey(day)] ?? []}
                selected={isSameDay(day, selected)}
                onSelect={(d) => {
                  setSelected(d);
                  if (!isSameMonth(d, month)) setMonth(startOfMonth(d));
                }}
                onAdd={addOn}
                onOpen={openEdit}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>{dragging && <Chip task={dragging} overlay />}</DragOverlay>
        </DndContext>

        <p className="hidden border-t border-line px-4 py-2.5 text-xs text-faint md:block">
          Drag a task onto another day to reschedule it.
        </p>
      </div>

      {/* Selected day */}
      <aside className="card h-fit overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h2 className="font-semibold text-ink">
              {isToday(selected) ? "Today" : isSameDay(selected, addDays(new Date(), 1)) ? "Tomorrow" : format(selected, "EEEE")}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">{format(selected, "MMMM d, yyyy")}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => addOn(selected)}>
            <Plus size={14} /> Add
          </button>
        </div>
        {selectedTasks.length ? (
          <div className="divide-y divide-line border-t border-line">
            {selectedTasks.map((t) => (
              <TaskRow key={t._id} task={t} compact />
            ))}
          </div>
        ) : (
          <EmptyState compact icon={CalendarPlus} title="Nothing scheduled" description="Enjoy the free time, or plan something." />
        )}
      </aside>
    </div>
  );
}
