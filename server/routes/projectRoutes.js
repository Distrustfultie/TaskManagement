const express = require("express");
const auth = require("../middleware/auth");
const projects = require("../controllers/projectController");

const router = express.Router();
router.use(auth);

router.get("/", projects.list);
router.post("/", projects.create);
router.put("/:id", projects.update);
router.delete("/:id", projects.remove);
router.post("/:id/members", projects.addMember);
router.delete("/:id/members/:userId", projects.removeMember);

module.exports = router;
