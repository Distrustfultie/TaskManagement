import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { useAuth } from "./AuthContext";
import { useTasks } from "./TasksContext";
import { useProjects } from "./ProjectsContext";
import { notificationApi } from "../services/api";
import { isDone, isOverdue, parseDate, byDueDate } from "../utils/dates";

const NotificationContext = createContext(null);

const KINDS = {
  overdue: { label: "Overdue", text: (t) => `“${t.title}” is overdue` },
  today: { label: "Due today", text: (t) => `“${t.title}” is due today` },
  tomorrow: { label: "Due tomorrow", text: (t) => `“${t.title}” is due tomorrow` },
};

/**
 * Two sources:
 *  - team: stored on the server (someone assigned you a task, commented, added you to a project)
 *  - due-date alerts derived from your tasks (overdue / today / tomorrow); read state kept in this browser
 */
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { tasks, refresh: refreshTasks } = useTasks();
  const { refresh: refreshProjects } = useProjects();
  const storageKey = `notifications-read:${user?._id ?? "anon"}`;

  const [readIds, setReadIds] = useState(() => new Set());
  const [team, setTeam] = useState([]);

  useEffect(() => {
    try {
      setReadIds(new Set(JSON.parse(localStorage.getItem(storageKey) || "[]")));
    } catch {
      setReadIds(new Set());
    }
  }, [storageKey]);

  // Server notifications: load now and poll every minute. New unread items
  // usually mean shared data changed (an assignment, a new project), so refresh.
  const lastUnread = useRef(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      notificationApi
        .list()
        .then((d) => {
          if (!alive) return;
          setTeam(d);
          const unread = d.filter((n) => !n.read).length;
          if (lastUnread.current !== null && unread > lastUnread.current) {
            refreshTasks();
            refreshProjects();
          }
          lastUnread.current = unread;
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [refreshTasks, refreshProjects]);

  const persist = useCallback(
    (set) => {
      setReadIds(set);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...set].slice(-500)));
      } catch {
        /* storage unavailable: read state lasts for this visit only */
      }
    },
    [storageKey]
  );

  const alerts = useMemo(() => {
    const list = [];
    for (const task of [...tasks].sort(byDueDate)) {
      if (isDone(task)) continue;
      const d = parseDate(task.dueDate);
      if (!d) continue;
      let kind = null;
      if (isOverdue(task)) kind = "overdue";
      else if (isToday(d)) kind = "today";
      else if (isTomorrow(d)) kind = "tomorrow";
      if (!kind) continue;
      const id = `${task._id}:${kind}:${format(d, "yyyy-MM-dd")}`;
      list.push({ id, kind, label: KINDS[kind].label, message: KINDS[kind].text(task), task, date: d, read: readIds.has(id) });
    }
    return list;
  }, [tasks, readIds]);

  const teamItems = useMemo(
    () =>
      team.map((n) => ({
        id: n._id,
        kind: "team",
        type: n.type,
        message: n.message,
        actor: n.actor,
        taskId: n.task,
        projectId: n.project,
        date: new Date(n.createdAt),
        read: n.read,
        server: true,
      })),
    [team]
  );

  const notifications = useMemo(() => [...teamItems, ...alerts], [teamItems, alerts]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    const item = notifications.find((n) => n.id === id);
    if (!item || item.read) return;
    if (item.server) {
      setTeam((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      notificationApi.read(id).catch(() => {});
    } else {
      persist(new Set([...readIds, id]));
    }
  };

  const markAllAsRead = () => {
    persist(new Set([...readIds, ...alerts.map((n) => n.id)]));
    if (team.some((n) => !n.read)) {
      setTeam((prev) => prev.map((n) => ({ ...n, read: true })));
      notificationApi.readAll().catch(() => {});
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
