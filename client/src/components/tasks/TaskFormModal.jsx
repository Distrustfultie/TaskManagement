import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, PencilOff, Play, Repeat, Timer, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Segmented from "../ui/Segmented";
import Select from "../ui/Select";
import Checkbox from "../ui/Checkbox";
import { useConfirm } from "../../context/ConfirmContext";
import { projectOptions } from "../../utils/options";
import TagInput from "./TagInput";
import SubtaskEditor from "./SubtaskEditor";
import CommentThread from "./CommentThread";
import ActivityFeed from "../activity/ActivityFeed";
import { PRIORITIES, STATUSES, STATUS_STYLE, normalizePriority } from "../ui/Badges";
import { useTasks } from "../../context/TasksContext";
import { useProjects } from "../../context/ProjectsContext";
import { useFocus } from "../../context/FocusContext";
import { formatDuration, toInputValue } from "../../utils/dates";
import { fullName, refId } from "../../utils/projects";

const FREQUENCIES = [
  { value: "once", label: "Once" },
  { value: "Daily", label: "Every day" },
  { value: "Weekly", label: "Every week" },
  { value: "Monthly", label: "Every month" },
];
const RECURRENCE = [
  { value: "none", label: "Doesn't repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function initialForm(task, defaults) {
  const src = { ...defaults, ...task };
  return {
    title: src.title ?? "",
    description: src.description ?? "",
    status: STATUSES.includes(src.status) ? src.status : "To Do",
    priority: normalizePriority(src.priority),
    dueDate: toInputValue(src.dueDate),
    project: refId(src.project) ?? "",
    assignee: refId(src.assignee) ?? "",
    tags: src.tags ?? [],
    subtasks: (src.subtasks ?? []).map((s) => ({ _id: s._id, title: s.title, done: !!s.done })),
    recurrence: src.recurrence || "none",
    category: src.category && src.category !== "General" ? src.category : "",
    remind: Boolean(src.reminderTime),
    reminderTime: toInputValue(src.reminderTime),
    reminderFrequency: src.reminderFrequency || "once",
  };
}

/** Create or edit a task. Pass `task` to edit; `defaults` to prefill a new one. */
export default function TaskFormModal({ open, onClose, task, defaults, onRequestDelete }) {
  const { tasks, createTask, updateTask } = useTasks();
  const { active: projects, byId } = useProjects();
  const focus = useFocus();
  const editing = Boolean(task?._id);
  const liveTask = editing ? tasks.find((t) => t._id === task._id) ?? task : null;
  const [form, setForm] = useState(() => initialForm(task, defaults));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("details");
  const confirm = useConfirm();
  const snapshot = useRef("");

  useEffect(() => {
    if (open) {
      const initial = initialForm(task, defaults);
      snapshot.current = JSON.stringify(initial);
      setForm(initial);
      setErrors({});
      setTab("details");
    }
  }, [open, task, defaults]);

  // Closing with unsaved edits asks first
  const dirty = open && JSON.stringify(form) !== snapshot.current;
  const requestClose = async () => {
    if (saving) return;
    if (dirty) {
      const ok = await confirm({
        title: editing ? "Discard your changes?" : "Discard this task?",
        description: editing ? "Your edits to this task haven't been saved." : "What you've entered so far will be lost.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        icon: PencilOff,
      });
      if (!ok) return;
    }
    onClose();
  };

  const categories = useMemo(() => [...new Set(tasks.map((t) => t.category).filter((c) => c && c !== "General"))].sort(), [tasks]);
  const allTags = useMemo(() => [...new Set(tasks.flatMap((t) => t.tags ?? []))].sort(), [tasks]);
  const project = form.project ? byId[form.project] : null;
  const members = project?.members ?? [];

  const set = (key) => (value) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Assignees must be members of the chosen project
      if (key === "project") {
        const p = byId[value];
        if (!p || !p.members.some((m) => refId(m.user) === f.assignee)) next.assignee = "";
      }
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Give the task a title";
    if (!form.dueDate) e.dueDate = "Pick a due date";
    if (form.remind && !form.reminderTime) e.reminderTime = "Pick when to send the reminder";
    setErrors(e);
    if (Object.keys(e).length) setTab("details");
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      project: form.project || null,
      assignee: form.project && form.assignee ? form.assignee : null,
      tags: form.tags,
      subtasks: form.subtasks.filter((s) => s.title.trim()).map(({ _id, title, done }) => ({ ...(_id ? { _id } : {}), title, done })),
      recurrence: form.recurrence,
      category: form.category.trim() || "General",
      reminderTime: form.remind ? form.reminderTime : "",
      reminderFrequency: form.remind ? form.reminderFrequency : "once",
    };
    setSaving(true);
    try {
      if (editing) await updateTask(task._id, payload);
      else await createTask(payload);
      onClose();
    } catch {
      /* toast already shown; keep the form open so nothing is lost */
    } finally {
      setSaving(false);
    }
  };

  const focusingThis = focus.session?.taskId === task?._id;
  const tabs = [
    { id: "details", label: "Details" },
    { id: "comments", label: `Comments${liveTask?.commentCount ? ` ${liveTask.commentCount}` : ""}` },
    { id: "activity", label: "Activity" },
  ];

  return (
    <Modal
      open={open}
      onClose={requestClose}
      size="lg"
      title={editing ? "Edit task" : "New task"}
      footer={
        <>
          {editing && onRequestDelete && (
            <button
              type="button"
              onClick={() => onRequestDelete(task)}
              className="btn btn-ghost text-primary-ink hover:bg-primary-soft hover:text-primary-ink sm:mr-auto"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button type="button" onClick={requestClose} className="btn btn-secondary">
            {tab === "details" ? "Cancel" : "Close"}
          </button>
          {tab === "details" && (
            <button type="submit" form="task-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create task"}
            </button>
          )}
        </>
      }
    >
      {editing && (
        <div className="-mx-5 -mt-1 mb-4 flex gap-1 border-b border-line px-4 sm:-mx-6 sm:px-5" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-2.5 pb-2.5 pt-1 text-[13px] font-medium transition-colors focus-visible:outline-none ${
                tab === t.id ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}

      {editing && tab === "comments" && <CommentThread taskId={task._id} />}
      {editing && tab === "activity" && (
        <div className="pb-2">
          <ActivityFeed taskId={task._id} compact />
        </div>
      )}

      {/* Kept mounted while on other tabs so unsaved edits aren't lost */}
      <form id="task-form" onSubmit={handleSubmit} noValidate className="space-y-5 pb-2" hidden={tab !== "details"}>
        <div>
          <label htmlFor="task-title" className="label">
            Title
          </label>
          <input
            id="task-title"
            data-autofocus
            className="input"
            placeholder="What needs to get done?"
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            aria-invalid={!!errors.title}
            maxLength={200}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="task-notes" className="label">
            Notes <span className="font-normal text-faint">(optional)</span>
          </label>
          <textarea
            id="task-notes"
            className="input h-auto min-h-[76px] py-2"
            placeholder="Add details, links or context"
            value={form.description}
            maxLength={5000}
            onChange={(e) => set("description")(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Status</span>
          <Segmented
            label="Status"
            options={STATUSES}
            value={form.status}
            onChange={set("status")}
            renderOption={(o) => (
              <>
                <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[o.value].dot}`} />
                {o.label}
              </>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="label">Priority</span>
            <Segmented label="Priority" options={PRIORITIES} value={form.priority} onChange={set("priority")} />
          </div>
          <div>
            <label htmlFor="task-due" className="label">
              Due
            </label>
            <input
              id="task-due"
              type="datetime-local"
              className="input"
              value={form.dueDate}
              onChange={(e) => set("dueDate")(e.target.value)}
              aria-invalid={!!errors.dueDate}
            />
            {errors.dueDate && <p className="field-error">{errors.dueDate}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="task-project" className="label">
              Project
            </label>
            <Select
              id="task-project"
              value={form.project}
              onChange={set("project")}
              options={[{ value: "", label: "No project" }, ...projectOptions(projects)]}
            />
          </div>
          <div>
            <label htmlFor="task-assignee" className="label">
              Assignee
            </label>
            <Select
              id="task-assignee"
              value={form.assignee}
              onChange={set("assignee")}
              disabled={!project}
              options={[
                { value: "", label: project ? "Unassigned" : "Pick a project first" },
                ...members.map((m) => ({ value: refId(m.user), label: fullName(m.user), description: m.user?.email })),
              ]}
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-tags" className="label">
            Tags
          </label>
          <TagInput id="task-tags" value={form.tags} onChange={set("tags")} suggestions={allTags} />
        </div>

        <div>
          <span className="label">Subtasks</span>
          <SubtaskEditor value={form.subtasks} onChange={set("subtasks")} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="task-repeat" className="label">
              <span className="inline-flex items-center gap-1.5">
                <Repeat size={13} className="text-faint" /> Repeat
              </span>
            </label>
            <Select id="task-repeat" value={form.recurrence} onChange={set("recurrence")} options={RECURRENCE} />
            {form.recurrence !== "none" && <p className="hint">Completing it schedules the next one automatically.</p>}
          </div>
          <div>
            <label htmlFor="task-category" className="label">
              Category <span className="font-normal text-faint">(optional)</span>
            </label>
            <input
              id="task-category"
              className="input"
              placeholder="e.g. Work, Personal"
              list="task-categories"
              value={form.category}
              onChange={(e) => set("category")(e.target.value)}
              maxLength={40}
            />
            <datalist id="task-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="rounded-xl border border-line p-4">
          <Checkbox
            checked={form.remind}
            onChange={set("remind")}
            labelClassName="text-sm font-medium text-ink"
            label={
              <span className="flex items-center gap-1.5">
                <BellRing size={15} className="text-faint" /> Email me a reminder
              </span>
            }
            description="Sent to the email on your account."
          />

          {form.remind && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="task-remind-at" className="label">
                  Remind me at
                </label>
                <input
                  id="task-remind-at"
                  type="datetime-local"
                  className="input"
                  value={form.reminderTime}
                  onChange={(e) => set("reminderTime")(e.target.value)}
                  aria-invalid={!!errors.reminderTime}
                />
                {errors.reminderTime && <p className="field-error">{errors.reminderTime}</p>}
              </div>
              <div>
                <label htmlFor="task-remind-freq" className="label">
                  Repeat reminder
                </label>
                <Select id="task-remind-freq" value={form.reminderFrequency} onChange={set("reminderFrequency")} options={FREQUENCIES} />
              </div>
            </div>
          )}
        </div>

        {editing && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
            <Timer size={18} className="text-faint" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Focus time</p>
              <p className="text-xs text-faint">{formatDuration(liveTask?.timeSpent ?? 0)} tracked on this task</p>
            </div>
            {focusingThis ? (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => focus.stop()}>
                Stop &amp; save
              </button>
            ) : (
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary btn-sm" disabled={!!focus.session} onClick={() => focus.start(liveTask, 25)}>
                  <Play size={13} /> 25 min focus
                </button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={!!focus.session} onClick={() => focus.start(liveTask)}>
                  Start timer
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
