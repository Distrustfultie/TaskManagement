import { Link } from "react-router-dom";
import { Bell, Menu, Moon, Plus, Sun } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { useTaskForm } from "../../context/TaskFormContext";
import FocusPill from "../focus/FocusPill";

export default function Header({ title, onMenuClick }) {
  const { unreadCount } = useNotifications();
  const { resolved, setTheme } = useTheme();
  const { openNew } = useTaskForm();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onMenuClick} className="btn btn-ghost btn-icon -ml-2 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>

      <h1 className="flex-1 truncate text-[15px] font-semibold text-ink">{title}</h1>

      <div className="flex items-center gap-1">
        <div className="mr-1">
          <FocusPill />
        </div>
        <button
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          className="btn btn-ghost btn-icon"
          aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={resolved === "dark" ? "Light mode" : "Dark mode"}
        >
          {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link
          to="/dashboard/notifications"
          className="btn btn-ghost btn-icon relative"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-canvas" />
          )}
        </Link>

        <button onClick={() => openNew()} className="btn btn-primary ml-1.5" title="New task (N)" aria-label="New task">
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">New task</span>
        </button>
      </div>
    </header>
  );
}
