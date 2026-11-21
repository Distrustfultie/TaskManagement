import { useState } from "react";

/**
 * Single-series column chart. data: [{ key, label, short, value }]
 * One hue, 4px rounded data-ends on a shared baseline, 2px gaps, recessive
 * grid, per-bar hover/focus tooltip, and an equivalent table for screen readers.
 */
export default function BarChart({ data, height = 160, unit = "", format = (v) => v, caption, color = "rgb(var(--proj-blue))" }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = max <= 4 ? max : Math.ceil(max / 2) * 2;
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <figure className="relative">
      <div className="relative" style={{ height }}>
        {/* Grid: baseline + midline + top, recessive */}
        {[0, 0.5, 1].map((f) => (
          <div key={f} className="pointer-events-none absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${f * 100}%` }}>
            <span className="w-6 -translate-y-1/2 text-right text-[10px] tabular-nums text-faint">{f === 0 ? "" : format(Math.round(nice * f))}</span>
            <div className={`h-px flex-1 ${f === 0 ? "bg-line-strong" : "bg-line/70"}`} />
          </div>
        ))}

        <div className="absolute inset-y-0 left-8 right-0 flex items-end gap-[2px]">
          {data.map((d, i) => {
            const h = (d.value / nice) * 100;
            const active = hover === i;
            return (
              <button
                key={d.key}
                type="button"
                className="group relative flex h-full flex-1 items-end justify-center focus-visible:outline-none"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${d.label}: ${format(d.value)}${unit}`}
              >
                <span
                  className="block w-full max-w-[22px] rounded-t-[4px] transition-opacity group-focus-visible:ring-2 group-focus-visible:ring-primary/40"
                  style={{
                    height: d.value ? `max(${h}%, 3px)` : 0,
                    background: color,
                    opacity: hover === null || active ? 1 : 0.45,
                  }}
                />
                {active && (
                  <span
                    className="pointer-events-none absolute z-10 -translate-y-2 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-xs shadow-pop"
                    style={{ bottom: `${Math.min(h, 100)}%` }}
                  >
                    <span className="block text-faint">{d.label}</span>
                    <span className="font-semibold tabular-nums text-ink">
                      {format(d.value)}
                      {unit}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ml-8 mt-1.5 flex gap-[2px]" aria-hidden="true">
        {data.map((d, i) => {
          // Sparse labels are allowed to overflow their narrow slot, centered on the bar
          const show = i % labelEvery === 0 || (i === data.length - 1 && (data.length - 1) % labelEvery >= labelEvery / 2);
          return (
            <span key={d.key} className="flex min-w-0 flex-1 justify-center text-[10px] text-faint">
              {show && <span className="whitespace-nowrap">{d.short}</span>}
            </span>
          );
        })}
      </div>

      <table className="sr-only">
        {caption && <caption>{caption}</caption>}
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>
                {format(d.value)}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
