import { Square, Timer } from "lucide-react";
import { useFocus } from "../../context/FocusContext";

const clock = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/** Header indicator for the running focus session. */
export default function FocusPill() {
  const { session, elapsed, stop } = useFocus();
  if (!session) return null;
  const shown = session.minutes ? Math.max(0, session.minutes * 60 - elapsed) : elapsed;

  return (
    <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface pl-2.5 pr-1 shadow-xs" role="timer" aria-live="off">
      <Timer size={15} className="animate-pulse text-primary" />
      <span className="hidden max-w-[10rem] truncate text-[13px] text-muted md:inline" title={session.title}>
        {session.title}
      </span>
      <span className="font-medium tabular-nums text-ink">{clock(shown)}</span>
      <button onClick={() => stop()} className="btn btn-ghost btn-icon btn-sm h-7 w-7" aria-label="Stop focus session and save time" title="Stop and save">
        <Square size={13} fill="currentColor" />
      </button>
    </div>
  );
}
