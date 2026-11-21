import { memo, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AlertCircle, CheckSquare, Clock, MessageSquare, Plus, Repeat } from "lucide-react";
import { useTasks } from "../../context/TasksContext";
import { useTaskForm } from "../../context/TaskFormContext";
import { useProjects } from "../../context/ProjectsContext";
import { PriorityBadge, STATUSES, STATUS_STYLE } from "../ui/Badges";
import Avatar from "../ui/Avatar";
import ProjectBadge from "../projects/ProjectBadge";
import { formatDue, isDone, isOverdue } from "../../utils/dates";
import { refId } from "../../utils/projects";

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.createdAt).localeCompare(String(b.createdAt));

function columnsFrom(tasks) {
  const cols = Object.fromEntries(STATUSES.map((s) => [s, []]));
  [...tasks].sort(byOrder).forEach((t) => (cols[t.status] ?? cols["To Do"]).push(t._id));
  return cols;
}

const BoardCard = memo(function BoardCard({ task, showProject, overlay = false }) {
  const { byId } = useProjects();
  const overdue = isOverdue(task);
  const done = isDone(task);
  const subtasks = task.subtasks ?? [];
  const subDone = subtasks.filter((s) => s.done).length;
  const assignee = task.assignee && typeof task.assignee === "object" ? task.assignee : null;

  return (
    <div
      className={`rounded-lg border border-line bg-surface p-3 text-left shadow-xs transition-shadow ${
        overlay ? "rotate-[1.5deg] shadow-pop" : "hover:border-line-strong"
      }`}
    >
      {showProject && byId[refId(task.project)] && (
        <div className="mb-1.5">
          <ProjectBadge project={byId[refId(task.project)]} />
        </div>
      )}
      <p className={`text-[13px] font-medium leading-snug ${done ? "text-faint line-through" : "text-ink"}`}>{task.title}</p>

      {task.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-muted">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-muted">
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 ${overdue ? "font-medium text-primary-ink" : ""}`}>
            {overdue ? <AlertCircle size={12} /> : <Clock size={12} className="text-faint" />}
            {formatDue(task.dueDate)}
          </span>
        )}
        {!done && <PriorityBadge priority={task.priority} />}
        {subtasks.length > 0 && (
          <span className="inline-flex items-center gap-1" title="Subtasks">
            <CheckSquare size={12} className="text-faint" />
            {subDone}/{subtasks.length}
          </span>
        )}
        {task.recurrence && task.recurrence !== "none" && <Repeat size={12} className="text-faint" aria-label="Repeats" />}
        {task.commentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={12} className="text-faint" />
            {task.commentCount}
          </span>
        )}
        {assignee && (
          <span className="ml-auto" title={`Assigned to ${assignee.firstName} ${assignee.lastName}`}>
            <Avatar user={assignee} size={20} />
          </span>
        )}
      </div>
    </div>
  );
});

function SortableCard({ task, showProject, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, transition }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        if (e.key === "Enter" && !isDragging) onOpen(task);
      }}
      aria-label={`${task.title}. Press space to pick up and move, Enter to open.`}
      className={`cursor-grab rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <BoardCard task={task} showProject={showProject} />
    </div>
  );
}

function Column({ status, ids, taskMap, showProject, onOpen, onAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      className="flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col rounded-xl border border-line bg-subtle/50 sm:w-80 lg:w-auto lg:max-w-none lg:flex-1"
      aria-label={`${status} column`}
    >
      <header className="flex items-center gap-2 px-3 pb-2 pt-3">
        <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[status].dot}`} />
        <h3 className="text-[13px] font-semibold text-ink">{status}</h3>
        <span className="text-[12px] text-faint">{ids.length}</span>
        <button
          onClick={() => onAdd(status)}
          className="btn btn-ghost btn-icon btn-sm ml-auto h-7 w-7"
          aria-label={`Add task to ${status}`}
        >
          <Plus size={15} />
        </button>
      </header>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-b-xl px-2 pb-2 transition-colors ${isOver ? "bg-primary-soft/40" : ""}`}
        >
          {ids.map((id) =>
            taskMap[id] ? <SortableCard key={id} task={taskMap[id]} showProject={showProject} onOpen={onOpen} /> : null
          )}
          {ids.length === 0 && (
            <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line py-6 text-xs text-faint">
              Drop tasks here
            </p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

/**
 * Kanban board. Dragging between columns changes status; order within a
 * column is saved too.
 */
export default function TaskBoard({ tasks, showProject = true, newTaskDefaults }) {
  const { reorderTasks } = useTasks();
  const { openEdit, openNew } = useTaskForm();
  const [columns, setColumns] = useState(() => columnsFrom(tasks));
  const [activeId, setActiveId] = useState(null);
  const taskMap = useMemo(() => Object.fromEntries(tasks.map((t) => [t._id, t])), [tasks]);

  // Follow server/state changes, but never mid-drag
  useEffect(() => {
    if (!activeId) setColumns(columnsFrom(tasks));
  }, [tasks, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Space picks up/drops; Enter is left free to open the task
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    })
  );

  const findColumn = (id) => (id in columns ? id : STATUSES.find((s) => columns[s].includes(id)));

  const onDragOver = ({ active, over }) => {
    if (!over) return;
    const from = findColumn(active.id);
    const to = findColumn(over.id);
    if (!from || !to || from === to) return;
    setColumns((cols) => {
      const source = cols[from].filter((id) => id !== active.id);
      const target = [...cols[to]];
      const overIndex = target.indexOf(over.id);
      target.splice(overIndex >= 0 ? overIndex : target.length, 0, active.id);
      return { ...cols, [from]: source, [to]: target };
    });
  };

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) {
      setColumns(columnsFrom(tasks));
      return;
    }
    const col = findColumn(active.id);
    let next = columns;
    if (col && col === findColumn(over.id) && active.id !== over.id) {
      const ids = columns[col];
      next = { ...columns, [col]: arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)) };
      setColumns(next);
    }
    // Re-number every column and send only what changed
    const items = [];
    for (const status of STATUSES) {
      next[status].forEach((id, i) => {
        const t = taskMap[id];
        const order = (i + 1) * 1000;
        if (t && (t.order !== order || t.status !== status)) items.push({ id, order, status });
      });
    }
    reorderTasks(items);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setColumns(columnsFrom(tasks));
      }}
    >
      <div className="scrollbar-thin -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            ids={columns[status]}
            taskMap={taskMap}
            showProject={showProject}
            onOpen={openEdit}
            onAdd={(s) => openNew({ ...newTaskDefaults, status: s })}
          />
        ))}
      </div>
      <DragOverlay>{activeId && taskMap[activeId] ? <BoardCard task={taskMap[activeId]} showProject={showProject} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
