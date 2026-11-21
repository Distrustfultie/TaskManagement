import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BellRing, CalendarDays, Check, LayoutDashboard, ListChecks, Moon, Sun } from "lucide-react";
import Logo from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Everything in one list",
    text: "Group tasks by what's overdue, due today and coming up, with status and priority at a glance.",
  },
  {
    icon: CalendarDays,
    title: "Plan on a calendar",
    text: "See your month and drag a task onto another day to reschedule it.",
  },
  {
    icon: BellRing,
    title: "Email reminders",
    text: "Set a one-off or repeating reminder and get an email when it's time.",
  },
  {
    icon: LayoutDashboard,
    title: "A clear overview",
    text: "Know what's next and how much is done the moment you sign in.",
  },
];

const DEMO = [
  { id: 1, title: "Finalize Q3 budget review", meta: "Today, 2:00 PM", tag: "Work", done: false, hot: true },
  { id: 2, title: "Book dentist appointment", meta: "Tomorrow", tag: "Personal", done: false },
  { id: 3, title: "Draft onboarding guide", meta: "Thursday", tag: "Work", done: false },
  { id: 4, title: "Renew gym membership", meta: "Yesterday", tag: "Personal", done: true },
];

function ProductPreview() {
  const [items, setItems] = useState(DEMO);
  const toggle = (id) => setItems((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const done = items.filter((t) => t.done).length;

  return (
    <div className="card overflow-hidden shadow-pop">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <p className="text-[13px] font-semibold text-ink">This week</p>
          <p className="text-xs text-faint">
            {done} of {items.length} done
          </p>
        </div>
        <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-subtle">
          <motion.div
            className="h-full rounded-full bg-status-done"
            animate={{ width: `${(done / items.length) * 100}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          />
        </div>
      </div>
      <ul className="divide-y divide-line">
        {items.map((t) => (
          <li key={t.id}>
            <button onClick={() => toggle(t.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-subtle/60">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                  t.done ? "border-status-done bg-status-done text-white" : "border-line-strong text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-medium ${t.done ? "text-faint line-through" : "text-ink"}`}>
                  {t.title}
                </span>
                <span className={`text-xs ${t.hot && !t.done ? "font-medium text-primary-ink" : "text-muted"}`}>{t.meta}</span>
              </span>
              <span className="rounded-md bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-muted">{t.tag}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="border-t border-line bg-subtle/50 px-5 py-2.5 text-center text-xs text-faint">Try it — click a task to complete it</p>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { resolved, setTheme } = useTheme();

  useEffect(() => {
    document.title = "Efes Manager — organize, schedule and finish your tasks";
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo className="flex-1" />
          <button
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
            className="btn btn-ghost btn-icon"
            aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary opacity-[0.07] blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Simple task management
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              Manage tasks.
              <br />
              <span className="text-primary">Own your time.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Efes Manager keeps your to-dos, deadlines and reminders in one calm place, so nothing slips through the cracks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn btn-primary btn-lg">
                {isAuthenticated ? "Go to your dashboard" : "Create a free account"} <ArrowRight size={16} />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:pl-4"
          >
            <ProductPreview />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Everything you need to stay on top of your week
          </h2>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-ink">
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Ready to clear your list?</h2>
              <p className="mt-1 text-muted">It takes less than a minute to get started.</p>
            </div>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-faint sm:px-6">
          <span>© {new Date().getFullYear()} Efes Manager</span>
          <span>Built for getting things done</span>
        </div>
      </footer>
    </div>
  );
}
