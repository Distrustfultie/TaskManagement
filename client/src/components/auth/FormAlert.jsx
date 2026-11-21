import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function FormAlert({ children, tone = "error" }) {
  if (!children) return null;
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  const cls =
    tone === "error"
      ? "border-primary/20 bg-primary-soft text-primary-ink"
      : "border-status-done/25 bg-status-done/10 text-ink";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] ${cls}`}>
      <Icon size={16} className="mt-px shrink-0" />
      <div>{children}</div>
    </div>
  );
}
