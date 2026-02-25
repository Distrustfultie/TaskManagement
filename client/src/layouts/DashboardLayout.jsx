import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  /* ---------- Fetch badge counts ---------- */
  useEffect(() => {
    // Example endpoint — adjust to your backend
    fetch("https://taskmanagement-n1tx.onrender.com/api/notifications/count", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNotificationCount(data.count || 0))
      .catch(() => setNotificationCount(0));
  }, []);

  const pageTitleMap = {
    "/dashboard": "Overview",
    "/dashboard/tasks": "My Tasks",
    "/dashboard/calendar": "Calendar",
    "/dashboard/notifications": "Notifications",
    "/dashboard/settings": "Settings",
  };

  return (
    <div className="flex min-h-screen bg-dark/5">
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        notificationCount={notificationCount}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          setMobileOpen={setMobileOpen}
          title={pageTitleMap[location.pathname]}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}