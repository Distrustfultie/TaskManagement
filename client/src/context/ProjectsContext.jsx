import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { projectApi, getErrorMessage } from "../services/api";
import ProjectFormModal from "../components/projects/ProjectFormModal";

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ open: false, project: null });

  const refresh = useCallback(async () => {
    try {
      setProjects(await projectApi.list());
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't load your projects"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProject = useCallback(async (body) => {
    try {
      const p = await projectApi.create(body);
      setProjects((prev) => [...prev, p]);
      toast.success(`Project “${p.name}” created`);
      return p;
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create the project"));
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (id, body, { silent = false } = {}) => {
    try {
      const p = await projectApi.update(id, body);
      setProjects((prev) => prev.map((x) => (x._id === id ? p : x)));
      if (!silent) toast.success("Project updated");
      return p;
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update the project"));
      throw err;
    }
  }, []);

  const removeProject = useCallback(async (id) => {
    try {
      await projectApi.remove(id);
      setProjects((prev) => prev.filter((x) => x._id !== id));
      toast.success("Project deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the project"));
      throw err;
    }
  }, []);

  /** Replace a project after a server change made elsewhere (e.g. members). */
  const replaceProject = useCallback((p) => setProjects((prev) => prev.map((x) => (x._id === p._id ? p : x))), []);
  const dropProject = useCallback((id) => setProjects((prev) => prev.filter((x) => x._id !== id)), []);

  const openProjectForm = useCallback((project = null) => setForm({ open: true, project }), []);
  const closeProjectForm = useCallback(() => setForm((f) => ({ ...f, open: false })), []);

  const byId = useMemo(() => Object.fromEntries(projects.map((p) => [p._id, p])), [projects]);
  const active = useMemo(() => projects.filter((p) => !p.archived), [projects]);

  const value = useMemo(
    () => ({
      projects,
      active,
      byId,
      loading,
      refresh,
      createProject,
      updateProject,
      removeProject,
      replaceProject,
      dropProject,
      openProjectForm,
    }),
    [projects, active, byId, loading, refresh, createProject, updateProject, removeProject, replaceProject, dropProject, openProjectForm]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
      <ProjectFormModal open={form.open} project={form.project} onClose={closeProjectForm} />
    </ProjectsContext.Provider>
  );
}

export const useProjects = () => useContext(ProjectsContext);
