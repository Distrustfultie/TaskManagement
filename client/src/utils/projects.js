export const PROJECT_COLORS = ["blue", "orange", "aqua", "yellow", "magenta", "green", "violet", "red"];

/** CSS color for a project's color key (mode-aware via CSS variables). */
export const projectColor = (key) => `rgb(var(--proj-${PROJECT_COLORS.includes(key) ? key : "blue"}))`;

/** The id of a ref that may or may not be populated. */
export const refId = (ref) => (ref && typeof ref === "object" ? ref._id : ref) || null;

export const fullName = (u) => (u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email : "");
