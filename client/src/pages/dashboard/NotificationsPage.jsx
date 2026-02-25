import { useEffect, useState } from "react";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  // Simulated fetch (replace with API later)
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        message: "Task “Design landing page” is due today",
        date: "Today • 9:00 AM",
        read: false,
      },
      {
        id: 2,
        message: "Reminder set for “Prepare weekly report”",
        date: "Yesterday • 4:30 PM",
        read: false,
      },
      {
        id: 3,
        message: "Task “Deploy to production” marked as done",
        date: "2 days ago",
        read: true,
      },
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellIcon className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-dark">
              Notifications
            </h1>
            <p className="text-sm text-accent">
              Stay up to date with your tasks
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <CheckIcon className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-dark/5 shadow-sm divide-y">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <BellIcon className="w-10 h-10 mx-auto text-accent/40 mb-3" />
            <p className="text-accent">
              You’re all caught up 🎉
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-4 p-5 transition ${
                notification.read
                  ? "bg-white"
                  : "bg-primary/5"
              }`}
            >
              {/* Indicator */}
              <div className="pt-1">
                {!notification.read && (
                  <span className="block w-2 h-2 rounded-full bg-primary" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    notification.read
                      ? "text-dark"
                      : "font-semibold text-dark"
                  }`}
                >
                  {notification.message}
                </p>
                <time className="text-xs text-accent mt-1 block">
                  {notification.date}
                </time>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}