import { useState } from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
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
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={busy} data-autofocus>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </>
      }
    />
  );
}
