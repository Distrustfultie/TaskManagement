import { Link } from "react-router-dom";

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="#CD1C18" />
      <path
        d="M9.5 16.5l4.5 4.5 8.5-9.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-ink">Efes Manager</span>
    </Link>
  );
}
