import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

export default function DashboardSidebar({ user }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Tasks", path: "/dashboard/tasks", icon: CheckSquare },
    { label: "Calendar", path: "/dashboard/calendar", icon: Calendar },
    {
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: Bell,
      badge: 3,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavClick = () => {
    // ✅ auto-close sidebar on mobile
    if (mobileOpen) setMobileOpen(false);
  };

  const SidebarContent = (
    <aside
      className={`h-full bg-dark/95 border-r border-white/10 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <h1 className="text-lg font-extrabold text-secondary">
            Efes Manager
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-lg hover:bg-white/10"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(({ label, path, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-secondary/80 hover:bg-white/5"
              }`
            }
          >
            {/* Active indicator */}
            <span
              className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${
                location.pathname === path
                  ? "bg-primary"
                  : "bg-transparent"
              }`}
            />

            <Icon size={18} />

            {!collapsed && <span>{label}</span>}

            {badge && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary text-white">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {/* User */}
        <div
          className={`flex items-center gap-3 p-2 rounded-lg bg-white/5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={18} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-secondary">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-secondary/60">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <NavLink
          to="/dashboard/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              isActive
                ? "bg-primary/15 text-primary"
                : "text-secondary/80 hover:bg-white/5"
            }`
          }
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark text-secondary shadow"
      >
        <Menu />
      </button>

      {/* Desktop */}
      <div className="hidden lg:block">{SidebarContent}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50">{SidebarContent}</div>
        </div>
      )}
    </>
  );
}