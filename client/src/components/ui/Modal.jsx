import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Accessible modal: Esc / backdrop close, focus moved in and restored,
 * body scroll locked. Renders as a bottom sheet on small screens.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const widths = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" };

  // Keep the latest onClose without re-running the open/close effect on every
  // parent render (which would steal focus while the user types).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Focus the first field (or the panel) once it has mounted
    const t = setTimeout(() => {
      // querySelector with a selector list returns the first match in DOM order
      // (that would be the close button), so look for the explicit target first.
      const panel = panelRef.current;
      const el =
        panel?.querySelector("[data-autofocus]") ||
        panel?.querySelector("input:not([type=hidden]), select, textarea");
      (el || panel)?.focus();
    }, 30);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-pop outline-none sm:rounded-2xl ${widths[size]}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
          >
            <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
              <div>
                <h2 id={titleId} className="text-base font-semibold text-ink">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm -mr-1.5 -mt-1" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="scrollbar-thin overflow-y-auto px-5 py-3 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
