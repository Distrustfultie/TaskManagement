const Task = require("../models/Task");
const sendEmail = require("../utils/sendEmail");
const cron = require("node-cron");

// Create a new task
async function createTask(req, res) {
  try {
    const { title, dueDate, email, reminderTime, reminderFrequency, status } = req.body;

    // Validate required fields
    if (!title || !dueDate || !email) {
      return res.status(400).json({ message: "Title, due date, and email are required." });
    }

    // Build task payload including status
    const taskData = { title, dueDate, email, reminderTime, reminderFrequency, status };
    const newTask = new Task(taskData);
    await newTask.save();

    // Schedule or send reminder
    if (reminderFrequency && reminderTime) {
      scheduleReminder(reminderTime, email, title, dueDate, reminderFrequency);
    } else if (reminderTime && new Date(reminderTime) > new Date()) {
      await sendEmail(
        email,
        "Task Reminder",
        `Reminder: Your task "${title}" is due on ${dueDate}.`
      );
    }

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

// Schedule recurring email reminders
function scheduleReminder(reminderTime, email, title, dueDate, frequency) {
  // Parse full ISO timestamp into hours and minutes
  const date = new Date(reminderTime);
  const hour = date.getHours();
  const minute = date.getMinutes();
  let cronExpression;

  if (frequency === "Daily") {
    // Every day at HH:MM
    cronExpression = `${minute} ${hour} * * *`;
  } else if (frequency === "Weekly") {
    // Every Monday at HH:MM
    cronExpression = `${minute} ${hour} * * 1`;
  } else if (frequency === "Monthly") {
    // 1st day of every month at HH:MM
    cronExpression = `${minute} ${hour} 1 * *`;
  } else {
    return;
  }

  cron.schedule(cronExpression, () => {
    sendEmail(
      email,
      "Task Reminder",
      `Reminder: Your task "${title}" is due on ${dueDate}.`
    );
  });
}

// Get all tasks
async function getTasks(req, res) {
  try {
    const { search, project, priority, dueDate } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (project) filter.project = project;
    if (priority) filter.priority = priority;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };

    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// Update a task
async function updateTask(req, res) {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

// Delete a task
async function deleteTask(req, res) {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };
