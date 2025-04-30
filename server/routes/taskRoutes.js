const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.post("/", createTask); // Create task
router.get("/", getTasks); // Get all tasks
router.put("/:id", updateTask); // Update task
router.delete("/:id", deleteTask); // Delete task

module.exports = router;