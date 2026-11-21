const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");
const { taskAccessFilter } = require("../utils/access");
const { shiftDate } = require("../utils/recurrence");
const { notify, nameOf } = require("../utils/notify");

const USER_FIELDS = "firstName lastName email";
const withPeople = (q) => q.populate("assignee", USER_FIELDS).populate("user", USER_FIELDS);

// Fields a client may set. Ownership (user), the reminder email, reminderSent,
// completedAt and timeSpent are controlled by the server only.
const EDITABLE_FIELDS = [
  "title",
  "description",
  "dueDate",
  "category",
  "priority",
  "tags",
  "subtasks",
  "recurrence",
  "reminderTime",
  "reminderFrequency",
  "status",
  "project",
  "assignee",
  "order",
];

function pickEditable(body = {}) {
  const out = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  if (out.tags !== undefined) {
    out.tags = [...new Set((Array.isArray(out.tags) ? out.tags : []).map((t) => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  }
  if (out.subtasks !== undefined) {
    out.subtasks = (Array.isArray(out.subtasks) ? out.subtasks : [])
      .filter((s) => s && String(s.title || "").trim())
      .slice(0, 50)
      .map((s) => ({ ...(s._id ? { _id: s._id } : {}), title: String(s.title).trim(), done: !!s.done }));
  }
  if (out.project === "") out.project = null;
  if (out.assignee === "") out.assignee = null;
  return out;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const fail = (res, err) => {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid data" });
  }
  if (err.name === "CastError") return res.status(404).json({ message: "Task not found" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
};

function record(actor, task, type, meta = {}) {
  // Activity is best-effort: never fail the request because of it
  Activity.create({ actor, task: task._id, project: task.project || null, taskTitle: task.title, type, meta }).catch((e) =>
    console.error("activity log failed:", e.message)
  );
}

/**
 * Apply client changes to a task document, enforcing project membership and
 * handling status transitions. Returns the next occurrence if a recurring
 * task was just completed.
 */
async function applyUpdates(task, updates, actor) {
  const userId = actor._id;
  const projectChanged =
    updates.project !== undefined && String(updates.project || "") !== String(task.project || "");

  let project = null;
  const targetProjectId = updates.project !== undefined ? updates.project : task.project;
  if (targetProjectId) {
    project = await Project.findOne({ _id: targetProjectId, "members.user": userId });
    if (!project) throw new HttpError(400, "You're not a member of that project");
  }

  // Assignee must belong to the task's project; personal tasks have no assignee
  let assignee = updates.assignee !== undefined ? updates.assignee : task.assignee;
  if (!project) assignee = null;
  else if (assignee && !project.isMember(assignee)) {
    if (updates.assignee !== undefined) throw new HttpError(400, "The assignee isn't a member of this project");
    assignee = null; // moved to a project the old assignee isn't in
  }
  const assigneeChanged = String(assignee || "") !== String(task.assignee?._id || task.assignee || "");

  if (updates.reminderTime !== undefined && updates.reminderTime !== task.reminderTime) {
    task.reminderSent = false; // a new reminder time should fire again
  }

  const wasDone = task.status === "Done";
  Object.assign(task, updates, { assignee });
  const nowDone = task.status === "Done";

  if (!wasDone && nowDone) task.completedAt = new Date();
  if (wasDone && !nowDone) task.completedAt = null;

  await task.save();

  if (!wasDone && nowDone) record(userId, task, "completed");
  else if (wasDone && !nowDone) record(userId, task, "reopened");
  if (projectChanged) record(userId, task, "moved", { to: project?.name ?? null });
  if (assigneeChanged && assignee) {
    record(userId, task, "assigned", { assignee: String(assignee) });
    notify({
      to: assignee,
      actor,
      type: "assigned",
      message: `${nameOf(actor)} assigned you “${task.title}”${project ? ` in ${project.name}` : ""}`,
      task: task._id,
      project: project?._id ?? null,
    });
  }

  // Completing a recurring task schedules its next occurrence
  if (!wasDone && nowDone && task.recurrence && task.recurrence !== "none") {
    const next = await Task.create({
      user: task.user,
      project: task.project,
      assignee: task.assignee,
      title: task.title,
      description: task.description,
      dueDate: shiftDate(task.dueDate, task.recurrence),
      category: task.category,
      priority: task.priority,
      tags: task.tags,
      subtasks: task.subtasks.map((s) => ({ title: s.title, done: false })),
      recurrence: task.recurrence,
      reminderTime: task.reminderTime ? shiftDate(task.reminderTime, task.recurrence) : "",
      reminderFrequency: task.reminderFrequency,
      email: task.email,
      order: task.order,
    });
    record(userId, next, "created", { recurring: true });
    return await withPeople(Task.findById(next._id));
  }
  return null;
}

// GET /tasks  (optional ?project=<id>)
async function getTasks(req, res) {
  try {
    const filter = await taskAccessFilter(req.userId);
    if (req.query.project) filter.project = req.query.project;
    const tasks = await withPeople(Task.find(filter).sort({ order: 1, createdAt: 1 }));
    res.json(tasks);
  } catch (err) {
    fail(res, err);
  }
}

// POST /tasks
async function createTask(req, res) {
  try {
    const fields = pickEditable(req.body);
    if (!fields.title || !String(fields.title).trim() || !fields.dueDate) {
      return res.status(400).json({ message: "Title and due date are required." });
    }
    // Reminders go to the creator's own email, never an arbitrary address
    const task = new Task({ user: req.userId, email: req.user.email, title: fields.title, dueDate: fields.dueDate });
    const next = await applyUpdates(task, fields, req.user);
    record(req.userId, task, "created");
    const saved = await withPeople(Task.findById(task._id));
    res.status(201).json(next ? { ...saved.toJSON(), _next: next } : saved);
  } catch (err) {
    fail(res, err);
  }
}

// PUT /tasks/:id
async function updateTask(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, ...(await taskAccessFilter(req.userId)) });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updates = pickEditable(req.body);
    const next = await applyUpdates(task, updates, req.user);
    const watched = ["title", "description", "dueDate", "priority", "tags", "subtasks", "recurrence"];
    if (watched.some((k) => updates[k] !== undefined) && updates.status === undefined) {
      record(req.userId, task, "updated");
    }
    const saved = await withPeople(Task.findById(task._id));
    res.json(next ? { ...saved.toJSON(), _next: next } : saved);
  } catch (err) {
    fail(res, err);
  }
}

// DELETE /tasks/:id
async function deleteTask(req, res) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, ...(await taskAccessFilter(req.userId)) });
    if (!task) return res.status(404).json({ message: "Task not found" });
    record(req.userId, task, "deleted");
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    fail(res, err);
  }
}

