/** Compact radio group styled as a segmented control. */
export default function Segmented({ options, value, onChange, label, size = "md", renderOption }) {
  const h = size === "sm" ? "h-8 text-[13px]" : "h-9 text-sm";
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg border border-line bg-subtle p-0.5">
      {options.map((opt) => {
        const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${h} ${
                active ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
              }`}
          >
            {renderOption ? renderOption(o, active) : o.label}
          </button>
        );
      })}
    </div>
  );
}
