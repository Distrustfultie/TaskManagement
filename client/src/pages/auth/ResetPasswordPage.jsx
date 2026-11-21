import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import PasswordField, { PasswordStrength } from "../../components/auth/PasswordField";
import FormAlert from "../../components/auth/FormAlert";
import { authApi, getErrorMessage } from "../../services/api";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const back = (
    <Link to="/login" className="link inline-flex items-center gap-1">
      <ArrowLeft size={14} /> Back to sign in
    </Link>
  );

  if (!token) {
    return (
      <AuthLayout title="This link isn't valid" subtitle="The reset link is missing or incomplete." docTitle="Reset password" footer={back}>
        <Link to="/forgot-password" className="btn btn-primary btn-lg w-full">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const er = {};
    if (password.length < 6) er.password = "Use at least 6 characters";
    if (confirm !== password) er.confirm = "Passwords don't match";
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await authApi.reset(token, password);
      toast.success("Password updated. Sign in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't reset your password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Make it something you haven't used before." docTitle="Reset password" footer={back}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormAlert>
          {error}
          {error && /invalid|expired/i.test(error) && (
            <>
              {" "}
              <Link to="/forgot-password" className="font-medium underline">
                Request a new link
              </Link>
            </>
          )}
        </FormAlert>
        <div>
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((x) => ({ ...x, password: undefined }));
            }}
            error={errors.password}
          />
          <PasswordStrength password={password} />
        </div>
        <PasswordField
          id="confirm"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setErrors((x) => ({ ...x, confirm: undefined }));
          }}
          error={errors.confirm}
        />
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
