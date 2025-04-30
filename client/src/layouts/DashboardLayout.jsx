import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import DashboardTopBar from '../components/layout/DashboardTopBar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-secondary/10">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* This was missing proper styling */}
        </main>
      </div>
    </div>
  );
}