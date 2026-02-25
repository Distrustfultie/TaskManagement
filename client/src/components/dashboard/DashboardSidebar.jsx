import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardSidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Tasks", path: "/dashboard/tasks", icon: CheckSquare },
    { label: "Calendar", path: "/dashboard/calendar", icon: Calendar },
    {
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: Bell,
      badge: unreadCount,
    },
  ];

  return (
    <aside className="w-64 bg-dark text-secondary min-h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-6">Efes Manager</h1>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ label, path, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            {badge > 0 && (
              <span className="ml-auto bg-primary text-white text-xs px-2 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <NavLink
          to="/dashboard/settings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5"
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}