// PUT /tasks/reorder  { items: [{ id, order, status? }] }  — board drag & drop
async function reorderTasks(req, res) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 500) : [];
    const access = await taskAccessFilter(req.userId);
    const tasks = await Task.find({ _id: { $in: items.map((i) => i.id) }, ...access });
    const byId = new Map(tasks.map((t) => [String(t._id), t]));
    const spawned = [];
    for (const item of items) {
      const task = byId.get(String(item.id));
      if (!task) continue;
      const changes = { order: Number(item.order) || 0 };
      if (item.status) changes.status = item.status;
      const next = await applyUpdates(task, changes, req.user);
      if (next) spawned.push(next);
    }
    const updated = await withPeople(Task.find({ _id: { $in: tasks.map((t) => t._id) } }));
    res.json({ updated, spawned });
  } catch (err) {
    fail(res, err);
  }
}

// POST /tasks/bulk  { ids: [], action: "update" | "delete", changes? }
async function bulkTasks(req, res) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.slice(0, 500) : [];
    const access = await taskAccessFilter(req.userId);
    const tasks = await Task.find({ _id: { $in: ids }, ...access });

    if (req.body.action === "delete") {
      await Task.deleteMany({ _id: { $in: tasks.map((t) => t._id) } });
      tasks.forEach((t) => record(req.userId, t, "deleted"));
      return res.json({ deleted: tasks.map((t) => t._id) });
    }

    const changes = pickEditable(req.body.changes);
    const allowed = ["status", "priority", "project", "dueDate", "assignee"];
    for (const k of Object.keys(changes)) if (!allowed.includes(k)) delete changes[k];

    const spawned = [];
    for (const task of tasks) {
      const next = await applyUpdates(task, changes, req.user);
      if (next) spawned.push(next);
    }
    const updated = await withPeople(Task.find({ _id: { $in: tasks.map((t) => t._id) } }));
    res.json({ updated, spawned });
  } catch (err) {
    fail(res, err);
  }
}

// POST /tasks/:id/time  { seconds }  — focus timer sessions
async function logTime(req, res) {
  try {
    const seconds = Math.round(Number(req.body.seconds));
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 12 * 3600) {
      return res.status(400).json({ message: "Time must be between 1 second and 12 hours" });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ...(await taskAccessFilter(req.userId)) },
      { $inc: { timeSpent: seconds } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(await withPeople(Task.findById(task._id)));
  } catch (err) {
    fail(res, err);
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask, reorderTasks, bulkTasks, logTime, HttpError };
