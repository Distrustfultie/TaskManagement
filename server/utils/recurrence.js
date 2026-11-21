// Shift a stored local date string ("2027-01-31" or "2027-01-31T09:30") by one
// recurrence step, without going through the server's time zone.
const RE = /^(\d{4})-(\d{2})-(\d{2})(T(\d{2}):(\d{2}))?/;
const pad = (n) => String(n).padStart(2, "0");

function shiftDate(value, recurrence) {
  const m = RE.exec(value || "");
  if (!m) return value;
  let y = +m[1];
  let mo = +m[2] - 1;
  let d = +m[3];

  if (recurrence === "daily" || recurrence === "weekly") {
    const dt = new Date(Date.UTC(y, mo, d + (recurrence === "daily" ? 1 : 7)));
    y = dt.getUTCFullYear();
    mo = dt.getUTCMonth();
    d = dt.getUTCDate();
  } else if (recurrence === "monthly") {
    mo += 1;
    if (mo > 11) {
      mo = 0;
      y += 1;
    }
    const lastDay = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    d = Math.min(d, lastDay); // Jan 31 -> Feb 28/29
  } else {
    return value;
  }
  return `${y}-${pad(mo + 1)}-${pad(d)}${m[4] ? `T${m[5]}:${m[6]}` : ""}`;
}

module.exports = { shiftDate };
