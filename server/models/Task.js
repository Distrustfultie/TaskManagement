const mongoose = require("mongoose");

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  done: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    // Creator. Access = creator, or any member of the task's project.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 5000 },
    dueDate: { type: String, required: true },
    category: { type: String, default: "General" },
    priority: { type: String, default: "Medium" },
    tags: { type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }], default: [] },
    subtasks: { type: [subtaskSchema], default: [] },
    recurrence: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },

    reminderTime: { type: String, default: "" },
    reminderFrequency: { type: String, default: "once" },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
      required: true,
    },
    reminderSent: { type: Boolean, default: false },

    order: { type: Number, default: 0 }, // position within a board column
    completedAt: { type: Date, default: null },
    timeSpent: { type: Number, default: 0, min: 0 }, // seconds tracked with the focus timer
    commentCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
