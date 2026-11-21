import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import FormAlert from "../../components/auth/FormAlert";
import { authApi, getErrorMessage } from "../../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Enter the email you signed up with.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgot(value);
      setSentTo(value);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't send the reset link"));
    } finally {
      setLoading(false);
    }
  };

  const back = (
    <Link to="/login" className="link inline-flex items-center gap-1">
      <ArrowLeft size={14} /> Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" docTitle="Reset password" footer={back}>
        <div className="flex flex-col items-center rounded-xl border border-line bg-subtle/50 px-6 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-done/10 text-status-done">
            <MailCheck size={22} />
          </span>
          <p className="mt-4 text-ink">
            We sent a reset link to <span className="font-medium">{sentTo}</span>.
          </p>
          <p className="mt-1 text-[13px] text-muted">It expires in 1 hour. Check your spam folder if you don&apos;t see it.</p>
          <button className="btn btn-ghost btn-sm mt-4" onClick={() => setSentTo("")}>
            Use a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      docTitle="Reset password"
      footer={back}
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
            value={email}
            onChange={(e) => {
              setError("");
              setEmail(e.target.value);
            }}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
