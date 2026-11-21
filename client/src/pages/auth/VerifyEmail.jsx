// Not routed: email verification is disabled for the MVP. Kept for when it returns.
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import FormAlert from "../../components/auth/FormAlert";
import { http, getErrorMessage } from "../../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [error, setError] = useState(token ? "" : "This verification link is missing its token.");

  useEffect(() => {
    if (!token) return;
    http
      .get("/api/auth/verify-email", { params: { token } })
      .then(() => {
        toast.success("Email verified! You can now sign in.");
        navigate("/login");
      })
      .catch((err) => setError(getErrorMessage(err, "Invalid or expired link")));
  }, [token, navigate]);

  return (
    <AuthLayout title={error ? "Couldn't verify your email" : "Verifying your email…"} docTitle="Verify email">
      {error ? (
        <div className="space-y-4">
          <FormAlert>{error}</FormAlert>
          <Link to="/login" className="btn btn-secondary w-full">
            Back to sign in
          </Link>
        </div>
      ) : (
        <p className="text-muted">This only takes a moment.</p>
      )}
    </AuthLayout>
  );
}
