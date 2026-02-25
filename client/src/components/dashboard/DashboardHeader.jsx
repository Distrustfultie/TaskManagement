import { Menu } from "lucide-react";

export default function DashboardHeader({ title, onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-dark text-secondary lg:hidden"
        >
          <Menu />
        </button>

        {/* Page title */}
        <h2 className="text-lg font-bold text-dark">
          {title}
        </h2>
      </div>

      {/* Right side (future-ready) */}
      <div className="flex items-center gap-4">
        {/* You can add search / notifications / avatar here later */}
      </div>
    </header>
  );
}