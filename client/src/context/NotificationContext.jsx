import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // mock fetch (replace with API later)
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        message: "Task “Design landing page” is due today",
        taskId: "123",
        createdAt: new Date(),
        read: false,
      },
      {
        id: 2,
        message: "Reminder set for “Prepare weekly report”",
        taskId: "456",
        createdAt: new Date(Date.now() - 86400000),
        read: false,
      },
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);