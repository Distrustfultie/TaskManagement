const mongoose = require("mongoose");

const COLORS = ["blue", "orange", "aqua", "yellow", "magenta", "green", "violet", "red"];

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "member"], default: "member" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    color: { type: String, enum: COLORS, default: "blue" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ "members.user": 1 });

projectSchema.methods.isMember = function (userId) {
  return this.members.some((m) => String(m.user._id ?? m.user) === String(userId));
};
projectSchema.methods.isOwner = function (userId) {
  return String(this.owner._id ?? this.owner) === String(userId);
};

projectSchema.statics.COLORS = COLORS;

module.exports = mongoose.model("Project", projectSchema);
