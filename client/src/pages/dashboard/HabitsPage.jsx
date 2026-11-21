import { useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, isToday, parseISO, startOfDay, subDays } from "date-fns";
import { Check, Flame, Plus, Repeat2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { habitApi, getErrorMessage } from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { PROJECT_COLORS, projectColor } from "../../utils/projects";

const key = (d) => format(d, "yyyy-MM-dd");

function streaks(log) {
  const set = new Set(log);
  const today = startOfDay(new Date());
  let current = 0;
  let cursor = set.has(key(today)) ? today : subDays(today, 1);
  while (set.has(key(cursor))) {
    current++;
    cursor = subDays(cursor, 1);
  }
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of [...set].sort()) {
    const day = parseISO(d);
    run = prev && differenceInCalendarDays(day, prev) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  const last30 = Array.from({ length: 30 }, (_, i) => key(subDays(today, i))).filter((d) => set.has(d)).length;
  return { current, best, rate: Math.round((last30 / 30) * 100) };
}

export default function HabitsPage() {
  const [habits, setHabits] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("aqua");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    habitApi
      .list()
      .then(setHabits)
      .catch((err) => {
        setHabits([]);
        toast.error(getErrorMessage(err, "Couldn't load your habits"));
      });
  }, []);

  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(subDays(today, 6), i));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const h = await habitApi.create({ name: name.trim(), color });
      setHabits((prev) => [...prev, h]);
      setName("");
      setColor(PROJECT_COLORS[(PROJECT_COLORS.indexOf(color) + 1) % PROJECT_COLORS.length]);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't add the habit"));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (habit, day) => {
    const k = key(day);
    const done = !habit.log.includes(k);
    // Optimistic
    setHabits((prev) => prev.map((h) => (h._id === habit._id ? { ...h, log: done ? [...h.log, k] : h.log.filter((x) => x !== k) } : h)));
    try {
      const saved = await habitApi.toggle(habit._id, k, done);
      setHabits((prev) => prev.map((h) => (h._id === habit._id ? saved : h)));
    } catch (err) {
      setHabits((prev) => prev.map((h) => (h._id === habit._id ? habit : h)));
      toast.error(getErrorMessage(err, "Couldn't update the habit"));
    }
  };

  const active = (habits ?? []).filter((h) => !h.archived);
  const doneToday = active.filter((h) => h.log.includes(key(new Date()))).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-muted">
          Small daily routines that keep you moving.
          {active.length > 0 && (
            <span className="ml-1 font-medium text-ink">
              {doneToday}/{active.length} done today.
            </span>
          )}
        </p>
      </div>

      <form onSubmit={add} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          className="input flex-1"
          placeholder="New habit, e.g. Read 20 minutes"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          aria-label="Habit name"
        />
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Habit color">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className="h-6 w-6 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              style={{
                background: projectColor(c),
                boxShadow: color === c ? `0 0 0 2px rgb(var(--surface)), 0 0 0 4px ${projectColor(c)}` : undefined,
              }}
            />
          ))}
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
          <Plus size={16} strokeWidth={2.5} /> Add habit
        </button>
      </form>

      {!habits ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : active.length === 0 ? (
        <div className="card">
          <EmptyState icon={Repeat2} title="No habits yet" description="Add something you want to do every day, then tick it off here." />
        </div>
      ) : (
        <section className="card overflow-hidden">
          <div className="hidden items-center gap-3 border-b border-line bg-subtle/50 px-5 py-2.5 sm:flex">
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-faint">Habit</span>
            <div className="flex gap-1.5">
              {days.map((d) => (
                <span key={key(d)} className={`w-8 text-center text-[11px] font-semibold ${isToday(d) ? "text-ink" : "text-faint"}`}>
                  {format(d, "EEEEE")}
                  <span className="block text-[10px] font-normal">{format(d, "d")}</span>
                </span>
              ))}
            </div>
            <span className="w-20 text-right text-[11px] font-semibold uppercase tracking-wide text-faint">Streak</span>
            <span className="w-8" />
          </div>
          <ul className="divide-y divide-line">
            {active.map((h) => {
              const s = streaks(h.log);
              return (
                <li key={h._id} className="group flex flex-wrap items-center gap-3 px-5 py-3.5 sm:flex-nowrap">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: projectColor(h.color) }} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{h.name}</p>
                      <p className="text-xs text-faint">
                        {s.rate}% of the last 30 days · best {s.best}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {days.map((d) => {
                      const done = h.log.includes(key(d));
                      return (
                        <button
                          key={key(d)}
                          onClick={() => toggle(h, d)}
                          aria-pressed={done}
                          aria-label={`${h.name}, ${format(d, "EEEE MMMM d")}: ${done ? "done" : "not done"}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                            done ? "border-transparent text-white" : "border-line text-transparent hover:border-line-strong hover:text-faint"
                          } ${isToday(d) && !done ? "border-line-strong" : ""}`}
                          style={done ? { background: projectColor(h.color) } : undefined}
                        >
                          <Check size={15} strokeWidth={3} />
                        </button>
                      );
                    })}
                  </div>
                  <span className="flex w-20 items-center justify-end gap-1 text-[13px] font-medium tabular-nums text-ink">
                    <Flame size={14} className={s.current ? "text-status-todo" : "text-faint"} />
                    {s.current}
                  </span>
                  <button
                    onClick={() => setDeleting(h)}
                    className="btn btn-ghost btn-icon btn-sm opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Delete habit ${h.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await habitApi.remove(deleting._id);
            setHabits((prev) => prev.filter((h) => h._id !== deleting._id));
            toast.success("Habit deleted");
          } catch (err) {
            toast.error(getErrorMessage(err, "Couldn't delete the habit"));
            throw err;
          }
        }}
        title={`Delete “${deleting?.name}”?`}
        description="Its history will be lost."
        confirmLabel="Delete habit"
      />
    </div>
  );
}
