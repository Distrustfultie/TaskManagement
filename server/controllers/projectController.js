const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const Activity = require("../models/Activity");
const { notify, nameOf } = require("../utils/notify");

const MEMBER_FIELDS = "firstName lastName email";

function pick(body = {}) {
  const out = {};
  for (const k of ["name", "description", "color", "archived"]) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

const fail = (res, err) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid data" });
  }
  if (err.name === "CastError") return res.status(404).json({ message: "Project not found" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
};

/** Load a project the user belongs to, or send 404. */
async function loadForMember(req, res) {
  const project = await Project.findOne({ _id: req.params.id, "members.user": req.userId }).populate(
    "members.user",
    MEMBER_FIELDS
  );
  if (!project) res.status(404).json({ message: "Project not found" });
  return project;
}

// GET /api/projects
exports.list = async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.userId })
      .sort({ createdAt: 1 })
      .populate("members.user", MEMBER_FIELDS);
    res.json(projects);
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/projects
exports.create = async (req, res) => {
  try {
    const fields = pick(req.body);
    if (!fields.name || !String(fields.name).trim()) {
      return res.status(400).json({ message: "Give the project a name" });
    }
    const project = await Project.create({
      ...fields,
      owner: req.userId,
      members: [{ user: req.userId, role: "owner" }],
    });
    await project.populate("members.user", MEMBER_FIELDS);
    res.status(201).json(project);
  } catch (err) {
    fail(res, err);
  }
};

// PUT /api/projects/:id  (any member may rename/recolour; only the owner may archive)
exports.update = async (req, res) => {
  try {
    const project = await loadForMember(req, res);
    if (!project) return;
    const fields = pick(req.body);
    if (fields.archived !== undefined && !project.isOwner(req.userId)) {
      return res.status(403).json({ message: "Only the project owner can archive it" });
    }
    Object.assign(project, fields);
    await project.save();
    res.json(project);
  } catch (err) {
    fail(res, err);
  }
};

// DELETE /api/projects/:id  (owner only; tasks are kept and moved out of the project)
exports.remove = async (req, res) => {
  try {
    const project = await loadForMember(req, res);
    if (!project) return;
    if (!project.isOwner(req.userId)) {
      return res.status(403).json({ message: "Only the project owner can delete it" });
    }
    await Task.updateMany({ project: project._id }, { $set: { project: null, assignee: null } });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/projects/:id/members  { email }  (owner only)
exports.addMember = async (req, res) => {
  try {
    const project = await loadForMember(req, res);
    if (!project) return;
    if (!project.isOwner(req.userId)) {
      return res.status(403).json({ message: "Only the project owner can add members" });
    }
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Enter an email address" });

    const user = await User.findOne({ email }).select(MEMBER_FIELDS);
    if (!user) {
      return res.status(404).json({ message: "No Efes Manager account uses that email. Ask them to sign up first." });
    }
    if (project.isMember(user._id)) return res.status(409).json({ message: "They're already a member" });
    if (project.members.length >= 50) return res.status(400).json({ message: "A project can have up to 50 members" });

    project.members.push({ user: user._id, role: "member" });
    await project.save();
    await project.populate("members.user", MEMBER_FIELDS);

    Activity.create({ actor: req.userId, project: project._id, type: "member_added", meta: { name: nameOf(user) } }).catch(() => {});
    notify({
      to: user._id,
      actor: req.user,
      type: "member_added",
      message: `${nameOf(req.user)} added you to the project “${project.name}”`,
      project: project._id,
    });
    res.status(201).json(project);
  } catch (err) {
    fail(res, err);
  }
};

// DELETE /api/projects/:id/members/:userId  (owner removes anyone; a member may leave)
exports.removeMember = async (req, res) => {
  try {
    const project = await loadForMember(req, res);
    if (!project) return;
    const target = req.params.userId;
    const self = String(target) === String(req.userId);
    if (!self && !project.isOwner(req.userId)) {
      return res.status(403).json({ message: "Only the project owner can remove members" });
    }
    if (project.isOwner(target)) {
      return res.status(400).json({ message: "The owner can't leave their own project. Delete it instead." });
    }
    const member = project.members.find((m) => String(m.user._id ?? m.user) === String(target));
    if (!member) return res.status(404).json({ message: "Not a member" });

    project.members = project.members.filter((m) => m !== member);
    await project.save();
    // Their assignments in this project no longer make sense
    await Task.updateMany({ project: project._id, assignee: target }, { $set: { assignee: null } });

    Activity.create({
      actor: req.userId,
      project: project._id,
      type: "member_removed",
      meta: { name: nameOf(member.user), left: self },
    }).catch(() => {});
    res.json(project);
  } catch (err) {
    fail(res, err);
  }
};

exports.loadForMember = loadForMember;
exports.MEMBER_FIELDS = MEMBER_FIELDS;
exports.fail = fail;
