export default function NotificationBadge({ count }) {
    return (
      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
        {count}
      </span>
    );
  }