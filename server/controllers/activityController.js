const Activity = require("../models/Activity");
const Project = require("../models/Project");
const Task = require("../models/Task");
const { projectIdsFor, taskAccessFilter } = require("../utils/access");

// GET /api/activity?project=<id> | ?task=<id> | (none: everything you can see)
exports.list = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    let filter;

    if (req.query.project) {
      const member = await Project.exists({ _id: req.query.project, "members.user": req.userId });
      if (!member) return res.status(404).json({ message: "Project not found" });
      filter = { project: req.query.project };
    } else if (req.query.task) {
      const task = await Task.findOne({ _id: req.query.task, ...(await taskAccessFilter(req.userId)) }).select("_id");
      if (!task) return res.status(404).json({ message: "Task not found" });
      filter = { task: task._id };
    } else {
      const projectIds = await projectIdsFor(req.userId);
      filter = { $or: [{ project: { $in: projectIds } }, { actor: req.userId, project: null }] };
    }

    const items = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actor", "firstName lastName email");
    res.json(items);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ message: "Not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
