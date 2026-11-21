/**
 * Ranked horizontal bars, one hue, largest first. rows: [{ key, label, value, swatch? }]
 * The name and figure carry the reading; the swatch only identifies (never color alone).
 */
export default function MeterList({ rows, format = (v) => v, empty = "Nothing to show yet", color = "rgb(var(--proj-blue))" }) {
  if (!rows.length) return <p className="py-6 text-center text-[13px] text-muted">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-center gap-2 text-[13px]">
            {r.swatch && <span className="h-2 w-2 shrink-0 rounded-[3px]" style={{ background: r.swatch }} aria-hidden="true" />}
            <span className="min-w-0 flex-1 truncate text-muted">{r.label}</span>
            <span className="font-medium tabular-nums text-ink">{format(r.value)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
