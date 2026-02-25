import { useEffect, useRef, useState } from "react";

export default function AuthForm({ type, onSubmit, loading }) {
  const emailRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "bg-red-500" };
    if (/[A-Z]/.test(p) && /\d/.test(p))
      return { label: "Strong", color: "bg-green-500" };
    return { label: "Medium", color: "bg-yellow-500" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const credentials =
      type === "login"
        ? { email: form.email, password: form.password }
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 text-red-600 text-sm px-4 py-2">
          {error}
        </div>
      )}

      {/* Names */}
      {type === "signup" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      )}

      {/* Email */}
      <input
        ref={emailRef}
        type="email"
        name="email"
        placeholder="Email address"
        value={form.email}
        onChange={handleChange}
        className="input"
        required
      />

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="input pr-14"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-primary hover:underline"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Strength meter */}
      {strength && (
        <div>
          <div className="h-1 rounded bg-dark/10">
            <div
              className={`h-1 rounded ${strength.color}`}
              style={{
                width:
                  strength.label === "Weak"
                    ? "33%"
                    : strength.label === "Medium"
                    ? "66%"
                    : "100%",
              }}
            />
          </div>
          <p className="text-xs text-accent mt-1">
            Password strength: {strength.label}
          </p>
        </div>
      )}

      {/* Confirm password */}
      {type === "signup" && (
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="input"
          required
        />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-accent hover:-translate-y-0.5 disabled:opacity-50"
      >
        {loading
          ? "Please wait…"
          : type === "login"
          ? "Sign In"
          : "Create Account"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-dark/10 flex-1" />
        <span className="text-xs text-accent">or</span>
        <div className="h-px bg-dark/10 flex-1" />
      </div>

      {/* Social buttons (UI only) */}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="social-btn">
          Google
        </button>
        <button type="button" className="social-btn">
          GitHub
        </button>
      </div>
    </form>
  );
}