import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "Try again.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="bg-card p-6">
      <h1 className="type-section">This page did not load</h1>
      <p className="mt-1 max-w-md text-sm text-muted">{errorMessage(error)}</p>
      <button type="button" onClick={reset} className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
        Try again
      </button>
    </div>
  );
}
