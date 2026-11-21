import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { AlertCircle, BellOff, CalendarClock, CheckCheck, Clock } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useTasks } from "../../context/TasksContext";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Avatar from "../../components/ui/Avatar";
import { TaskListSkeleton } from "../../components/ui/Skeleton";
import { formatDue } from "../../utils/dates";

const ICONS = {
  overdue: { icon: AlertCircle, cls: "bg-primary-soft text-primary-ink" },
  today: { icon: Clock, cls: "bg-subtle text-ink" },
  tomorrow: { icon: CalendarClock, cls: "bg-subtle text-muted" },
};
const GROUPS = [
  { kind: "team", title: "From your team" },
  { kind: "overdue", title: "Needs attention" },
  { kind: "today", title: "Due today" },
  { kind: "tomorrow", title: "Coming up tomorrow" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { loading, error, refresh } = useTasks();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (loading) return <TaskListSkeleton rows={4} />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const open = (n) => {
    markAsRead(n.id);
    if (n.kind === "team") {
      if (n.taskId) navigate(`/dashboard/tasks?edit=${n.taskId}`);
      else if (n.projectId) navigate(`/dashboard/projects/${n.projectId}`);
    } else {
      navigate(`/dashboard/tasks?edit=${n.task._id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">
          {unreadCount ? `${unreadCount} unread` : notifications.length ? "All caught up" : "Nothing needs your attention"}
        </p>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BellOff}
            title="You're all caught up"
            description="You'll see tasks here when they're due soon, and updates when teammates assign or comment."
          />
        </div>
      ) : (
        GROUPS.map(({ kind, title }) => {
          const list = notifications.filter((n) => n.kind === kind);
          if (!list.length) return null;
          return (
            <section key={kind}>
              <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">
                {title} <span className="font-normal text-faint">{list.length}</span>
              </h2>
              <div className="card divide-y divide-line overflow-hidden">
                {list.map((n) => {
                  const meta = ICONS[n.kind];
                  return (
                    <button
                      key={n.id}
                      onClick={() => open(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-subtle/60 focus-visible:bg-subtle focus-visible:outline-none ${
                        n.read ? "" : "bg-primary-soft/40"
                      }`}
                    >
                      {n.kind === "team" ? (
                        <span className="mt-0.5 shrink-0">
                          <Avatar user={n.actor} size={32} />
                        </span>
                      ) : (
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.cls}`}>
                          <meta.icon size={16} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${n.read ? "text-muted" : "font-medium text-ink"}`}>{n.message}</span>
                        <span className="mt-0.5 block text-xs text-faint">
                          {n.kind === "team"
                            ? formatDistanceToNowStrict(n.date, { addSuffix: true })
                            : `${n.label} · ${formatDue(n.task.dueDate)}`}
                        </span>
                      </span>
                      {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
