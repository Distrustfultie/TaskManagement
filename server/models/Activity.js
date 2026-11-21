const mongoose = require("mongoose");

// One entry in a task/project history feed ("Ada completed “Ship v2”").
const activitySchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null, index: true },
  taskTitle: { type: String, default: "" },
  type: {
    type: String,
    enum: ["created", "completed", "reopened", "updated", "assigned", "moved", "commented", "deleted", "member_added", "member_removed"],
    required: true,
  },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("Activity", activitySchema);
