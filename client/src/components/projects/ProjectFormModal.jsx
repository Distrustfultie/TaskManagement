import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Modal from "../ui/Modal";
import { useProjects } from "../../context/ProjectsContext";
import { PROJECT_COLORS, projectColor } from "../../utils/projects";

export default function ProjectFormModal({ open, project, onClose }) {
  const navigate = useNavigate();
  const { projects, createProject, updateProject } = useProjects();
  const editing = Boolean(project?._id);
  const [form, setForm] = useState({ name: "", description: "", color: "blue" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      project
        ? { name: project.name, description: project.description || "", color: project.color }
        : // Suggest the first color not used yet
          { name: "", description: "", color: PROJECT_COLORS.find((c) => !projects.some((p) => p.color === c)) ?? "blue" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Give the project a name");
      return;
    }
    setSaving(true);
    try {
      const body = { name: form.name.trim(), description: form.description.trim(), color: form.color };
      if (editing) await updateProject(project._id, body);
      else {
        const p = await createProject(body);
        navigate(`/dashboard/projects/${p._id}`);
      }
      onClose();
    } catch {
      /* toast shown by context */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={editing ? "Edit project" : "New project"}
      description={editing ? undefined : "Group related tasks and share them with others."}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="project-form" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save" : "Create project"}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} noValidate className="space-y-5 pb-2">
        <div>
          <label htmlFor="project-name" className="label">
            Name
          </label>
          <input
            id="project-name"
            data-autofocus
            className="input"
            placeholder="e.g. Website relaunch"
            maxLength={60}
            value={form.name}
            aria-invalid={!!error}
            onChange={(e) => {
              setError("");
              setForm((f) => ({ ...f, name: e.target.value }));
            }}
          />
          {error && <p className="field-error">{error}</p>}
        </div>

        <div>
          <span className="label">Color</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Project color">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={form.color === c}
                aria-label={c}
                title={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className="flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                style={{
                  background: projectColor(c),
                  boxShadow: form.color === c ? `0 0 0 2px rgb(var(--surface)), 0 0 0 4px ${projectColor(c)}` : undefined,
                }}
              >
                {form.color === c && <Check size={15} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="project-desc" className="label">
            Description <span className="font-normal text-faint">(optional)</span>
          </label>
          <textarea
            id="project-desc"
            className="input h-auto min-h-[80px] py-2"
            maxLength={500}
            placeholder="What is this project about?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </form>
    </Modal>
  );
}
