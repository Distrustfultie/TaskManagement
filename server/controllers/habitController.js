const Habit = require("../models/Habit");

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const fail = (res, err) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid data" });
  }
  if (err.name === "CastError") return res.status(404).json({ message: "Habit not found" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
};

exports.list = async (req, res) => {
  try {
    res.json(await Habit.find({ user: req.userId }).sort({ createdAt: 1 }));
  } catch (err) {
    fail(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Give the habit a name" });
    if ((await Habit.countDocuments({ user: req.userId, archived: false })) >= 20) {
      return res.status(400).json({ message: "You can track up to 20 habits" });
    }
    res.status(201).json(await Habit.create({ user: req.userId, name, color: req.body.color }));
  } catch (err) {
    fail(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    for (const k of ["name", "color", "archived"]) if (req.body[k] !== undefined) habit[k] = req.body[k];
    await habit.save();
    res.json(habit);
  } catch (err) {
    fail(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/habits/:id/toggle  { date: "yyyy-MM-dd", done?: boolean }
exports.toggle = async (req, res) => {
  try {
    const date = String(req.body.date || "");
    if (!DAY.test(date)) return res.status(400).json({ message: "Invalid date" });
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const has = habit.log.includes(date);
    const done = req.body.done === undefined ? !has : !!req.body.done;
    if (done && !has) habit.log.push(date);
    if (!done && has) habit.log = habit.log.filter((d) => d !== date);
    habit.log.sort();
    if (habit.log.length > 3000) habit.log = habit.log.slice(-3000);
    await habit.save();
    res.json(habit);
  } catch (err) {
    fail(res, err);
  }
};
