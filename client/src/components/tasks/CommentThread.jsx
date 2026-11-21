import { useEffect, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { commentApi, getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TasksContext";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { fullName } from "../../utils/projects";

export default function CommentThread({ taskId }) {
  const { user } = useAuth();
  const { patchTask } = useTasks();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let alive = true;
    commentApi
      .list(taskId)
      .then((c) => alive && setComments(c))
      .catch((err) => {
        if (!alive) return;
        setComments([]);
        toast.error(getErrorMessage(err, "Couldn't load comments"));
      });
    return () => {
      alive = false;
    };
  }, [taskId]);

  // Braces matter: scrollIntoView may return a value, and an effect must return nothing or a cleanup
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [comments?.length]);

  const submit = async (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;
    setBusy(true);
    try {
      const c = await commentApi.create(taskId, value);
      setComments((prev) => [...(prev ?? []), c]);
      patchTask(taskId, (t) => ({ commentCount: (t.commentCount ?? 0) + 1 }));
      setText("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't post the comment"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    try {
      await commentApi.remove(taskId, c._id);
      setComments((prev) => prev.filter((x) => x._id !== c._id));
      patchTask(taskId, (t) => ({ commentCount: Math.max(0, (t.commentCount ?? 1) - 1) }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the comment"));
    }
  };

  return (
    <div className="space-y-4 pb-2">
      {!comments ? (
        <Skeleton className="h-16" />
      ) : comments.length === 0 ? (
        <EmptyState compact icon={MessageSquare} title="No comments yet" description="Discuss details, share updates or ask a question." />
      ) : (
        <ol className="space-y-4">
          {comments.map((c) => (
            <li key={c._id} className="group flex gap-3">
              <Avatar user={c.user} size={28} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px]">
                  <span className="font-medium text-ink">{c.user?._id === user?._id ? "You" : fullName(c.user)}</span>
                  <span className="ml-2 text-xs text-faint">{formatDistanceToNowStrict(new Date(c.createdAt), { addSuffix: true })}</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">{c.text}</p>
              </div>
              {c.user?._id === user?._id && (
                <button
                  onClick={() => remove(c)}
                  className="btn btn-ghost btn-icon btn-sm h-7 w-7 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
          <li ref={endRef} aria-hidden="true" />
        </ol>
      )}

      <form onSubmit={submit} className="flex items-start gap-3 border-t border-line pt-4">
        <Avatar user={user} size={28} />
        <div className="flex-1 space-y-2">
          <textarea
            className="input h-auto min-h-[72px] py-2"
            placeholder="Write a comment…  (Ctrl+Enter to send)"
            value={text}
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && submit(e)}
            aria-label="Comment"
          />
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>
              {busy ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
