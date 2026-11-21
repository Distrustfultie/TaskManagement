const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./db");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const notifications = require("./routes/notificationRoutes");
const cron = require("node-cron");
const projectRoutes = require("./routes/projectRoutes");
const activityRoutes = require("./routes/activityRoutes");
const habitRoutes = require("./routes/habitRoutes");
const Task = require("./models/Task");
const sendEmail = require("./utils/sendEmail");
const { shiftDate } = require("./utils/recurrence");

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://efe-task-manager.vercel.app',
  // Extra origins, comma-separated (e.g. preview deploys or another local port)
  ...(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 👇 THIS LINE FIXES THE PREFLIGHT ISSUE
app.options('*', cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notifications);
app.use("/api/projects", projectRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/habits", habitRoutes);

// Reminder emails, checked every minute. Repeating reminders are rescheduled
// in the database (not in memory), so they survive restarts.
const REPEAT_STEP = { Daily: "daily", Weekly: "weekly", Monthly: "monthly" };

cron.schedule("* * * * *", async () => {
  try {
    // Only owned, unfinished tasks: legacy tasks with no user are skipped
    const tasks = await Task.find({
      reminderSent: false,
      reminderTime: { $nin: ["", null] },
      status: { $ne: "Done" },
      user: { $exists: true },
    });
    const now = new Date();

    for (const task of tasks) {
      try {
        const reminderDate = new Date(task.reminderTime);
        if (Number.isNaN(reminderDate.getTime()) || now < reminderDate) continue;

        await sendEmail(
          task.email,
          `Reminder: ${task.title}`,
          `Don't forget: ${task.title} is due on ${task.dueDate}.`
        );

        const step = REPEAT_STEP[task.reminderFrequency];
        let next = step ? shiftDate(task.reminderTime, step) : null;
        // Skip occurrences missed while the server was asleep
        while (next && new Date(next) <= now) next = shiftDate(next, step);

        await Task.updateOne(
          { _id: task._id },
          next ? { $set: { reminderTime: next } } : { $set: { reminderSent: true } }
        );
      } catch (err) {
        console.error(`Reminder failed for task ${task._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Error processing reminders:", error);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));