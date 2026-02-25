import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const passwordRef = useRef(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: "Weak", color: "bg-red-500" };
    if (/[A-Z]/.test(password) && /\d/.test(password))
      return { label: "Strong", color: "bg-green-500" };
    return { label: "Medium", color: "bg-yellow-500" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://taskmanagement-n1tx.onrender.com/api/auth/reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      toast.success("Password reset successful 🔐");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Choose a strong password to secure your account"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* New password */}
        <div className="relative">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-accent hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}