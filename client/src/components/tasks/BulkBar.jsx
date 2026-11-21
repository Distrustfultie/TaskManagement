import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useTasks } from "../../context/TasksContext";
import { useProjects } from "../../context/ProjectsContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import Select from "../ui/Select";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, projectOptions } from "../../utils/options";

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
            {/* value="" never matches, so each Select acts as an action menu */}
            <div className="w-32">
              <Select size="sm" value="" placeholder="Status…" ariaLabel="Set status" minWidth={170} options={STATUS_OPTIONS} onChange={(v) => apply({ status: v })} />
            </div>
            <div className="w-32">
              <Select size="sm" value="" placeholder="Priority…" ariaLabel="Set priority" minWidth={170} options={PRIORITY_OPTIONS} onChange={(v) => apply({ priority: v })} />
            </div>
            <div className="w-36">
              <Select
                size="sm"
                value=""
                placeholder="Move to…"
                ariaLabel="Move to project"
                minWidth={220}
                options={[{ value: "none", label: "No project" }, ...projectOptions(active)]}
                onChange={(v) => apply({ project: v === "none" ? null : v })}
              />
            </div>
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
        icon={Trash2}
      />
    </>
  );
}
