import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTasks } from "./TasksContext";
import { formatDuration } from "../utils/dates";

const FocusContext = createContext(null);
const KEY = "focus-session";

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s && s.taskId && s.startedAt ? s : null;
  } catch {
    return null;
  }
}

/**
 * One running focus session at a time: { taskId, title, startedAt, minutes }.
 * Survives reloads via localStorage; tracked time is saved to the task on stop.
 */
export function FocusProvider({ children }) {
  const { logTime } = useTasks();
  const [session, setSession] = useState(load);
  const [now, setNow] = useState(Date.now());
  const stopping = useRef(false);

  useEffect(() => {
    try {
      session ? localStorage.setItem(KEY, JSON.stringify(session)) : localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable: the session just won't survive a reload */
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [session]);

  const elapsed = session ? Math.max(0, Math.floor((now - session.startedAt) / 1000)) : 0;

  const stop = useCallback(
    async ({ save = true } = {}) => {
      if (!session || stopping.current) return;
      stopping.current = true;
      const seconds = Math.min(Math.floor((Date.now() - session.startedAt) / 1000), session.minutes ? session.minutes * 60 : Infinity);
      setSession(null);
      try {
        if (save && seconds >= 60) {
          await logTime(session.taskId, seconds);
          toast.success(`${formatDuration(seconds)} tracked on “${session.title}”`);
        } else if (save) {
          toast("Sessions under a minute aren't saved", { icon: "⏱️" });
        }
      } catch {
        /* toast shown */
      } finally {
        stopping.current = false;
      }
    },
    [session, logTime]
  );

  // Pomodoro-style sessions end themselves
  useEffect(() => {
    if (session?.minutes && elapsed >= session.minutes * 60) {
      toast.success("Focus session complete — take a short break");
      stop();
    }
  }, [elapsed, session, stop]);

  const start = useCallback(
    (task, minutes = null) => {
      if (session) {
        toast.error("Stop the current focus session first");
        return;
      }
      setNow(Date.now());
      setSession({ taskId: task._id, title: task.title, startedAt: Date.now(), minutes });
    },
    [session]
  );

  const value = useMemo(() => ({ session, elapsed, start, stop }), [session, elapsed, start, stop]);
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export const useFocus = () => useContext(FocusContext);
