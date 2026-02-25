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
const Task = require("./models/Task");
const sendEmail = require("./utils/sendEmail");

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://efe-task-manager.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notifications);

// Cron job to send reminders
cron.schedule("* * * * *", async () => {
  try {
    const tasks = await Task.find({ reminderSent: false });
    const now = new Date();

    tasks.forEach(async (task) => {
      const reminderDate = new Date(task.reminderTime);
      if (now >= reminderDate) {
        await sendEmail(
          task.email,
          `Reminder: ${task.title}`,
          `Don't forget: ${task.title} is due on ${task.dueDate}.`
        );

        // Update task to mark reminder as sent
        task.reminderSent = true;
        await task.save();
      }
    });
  } catch (error) {
    console.error("Error processing reminders:", error);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));