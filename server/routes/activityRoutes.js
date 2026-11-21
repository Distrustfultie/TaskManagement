const express = require("express");
const auth = require("../middleware/auth");
const { list } = require("../controllers/activityController");

const router = express.Router();
router.use(auth);
router.get("/", list);

module.exports = router;
