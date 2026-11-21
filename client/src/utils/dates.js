import {
  differenceInCalendarDays,
  endOfWeek,
  format,
  isSameYear,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO,
} from "date-fns";

/** Parse a stored due date ("2027-01-05", "2027-01-05T10:00", or full ISO) as local time. */
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const d = parseISO(String(value));
  if (isValid(d)) return d;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

/** Value for <input type="datetime-local"> */
export function toInputValue(value) {
  const d = parseDate(value);
  return d ? format(d, "yyyy-MM-dd'T'HH:mm") : "";
}

const hasTime = (d) => d.getHours() !== 0 || d.getMinutes() !== 0;

/** "Today, 2:30 PM" · "Tomorrow" · "Mon, Jan 5" · "Jan 5, 2028" */
export function formatDue(value) {
  const d = parseDate(value);
  if (!d) return "";
  const time = hasTime(d) ? `, ${format(d, "p")}` : "";
  if (isToday(d)) return `Today${time}`;
  if (isTomorrow(d)) return `Tomorrow${time}`;
  if (isYesterday(d)) return `Yesterday${time}`;
  const diff = differenceInCalendarDays(d, new Date());
  if (diff > 0 && diff < 7) return `${format(d, "EEEE")}${time}`;
  return isSameYear(d, new Date()) ? `${format(d, "EEE, MMM d")}${time}` : format(d, "MMM d, yyyy");
}

export const isDone = (task) => task.status === "Done";

export function isOverdue(task) {
  if (isDone(task)) return false;
  const d = parseDate(task.dueDate);
  if (!d) return false;
  // A date-only task is overdue once its day has passed; a timed one once its time has.
  return hasTime(d) ? d < new Date() : differenceInCalendarDays(d, new Date()) < 0;
}

export const byDueDate = (a, b) =>
  (parseDate(a.dueDate)?.getTime() ?? Infinity) - (parseDate(b.dueDate)?.getTime() ?? Infinity);

export const TASK_GROUPS = ["Overdue", "Today", "Tomorrow", "This week", "Later", "No date", "Completed"];

/** Bucket tasks for the list view; each bucket sorted by due date. */
export function groupTasks(tasks) {
  const groups = Object.fromEntries(TASK_GROUPS.map((g) => [g, []]));
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  for (const task of tasks) {
    const d = parseDate(task.dueDate);
    let group;
    if (isDone(task)) group = "Completed";
    else if (!d) group = "No date";
    else if (isOverdue(task)) group = "Overdue";
    else if (isToday(d)) group = "Today";
    else if (isTomorrow(d)) group = "Tomorrow";
    else if (d <= weekEnd) group = "This week";
    else group = "Later";
    groups[group].push(task);
  }
  for (const g of TASK_GROUPS) groups[g].sort(byDueDate);
  return TASK_GROUPS.filter((g) => groups[g].length).map((g) => ({ name: g, tasks: groups[g] }));
}

/** 95 -> "1m", 3720 -> "1h 2m" */
export function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return m ? `${h}h ${m}m` : `${h}h`;
  if (m) return `${m}m`;
  return s ? `${s}s` : "0m";
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
