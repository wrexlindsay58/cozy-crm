import { useState } from "react";
import { sendMessage, useThread } from "@/features/thread/store";
import { useOps } from "@/features/ops/store";
import { cn } from "@/lib/cn";

export function ThreadPane({
  personId,
  mode,
}: {
  personId: string;
  mode: "customer" | "internal";
}) {
  const internal = mode === "internal";
  const rows = useThread(personId, internal);
  const { history } = useOps();
  const [draft, setDraft] = useState("");
  const fileHistory = internal
    ? []
    : (history[personId] ?? []).filter((h) => !h.what.startsWith("Call "));

  function send() {
    sendMessage(personId, draft, internal);
    setDraft("");
  }

  const empty = rows.length === 0 && fileHistory.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {empty ? (
          <p className="text-sm text-muted">{internal ? "No internal notes on this file." : "No texts or history on this file."}</p>
        ) : null}
        {fileHistory
          .slice()
          .reverse()
          .map((h) => (
            <div key={`${h.at}-${h.what}`} className="px-1">
              <p className="text-center text-[11px] font-semibold text-muted">
                {h.at} · {h.who}
              </p>
              <p className="text-center text-[13px] text-muted">{h.what}</p>
            </div>
          ))}
        {rows.map((m) => (
          <div key={m.id} className={cn("max-w-[92%]", m.from === "shop" ? "ml-auto" : "")}>
            <p className="text-[10px] font-semibold text-muted">
              {m.from === "shop" ? (internal ? "Internal" : "Cozy") : "Customer"} · {m.channel} · {m.at}
            </p>
            <p className={cn("mt-0.5 rounded-md px-2.5 py-2 text-sm", m.from === "shop" ? "bg-navy text-card" : "bg-page text-ink")}>
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <form
        className="border-t border-line p-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor={`composer-${personId}-${mode}`}>
          {internal ? "Internal note" : "Text"}
        </label>
        <div className="flex gap-2">
          <input
            id={`composer-${personId}-${mode}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={internal ? "Internal note" : "Text this house"}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
