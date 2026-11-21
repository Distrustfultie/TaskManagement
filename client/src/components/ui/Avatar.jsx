export default function Avatar({ user, size = 32 }) {
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-ink"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
