import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Braces, FileText, Link, Paperclip, Phone, Plus, Smile } from "lucide-react";
import { addHistory, dndOn } from "@/features/ops/store";
import { sendMessage, useThread } from "@/features/thread/store";
import { kindFromFile } from "@/features/photos/store";
import type { DndChannel } from "@/lib/crm-data";
import { cannedFor, COMPOSE_EMOJI, CUSTOM_VALUES, TRIGGER_LINKS } from "@/lib/canned";
import { Tip } from "@/components/tip";
import { TalkLine } from "./talk-line";
import { CommentBox } from "./comment-box";
import { CallCard } from "./call-card";
import { EmailCard } from "./email-card";
import { cn } from "@/lib/cn";
import type { FileKind, ThreadMessage, ThreadNest } from "@/lib/file-data";

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
  const [files, setFiles] = useState<{ name: string; kind: FileKind; src?: string }[]>([]);
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
      sendMessage(personId, draft, "email", { subject, files: files.length ? files : undefined });
      addHistory(personId, "Wrex Lindsay", `Email sent${subject.trim() ? `. ${subject.trim()}` : "."}`);
      setSubject("");
    } else {
      if (blockText) return;
      sendMessage(personId, draft, "sms", { files: files.length ? files : undefined });
      addHistory(personId, "Wrex Lindsay", "Text sent.");
    }
    setDraft("");
    setFiles([]);
  }

  const emptyCopy = mode === "internal" ? "None yet." : mode === "notes" ? "None yet." : "Nothing on this thread yet.";
  const placeholder =
    mode === "internal"
      ? "Message the shop"
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
          ? groupInternal(rows.filter((m) => !m.replyTo)).map((block, i) =>
              block.nest ? (
                <NestBlock
                  key={`${block.nest.kind}-${block.nest.id}-${i}`}
                  nest={block.nest}
                  items={block.items}
                  replies={rows.filter((m) => m.replyTo)}
                  personId={personId}
                />
              ) : (
                block.items.map((m) => (
                  <PlainInternal key={m.id} msg={m} personId={personId} replies={rows.filter((r) => r.replyTo === m.id)} />
                ))
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
                  {m.files?.length ? <p className="mt-1 text-[11px] text-muted">{m.files.map((f) => f.name).join(" · ")}</p> : null}
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
        <div className="flex gap-1">
          <div className="flex h-11 min-w-0 flex-1 items-stretch rounded-md border border-line bg-card focus-within:border-navy">
            <input
              id={`composer-${personId}-${mode}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              disabled={blocked}
              className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none disabled:opacity-50"
            />
            {mode === "customer" ? (
              <ComposeExtras
                channel={channel}
                files={files}
                onFiles={setFiles}
                onTemplate={(body, sub) => {
                  setDraft(body);
                  if (sub) setSubject(sub);
                }}
                onInsert={(bit) => setDraft((d) => (d ? `${d}${d.endsWith(" ") ? "" : " "}${bit}` : bit))}
              />
            ) : null}
          </div>
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

function NestBlock({
  nest,
  items,
  replies,
  personId,
}: {
  nest: ThreadNest;
  items: ThreadMessage[];
  replies: ThreadMessage[];
  personId: string;
}) {
  const label = nest.kind === "ticket" ? "Ticket" : nest.kind === "task" ? "Task" : nest.kind === "note" ? "Note" : "Media";
  return (
    <div className="rounded-md border border-line bg-page px-2.5 py-2">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
        {label} · {nest.title}
      </p>
      <div className="mt-2 space-y-3">
        {items.map((m) => (
          <TalkLine key={m.id} msg={m} personId={personId} nest={nest} replies={replies.filter((r) => r.replyTo === m.id)} />
        ))}
      </div>
    </div>
  );
}

function PlainInternal({ msg, personId, replies }: { msg: ThreadMessage; personId: string; replies: ThreadMessage[] }) {
  return (
    <div className="rounded-md border border-line p-2.5">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Internal · {msg.at}</p>
      <div className="mt-1">
        <TalkLine msg={msg} personId={personId} replies={replies} />
      </div>
    </div>
  );
}

function ComposeExtras({
  channel,
  files,
  onFiles,
  onTemplate,
  onInsert,
}: {
  channel: "sms" | "email";
  files: { name: string; kind: FileKind; src?: string }[];
  onFiles: (rows: { name: string; kind: FileKind; src?: string }[]) => void;
  onTemplate: (body: string, subject?: string) => void;
  onInsert: (bit: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<"icons" | "templates" | "links" | "values" | "emoji">("icons");
  const [box, setBox] = useState<DOMRect | null>(null);
  const canned = cannedFor(channel);

  function addFile(file: File | undefined) {
    if (!file) return;
    const kind = kindFromFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      onFiles([...files, { name: file.name, kind, src: typeof reader.result === "string" ? reader.result : undefined }]);
    };
    reader.readAsDataURL(file);
  }

  function close() {
    setOpen(false);
    setPane("icons");
    setBox(null);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    const el = btnRef.current;
    if (el) setBox(el.getBoundingClientRect());
    setPane("icons");
    setOpen(true);
  }

  return (
    <div className="relative shrink-0">
      <input ref={fileRef} type="file" className="sr-only" accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => addFile(e.target.files?.[0])} />
      <Tip label="Insert" on={!open} side="top">
        <button
          ref={btnRef}
          type="button"
          aria-label="Insert"
          aria-expanded={open}
          onClick={toggle}
          className="relative grid h-11 w-10 place-items-center border-l border-line text-navy"
        >
          <Plus className="size-4" />
          {files.length ? (
            <span className="absolute top-1 right-1 grid size-3.5 place-items-center rounded-full bg-navy text-[8px] font-bold text-card">{files.length}</span>
          ) : null}
        </button>
      </Tip>
      {open && box
        ? createPortal(
            <div
              className="fixed z-50 w-56 rounded-md border border-line bg-card shadow-sm"
              style={{ left: Math.max(8, box.right - 224), top: box.top - 8, transform: "translateY(-100%)" }}
            >
              {pane === "icons" ? (
                <div className="flex">
                  {(
                    [
                      { id: "attach", label: files.length ? files.map((f) => f.name).join(", ") : "Attach", icon: Paperclip, run: () => fileRef.current?.click() },
                      { id: "templates", label: "Templates", icon: FileText, run: () => setPane("templates") },
                      { id: "links", label: "Trigger links", icon: Link, run: () => setPane("links") },
                      { id: "values", label: "Custom values", icon: Braces, run: () => setPane("values") },
                      { id: "emoji", label: "Emojis", icon: Smile, run: () => setPane("emoji") },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Tip key={item.id} label={item.label} on side="top">
                        <button type="button" aria-label={item.label} onClick={item.run} className="grid h-10 flex-1 place-items-center text-navy hover:bg-page">
                          <Icon className="size-4" />
                        </button>
                      </Tip>
                    );
                  })}
                </div>
              ) : (
                <div className="py-1">
                  <button type="button" className="px-3 py-1 text-[11px] font-semibold text-muted" onClick={() => setPane("icons")}>
                    Back
                  </button>
                  {pane === "templates"
                    ? canned.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onTemplate(c.body, c.subject);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "links"
                    ? TRIGGER_LINKS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onInsert(c.insert);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "values"
                    ? CUSTOM_VALUES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onInsert(c.insert);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "emoji" ? (
                    <div className="grid grid-cols-5 gap-0 px-1 pb-1">
                      {COMPOSE_EMOJI.map((e) => (
                        <button
                          key={e}
                          type="button"
                          className="grid h-10 place-items-center text-base hover:bg-page"
                          onClick={() => {
                            onInsert(e);
                            close();
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
