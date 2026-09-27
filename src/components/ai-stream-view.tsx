import { useAIStreamState } from "@/features/ai/use-ai-stream";

export function AIStreamView() {
  const stream = useAIStreamState();
  if (stream.status === "idle") return null;
  const detail = stream.error || stream.step || (stream.status === "done" ? "Response ready" : "Working");
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 w-72 max-w-[calc(100vw-2rem)]" aria-live="polite">
      <div className="pointer-events-auto rounded-md border border-line bg-card px-3 py-2 shadow-sm">
        <p className="text-[11px] font-bold tracking-wider text-muted uppercase">Assistant</p>
        <p className="mt-1 truncate text-sm text-ink">{detail}</p>
        {stream.text ? <p className="mt-1 line-clamp-3 text-[13px] text-muted">{stream.text}</p> : null}
      </div>
    </div>
  );
}
