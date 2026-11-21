const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const { taskAccessFilter } = require("../utils/access");
const { notify, nameOf } = require("../utils/notify");

const USER_FIELDS = "firstName lastName email";

async function loadTask(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, ...(await taskAccessFilter(req.userId)) });
    if (!task) res.status(404).json({ message: "Task not found" });
    return task;
  } catch {
    res.status(404).json({ message: "Task not found" });
    return null;
  }
}

// GET /tasks/:id/comments
exports.list = async (req, res) => {
  const task = await loadTask(req, res);
  if (!task) return;
  try {
    const comments = await Comment.find({ task: task._id }).sort({ createdAt: 1 }).populate("user", USER_FIELDS);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /tasks/:id/comments  { text }
exports.create = async (req, res) => {
  const task = await loadTask(req, res);
  if (!task) return;
  try {
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Write something first" });
    if (text.length > 2000) return res.status(400).json({ message: "Comments can be up to 2000 characters" });

    const comment = await Comment.create({ task: task._id, user: req.userId, text });
    await Task.updateOne({ _id: task._id }, { $inc: { commentCount: 1 } });
    await comment.populate("user", USER_FIELDS);

    Activity.create({
      actor: req.userId,
      task: task._id,
      project: task.project,
      taskTitle: task.title,
      type: "commented",
      meta: { excerpt: text.slice(0, 120) },
    }).catch(() => {});

    // Let the creator and the assignee know (never the commenter themself)
    const recipients = new Set([String(task.user), task.assignee && String(task.assignee)].filter(Boolean));
    for (const to of recipients) {
      notify({
        to,
        actor: req.user,
        type: "comment",
        message: `${nameOf(req.user)} commented on “${task.title}”`,
        task: task._id,
        project: task.project,
        email: false,
      });
    }
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /tasks/:id/comments/:commentId  (author only)
exports.remove = async (req, res) => {
  const task = await loadTask(req, res);
  if (!task) return;
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, task: task._id, user: req.userId });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    await Task.updateOne({ _id: task._id, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
    res.json({ message: "Comment deleted" });
  } catch {
    res.status(404).json({ message: "Comment not found" });
  }
};
