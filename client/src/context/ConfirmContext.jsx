import { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const ConfirmContext = createContext(null);

/**
 * `const ok = await confirm({ title, description, confirmLabel, tone, icon })`
 * One shared confirmation modal for the whole app. Resolves true/false.
 * Pass `action` to run async work inside the dialog (button shows busy state).
 */
export function ConfirmProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current?.(false); // a newer request supersedes an unanswered one
        resolver.current = resolve;
        setOpts(options);
      }),
    []
  );

  const settle = (value) => {
    resolver.current?.(value);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!opts}
        {...(opts ?? {})}
        onConfirm={async () => {
          if (opts?.action) await opts.action();
          settle(true);
        }}
        onClose={() => {
          settle(false);
          setOpts(null);
        }}
      />
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
