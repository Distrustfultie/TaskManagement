// src/components/CalendarWidget.jsx
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function CalendarWidget() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-dark mb-4">Calendar</h2>
      <Calendar 
        color="#CD1C18"
        className="border-none"
      />
    </div>
  );
}