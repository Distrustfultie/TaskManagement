const Project = require("../models/Project");

/** Ids of every project the user belongs to (owner or member). */
async function projectIdsFor(userId) {
  return Project.find({ "members.user": userId }).distinct("_id");
}

/**
 * Mongo filter for the tasks a user may see and change: tasks they created,
 * plus every task in a project they're a member of.
 */
async function taskAccessFilter(userId) {
  const ids = await projectIdsFor(userId);
  return { $or: [{ user: userId }, { project: { $in: ids } }] };
}

module.exports = { projectIdsFor, taskAccessFilter };
