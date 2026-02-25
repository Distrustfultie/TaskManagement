import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const today = [];
  const earlier = [];

  notifications.forEach((n) => {
    const isToday =
      new Date(n.createdAt).toDateString() ===
      new Date().toDateString();
    (isToday ? today : earlier).push(n);
  });

  const renderGroup = (title, list) => (
    <>
      <h3 className="text-sm font-semibold text-accent mt-6 mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {list.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markAsRead(n.id);
              navigate(`/dashboard/task-details/${n.taskId}`);
            }}
            className={`p-4 rounded-lg cursor-pointer transition ${
              n.read
                ? "bg-white"
                : "bg-primary/10 border-l-4 border-primary"
            }`}
          >
            <p className="text-sm font-medium">{n.message}</p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell className="text-primary" />
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-sm text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {today.length === 0 && earlier.length === 0 ? (
        <p className="text-center text-accent py-10">
          You’re all caught up 🎉
        </p>
      ) : (
        <>
          {today.length > 0 && renderGroup("Today", today)}
          {earlier.length > 0 && renderGroup("Earlier", earlier)}
        </>
      )}
    </div>
  );
}