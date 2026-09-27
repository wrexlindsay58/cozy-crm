import type { ErrorComponentProps } from "@tanstack/react-router";

export function ListError({ error, reset, title }: ErrorComponentProps & { title: string }) {
  const message = error instanceof Error && error.message ? error.message : "This list did not load.";
  return (
    <div className="bg-card p-6">
      <h1 className="type-section">{title} did not load</h1>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      <button type="button" onClick={reset} className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
        Try again
      </button>
    </div>
  );
}
