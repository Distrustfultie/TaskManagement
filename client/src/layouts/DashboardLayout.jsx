import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TasksProvider } from "../context/TasksContext";
import { ProjectsProvider, useProjects } from "../context/ProjectsContext";
import { NotificationProvider } from "../context/NotificationContext";
import { FocusProvider } from "../context/FocusContext";
import { TaskFormProvider } from "../context/TaskFormContext";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import ErrorBoundary from "../components/ui/ErrorBoundary";

const TITLES = {
  "/dashboard": "Overview",
  "/dashboard/tasks": "My Tasks",
  "/dashboard/calendar": "Calendar",
  "/dashboard/insights": "Insights",
  "/dashboard/habits": "Habits",
  "/dashboard/notifications": "Notifications",
  "/dashboard/settings": "Settings",
};

function Shell() {
  const { pathname } = useLocation();
  const { byId } = useProjects();
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = pathname.replace(/\/+$/, "");
  const projectId = path.match(/^\/dashboard\/projects\/([^/]+)/)?.[1];
  const title = projectId ? byId[projectId]?.name ?? "Project" : TITLES[path] ?? "Dashboard";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = `${title} · Efes Manager`;
  }, [title]);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8">
          <ErrorBoundary resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <TasksProvider>
      <ProjectsProvider>
        <NotificationProvider>
          <FocusProvider>
            <TaskFormProvider>
              <Shell />
            </TaskFormProvider>
          </FocusProvider>
        </NotificationProvider>
      </ProjectsProvider>
    </TasksProvider>
  );
}
