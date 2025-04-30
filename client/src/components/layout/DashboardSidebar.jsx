import { NavLink, useNavigate } from "react-router-dom";

export default function DashboardSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-dark min-h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-secondary mb-8">Efes Manager</h1>
      <nav className="flex-1 space-y-2">
        {[
          { label: "Dashboard", path: "/dashboard" },
          { label: "My Tasks", path: "/dashboard/tasks" },
          { label: "Calendar", path: "/dashboard/calendar" },
          { label: "Notifications", path: "/dashboard/notifications" },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "text-secondary hover:bg-accent/50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-accent pt-4 space-y-2">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `w-full p-3 rounded-lg text-left ${
              isActive
                ? "bg-accent text-white"
                : "text-secondary hover:bg-accent/50"
            }`
          }
        >
          ⚙ Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full text-secondary p-3 hover:bg-accent/50 rounded-lg text-left"
        >
          🚪 Log Out
        </button>
      </div>
    </aside>
  );
}