import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import PasswordField, { PasswordStrength } from "../../components/auth/PasswordField";
import FormAlert from "../../components/auth/FormAlert";
import { useAuth } from "../../context/AuthContext";
import { authApi, getErrorMessage } from "../../services/api";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setError("");
    setErrors((er) => ({ ...er, [key]: undefined }));
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const validate = () => {
    const er = {};
    if (!form.firstName.trim()) er.firstName = "Required";
    if (!form.lastName.trim()) er.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = "Enter a valid email";
    if (form.password.length < 6) er.password = "Use at least 6 characters";
    if (form.confirmPassword !== form.password) er.confirmPassword = "Passwords don't match";
    setErrors(er);
    return !Object.keys(er).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const email = form.email.trim().toLowerCase();
    try {
      await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create your account"));
      setLoading(false);
      return;
    }
    // Account exists now: sign straight in so there's no second form to fill
    try {
      const data = await authApi.login({ email, password: form.password });
      login(data.token, data.user);
      toast.success("Account created — welcome!");
      navigate("/dashboard");
    } catch {
      toast.success("Account created. Please sign in.");
      navigate("/login", { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your work in under a minute."
      docTitle="Sign up"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormAlert>{error}</FormAlert>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="label">
              First name
            </label>
            <input id="firstName" className="input" autoComplete="given-name" autoFocus value={form.firstName} onChange={set("firstName")} aria-invalid={!!errors.firstName} />
            {errors.firstName && <p className="field-error">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="label">
              Last name
            </label>
            <input id="lastName" className="input" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} aria-invalid={!!errors.lastName} />
            {errors.lastName && <p className="field-error">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" className="input" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <PasswordField id="password" label="Password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
          <PasswordStrength password={form.password} />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
