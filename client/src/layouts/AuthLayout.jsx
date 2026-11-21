import { useEffect } from "react";
import { motion } from "framer-motion";
import { BellRing, CalendarDays, CheckCircle2 } from "lucide-react";
import Logo from "../components/ui/Logo";

const POINTS = [
  { icon: CheckCircle2, text: "Track every task from To Do to Done" },
  { icon: CalendarDays, text: "Drag tasks across your calendar to reschedule" },
  { icon: BellRing, text: "Get email reminders before things are due" },
];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-[#2a0508] lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Soft brand glow + grid texture */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#CD1C18] opacity-40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full bg-[#FFA896] opacity-20 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative" />

      <div className="relative max-w-md">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
          A calmer way to get through your list.
        </h2>
        <ul className="mt-8 space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[15px] text-white/80">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Efes Manager</p>
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children, footer, docTitle }) {
  useEffect(() => {
    document.title = `${docTitle ?? title} · Efes Manager`;
  }, [docTitle, title]);

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[1fr_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-[13px] text-muted">{footer}</div>}
          </motion.div>
        </div>
      </div>
      <BrandPanel />
    </div>
  );
}
