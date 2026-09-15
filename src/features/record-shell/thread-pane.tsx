import { useState } from "react";
import { sendMessage, useThread } from "@/features/thread/store";
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
  const [draft, setDraft] = useState("");

  function send() {
    sendMessage(personId, draft, internal);
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{internal ? "No internal notes on this file." : "No texts on this file."}</p>
        ) : null}
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
            className="h-10 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
