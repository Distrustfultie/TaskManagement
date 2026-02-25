import TaskOverview from "../../components/dashboard/TaskOverview";
import CalendarWidget from "../../components/CalendarWidget";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark">
          Dashboard
        </h1>
        <p className="text-sm text-accent">
          Overview of your tasks and schedule
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Overview */}
        <div className="xl:col-span-2">
          <TaskOverview />
        </div>

        {/* Calendar */}
        <div className="xl:col-span-1">
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
}