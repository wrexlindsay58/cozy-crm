import { cn } from "@/lib/cn";
import type { ThreadMessage } from "@/lib/file-data";
import { Initial, whoName } from "./who-mark";

export function EmailThread({
  thread,
  contact,
  onReply,
}: {
  thread: ThreadMessage[];
  contact: string;
  onReply: (root: ThreadMessage) => void;
}) {
  const root = thread[0];
  if (!root) return null;
  const subject = (root.subject || thread.find((m) => m.subject)?.subject || "No subject").replace(/^Re:\s*/i, "");
  return (
    <article className="overflow-hidden rounded-md border border-line bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-wide text-navy uppercase">Email</p>
          <p className="text-sm font-semibold break-words">{subject}</p>
        </div>
        <button
          type="button"
          onClick={() => onReply(root)}
          className="h-8 shrink-0 rounded-md border border-navy px-2.5 text-[12px] font-semibold text-navy"
        >
          Reply
        </button>
      </header>
      <ol className="space-y-2 p-2">
        {thread.map((m) => {
          const name = whoName(m, contact);
          const shop = m.from === "shop";
          return (
            <li key={m.id} className={cn("flex", shop ? "justify-end" : "justify-start")}>
              <div className={cn("flex max-w-[92%] items-start gap-2", shop && "flex-row-reverse")}>
                <Initial name={name} />
                <div
                  className={cn(
                    "min-w-0 rounded-md border bg-card px-3 py-2",
                    shop ? "border border-navy/20 border-l-[3px] border-l-navy bg-card" : "border border-navy/15 bg-info-bg",
                  )}
                >
                  <p className={cn("text-[10px] font-semibold text-muted", shop && "text-right")}>
                    {name} · {m.at}
                  </p>
                  {m.subject ? (
                    <p className={cn("mt-0.5 text-[13px] font-semibold break-words", shop && "text-right")}>{m.subject}</p>
                  ) : null}
                  <p className="mt-1 whitespace-pre-wrap text-sm">{m.text}</p>
                  {m.files?.length ? (
                    <p className="mt-2 text-[11px] font-semibold text-muted">{m.files.map((f) => f.name).join(" · ")}</p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
