import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import PasswordField from "../../components/auth/PasswordField";
import FormAlert from "../../components/auth/FormAlert";
import Checkbox from "../../components/ui/Checkbox";
import { useAuth } from "../../context/AuthContext";
import { authApi, getErrorMessage } from "../../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: location.state?.email ?? "", password: "", rememberMe: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setError("");
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rememberMe: form.rememberMe,
      });
      login(data.token, data.user);
      toast.success(`Welcome back${data.user?.firstName ? `, ${data.user.firstName}` : ""}`);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't sign you in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      docTitle="Sign in"
      footer={
        <>
          New to Efes Manager?{" "}
          <Link to="/signup" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormAlert>{error}</FormAlert>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={set("password")}
          labelAction={
            <Link to="/forgot-password" className="link mb-1.5 text-[13px]">
              Forgot password?
            </Link>
          }
        />

        <Checkbox
          checked={form.rememberMe}
          onChange={(v) => setForm((f) => ({ ...f, rememberMe: v }))}
          label="Keep me signed in for 30 days"
          labelClassName="text-[13px] text-muted"
        />

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
