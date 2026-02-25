import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedStat from "../components/AnimatedStat";

export default function HomePage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design landing page", done: false },
    { id: 2, title: "Fix authentication flow", done: false },
    { id: 3, title: "Prepare weekly report", done: false },
    { id: 4, title: "Deploy to production", done: false },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 dark:from-[#0f172a] dark:via-[#020617] dark:to-black transition-colors">

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animate-gradient bg-[length:200%_200%] bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 opacity-60" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-14 items-center">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-4 px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              Smart Task Management
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-white leading-tight mb-5">
              Manage Tasks. <br />
              <span className="text-primary">Own Your Time.</span>
            </h1>

            <p className="text-lg text-accent/80 dark:text-white/70 mb-8 max-w-xl">
              Efes Manager helps you organize, track, and complete tasks with
              clarity — so nothing slips through the cracks.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 mb-10">
              <a
                href="/login"
                className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-accent transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Sign In →
              </a>

              <a
                href="/signup"
                className="px-8 py-3 rounded-xl border border-primary/40 text-primary dark:text-white hover:bg-primary/10 transition-all"
              >
                Create Account
              </a>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-6 max-w-md">
              <AnimatedStat value={1200} suffix="+" label="Tasks completed" />
              <AnimatedStat value={98} suffix="%" label="On-time delivery" />
              <AnimatedStat value={24} suffix="/7" label="Availability" />
            </div>
          </motion.div>

          {/* RIGHT SIDE — DEMO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-6">

              {/* Fake window controls */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      task.done
                        ? "bg-green-500/10 text-green-600"
                        : "bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        task.done ? "line-through opacity-60" : ""
                      }`}
                    >
                      {task.title}
                    </span>

                    <span className="text-xs font-medium">
                      {task.done ? "Completed" : "Click to complete"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}