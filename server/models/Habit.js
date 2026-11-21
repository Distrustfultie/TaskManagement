const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    color: { type: String, enum: ["blue", "orange", "aqua", "yellow", "magenta", "green", "violet", "red"], default: "aqua" },
    // Days the habit was done, as local "yyyy-MM-dd" strings
    log: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
