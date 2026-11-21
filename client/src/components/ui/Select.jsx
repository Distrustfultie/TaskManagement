import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { useLayer } from "../../utils/layers";

/**
 * Custom dropdown (WAI-ARIA listbox). Options: string | { value, label, icon?, dot?, description?, disabled? }
 * Keyboard: ↑ ↓ Home End to move, Enter/Space to pick, Esc to close, type to jump.
 * With `placeholder` and a value that matches nothing it doubles as an action menu.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
  ariaLabel,
  size = "md",
  disabled = false,
  className = "",
  minWidth = 0,
  align = "start",
  invalid = false,
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const selected = opts.find((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", t: 0 });
  const listId = useId();

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  useLayer(open, () => close(true));

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const height = Math.min(300, opts.length * 38 + 10);
    const below = window.innerHeight - r.bottom;
    const up = below < height + 12 && r.top > below;
    const width = Math.max(r.width, minWidth);
    let left = align === "end" ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setPos(up ? { left, width, bottom: window.innerHeight - r.top + 4 } : { left, width, top: r.bottom + 4 });
  }, [opts.length, minWidth, align]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!listRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", onDown, true);
    requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open, place, close]);

  useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const enabled = (i) => opts[i] && !opts[i].disabled;
  const move = (from, step) => {
    for (let i = from + step, n = 0; n < opts.length; i += step, n++) {
      const j = (i + opts.length) % opts.length;
      if (enabled(j)) return j;
    }
    return from;
  };

  const openList = () => {
    if (disabled) return;
    const idx = opts.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : move(-1, 1));
    setOpen(true);
  };

  const choose = (o) => {
    if (o.disabled) return;
    close(true);
    if (o.value !== value || !selected) onChange(o.value);
  };

  const onTriggerKey = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e) => {
    if (e.key === "ArrowDown") setActive((a) => move(a, 1));
    else if (e.key === "ArrowUp") setActive((a) => move(a, -1));
    else if (e.key === "Home") setActive(move(-1, 1));
    else if (e.key === "End") setActive(move(opts.length, -1));
    else if (e.key === "Enter" || e.key === " ") active >= 0 && choose(opts[active]);
    else if (e.key === "Tab") return close(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.t < 600 ? typed.current.text : "") + e.key.toLowerCase(), t: now };
      const hit = opts.findIndex((o) => !o.disabled && String(o.label).toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    } else return;
    e.preventDefault();
  };

  const h = size === "sm" ? "h-9 text-[13px]" : "h-10 text-sm";

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKey}
        className={`flex w-full items-center gap-2 rounded-lg border bg-surface px-3 text-left shadow-xs transition-[border-color,box-shadow]
          focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15
          disabled:cursor-not-allowed disabled:opacity-60 ${h} ${
            open ? "border-primary ring-4 ring-primary/15" : invalid ? "border-primary" : "border-line hover:border-line-strong"
          } ${className}`}
      >
        {selected?.dot && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: selected.dot }} />}
        {selected?.icon && <selected.icon size={15} className="shrink-0 text-faint" />}
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-ink" : "text-muted"}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onKeyDown={onListKey}
            className="scrollbar-thin fixed z-[70] max-h-[300px] overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-pop outline-none animate-[pop-in_120ms_ease-out]"
            style={pos}
          >
            {opts.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={String(o.value)}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled || undefined}
                  onMouseMove={() => !o.disabled && active !== i && setActive(i)}
                  onClick={() => choose(o)}
                  className={`flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                    o.disabled ? "cursor-not-allowed opacity-50" : ""
                  } ${i === active ? "bg-subtle text-ink" : "text-ink"}`}
                >
                  {o.dot && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: o.dot }} />}
                  {o.icon && <o.icon size={15} className="shrink-0 text-faint" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${isSel ? "font-medium" : ""}`}>{o.label}</span>
                    {o.description && <span className="block truncate text-xs text-faint">{o.description}</span>}
                  </span>
                  {isSel && <Check size={15} className="shrink-0 text-primary" strokeWidth={2.5} />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
