import { useState } from "react";
import { Phone } from "lucide-react";
import { addHistory, dndOn } from "@/features/ops/store";
import { sendMessage, useThread } from "@/features/thread/store";
import type { DndChannel } from "@/lib/crm-data";
import { CommentBox } from "./comment-box";
import { CallCard } from "./call-card";
import { EmailCard } from "./email-card";
import { cn } from "@/lib/cn";
import type { ThreadMessage, ThreadNest } from "@/lib/file-data";

export function ThreadPane({
  personId,
  mode,
  onCall,
  dnd,
}: {
  personId: string;
  mode: "customer" | "internal" | "notes";
  onCall?: () => void;
  dnd?: DndChannel[];
}) {
  const rows = useThread(personId, mode);
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const blockText = dndOn({ dnd }, "text");
  const blockEmail = dndOn({ dnd }, "email");
  const blockCall = dndOn({ dnd }, "call");

  function send() {
    if (mode === "notes") {
      sendMessage(personId, draft, "note");
      addHistory(personId, "Wrex Lindsay", "Note added.");
    } else if (mode === "internal") {
      sendMessage(personId, draft, "internal");
    } else if (channel === "email") {
      if (blockEmail) return;
      sendMessage(personId, draft, "email", { subject });
      addHistory(personId, "Wrex Lindsay", `Email sent${subject.trim() ? `. ${subject.trim()}` : "."}`);
      setSubject("");
    } else {
      if (blockText) return;
      sendMessage(personId, draft, "sms");
      addHistory(personId, "Wrex Lindsay", "Text sent.");
    }
    setDraft("");
  }

  const emptyCopy = mode === "internal" ? "None yet." : mode === "notes" ? "None yet." : "Nothing on this thread yet.";
  const placeholder =
    mode === "internal"
      ? "Internal"
      : mode === "notes"
        ? "Note"
        : channel === "email"
          ? blockEmail
            ? "DND on email"
            : "Write the email"
          : blockText
            ? "DND on texts"
            : "Send a text";
  const sendLabel = mode === "notes" ? "Add" : "Send";
  const blocked = mode === "customer" && ((channel === "sms" && blockText) || (channel === "email" && blockEmail));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {rows.length === 0 ? <p className="text-sm text-muted">{emptyCopy}</p> : null}
        {mode === "internal"
          ? groupInternal(rows).map((block, i) =>
              block.nest ? (
                <NestBlock key={`${block.nest.kind}-${block.nest.id}-${i}`} nest={block.nest} items={block.items} />
              ) : (
                block.items.map((m) => <PlainInternal key={m.id} text={m.text} at={m.at} />)
              ),
            )
          : rows.map((m) =>
              m.channel === "call" ? (
                <CallCard key={m.id} msg={m} />
              ) : m.channel === "email" ? (
                <EmailCard key={m.id} msg={m} />
              ) : (
                <div key={m.id} className={cn("max-w-[92%]", m.from === "shop" || mode === "notes" ? "ml-auto" : "")}>
                  <p className="text-[10px] font-semibold text-muted">
                    {mode === "notes" ? "Note" : m.from === "shop" ? "Cozy" : "Customer"} · {m.channel} · {m.at}
                  </p>
                  <p className={cn("mt-0.5 rounded-md px-2.5 py-2 text-sm", m.from === "shop" || mode === "notes" ? "bg-navy text-card" : "bg-page text-ink")}>
                    {m.text}
                  </p>
                  {mode === "notes" ? <CommentBox personId={personId} nest={{ kind: "note", id: m.id, title: m.text.slice(0, 48) }} /> : null}
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
            {onCall ? (
              <button
                type="button"
                aria-label="Call"
                onClick={onCall}
                disabled={blockCall}
                className="ml-auto grid size-10 place-items-center rounded-md text-navy disabled:opacity-40"
              >
                <Phone className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}
        {mode === "customer" && channel === "email" ? (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            disabled={blockEmail}
            className="mb-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy disabled:opacity-50"
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
            disabled={blocked}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy disabled:opacity-50"
          />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            {sendLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function groupInternal(rows: ThreadMessage[]) {
  const blocks: { nest?: ThreadNest; items: ThreadMessage[] }[] = [];
  for (const m of rows) {
    if (!m.nest) {
      blocks.push({ items: [m] });
      continue;
    }
    const last = blocks[blocks.length - 1];
    if (last?.nest && last.nest.kind === m.nest.kind && last.nest.id === m.nest.id) last.items.push(m);
    else blocks.push({ nest: m.nest, items: [m] });
  }
  return blocks;
}

function NestBlock({ nest, items }: { nest: ThreadNest; items: ThreadMessage[] }) {
  const label = nest.kind === "ticket" ? "Ticket" : nest.kind === "task" ? "Task" : nest.kind === "note" ? "Note" : "Media";
  return (
    <div className="rounded-md border border-line bg-page px-2.5 py-2">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
        {label} · {nest.title}
      </p>
      {items.map((m) => (
        <p key={m.id} className={cn("mt-1 text-sm", m.replyTo && "ml-3 text-muted")}>
          {m.text}
          <span className="ml-1 text-[10px] text-muted">{m.at}</span>
        </p>
      ))}
    </div>
  );
}

function PlainInternal({ text, at }: { text: string; at: string }) {
  return (
    <div className="ml-auto max-w-[92%]">
      <p className="text-[10px] font-semibold text-muted">Internal · {at}</p>
      <p className="mt-0.5 rounded-md bg-navy px-2.5 py-2 text-sm text-card">{text}</p>
    </div>
  );
}
