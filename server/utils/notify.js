const Notification = require("../models/Notifications");
const User = require("../models/User");
const sendEmail = require("./sendEmail");

/**
 * In-app notification (+ best-effort email) for another user.
 * Never notifies people about their own actions, and never throws.
 */
async function notify({ to, actor, type, message, task = null, project = null, email = true }) {
  try {
    if (!to || String(to) === String(actor?._id ?? actor)) return;
    await Notification.create({ user: to, actor: actor?._id ?? actor, type, message, task, project });
    if (email) {
      const user = await User.findById(to).select("email");
      if (user?.email) {
        const link = process.env.CLIENT_URL ? `\n\nOpen Efes Manager: ${process.env.CLIENT_URL}/dashboard` : "";
        sendEmail(user.email, message, `${message}${link}`);
      }
    }
  } catch (err) {
    console.error("notify failed:", err.message);
  }
}

const nameOf = (u) => (u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email : "Someone");

module.exports = { notify, nameOf };
