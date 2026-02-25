import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(
          `https://taskmanagement-n1tx.onrender.com/api/auth/verify-email?token=${token}`
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast.success("Email verified! You can now log in.");
        navigate("/login");
      } catch (err) {
        toast.error(err.message || "Invalid or expired token");
      }
    };

    if (token) verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Verifying your email…</p>
    </div>
  );
}
