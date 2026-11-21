import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import TaskFormModal from "../components/tasks/TaskFormModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useTasks } from "./TasksContext";

const TaskFormContext = createContext(null);

const isTyping = (el) =>
  el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

/**
 * Owns the one task form + delete confirmation for the whole dashboard, so any
 * page (or the header button, or the "N" shortcut) can open them.
 */
export function TaskFormProvider({ children }) {
  const { deleteTask } = useTasks();
  const [state, setState] = useState({ open: false, task: null, defaults: null });
  const [toDelete, setToDelete] = useState(null);

  const openNew = useCallback((defaults = null) => setState({ open: true, task: null, defaults }), []);
  const openEdit = useCallback((task) => setState({ open: true, task, defaults: null }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const confirmDelete = useCallback((task) => setToDelete(task), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(document.activeElement) || document.querySelector("[role=dialog]")) return;
      e.preventDefault();
      openNew();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openNew]);

  const value = useMemo(() => ({ openNew, openEdit, confirmDelete }), [openNew, openEdit, confirmDelete]);

  return (
    <TaskFormContext.Provider value={value}>
      {children}
      <TaskFormModal
        open={state.open}
        task={state.task}
        defaults={state.defaults}
        onClose={close}
        onRequestDelete={(task) => {
          close();
          setToDelete(task);
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteTask(toDelete._id)}
        title="Delete this task?"
        description={toDelete ? `“${toDelete.title}” will be permanently deleted.` : undefined}
        confirmLabel="Delete task"
      />
    </TaskFormContext.Provider>
  );
}

export const useTaskForm = () => useContext(TaskFormContext);
