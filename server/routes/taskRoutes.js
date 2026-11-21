const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  reorderTasks,
  bulkTasks,
  logTime,
} = require("../controllers/taskController");
const comments = require("../controllers/commentController");
const auth = require("../middleware/auth");

const router = express.Router();

// Every task route requires a logged-in user
router.use(auth);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/reorder", reorderTasks); // must come before /:id
router.post("/bulk", bulkTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/time", logTime);
router.get("/:id/comments", comments.list);
router.post("/:id/comments", comments.create);
router.delete("/:id/comments/:commentId", comments.remove);

module.exports = router;
