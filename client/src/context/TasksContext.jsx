import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import * as api from "../services/api";

const TasksContext = createContext(null);

/** Merge server task documents into the list (replace by id, append new ones). */
function mergeTasks(list, incoming) {
  if (!incoming.length) return list;
  const byId = new Map(incoming.map((t) => [t._id, t]));
  const merged = list.map((t) => byId.get(t._id) ?? t);
  const known = new Set(list.map((t) => t._id));
  for (const t of incoming) if (!known.has(t._id)) merged.push(t);
  return merged;
}

/** A save may return `_next`: the next occurrence of a recurring task. */
function splitNext(saved) {
  if (!saved?._next) return [saved, null];
  const { _next, ...task } = saved;
  return [task, _next];
}

/**
 * Single source of truth for every task the user can see (their own plus
 * shared projects). Mutations update local state so all views stay in sync.
 */
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await api.fetchTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(api.getErrorMessage(err, "Couldn't load your tasks"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const announceNext = (next) =>
    next && toast.success(`Next “${next.title}” scheduled`, { id: `next-${next._id}` });

  const createTask = useCallback(async (input) => {
    try {
      const [task, next] = splitNext(await api.createTask(input));
      setTasks((prev) => mergeTasks(prev, next ? [task, next] : [task]));
      toast.success("Task created");
      announceNext(next);
      return task;
    } catch (err) {
      toast.error(api.getErrorMessage(err, "Couldn't create the task"));
      throw err;
    }
  }, []);

  /** Optimistic update: the UI changes immediately and rolls back on failure. */
  const updateTask = useCallback(async (id, changes, { silent = false } = {}) => {
    const previous = tasksRef.current;
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...changes } : t)));
    try {
      const [saved, next] = splitNext(await api.updateTask(id, changes));
      setTasks((prev) => mergeTasks(prev, next ? [saved, next] : [saved]));
      if (!silent) toast.success("Task updated");
      announceNext(next);
      return saved;
    } catch (err) {
      setTasks(previous);
      toast.error(api.getErrorMessage(err, "Couldn't update the task"));
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    const previous = tasksRef.current;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await api.deleteTask(id);
      toast.success("Task deleted");
    } catch (err) {
      setTasks(previous);
      toast.error(api.getErrorMessage(err, "Couldn't delete the task"));
      throw err;
    }
  }, []);

  /** Board drag & drop: items = [{ id, order, status }] */
  const reorderTasks = useCallback(async (items) => {
    if (!items.length) return;
    const previous = tasksRef.current;
    const byId = new Map(items.map((i) => [i.id, i]));
    setTasks((prev) =>
      prev.map((t) => (byId.has(t._id) ? { ...t, order: byId.get(t._id).order, status: byId.get(t._id).status ?? t.status } : t))
    );
    try {
      const { updated, spawned } = await api.reorderTasks(items);
      setTasks((prev) => mergeTasks(prev, [...updated, ...spawned]));
      spawned.forEach(announceNext);
    } catch (err) {
      setTasks(previous);
      toast.error(api.getErrorMessage(err, "Couldn't move the task"));
    }
  }, []);

  /** Bulk update or delete. */
  const bulkTasks = useCallback(async (ids, action, changes) => {
    const previous = tasksRef.current;
    const idSet = new Set(ids);
    setTasks((prev) =>
      action === "delete" ? prev.filter((t) => !idSet.has(t._id)) : prev.map((t) => (idSet.has(t._id) ? { ...t, ...changes } : t))
    );
    try {
      const res = await api.bulkTasks(ids, action, changes);
      if (action !== "delete") {
        setTasks((prev) => mergeTasks(prev, [...res.updated, ...res.spawned]));
        res.spawned.forEach(announceNext);
      }
      const n = ids.length;
      toast.success(`${n} task${n === 1 ? "" : "s"} ${action === "delete" ? "deleted" : "updated"}`);
    } catch (err) {
      setTasks(previous);
      toast.error(api.getErrorMessage(err, "Couldn't update those tasks"));
      throw err;
    }
  }, []);

  const logTime = useCallback(async (id, seconds) => {
    try {
      const saved = await api.logTaskTime(id, seconds);
      setTasks((prev) => mergeTasks(prev, [saved]));
      return saved;
    } catch (err) {
      toast.error(api.getErrorMessage(err, "Couldn't save the tracked time"));
      throw err;
    }
  }, []);

  /** Drop every task of a project from local state (after project delete/leave). */
  const forgetProject = useCallback((projectId, { keepOwn = false, userId } = {}) => {
    setTasks((prev) =>
      prev
        .map((t) => (keepOwn && (t.project?._id ?? t.project) === projectId ? { ...t, project: null, assignee: null } : t))
        .filter((t) => keepOwn || (t.project?._id ?? t.project) !== projectId || (t.user?._id ?? t.user) === userId)
    );
  }, []);

  /** Local-only patch for server-maintained fields (e.g. commentCount). */
  const patchTask = useCallback((id, changes) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...(typeof changes === "function" ? changes(t) : changes) } : t)));
  }, []);

  const value = useMemo(
    () => ({ tasks, loading, error, refresh, createTask, updateTask, deleteTask, reorderTasks, bulkTasks, logTime, forgetProject, patchTask }),
    [tasks, loading, error, refresh, createTask, updateTask, deleteTask, reorderTasks, bulkTasks, logTime, forgetProject, patchTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export const useTasks = () => useContext(TasksContext);
