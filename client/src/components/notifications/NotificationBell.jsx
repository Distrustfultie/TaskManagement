import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('https://taskmanagement-n1tx.onrender.com/notifications', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        // count only unread ones
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchNotifications();
    // Poll every minute or use WebSockets/eventsource for real-time
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button className="p-2 hover:bg-secondary/20 rounded-full">
        <Bell className="w-6 h-6 text-accent" />
      </button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
