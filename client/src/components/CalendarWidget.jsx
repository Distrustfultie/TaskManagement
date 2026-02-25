import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function CalendarWidget() {
  return (
    <div className="bg-white rounded-2xl border border-dark/5 shadow-sm p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-dark">
          Calendar
        </h2>
        <p className="text-sm text-accent">
          Upcoming tasks & deadlines
        </p>
      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          color="#CD1C18"
          className="border-none"
        />
      </div>
    </div>
  );
}