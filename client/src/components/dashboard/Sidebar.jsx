import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Bell, CalendarDays, CheckSquare, LayoutDashboard, LogOut, Plus, Repeat2, Settings, Users, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTasks } from "../../context/TasksContext";
import { useProjects } from "../../context/ProjectsContext";
import { ProjectDot } from "../projects/ProjectBadge";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";

function NavItem({ to, icon: Icon, label, count, end, highlight }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isActive ? "bg-subtle text-ink" : "text-muted hover:bg-subtle/70 hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? "text-primary" : "text-faint group-hover:text-muted"} />
          <span className="flex-1">{label}</span>
          {count > 0 && (
            <span
              className={`min-w-[1.25rem] rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 ${
                highlight ? "bg-primary text-white" : "bg-line/70 text-muted"
              }`}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { tasks } = useTasks();
  const { active, openProjectForm } = useProjects();
  const openCount = tasks.filter((t) => t.status !== "Done").length;

  return (
    <div className="flex h-full flex-col" onClick={(e) => e.target.closest("a") && onNavigate?.()}>
      <div className="flex h-14 items-center px-4">
        <Logo to="/dashboard" />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pt-2" aria-label="Main">
        <div className="space-y-0.5">
          <NavItem to="/dashboard" end icon={LayoutDashboard} label="Overview" />
          <NavItem to="/dashboard/tasks" icon={CheckSquare} label="My Tasks" count={openCount} />
          <NavItem to="/dashboard/calendar" icon={CalendarDays} label="Calendar" />
          <NavItem to="/dashboard/insights" icon={BarChart3} label="Insights" />
          <NavItem to="/dashboard/habits" icon={Repeat2} label="Habits" />
          <NavItem to="/dashboard/notifications" icon={Bell} label="Notifications" count={unreadCount} highlight />
        </div>

        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between px-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">Projects</span>
            <button
              onClick={() => openProjectForm()}
              className="btn btn-ghost btn-icon btn-sm h-6 w-6"
              aria-label="New project"
              title="New project"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {active.map((p) => {
              const open = tasks.filter((t) => (t.project?._id ?? t.project) === p._id && t.status !== "Done").length;
              return (
                <NavLink
                  key={p._id}
                  to={`/dashboard/projects/${p._id}`}
                  className={({ isActive }) =>
                    `flex h-8 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isActive ? "bg-subtle text-ink" : "text-muted hover:bg-subtle/70 hover:text-ink"
                    }`
                  }
                >
                  <span className="flex w-[18px] justify-center">
                    <ProjectDot color={p.color} size={9} />
                  </span>
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.members.length > 1 && <Users size={12} className="text-faint" aria-label="Shared" />}
                  {open > 0 && <span className="text-[11px] text-faint">{open}</span>}
                </NavLink>
              );
            })}
            {active.length === 0 && (
              <button
                onClick={() => openProjectForm()}
                className="flex h-8 w-full items-center gap-3 rounded-lg px-2.5 text-[13px] text-faint hover:bg-subtle/70 hover:text-ink"
              >
                <Plus size={14} className="ml-0.5" /> Create a project
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="space-y-0.5 px-3 pb-3">
        <NavItem to="/dashboard/settings" icon={Settings} label="Settings" />
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-line p-2.5">
          <Avatar user={user} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user?.fullName || "Your account"}</p>
            <p className="truncate text-xs text-faint">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-pop"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            >
              <button
                onClick={onClose}
                className="btn btn-ghost btn-icon btn-sm absolute right-3 top-3"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
