import { useRef, useState } from "react";
import { ChevronDown, Braces, DollarSign, FileText, Link, Paperclip, Phone, Plus, Smile } from "lucide-react";
import { addHistory, dndOn, useOps } from "@/features/ops/store";
import { sendMessage, useThread, isBlocked } from "@/features/thread/store";
import { kindFromFile } from "@/features/photos/store";
import type { DndChannel } from "@/lib/crm-data";
import { cannedFor, COMPOSE_EMOJI, CUSTOM_VALUES, PAY_ASKS, TRIGGER_LINKS } from "@/lib/canned";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { setCallFrom, setEmailFrom, setSmsFrom, useFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { TalkLine } from "./talk-line";
import { CommentBox } from "./comment-box";
import { CallCard } from "./call-card";
import { EmailThread } from "./email-card";
import { cn } from "@/lib/cn";
import { accounts } from "@/lib/crm-data";
import { Initial, whoName } from "./who-mark";
import type { FileKind, ThreadMessage, ThreadNest } from "@/lib/file-data";

export function ThreadPane({
  personId,
  mode,
  onCall,
  dnd,
  actionId,
  actionKind,
  actionTitle,
  actionIds,
  scope = "house",
  onScope,
}: {
  personId: string;
  mode: "customer" | "internal" | "notes";
  onCall?: () => void;
  dnd?: DndChannel[];
  actionId?: string;
  actionKind?: "ticket" | "task" | "request";
  actionTitle?: string;
  actionIds?: string[];
  scope?: "action" | "house";
  onScope?: (next: "action" | "house") => void;
}) {
  const { leads } = useOps();
  const contact =
    leads.find((l) => l.id === personId)?.name ??
    accounts.find((a) => a.id === personId)?.name ??
    "Customer";
  const ids = scope === "action" && actionIds?.length ? actionIds : undefined;
  const rows = useThread(personId, mode, ids);
  const houseRows = useThread(personId, mode);
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [replyRoot, setReplyRoot] = useState<ThreadMessage | null>(null);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [files, setFiles] = useState<{ name: string; kind: FileKind; src?: string }[]>([]);
  const from = useFrom();
  const { numbers, emails } = useMoneySettings();
  const blockText = dndOn({ dnd }, "text");
  const blockEmail = dndOn({ dnd }, "email");
  const blockCall = dndOn({ dnd }, "call");
  const stamp = scope === "action" && actionId ? { actionId, actionKind } : undefined;
  const nest =
    stamp && mode === "internal"
      ? { kind: actionKind ?? "ticket", id: actionId!, title: actionTitle || actionId! }
      : undefined;

  function send() {
    if (mode === "notes") {
      sendMessage(personId, draft, "note", stamp);
      addHistory(personId, "Wrex Lindsay", "Note added.");
    } else if (mode === "internal") {
      sendMessage(personId, draft, "internal", { ...stamp, nest });
    } else if (channel === "email") {
      if (blockEmail) return;
      sendMessage(personId, draft, "email", {
        subject,
        replyTo: replyRoot?.id,
        files: files.length ? files : undefined,
        ...stamp,
      });
      addHistory(personId, "Wrex Lindsay", `Email sent${subject.trim() ? `. ${subject.trim()}` : "."}`);
      setSubject("");
      setReplyRoot(null);
    } else {
      if (blockText) return;
      sendMessage(personId, draft, "sms", { files: files.length ? files : undefined, ...stamp });
      addHistory(personId, "Wrex Lindsay", "Text sent.");
    }
    setDraft("");
    setFiles([]);
  }

  const word = actionKind ?? "ticket";
  const emptyCopy =
    scope === "action"
      ? `Nothing on this ${word} yet.`
      : mode === "internal"
        ? "None yet."
        : mode === "notes"
          ? "None yet."
          : "Nothing on this thread yet.";
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
  const showScope = Boolean(actionId && onScope && (mode === "customer" || mode === "internal"));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showScope ? (
        <button
          type="button"
          onClick={() => onScope?.(scope === "action" ? "house" : "action")}
          className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-page px-3 py-2 text-left"
        >
          <p className="min-w-0 truncate text-[12px] font-semibold text-navy">
            {scope === "action"
              ? mode === "internal"
                ? "View all Internal on this house"
                : "View all customer talk"
              : `Back to this ${word}`}
          </p>
          <p className="shrink-0 text-[11px] text-muted">
            {scope === "action" ? `${rows.length} on this ${word}` : `All talk · ${houseRows.length}`}
          </p>
        </button>
      ) : null}
      {mode === "customer" && isBlocked(personId) ? (
        <p className="shrink-0 border-b border-line bg-stop-bg px-3 py-2 text-[12px] font-semibold text-stop">
          Blocked. This contact can't reach this inbox.
        </p>
      ) : null}
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
                  contact={contact}
                />
              ) : (
                block.items.map((m) => (
                  <PlainInternal key={m.id} msg={m} personId={personId} contact={contact} replies={rows.filter((r) => r.replyTo === m.id)} />
                ))
              ),
            )
          : stitch(rows).map((row) =>
              row.kind === "call" ? (
                <CallCard key={row.msg.id} msg={row.msg} contact={contact} />
              ) : row.kind === "mail" ? (
                <EmailThread
                  key={row.thread[0]?.id}
                  thread={row.thread}
                  contact={contact}
                  onReply={(root) => {
                    setChannel("email");
                    setReplyRoot(root);
                    const base = (root.subject ?? "Email").replace(/^Re:\s*/i, "");
                    setSubject(`Re: ${base}`);
                  }}
                />
              ) : row.msg.channel === "note" ? (
                <NoteCard key={row.msg.id} msg={row.msg} />
              ) : (
                <Bubble key={row.msg.id} msg={row.msg} contact={contact} />
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
          <div className="mb-2 flex items-center gap-1">
            <FromSplit
              label="SMS"
              active={channel === "sms"}
              onPick={() => setChannel("sms")}
              current={from.smsFrom}
              options={numbers.map((n) => ({ label: `${n.office} · ${n.number}`, value: n.number }))}
              onFrom={setSmsFrom}
            />
            <FromSplit
              label="Email"
              active={channel === "email"}
              onPick={() => setChannel("email")}
              current={from.emailFrom}
              options={emails.map((n) => ({ label: `${n.office} · ${n.email}`, value: n.email }))}
              onFrom={setEmailFrom}
            />
            {onCall ? (
              <div className="ml-auto">
                <FromSplit
                  label=""
                  aria="Call"
                  icon
                  onPick={onCall}
                  current={from.callFrom}
                  options={numbers.map((n) => ({ label: `${n.office} · ${n.number}`, value: n.number }))}
                  onFrom={setCallFrom}
                  disabled={blockCall}
                />
              </div>
            ) : null}
          </div>
        ) : null}
        {mode === "customer" && channel === "email" ? (
          <>
            {replyRoot ? (
              <p className="mb-2 flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-[12px]">
                <span className="min-w-0 truncate">Reply · {(replyRoot.subject ?? "Email").replace(/^Re:\s*/i, "")}</span>
                <button
                  type="button"
                  className="shrink-0 font-semibold text-navy"
                  onClick={() => {
                    setReplyRoot(null);
                    setSubject("");
                  }}
                >
                  Cancel
                </button>
              </p>
            ) : null}
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              disabled={blockEmail}
              className="mb-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy disabled:opacity-50"
            />
          </>
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

type Stitched =
  | { kind: "call"; msg: ThreadMessage }
  | { kind: "sms"; msg: ThreadMessage }
  | { kind: "mail"; thread: ThreadMessage[] };

function stitch(rows: ThreadMessage[]): Stitched[] {
  const mail = rows.filter((m) => m.channel === "email");
  const byId = new Map(mail.map((m) => [m.id, m]));
  function rootOf(m: ThreadMessage) {
    let cur = m;
    const seen = new Set<string>();
    while (cur.replyTo && byId.has(cur.replyTo) && !seen.has(cur.id)) {
      seen.add(cur.id);
      const next = byId.get(cur.replyTo);
      if (!next) break;
      cur = next;
    }
    return cur.id;
  }
  const groups = new Map<string, ThreadMessage[]>();
  for (const m of mail) {
    const id = rootOf(m);
    const list = groups.get(id) ?? [];
    list.push(m);
    groups.set(id, list);
  }
  const last = new Map<string, string>();
  for (const [id, list] of groups) last.set(id, list[list.length - 1]?.id ?? id);
  const out: Stitched[] = [];
  for (const m of rows) {
    if (m.channel === "email") {
      const id = rootOf(m);
      if (m.id !== last.get(id)) continue;
      const thread = groups.get(id);
      if (thread) out.push({ kind: "mail", thread });
      continue;
    }
    if (m.channel === "call") out.push({ kind: "call", msg: m });
    else out.push({ kind: "sms", msg: m });
  }
  return out;
}

function NoteCard({ msg }: { msg: ThreadMessage }) {
  const name = msg.by || "Cozy";
  return (
    <article className="rounded-md border border-line bg-card px-3 py-3">
      <div className="flex items-start gap-2">
        <Initial name={name} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted">
            {name} · note · {msg.at}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{msg.text}</p>
        </div>
      </div>
      <CommentBox personId={msg.personId} nest={{ kind: "note", id: msg.id, title: msg.text.slice(0, 48) }} />
    </article>
  );
}

function Bubble({ msg, contact }: { msg: ThreadMessage; contact: string }) {
  const name = whoName(msg, contact);
  const mine = msg.from === "shop";
  return (
    <div className={cn("flex max-w-[92%] items-end gap-2", mine && "ml-auto flex-row-reverse")}>
      <Initial name={name} />
      <div className="min-w-0">
        <p className={cn("text-[10px] font-semibold text-muted", mine && "text-right")}>
          {name} · {msg.channel} · {msg.at}
        </p>
        <p className={cn("mt-0.5 rounded-md px-2.5 py-2 text-sm", mine ? "bg-navy text-card" : "bg-page text-ink")}>{msg.text}</p>
        {msg.files?.length ? (
          <p className={cn("mt-1 text-[11px] text-muted", mine && "text-right")}>{msg.files.map((f) => f.name).join(" · ")}</p>
        ) : null}
      </div>
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
  contact,
}: {
  nest: ThreadNest;
  items: ThreadMessage[];
  replies: ThreadMessage[];
  personId: string;
  contact: string;
}) {
  const label = nest.kind === "ticket" ? "Ticket" : nest.kind === "task" ? "Task" : nest.kind === "request" ? "Request" : nest.kind === "note" ? "Note" : "Media";
  return (
    <div className="rounded-md border border-line bg-card px-2.5 py-2">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
        {label} · {nest.title}
      </p>
      <div className="mt-2 space-y-3">
        {items.map((m) => (
          <TalkLine key={m.id} msg={m} personId={personId} contact={contact} nest={nest} replies={replies.filter((r) => r.replyTo === m.id)} />
        ))}
      </div>
    </div>
  );
}

function PlainInternal({ msg, personId, contact, replies }: { msg: ThreadMessage; personId: string; contact: string; replies: ThreadMessage[] }) {
  return (
    <div className="rounded-md border border-line p-2.5">
      <TalkLine msg={msg} personId={personId} contact={contact} replies={replies} />
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
  const [pane, setPane] = useState<"icons" | "templates" | "links" | "values" | "emoji" | "pay">("icons");
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
      {open && box ? (
        <Float key={pane} anchor={box} prefer="top" onClose={close}>
              {pane === "icons" ? (
                <div className="flex items-center gap-2 p-1.5">
                  {(
                    [
                      { id: "attach", label: files.length ? files.map((f) => f.name).join(", ") : "Attach", icon: Paperclip, run: () => fileRef.current?.click() },
                      { id: "templates", label: "Templates", icon: FileText, run: () => setPane("templates") },
                      { id: "links", label: "Trigger links", icon: Link, run: () => setPane("links") },
                      { id: "values", label: "Custom values", icon: Braces, run: () => setPane("values") },
                      { id: "pay", label: "Request payment", icon: DollarSign, run: () => setPane("pay") },
                      { id: "emoji", label: "Emojis", icon: Smile, run: () => setPane("emoji") },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Tip key={item.id} label={item.label} on side="top">
                        <button type="button" aria-label={item.label} onClick={item.run} className="grid size-11 place-items-center rounded-md text-navy hover:bg-page">
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
                  {pane === "pay"
                    ? PAY_ASKS.map((c) => (
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
        </Float>
      ) : null}
    </div>
  );
}

function FromSplit({
  label,
  aria,
  active,
  onPick,
  current,
  options,
  onFrom,
  icon,
  disabled,
}: {
  label: string;
  aria?: string;
  active?: boolean;
  onPick: () => void;
  current: string;
  options: { label: string; value: string }[];
  onFrom: (v: string) => void;
  icon?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const chevRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<DOMRect | null>(null);

  function toggle() {
    if (open) {
      setOpen(false);
      setBox(null);
      return;
    }
    if (chevRef.current) setBox(chevRef.current.getBoundingClientRect());
    setOpen(true);
  }

  return (
    <div className="relative flex">
      <button
        type="button"
        aria-label={aria ?? label}
        disabled={disabled}
        onClick={onPick}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-l-md px-3 text-sm font-semibold disabled:opacity-40",
          icon && "w-10 px-0",
          active ? "bg-navy text-card" : "text-muted",
        )}
      >
        {icon ? <Phone className="size-4" /> : label}
      </button>
      <Tip label={current || "From"} on={!open} side="top">
        <button
          ref={chevRef}
          type="button"
          aria-label={`${aria ?? label} from`}
          disabled={disabled}
          onClick={toggle}
          className={cn("grid h-10 w-7 place-items-center rounded-r-md disabled:opacity-40", active ? "bg-navy text-card" : "text-muted")}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </Tip>
      {open && box ? (
        <Float anchor={box} prefer="top" onClose={() => setOpen(false)}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={cn("block w-full min-w-52 px-3 py-2 text-left text-sm hover:bg-page", o.value === current && "font-semibold")}
              onClick={() => {
                onFrom(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}
