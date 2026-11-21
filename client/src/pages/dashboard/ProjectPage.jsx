import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Archive, ArchiveRestore, FolderX, Pencil, Plus, Trash2 } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useTasks } from "../../context/TasksContext";
import { useTaskForm } from "../../context/TaskFormContext";
import { useAuth } from "../../context/AuthContext";
import TaskWorkspace from "../../components/tasks/TaskWorkspace";
import ProjectMembers from "../../components/projects/ProjectMembers";
import ActivityFeed from "../../components/activity/ActivityFeed";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import { projectColor, refId, fullName } from "../../utils/projects";

const TABS = [
  { id: "tasks", label: "Tasks" },
  { id: "members", label: "Members" },
  { id: "activity", label: "Activity" },
];

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const { byId, loading, openProjectForm, updateProject, removeProject } = useProjects();
  const { tasks, refresh } = useTasks();
  const { openNew } = useTaskForm();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const project = byId[id];
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "tasks";
  const projectTasks = useMemo(() => tasks.filter((t) => refId(t.project) === id), [tasks, id]);
  const done = projectTasks.filter((t) => t.status === "Done").length;
  const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
  const isOwner = project && refId(project.owner) === user?._id;

  useEffect(() => {
    if (project) document.title = `${project.name} · Efes Manager`;
  }, [project]);

  if (loading) return <Skeleton className="h-40 rounded-xl" />;
  if (!project)
    return (
      <div className="card">
        <EmptyState
          icon={FolderX}
          title="Project not found"
          description="It may have been deleted, or you're no longer a member."
          action={
            <Link to="/dashboard" className="btn btn-secondary">
              Back to overview
            </Link>
          }
        />
      </div>
    );

  const setTab = (t) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        t === "tasks" ? n.delete("tab") : n.set("tab", t);
        return n;
      },
      { replace: true }
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-1.5" style={{ background: projectColor(project.color) }} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight text-ink">{project.name}</h2>
              {project.archived && (
                <span className="rounded-full border border-line bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted">Archived</span>
              )}
            </div>
            {project.description && <p className="mt-1 max-w-2xl text-muted">{project.description}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="w-48">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-muted">Progress</span>
                  <span className="font-medium tabular-nums text-ink">
                    {done}/{projectTasks.length} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full rounded-full bg-status-done transition-[width]" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <button onClick={() => setTab("members")} className="flex items-center -space-x-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="View members">
                {project.members.slice(0, 5).map((m) => (
                  <span key={refId(m.user)} className="rounded-full ring-2 ring-surface" title={fullName(m.user)}>
                    <Avatar user={m.user} size={26} />
                  </span>
                ))}
                {project.members.length > 5 && (
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-subtle text-[10px] font-semibold text-muted ring-2 ring-surface">
                    +{project.members.length - 5}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => openNew({ project: id })}>
              <Plus size={16} strokeWidth={2.5} /> Add task
            </button>
            <button className="btn btn-secondary btn-icon" onClick={() => openProjectForm(project)} aria-label="Edit project" title="Edit project">
              <Pencil size={16} />
            </button>
            {isOwner && (
              <>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => updateProject(id, { archived: !project.archived })}
                  aria-label={project.archived ? "Restore project" : "Archive project"}
                  title={project.archived ? "Restore project" : "Archive project"}
                >
                  {project.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                </button>
                <button
                  className="btn btn-secondary btn-icon hover:bg-primary-soft hover:text-primary-ink"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete project"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-t border-line px-3" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                tab === t.id ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
              {t.id === "members" && <span className="ml-1.5 text-faint">{project.members.length}</span>}
              {tab === t.id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      {tab === "tasks" && <TaskWorkspace tasks={projectTasks} projectId={id} />}
      {tab === "members" && <ProjectMembers project={project} />}
      {tab === "activity" && <ActivityFeed projectId={id} />}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await removeProject(id);
          refresh(); // tasks were moved out of the project server-side
          navigate("/dashboard/tasks");
        }}
        title={`Delete “${project.name}”?`}
        description="The project is removed for everyone. Its tasks are kept and moved out of the project."
        confirmLabel="Delete project"
      />
    </div>
  );
}
