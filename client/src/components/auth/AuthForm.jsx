import { useState } from 'react';

export default function AuthForm({ type, onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === 'signup' && form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Build credentials to send
    const credentials =
      type === 'login'
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email.toLowerCase().trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
          };

    onSubmit(credentials);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-secondary/10 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-dark mb-6 text-center">
        {type === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'signup' && (
          <>
            <div>
              <label className="block text-accent mb-2">First name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-accent mb-2">Last name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-accent mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <div>
          <label className="block text-accent mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        {type === 'signup' && (
          <div>
            <label className="block text-accent mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
              required
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading ? 'Please wait...' : type === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
