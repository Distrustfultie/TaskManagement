import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { History } from "lucide-react";
import { activityApi, getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TasksContext";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { fullName } from "../../utils/projects";

function describe(a, withTask) {
  const t = withTask && a.taskTitle ? ` “${a.taskTitle}”` : "";
  switch (a.type) {
    case "created":
      return a.meta?.recurring ? `scheduled the next${t || " occurrence"}` : `created${t || " this task"}`;
    case "completed":
      return `completed${t || " this task"}`;
    case "reopened":
      return `reopened${t || " this task"}`;
    case "updated":
      return `edited${t || " this task"}`;
    case "assigned":
      return `assigned${t || " this task"}`;
    case "moved":
      return a.meta?.to ? `moved${t} to ${a.meta.to}` : `moved${t} out of its project`;
    case "commented":
      return `commented on${t || " this task"}`;
    case "deleted":
      return `deleted${t}`;
    case "member_added":
      return `added ${a.meta?.name ?? "a member"}`;
    case "member_removed":
      return a.meta?.left ? "left the project" : `removed ${a.meta?.name ?? "a member"}`;
    default:
      return "made a change";
  }
}

/** History for a project, a task, or (no props) everything you can see. */
export default function ActivityFeed({ projectId, taskId, limit, compact = false }) {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  // Refetch when tasks change so the feed reflects what just happened
  const version = `${tasks.length}:${tasks.reduce((m, t) => (t.updatedAt > m ? t.updatedAt : m), "")}`;
  useEffect(() => {
    let alive = true;
    activityApi
      .list({ project: projectId, task: taskId, limit })
      .then((d) => alive && setItems(d))
      .catch((err) => alive && setError(getErrorMessage(err, "Couldn't load activity")));
    return () => {
      alive = false;
    };
  }, [projectId, taskId, limit, version]);

  if (error) return <p className="py-6 text-center text-[13px] text-muted">{error}</p>;
  if (!items)
    return (
      <div className="space-y-3 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    );
  if (!items.length)
    return (
      <div className={compact ? "" : "card"}>
        <EmptyState compact icon={History} title="No activity yet" description="Changes to tasks will show up here." />
      </div>
    );

  const list = (
    <ol className="space-y-4">
      {items.map((a) => (
        <li key={a._id} className="flex gap-3">
          <Avatar user={a.actor} size={26} />
          <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
            <p className="text-muted">
              <span className="font-medium text-ink">{a.actor?._id === user?._id ? "You" : fullName(a.actor)}</span>{" "}
              {describe(a, !taskId)}
            </p>
            {a.type === "commented" && a.meta?.excerpt && (
              <p className="mt-1 line-clamp-2 rounded-md bg-subtle px-2.5 py-1.5 text-muted">{a.meta.excerpt}</p>
            )}
            <p className="text-xs text-faint">{formatDistanceToNowStrict(new Date(a.createdAt), { addSuffix: true })}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return compact ? list : <div className="card p-5">{list}</div>;
}
