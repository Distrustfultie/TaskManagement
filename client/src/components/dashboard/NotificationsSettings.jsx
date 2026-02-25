import { useState } from "react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    inApp: true,
    email: false,
  });

  const toggle = (key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm max-w-xl">
      <h2 className="text-xl font-bold mb-4">
        Notification Preferences
      </h2>

      {[
        { key: "inApp", label: "In-app notifications" },
        { key: "email", label: "Email notifications" },
      ].map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center justify-between py-3"
        >
          <span>{label}</span>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={() => toggle(key)}
            className="w-5 h-5 accent-primary"
          />
        </label>
      ))}
    </div>
  );
}