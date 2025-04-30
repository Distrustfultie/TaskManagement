// src/pages/dashboard/OverviewPage.jsx
import { useEffect } from 'react';
import CalendarWidget from '../../components/CalendarWidget';
import TaskOverview from '../../components/dashboard/TaskOverview';

export default function OverviewPage() {
  useEffect(() => {
    // Fetch initial dashboard data
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TaskOverview />
      </div>
      <div className="lg:col-span-1">
        <CalendarWidget />
      </div>
    </div>
  );
}