import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BellIcon className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-semibold text-dark">Notifications</h2>
      </div>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className="p-4 border-l-4 border-primary bg-secondary/10 rounded-lg"
          >
            <p className="text-dark">{notification.message}</p>
            <time className="text-sm text-accent">{notification.date}</time>
          </div>
        ))}
        
        {!notifications.length && (
          <p className="text-center text-accent py-8">No new notifications</p>
        )}
      </div>
    </div>
  );
}