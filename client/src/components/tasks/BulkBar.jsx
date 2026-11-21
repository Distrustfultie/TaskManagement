import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useTasks } from "../../context/TasksContext";
import { useProjects } from "../../context/ProjectsContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import { PRIORITIES, STATUSES } from "../ui/Badges";

/** Floating action bar for the selected tasks. */
export default function BulkBar({ selected, onClear }) {
  const { bulkTasks } = useTasks();
  const { active } = useProjects();
  const [confirm, setConfirm] = useState(false);
  const ids = [...selected];
  const n = ids.length;

  const apply = async (changes) => {
    try {
      await bulkTasks(ids, "update", changes);
      onClear();
    } catch {
      /* toast shown */
    }
  };

  const selectCls = "input h-8 w-auto py-0 pl-2.5 text-[13px]";

  return (
    <>
      <AnimatePresence>
        {n > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-2 pl-4 shadow-pop sm:inset-x-6"
            role="toolbar"
            aria-label="Bulk actions"
          >
            <span className="mr-1 text-[13px] font-semibold text-ink">{n} selected</span>
            <select className={selectCls} value="" onChange={(e) => e.target.value && apply({ status: e.target.value })} aria-label="Set status">
              <option value="">Status…</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select className={selectCls} value="" onChange={(e) => e.target.value && apply({ priority: e.target.value })} aria-label="Set priority">
              <option value="">Priority…</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              className={selectCls}
              value=""
              onChange={(e) => e.target.value && apply({ project: e.target.value === "none" ? null : e.target.value })}
              aria-label="Move to project"
            >
              <option value="">Move to…</option>
              <option value="none">No project</option>
              {active.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-primary-ink hover:bg-primary-soft hover:text-primary-ink" onClick={() => setConfirm(true)}>
                <Trash2 size={15} /> Delete
              </button>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onClear} aria-label="Clear selection">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await bulkTasks(ids, "delete");
          onClear();
        }}
        title={`Delete ${n} task${n === 1 ? "" : "s"}?`}
        description="This can't be undone."
        confirmLabel="Delete"
      />
    </>
  );
}
