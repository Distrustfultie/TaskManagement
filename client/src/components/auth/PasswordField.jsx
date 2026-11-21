import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function getPasswordStrength(p) {
  if (!p) return null;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (p.length < 6) return { level: 1, label: "Too short" };
  if (score <= 2) return { level: 2, label: "Fair" };
  if (score <= 3) return { level: 3, label: "Good" };
  return { level: 4, label: "Strong" };
}

export function PasswordStrength({ password }) {
  const s = getPasswordStrength(password);
  if (!s) return null;
  const color = ["", "bg-primary", "bg-status-todo", "bg-status-done", "bg-status-done"][s.level];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= s.level ? color : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Password strength: <span className="font-medium text-ink">{s.label}</span>
      </p>
    </div>
  );
}

export default function PasswordField({ id, label, error, labelAction, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} className="input pr-10" aria-invalid={!!error} {...props} />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
