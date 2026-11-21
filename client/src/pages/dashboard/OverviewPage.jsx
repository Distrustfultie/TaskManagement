import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, isToday } from "date-fns";
import { AlertCircle, ArrowRight, CalendarCheck, CheckCircle2, CircleDot, FolderKanban, PartyPopper, Plus, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TasksContext";
import { useTaskForm } from "../../context/TaskFormContext";
import { useProjects } from "../../context/ProjectsContext";
import ActivityFeed from "../../components/activity/ActivityFeed";
import { ProjectDot } from "../../components/projects/ProjectBadge";
import { refId } from "../../utils/projects";
import TaskRow from "../../components/tasks/TaskRow";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { STATUSES, STATUS_STYLE } from "../../components/ui/Badges";
import { byDueDate, greeting, isDone, isOverdue, parseDate } from "../../utils/dates";

function StatTile({ label, value, icon: Icon, to, tone }) {
  return (
    <Link
      to={to}
      className="card group p-4 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <Icon size={16} className={tone ?? "text-faint"} />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </Link>
  );
}

/** Thin segmented bar + list rows (swatch, name, count, share). Text stays in ink tokens. */
function StatusBreakdown({ counts, total }) {
  const done = counts.Done;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const label = STATUSES.map((s) => `${s}: ${counts[s]}`).join(", ");

  return (
    <div className="card h-fit p-5">
      <h2 className="font-semibold text-ink">Progress</h2>
      <p className="mt-0.5 text-[13px] text-muted">
        {total ? `${done} of ${total} tasks complete` : "No tasks yet"}
      </p>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {pct}
        <span className="text-lg text-muted">%</span>
      </p>

      <div className="mt-3 flex h-2 gap-[2px] overflow-hidden rounded-full bg-subtle" role="img" aria-label={label}>
        {total > 0 &&
          STATUSES.map(
            (s) =>
              counts[s] > 0 && (
                <div
                  key={s}
                  className={`${STATUS_STYLE[s].dot} h-full first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${(counts[s] / total) * 100}%` }}
                  title={`${s}: ${counts[s]} (${Math.round((counts[s] / total) * 100)}%)`}
                />
              )
          )}
      </div>

      <ul className="mt-4 space-y-2.5">
        {STATUSES.map((s) => (
          <li key={s}>
            <Link
              to={`/dashboard/tasks?status=${encodeURIComponent(s)}`}
              className="flex items-center gap-2.5 rounded text-[13px] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className={`h-2.5 w-2.5 rounded-sm ${STATUS_STYLE[s].dot}`} />
              <span className="flex-1 text-muted">{s}</span>
              <span className="font-medium tabular-nums text-ink">{counts[s]}</span>
              <span className="w-10 text-right tabular-nums text-faint">
                {total ? `${Math.round((counts[s] / total) * 100)}%` : "—"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Meter list: each project's done share against its own total. */
function ProjectsCard() {
  const { active, openProjectForm } = useProjects();
  const { tasks } = useTasks();
  const rows = active.map((p) => {
    const list = tasks.filter((t) => refId(t.project) === p._id);
    const done = list.filter((t) => t.status === "Done").length;
    return { p, total: list.length, done, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  });

  return (
    <section className="card p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Projects</h2>
          <p className="mt-0.5 text-[13px] text-muted">Progress across everything you&apos;re part of</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => openProjectForm()}>
          <Plus size={14} /> New project
        </button>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          compact
          icon={FolderKanban}
          title="No projects yet"
          description="Group related tasks into a project, view them as a board and invite others."
        />
      ) : (
        <ul className="space-y-3.5">
          {rows.map(({ p, total, done, pct }) => (
            <li key={p._id}>
              <Link
                to={`/dashboard/projects/${p._id}`}
                className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <ProjectDot color={p.color} size={9} />
                  <span className="min-w-0 flex-1 truncate font-medium text-ink hover:underline">{p.name}</span>
                  {p.members.length > 1 && (
                    <span className="flex items-center gap-1 text-xs text-faint">
                      <Users size={12} /> {p.members.length}
                    </span>
                  )}
                  <span className="w-24 text-right tabular-nums text-muted">
                    {done}/{total} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full rounded-full bg-status-done" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { tasks, loading, error, refresh } = useTasks();
  const { openNew } = useTaskForm();

  const stats = useMemo(() => {
    const counts = { "To Do": 0, "In Progress": 0, Done: 0 };
    tasks.forEach((t) => counts[t.status] !== undefined && counts[t.status]++);
    const open = tasks.filter((t) => !isDone(t));
    return {
      counts,
      open: open.length,
      overdue: open.filter(isOverdue).length,
      dueToday: open.filter((t) => !isOverdue(t) && parseDate(t.dueDate) && isToday(parseDate(t.dueDate))).length,
      upNext: [...open].sort(byDueDate).slice(0, 6),
    };
  }, [tasks]);

  const subtitle = loading
    ? format(new Date(), "EEEE, MMMM d")
    : `${format(new Date(), "EEEE, MMMM d")} · ${
        stats.dueToday ? `${stats.dueToday} due today` : "nothing due today"
      }${stats.overdue ? `, ${stats.overdue} overdue` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {greeting()}
            {user?.firstName ? `, ${user.firstName}` : ""}
          </h2>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[86px] rounded-xl" />)
            ) : (
              <>
                <StatTile label="Open tasks" value={stats.open} icon={CircleDot} to="/dashboard/tasks" />
                <StatTile label="Due today" value={stats.dueToday} icon={CalendarCheck} to="/dashboard/tasks" />
                <StatTile
                  label="Overdue"
                  value={stats.overdue}
                  icon={AlertCircle}
                  to="/dashboard/tasks"
                  tone={stats.overdue ? "text-primary" : undefined}
                />
                <StatTile
                  label="Completed"
                  value={stats.counts.Done}
                  icon={CheckCircle2}
                  to="/dashboard/tasks?status=Done"
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card overflow-hidden lg:col-span-2">
              <div className="flex items-center justify-between px-5 pb-3 pt-5">
                <div>
                  <h2 className="font-semibold text-ink">Up next</h2>
                  <p className="mt-0.5 text-[13px] text-muted">Your most urgent open tasks</p>
                </div>
                <Link to="/dashboard/tasks" className="btn btn-ghost btn-sm">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3 px-5 pb-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : stats.upNext.length === 0 ? (
                <EmptyState
                  compact
                  icon={PartyPopper}
                  title={tasks.length ? "You're all caught up" : "No tasks yet"}
                  description={tasks.length ? "Every task is done. Enjoy the quiet." : "Add a task to see it here."}
                  action={
                    <button className="btn btn-secondary" onClick={() => openNew()}>
                      <Plus size={15} /> New task
                    </button>
                  }
                />
              ) : (
                <div className="divide-y divide-line border-t border-line">
                  {stats.upNext.map((t) => (
                    <TaskRow key={t._id} task={t} />
                  ))}
                </div>
              )}
            </section>

            {loading ? <Skeleton className="h-72 rounded-xl" /> : <StatusBreakdown counts={stats.counts} total={tasks.length} />}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ProjectsCard />
            <section className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-ink">Recent activity</h2>
                <Link to="/dashboard/insights" className="btn btn-ghost btn-sm">
                  Insights <ArrowRight size={14} />
                </Link>
              </div>
              <ActivityFeed limit={6} compact />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
