import { useState } from "react";
import { addHistory } from "@/features/ops/store";
import { sendMessage, useThread } from "@/features/thread/store";
import { CallCard } from "./call-card";
import { cn } from "@/lib/cn";

export function ThreadPane({
  personId,
  mode,
}: {
  personId: string;
  mode: "customer" | "internal" | "notes";
}) {
  const rows = useThread(personId, mode);
  const [draft, setDraft] = useState("");

  function send() {
    if (mode === "notes") {
      sendMessage(personId, draft, "note");
      addHistory(personId, "Wrex Lindsay", "Note added.");
    } else if (mode === "internal") {
      sendMessage(personId, draft, "internal");
    } else {
      sendMessage(personId, draft, "sms");
    }
    setDraft("");
  }

  const emptyCopy =
    mode === "internal" ? "No internal messages." : mode === "notes" ? "No notes yet." : "No texts or calls on this file.";
  const placeholder = mode === "internal" ? "Internal" : mode === "notes" ? "Note" : "Text this house";
  const sendLabel = mode === "notes" ? "Add" : "Send";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {rows.length === 0 ? <p className="text-sm text-muted">{emptyCopy}</p> : null}
        {rows.map((m) =>
          m.channel === "call" ? (
            <CallCard key={m.id} msg={m} />
          ) : (
            <div key={m.id} className={cn("max-w-[92%]", m.from === "shop" || mode === "notes" ? "ml-auto" : "")}>
              <p className="text-[10px] font-semibold text-muted">
                {mode === "notes" ? "Note" : m.from === "shop" ? (mode === "internal" ? "Internal" : "Cozy") : "Customer"} · {m.channel} · {m.at}
              </p>
              <p className={cn("mt-0.5 rounded-md px-2.5 py-2 text-sm", m.from === "shop" || mode === "notes" ? "bg-navy text-card" : "bg-page text-ink")}>
                {m.text}
              </p>
            </div>
          ),
        )}
      </div>
      <form
        className="border-t border-line p-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor={`composer-${personId}-${mode}`}>
          {placeholder}
        </label>
        <div className="flex gap-2">
          <input
            id={`composer-${personId}-${mode}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            {sendLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
