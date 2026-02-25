import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";

export default function ForgotPasswordPage() {
  const emailRef = useRef(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        "https://taskmanagement-n1tx.onrender.com/api/auth/forgot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset link");

      toast.success("Password reset link sent 📩 Check your inbox");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a reset link"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <input
          ref={emailRef}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-accent hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}