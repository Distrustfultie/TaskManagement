import { useState } from "react";
import { Plus, X } from "lucide-react";

let tempId = 0;

/** Checklist editor. Items: { _id?, key, title, done } */
export default function SubtaskEditor({ value, onChange }) {
  const [draft, setDraft] = useState("");
  const done = value.filter((s) => s.done).length;

  const add = () => {
    const title = draft.trim();
    if (!title || value.length >= 50) return;
    onChange([...value, { key: `new-${++tempId}`, title, done: false }]);
    setDraft("");
  };
  const update = (i, changes) => onChange(value.map((s, j) => (j === i ? { ...s, ...changes } : s)));

  return (
    <div className="rounded-xl border border-line">
      {value.length > 0 && (
        <>
          <div className="flex items-center gap-3 px-3 pt-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
              <div className="h-full rounded-full bg-status-done transition-[width]" style={{ width: `${(done / value.length) * 100}%` }} />
            </div>
            <span className="text-xs tabular-nums text-muted">
              {done}/{value.length}
            </span>
          </div>
          <ul className="px-1.5 pt-1.5">
            {value.map((s, i) => (
              <li key={s._id ?? s.key} className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-subtle/60">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[rgb(var(--status-done))]"
                  checked={s.done}
                  onChange={(e) => update(i, { done: e.target.checked })}
                  aria-label={`Mark “${s.title}” ${s.done ? "not done" : "done"}`}
                />
                <input
                  className={`min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-sm focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    s.done ? "text-faint line-through" : "text-ink"
                  }`}
                  value={s.title}
                  maxLength={200}
                  onChange={(e) => update(i, { title: e.target.value })}
                  aria-label="Subtask title"
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="rounded p-1 text-faint opacity-0 hover:bg-line hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={`Remove “${s.title}”`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex items-center gap-2 p-2">
        <Plus size={16} className="ml-1 shrink-0 text-faint" />
        <input
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-ink placeholder:text-faint focus:outline-none"
          placeholder={value.length ? "Add another step" : "Break it down into steps"}
          value={draft}
          maxLength={200}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          aria-label="New subtask"
        />
        {draft.trim() && (
          <button type="button" className="btn btn-secondary btn-sm h-7" onClick={add}>
            Add
          </button>
        )}
      </div>
    </div>
  );
}
