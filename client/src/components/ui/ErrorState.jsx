import { WifiOff } from "lucide-react";
import EmptyState from "./EmptyState";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="card">
      <EmptyState
        icon={WifiOff}
        title="Couldn't load your tasks"
        description={message}
        action={
          onRetry && (
            <button onClick={onRetry} className="btn btn-secondary">
              Try again
            </button>
          )
        }
      />
    </div>
  );
}
