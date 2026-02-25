import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import AuthForm from "../../components/auth/AuthForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://taskmanagement-n1tx.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      toast.success("Welcome back 👋");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Efes Manager"
    >
      <AuthForm type="login" onSubmit={handleLogin} loading={loading} />

      <div className="mt-6 text-center text-sm text-accent">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Create one
        </Link>
        <br />
        <Link to="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}