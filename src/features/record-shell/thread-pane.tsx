import { useState } from "react";
import { addHistory } from "@/features/ops/store";
import { sendMessage, useThread } from "@/features/thread/store";
import { CallCard } from "./call-card";
import { EmailCard } from "./email-card";
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
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");

  function send() {
    if (mode === "notes") {
      sendMessage(personId, draft, "note");
      addHistory(personId, "Wrex Lindsay", "Note added.");
    } else if (mode === "internal") {
      sendMessage(personId, draft, "internal");
    } else if (channel === "email") {
      sendMessage(personId, draft, "email", { subject });
      addHistory(personId, "Wrex Lindsay", `Email sent${subject.trim() ? `. ${subject.trim()}` : "."}`);
      setSubject("");
    } else {
      sendMessage(personId, draft, "sms");
      addHistory(personId, "Wrex Lindsay", "Text sent.");
    }
    setDraft("");
  }

  const emptyCopy =
    mode === "internal" ? "No internal messages." : mode === "notes" ? "No notes yet." : "No texts, emails, or calls on this file.";
  const placeholder =
    mode === "internal" ? "Internal" : mode === "notes" ? "Note" : channel === "email" ? "Email body" : "Text this house";
  const sendLabel = mode === "notes" ? "Add" : "Send";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {rows.length === 0 ? <p className="text-sm text-muted">{emptyCopy}</p> : null}
        {rows.map((m) =>
          m.channel === "call" ? (
            <CallCard key={m.id} msg={m} />
          ) : m.channel === "email" ? (
            <EmailCard key={m.id} msg={m} />
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
        {mode === "customer" ? (
          <div className="mb-2 flex gap-1">
            {(["sms", "email"] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn("h-10 rounded-md px-3 text-sm font-semibold", channel === ch ? "bg-navy text-card" : "text-muted")}
              >
                {ch === "sms" ? "SMS" : "Email"}
              </button>
            ))}
          </div>
        ) : null}
        {mode === "customer" && channel === "email" ? (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="mb-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
        ) : null}
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
