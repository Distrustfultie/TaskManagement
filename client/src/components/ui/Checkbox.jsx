import { Check } from "lucide-react";

/** Custom checkbox with a real (visually hidden) input for keyboard + screen readers. */
export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  ariaLabel,
  id,
  tone = "primary",
  disabled = false,
  className = "",
  boxClassName = "",
  labelClassName = "text-sm text-ink",
}) {
  const fill = tone === "done" ? "bg-status-done border-status-done" : "bg-primary border-primary";
  return (
    <label className={`inline-flex items-start gap-2.5 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}>
      <span className="relative mt-px inline-flex">
        <input
          id={id}
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-[inherit] opacity-0"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={ariaLabel}
        />
        <span
          aria-hidden="true"
          className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] transition-colors
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface ${
              checked ? `${fill} text-white` : "border-line-strong bg-surface text-transparent peer-hover:border-faint"
            } ${boxClassName}`}
        >
          <Check size={12} strokeWidth={3.5} />
        </span>
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className={`block ${labelClassName}`}>{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-faint">{description}</span>}
        </span>
      )}
    </label>
  );
}
