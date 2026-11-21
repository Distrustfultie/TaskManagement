import { useEffect, useRef } from "react";

/**
 * Stack of open overlays (modals, dropdowns). Escape only closes the top one,
 * so a dropdown inside a modal, or a confirm on top of a form, behaves.
 */
const stack = [];

function onKeyDown(e) {
  if (e.key !== "Escape" || !stack.length) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  stack[stack.length - 1].current?.();
}

export function useLayer(active, onEscape) {
  const handler = useRef(onEscape);
  handler.current = onEscape;

  useEffect(() => {
    if (!active) return;
    if (!stack.length) document.addEventListener("keydown", onKeyDown, true);
    stack.push(handler);
    return () => {
      const i = stack.indexOf(handler);
      if (i >= 0) stack.splice(i, 1);
      if (!stack.length) document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [active]);
}
