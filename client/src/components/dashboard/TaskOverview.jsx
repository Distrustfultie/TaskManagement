// src/components/dashboard/TaskOverview.jsx
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { fetchTasks } from '../../api';

export default function TaskOverview() {
  const [tasks, setTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Load tasks once
  useEffect(() => {
    (async () => {
      const data = await fetchTasks();
      setTasks(data);
    })();
  }, []);

  // Count per status
  const counts = tasks.reduce(
    (acc, t) => {
      if (t.status === 'To Do') acc['To Do']++;
      else if (t.status === 'In Progress') acc['In Progress']++;
      else if (t.status === 'Done') acc['Done']++;
      return acc;
    },
    {'To Do':0,'In Progress':0,'Done':0}
  );

  // Build data for recharts
  const chartData = [
    { name: 'To Do',       value: counts['To Do'],       color:'#facc15' },
    { name: 'In Progress', value: counts['In Progress'], color:'#3b82f6' },
    { name: 'Done',        value: counts['Done'],        color:'#10b981' },
  ];

  // Filter list under chart
  const filtered = selectedStatus
    ? tasks.filter((t) => t.status === selectedStatus)
    : tasks;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Task Overview</h2>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <PieChart width={300} height={200}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={60}
            dataKey="value"
            onClick={(entry) => setSelectedStatus(entry.name)}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </motion.div>

      <motion.div className="mt-4 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <h3 className="text-md font-medium">
          {selectedStatus ? `${selectedStatus} Tasks` : 'All Tasks'}
        </h3>
        {filtered.map((t) => (
          <motion.div
            key={t._id}
            className="p-3 bg-secondary/10 rounded hover:bg-secondary/20 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {t.title}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
