import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { useFocus } from "../context/FocusContext";
import { formatDuration } from "../utils/dates";

/** Sign out after a confirmation; a running focus session is saved first. */
export default function useSignOut() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const confirm = useConfirm();
  const focus = useFocus();

  return async () => {
    const running = focus?.session;
    const ok = await confirm({
      title: "Sign out of Efes Manager?",
      description: running
        ? `Your focus session on “${running.title}” (${formatDuration(focus.elapsed)}) will be saved first.`
        : "You'll need to sign in again to see your tasks.",
      confirmLabel: "Sign out",
      tone: "neutral",
      icon: LogOut,
      action: running ? () => focus.stop() : undefined,
    });
    if (!ok) return;
    logout();
    toast.success("Signed out");
    navigate("/login");
  };
}
