import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

/**
 * Confirmation modal. `tone="danger"` for destructive actions (red icon + button);
 * `tone="neutral"` for things like signing out. Focus starts on Cancel so Enter
 * never triggers the action by accident.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busyLabel = "Working…",
  tone = "danger",
  icon = AlertTriangle,
}) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      /* the caller already reported the error */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      description={description}
      size="sm"
      role="alertdialog"
      icon={icon}
      iconTone={tone === "danger" ? "danger" : "neutral"}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={busy} data-autofocus>
            {cancelLabel}
          </button>
          <button className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`} onClick={handleConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </>
      }
    />
  );
}
