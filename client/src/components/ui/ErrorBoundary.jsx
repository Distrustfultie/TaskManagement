import { Component } from "react";
import { AlertTriangle } from "lucide-react";

/** Keeps one broken view from blanking the whole app. Resets when `resetKey` changes. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-subtle text-muted">
          <AlertTriangle size={20} />
        </div>
        <p className="font-medium text-ink">Something went wrong on this page</p>
        <p className="mt-1 max-w-sm text-sm text-muted">Your data is safe. Try again, or go back to the overview.</p>
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <a className="btn btn-secondary" href="/dashboard">
            Overview
          </a>
        </div>
      </div>
    );
  }
}
