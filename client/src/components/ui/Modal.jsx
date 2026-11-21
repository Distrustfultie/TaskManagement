import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useLayer } from "../../utils/layers";

// Scroll lock shared by stacked modals: unlock only when the last one closes
let locks = 0;
const lockScroll = () => {
  if (locks++ === 0) document.body.style.overflow = "hidden";
};
const unlockScroll = () => {
  if (--locks <= 0) {
    locks = 0;
    document.body.style.overflow = "";
  }
};

const ICON_TONES = {
  danger: "bg-primary-soft text-primary-ink",
  neutral: "bg-subtle text-muted",
};

/**
 * Accessible modal: Esc (top-most layer only) / backdrop / X close, focus moved
 * in and restored, body scroll locked. Bottom sheet on small screens.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  icon: Icon,
  iconTone = "neutral",
  role = "dialog",
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);
  const widths = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" };

  // Keep the latest onClose without re-running the open/close effect on every
  // parent render (which would steal focus while the user types).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useLayer(open, () => onCloseRef.current?.());

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    lockScroll();

    // Focus the explicit target, else the first field, else the panel
    const t = setTimeout(() => {
      const panel = panelRef.current;
      const el = panel?.querySelector("[data-autofocus]") || panel?.querySelector("input:not([type=hidden]), textarea");
      (el || panel)?.focus();
    }, 30);

    return () => {
      clearTimeout(t);
      unlockScroll();
      previouslyFocused?.focus?.({ preventScroll: true });
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
            onClick={() => onCloseRef.current?.()}
          />
          <motion.div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-pop outline-none sm:rounded-2xl ${widths[size]}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
          >
            <div className={`flex items-start gap-4 px-5 pt-5 sm:px-6 ${children ? "pb-2" : "pb-5"}`}>
              {Icon && (
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ICON_TONES[iconTone] ?? ICON_TONES.neutral}`}>
                  <Icon size={19} />
                </span>
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 id={titleId} className="text-base font-semibold text-ink">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                )}
              </div>
              <button onClick={() => onCloseRef.current?.()} className="btn btn-ghost btn-icon btn-sm -mr-1.5 -mt-1" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {children && <div className="scrollbar-thin overflow-y-auto px-5 py-3 sm:px-6">{children}</div>}
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
