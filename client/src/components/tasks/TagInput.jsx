import { useState } from "react";
import { X } from "lucide-react";

const clean = (s) => s.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-").slice(0, 30);

/** Chip input: Enter or comma adds, Backspace on empty removes the last tag. */
export default function TagInput({ id, value, onChange, suggestions = [], max = 10 }) {
  const [draft, setDraft] = useState("");

  const add = (raw) => {
    const tag = clean(raw);
    if (tag && !value.includes(tag) && value.length < max) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-subtle py-0.5 pl-2 pr-1 text-xs font-medium text-ink">
          #{t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="rounded p-0.5 text-faint hover:bg-line hover:text-ink"
            aria-label={`Remove tag ${t}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        list={`${id}-suggestions`}
        className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-faint focus:outline-none"
        placeholder={value.length ? "" : "Add tags, e.g. urgent, client"}
        value={draft}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
        disabled={value.length >= max}
      />
      <datalist id={`${id}-suggestions`}>
        {suggestions
          .filter((s) => !value.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  );
}
