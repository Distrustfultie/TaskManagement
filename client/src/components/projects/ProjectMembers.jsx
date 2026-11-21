import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, LogOut, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { useTasks } from "../../context/TasksContext";
import { projectApi, getErrorMessage } from "../../services/api";
import Avatar from "../ui/Avatar";
import ConfirmDialog from "../ui/ConfirmDialog";
import { fullName, refId } from "../../utils/projects";

export default function ProjectMembers({ project }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { replaceProject, dropProject } = useProjects();
  const { tasks, refresh } = useTasks();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);
  const isOwner = refId(project.owner) === user?._id;

  const openByMember = (memberId) =>
    tasks.filter((t) => refId(t.project) === project._id && refId(t.assignee) === memberId && t.status !== "Done").length;

  const invite = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const p = await projectApi.addMember(project._id, email.trim());
      replaceProject(p);
      toast.success("Member added");
      setEmail("");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't add that member"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (member) => {
    const self = refId(member.user) === user?._id;
    const p = await projectApi.removeMember(project._id, refId(member.user)).catch((err) => {
      toast.error(getErrorMessage(err, "Couldn't remove the member"));
      throw err;
    });
    if (self) {
      dropProject(project._id);
      refresh();
      toast.success(`You left “${project.name}”`);
      navigate("/dashboard");
    } else {
      replaceProject(p);
      refresh(); // their assignments were cleared server-side
      toast.success(`${fullName(member.user)} removed`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="card overflow-hidden">
        <div className="px-5 pb-3 pt-5">
          <h2 className="font-semibold text-ink">Members</h2>
          <p className="mt-0.5 text-[13px] text-muted">Everyone here can see, edit and complete this project’s tasks.</p>
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {project.members.map((m) => {
            const id = refId(m.user);
            const self = id === user?._id;
            const owner = m.role === "owner";
            const open = openByMember(id);
            return (
              <li key={id} className="flex items-center gap-3 px-5 py-3">
                <Avatar user={m.user} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium text-ink">
                    {fullName(m.user)}
                    {self && <span className="text-xs font-normal text-faint">(you)</span>}
                    {owner && <Crown size={13} className="text-status-todo" aria-label="Owner" />}
                  </p>
                  <p className="truncate text-xs text-faint">
                    {m.user?.email} · {open} open task{open === 1 ? "" : "s"}
                  </p>
                </div>
                {!owner && (isOwner || self) && (
                  <button
                    className="btn btn-ghost btn-sm text-muted hover:bg-primary-soft hover:text-primary-ink"
                    onClick={() => setRemoving(m)}
                  >
                    {self ? <LogOut size={15} /> : <UserMinus size={15} />}
                    {self ? "Leave" : "Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="card h-fit p-5">
        <h3 className="font-semibold text-ink">Add a member</h3>
        {isOwner ? (
          <form onSubmit={invite} noValidate className="mt-3 space-y-3">
            <div>
              <label htmlFor="invite-email" className="label">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                className="input"
                placeholder="teammate@company.com"
                value={email}
                aria-invalid={!!error}
                onChange={(e) => {
                  setError("");
                  setEmail(e.target.value);
                }}
              />
              {error ? <p className="field-error">{error}</p> : <p className="hint">They need an Efes Manager account.</p>}
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              <UserPlus size={16} /> {busy ? "Adding…" : "Add member"}
            </button>
          </form>
        ) : (
          <p className="mt-2 text-[13px] text-muted">Only the project owner can add members.</p>
        )}
      </aside>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => remove(removing)}
        title={removing && refId(removing.user) === user?._id ? `Leave “${project.name}”?` : `Remove ${fullName(removing?.user)}?`}
        description={
          removing && refId(removing.user) === user?._id
            ? "You'll lose access to this project's tasks."
            : "They'll lose access to this project, and their tasks here will be unassigned."
        }
        confirmLabel={removing && refId(removing.user) === user?._id ? "Leave project" : "Remove member"}
        icon={removing && refId(removing.user) === user?._id ? LogOut : UserMinus}
      />
    </div>
  );
}
