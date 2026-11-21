import { ArrowDown, ArrowUp, Equal } from "lucide-react";
import { projectColor } from "./projects";

// Shared option lists for the custom <Select>
const STATUS_TOKEN = { "To Do": "todo", "In Progress": "progress", Done: "done" };

export const STATUS_OPTIONS = ["To Do", "In Progress", "Done"].map((s) => ({
  value: s,
  label: s,
  dot: `rgb(var(--status-${STATUS_TOKEN[s]}))`,
}));

export const PRIORITY_OPTIONS = [
  { value: "High", label: "High", icon: ArrowUp },
  { value: "Medium", label: "Medium", icon: Equal },
  { value: "Low", label: "Low", icon: ArrowDown },
];

export const projectOptions = (projects) => projects.map((p) => ({ value: p._id, label: p.name, dot: projectColor(p.color) }));

export const FREQUENCY_OPTIONS = [
  { value: "Daily", label: "Every day" },
  { value: "Weekly", label: "Every week" },
  { value: "Monthly", label: "Every month" },
];
