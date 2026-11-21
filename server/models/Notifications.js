const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['assigned', 'comment', 'member_added', 'general'], default: 'general' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
