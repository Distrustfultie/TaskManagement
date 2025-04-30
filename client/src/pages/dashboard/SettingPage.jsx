import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [defaultFreq, setDefaultFreq] = useState('Daily');

  useEffect(() => {
    // fetch current user settings from API
    (async () => {
      const res = await fetch('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const user = await res.json();
        setName(user.firstName + ' ' + user.lastName);
        setEmail(user.email);
        setTheme(user.theme || 'light');
        setDefaultFreq(user.defaultFreq || 'Daily');
      }
    })();
  }, []);

  const handleSave = async () => {
    const [firstName, lastName] = name.split(' ');
    const res = await fetch('http://localhost:5000/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ firstName, lastName, email, theme, defaultFreq })
    });
    if (res.ok) toast.success('Settings saved!');
    else toast.error('Save failed');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold">Settings</h1>
      {/* Profile */}
      <section>
        <h2 className="text-lg font-semibold">Profile</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full mb-4 border px-3 py-2 rounded"
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
        />
      </section>
      {/* Notifications */}
      <section>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <select
          value={defaultFreq}
          onChange={e => setDefaultFreq(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </section>
      {/* Theme */}
      <section>
        <h2 className="text-lg font-semibold">Theme</h2>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
      >
        Save
      </button>
    </div>
  );
}