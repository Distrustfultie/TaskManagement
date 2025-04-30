const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: String, required: true },
  category: { type: String, default: "General" },
  priority: { type: String, default: "Normal" },
  reminderTime: { type: String, default: "" },
  reminderFrequency: { type: String, default: "once" },
  email: { type: String, required: true },
    status: {
      type: String,
      enum: ['To Do','In Progress','Done'],
      default: 'To Do',
      required: true
    },
  reminderSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Task", taskSchema);