const express = require("express");
const auth = require("../middleware/auth");
const habits = require("../controllers/habitController");

const router = express.Router();
router.use(auth);

router.get("/", habits.list);
router.post("/", habits.create);
router.put("/:id", habits.update);
router.delete("/:id", habits.remove);
router.post("/:id/toggle", habits.toggle);

module.exports = router;
