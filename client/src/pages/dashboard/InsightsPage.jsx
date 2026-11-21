import { useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, isAfter, startOfDay, startOfWeek, subDays } from "date-fns";
import { CalendarRange, Flame, Target, Timer, TrendingDown, TrendingUp } from "lucide-react";
import { useTasks } from "../../context/TasksContext";
import { useProjects } from "../../context/ProjectsContext";
import BarChart from "../../components/charts/BarChart";
import MeterList from "../../components/charts/MeterList";
import Segmented from "../../components/ui/Segmented";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDuration, isDone, isOverdue, parseDate } from "../../utils/dates";
import { projectColor, refId } from "../../utils/projects";

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];
const dayKey = (d) => format(d, "yyyy-MM-dd");

function Tile({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-[13px] font-medium text-muted">
        {label}
        <Icon size={16} className="text-faint" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export default function InsightsPage() {
  const { tasks, loading, error, refresh } = useTasks();
  const { byId } = useProjects();
  const [range, setRange] = useState(30);

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const from = subDays(today, range - 1);
    const prevFrom = subDays(from, range);
    const completed = tasks.filter((t) => isDone(t) && t.completedAt).map((t) => ({ ...t, done: new Date(t.completedAt) }));

    const inRange = completed.filter((t) => !isAfter(from, t.done));
    const inPrev = completed.filter((t) => !isAfter(prevFrom, t.done) && isAfter(from, t.done));

    // Completed per day
    const perDay = {};
    inRange.forEach((t) => (perDay[dayKey(t.done)] = (perDay[dayKey(t.done)] ?? 0) + 1));
    const series = Array.from({ length: range }, (_, i) => {
      const d = addDays(from, i);
      return { key: dayKey(d), label: format(d, "EEE, MMM d"), short: range <= 7 ? format(d, "EEE") : format(d, "MMM d"), value: perDay[dayKey(d)] ?? 0 };
    });

    // On time: finished on or before the due day
    const withDue = inRange.filter((t) => parseDate(t.dueDate));
    const onTime = withDue.filter((t) => differenceInCalendarDays(t.done, parseDate(t.dueDate)) <= 0).length;

    // Streak of consecutive days (ending today or yesterday) with a completion
    const days = new Set(completed.map((t) => dayKey(t.done)));
    let streak = 0;
    let cursor = days.has(dayKey(today)) ? today : subDays(today, 1);
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor = subDays(cursor, 1);
    }

    // Ahead: open tasks due in the next 7 days
    const open = tasks.filter((t) => !isDone(t));
    const ahead = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i);
      const value = open.filter((t) => {
        const due = parseDate(t.dueDate);
        return due && dayKey(due) === dayKey(d);
      }).length;
      return { key: dayKey(d), label: format(d, "EEEE, MMM d"), short: i === 0 ? "Today" : format(d, "EEE"), value };
    });

    const groupBy = (list, val) => {
      const m = {};
      list.forEach((t) => {
        const k = refId(t.project) ?? "none";
        m[k] = (m[k] ?? 0) + val(t);
      });
      return Object.entries(m)
        .map(([k, v]) => ({
          key: k,
          label: k === "none" ? "No project" : byId[k]?.name ?? "Other project",
          swatch: k === "none" ? "rgb(var(--line-strong))" : projectColor(byId[k]?.color),
          value: v,
        }))
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    };

    // This week so far (Mon → today)
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekDone = completed.filter((t) => !isAfter(weekStart, t.done));
    const weekCreated = tasks.filter((t) => t.createdAt && !isAfter(weekStart, new Date(t.createdAt)));
    const topProject = groupBy(weekDone, () => 1)[0];

    return {
      total: inRange.length,
      prev: inPrev.length,
      series,
      perDayAvg: inRange.length / range,
      onTimeRate: withDue.length ? Math.round((onTime / withDue.length) * 100) : null,
      streak,
      ahead,
      byProject: groupBy(inRange, () => 1),
      timeByProject: groupBy(tasks, (t) => t.timeSpent ?? 0),
      focusTotal: tasks.reduce((s, t) => s + (t.timeSpent ?? 0), 0),
      week: { done: weekDone.length, created: weekCreated.length, overdue: open.filter(isOverdue).length, top: topProject },
    };
  }, [tasks, byId, range]);

  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );

  const change = data.prev ? Math.round(((data.total - data.prev) / data.prev) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">How your work is going, from the tasks you complete.</p>
        <div className="w-full sm:w-auto">
          <Segmented label="Range" size="sm" options={RANGES} value={range} onChange={setRange} />
        </div>
      </div>

      {/* Hero + tiles */}
      <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="card p-5">
          <p className="text-[13px] font-medium text-muted">Tasks completed · last {range} days</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-ink">{data.total}</p>
          {change !== null ? (
            <p className={`mt-2 inline-flex items-center gap-1 text-[13px] font-medium ${change >= 0 ? "text-status-done" : "text-primary-ink"}`}>
              {change >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {change >= 0 ? "+" : ""}
              {change}% <span className="font-normal text-faint">vs previous {range} days</span>
            </p>
          ) : (
            <p className="mt-2 text-[13px] text-faint">{data.perDayAvg.toFixed(1)} per day on average</p>
          )}
        </div>
        <Tile icon={Target} label="On time" value={data.onTimeRate === null ? "—" : `${data.onTimeRate}%`} hint="Finished by the due day" />
        <Tile icon={Flame} label="Streak" value={`${data.streak} day${data.streak === 1 ? "" : "s"}`} hint="In a row with a completion" />
        <Tile icon={Timer} label="Focus time" value={formatDuration(data.focusTotal)} hint="Tracked with the timer" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink">Completed per day</h2>
          <p className="mb-5 mt-0.5 text-[13px] text-muted">Tasks marked done each day</p>
          <BarChart data={data.series} caption="Tasks completed per day" />
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <CalendarRange size={16} className="text-faint" /> This week
          </h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            {[
              ["Completed", data.week.done],
              ["Created", data.week.created],
              ["Overdue right now", data.week.overdue],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium tabular-nums text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-lg bg-subtle px-3 py-2.5 text-[13px] leading-relaxed text-muted">
            {data.week.done === 0
              ? "No tasks completed yet this week — pick one small thing to finish today."
              : `You've finished ${data.week.done} task${data.week.done === 1 ? "" : "s"} this week${
                  data.week.top ? (data.week.top.key === "none" ? ", mostly outside projects" : `, most in ${data.week.top.label}`) : ""
                }.${data.week.overdue ? ` ${data.week.overdue} still overdue.` : " Nothing overdue — nice."}`}
          </p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="font-semibold text-ink">Coming up</h2>
          <p className="mb-5 mt-0.5 text-[13px] text-muted">Open tasks due in the next 7 days</p>
          <BarChart data={data.ahead} height={120} caption="Open tasks due per day, next 7 days" />
        </section>
        <section className="card p-5">
          <h2 className="font-semibold text-ink">Completed by project</h2>
          <p className="mb-5 mt-0.5 text-[13px] text-muted">Last {range} days</p>
          <MeterList rows={data.byProject} empty="Complete a task to see this" />
        </section>
        <section className="card p-5">
          <h2 className="font-semibold text-ink">Focus time by project</h2>
          <p className="mb-5 mt-0.5 text-[13px] text-muted">All tracked time</p>
          <MeterList rows={data.timeByProject} format={formatDuration} empty="Start a focus session from any task" />
        </section>
      </div>
    </div>
  );
}
