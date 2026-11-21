import axios from "axios";

// One place for the backend URL. Set VITE_API_URL per environment
// (e.g. in client/.env.local); falls back to the deployed API.
export const API_BASE = (
  import.meta.env.VITE_API_URL || "https://taskmanagement-n1tx.onrender.com"
).replace(/\/+$/, "");

export const http = axios.create({ baseURL: API_BASE, timeout: 20000 });

// Attach the JWT saved at login to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 on a protected call means the session is gone: let AuthContext log out
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.startsWith("/api/auth/login")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

/** Turn any request error into a message a person can read. */
export function getErrorMessage(error, fallback = "Something went wrong") {
  if (error?.code === "ECONNABORTED") return "The server took too long to respond. Try again.";
  if (error?.response) {
    const data = error.response.data;
    return data?.message || data?.error || fallback;
  }
  if (error?.request) return "Can't reach the server. Check your connection.";
  return error?.message || fallback;
}

/* ---------- Auth ---------- */
export const authApi = {
  login: (body) => http.post("/api/auth/login", body).then((r) => r.data),
  register: (body) => http.post("/api/auth/register", body).then((r) => r.data),
  me: () => http.get("/api/auth/me").then((r) => r.data),
  forgot: (email) => http.post("/api/auth/forgot", { email }).then((r) => r.data),
  reset: (token, password) => http.put("/api/auth/reset", { token, password }).then((r) => r.data),
};

/* ---------- User ---------- */
export const userApi = {
  me: () => http.get("/api/users/me").then((r) => r.data),
  update: (body) => http.put("/api/users/me", body).then((r) => r.data),
};

/* ---------- Tasks (these throw on failure; callers show the error) ---------- */
export const fetchTasks = () => http.get("/tasks").then((r) => r.data);
export const createTask = (task) => http.post("/tasks", task).then((r) => r.data);
export const updateTask = (id, task) => http.put(`/tasks/${id}`, task).then((r) => r.data);
export const deleteTask = (id) => http.delete(`/tasks/${id}`).then((r) => r.data);
export const reorderTasks = (items) => http.put("/tasks/reorder", { items }).then((r) => r.data);
export const bulkTasks = (ids, action, changes) => http.post("/tasks/bulk", { ids, action, changes }).then((r) => r.data);
export const logTaskTime = (id, seconds) => http.post(`/tasks/${id}/time`, { seconds }).then((r) => r.data);

/* ---------- Projects ---------- */
export const projectApi = {
  list: () => http.get("/api/projects").then((r) => r.data),
  create: (body) => http.post("/api/projects", body).then((r) => r.data),
  update: (id, body) => http.put(`/api/projects/${id}`, body).then((r) => r.data),
  remove: (id) => http.delete(`/api/projects/${id}`).then((r) => r.data),
  addMember: (id, email) => http.post(`/api/projects/${id}/members`, { email }).then((r) => r.data),
  removeMember: (id, userId) => http.delete(`/api/projects/${id}/members/${userId}`).then((r) => r.data),
};

/* ---------- Comments & activity ---------- */
export const commentApi = {
  list: (taskId) => http.get(`/tasks/${taskId}/comments`).then((r) => r.data),
  create: (taskId, text) => http.post(`/tasks/${taskId}/comments`, { text }).then((r) => r.data),
  remove: (taskId, commentId) => http.delete(`/tasks/${taskId}/comments/${commentId}`).then((r) => r.data),
};
export const activityApi = {
  list: (params) => http.get("/api/activity", { params }).then((r) => r.data),
};

/* ---------- Notifications (server-side: assignments, comments, invites) ---------- */
export const notificationApi = {
  list: () => http.get("/api/notifications").then((r) => r.data),
  read: (id) => http.put(`/api/notifications/${id}/read`).then((r) => r.data),
  readAll: () => http.put("/api/notifications/read-all").then((r) => r.data),
};

/* ---------- Habits ---------- */
export const habitApi = {
  list: () => http.get("/api/habits").then((r) => r.data),
  create: (body) => http.post("/api/habits", body).then((r) => r.data),
  update: (id, body) => http.put(`/api/habits/${id}`, body).then((r) => r.data),
  remove: (id) => http.delete(`/api/habits/${id}`).then((r) => r.data),
  toggle: (id, date, done) => http.post(`/api/habits/${id}/toggle`, { date, done }).then((r) => r.data),
};
