import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import {
  seedActivity,
  seedChat,
  type ChatLine,
  type FeedTab,
  type Reacts,
} from "@/features/today/feed-data";

function initials(name: string) {
  const parts = name.replace(/—/g, " ").split(/\s+/).filter(Boolean);
  if (/^crew/i.test(name)) return ((parts[1]?.[0] ?? "C") + (parts[2]?.[0] ?? "")).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function toggleReact(reacts: Reacts | undefined, mark: string, who = "You"): Reacts {
  const next: Reacts = { ...(reacts ?? {}) };
  const row = next[mark] ?? [];
  next[mark] = row.includes(who) ? row.filter((n) => n !== who) : [...row, who];
  if (!next[mark].length) delete next[mark];
  return next;
}

const TABS: { id: FeedTab; label: string; icon: ReactNode }[] = [
  { id: "activity", label: "Activity", icon: <BoltIco /> },
  { id: "chat", label: "Chat", icon: <ChatIco /> },
];

export function ShopFeed({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const [tab, setTab] = useState<FeedTab>("activity");
  const [chat, setChat] = useState(seedChat);
  const [activity, setActivity] = useState(seedActivity);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<string>("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const pick = useRef<HTMLInputElement>(null);

  function send() {
    const text = draft.trim();
    if (!text && !file) return;
    setChat((rows) => [{ id: `c-${Date.now()}`, who: "You", text: text || file, at: "now", media: file ? { name: file } : undefined }, ...rows]);
    setDraft("");
    setFile("");
  }

  function sendReply(id: string) {
    const text = reply.trim();
    if (!text) return;
    const line: ChatLine = { id: `r-${Date.now()}`, who: "You", text, at: "now" };
    setChat((rows) => rows.map((m) => (m.id === id ? { ...m, replies: [...(m.replies ?? []), line] } : m)));
    setReply("");
    setReplyTo(null);
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={onOpen}
          className="absolute right-4 bottom-4 z-10 h-11 rounded-md bg-navy px-4 text-[12px] font-bold text-card shadow-md xl:hidden"
        >
          Feed
        </button>
      ) : null}
      {open ? <button type="button" aria-label="Close feed" className="absolute inset-0 z-20 bg-ink/20 xl:hidden" onClick={onClose} /> : null}
      <aside
        className={cn(
          "min-h-0 w-[298px] shrink-0 flex-col border-line bg-card text-[12px]",
          "xl:relative xl:flex xl:border-l",
          open ? "absolute inset-y-0 right-0 z-30 flex border-l shadow-lg" : "hidden",
        )}
      >
        <div className="flex shrink-0 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-3 text-[11px] font-bold tracking-wide uppercase",
                tab === t.id ? "border-b-2 border-navy text-ink" : "text-muted",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <button type="button" onClick={onClose} className="px-3 text-[12px] font-bold text-muted xl:hidden" aria-label="Close feed">
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          {tab === "chat" ? (
            <ul className="space-y-4">
              {chat.map((m) => (
                <li key={m.id}>
                  <ChatBlock
                    m={m}
                    replyOpen={replyTo === m.id}
                    reply={reply}
                    onReplyChange={setReply}
                    onToggleReply={() => {
                      setReplyTo(replyTo === m.id ? null : m.id);
                      setReply("");
                    }}
                    onSendReply={() => sendReply(m.id)}
                    onReact={(k) => setChat((rows) => rows.map((row) => (row.id === m.id ? { ...row, reacts: toggleReact(row.reacts, k) } : row)))}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "activity" ? (
            <ul className="space-y-4">
              {activity.map((m) => (
                <li key={m.id} className="flex gap-2.5">
                  <Face name={m.who} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold">{m.who}</span>
                      <span className="shrink-0 text-[10px] text-muted">{m.at}</span>
                    </p>
                    <p className="mt-0.5 text-[12px] leading-4 text-ink">{m.text}</p>
                    <ReactBar
                      reacts={m.reacts}
                      onToggle={(k) => setActivity((rows) => rows.map((row) => (row.id === m.id ? { ...row, reacts: toggleReact(row.reacts, k) } : row)))}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {tab === "chat" ? (
          <form
            className="shrink-0 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            {file ? (
              <p className="mb-2 flex items-center justify-between gap-2 text-[12px]">
                <span className="min-w-0 truncate font-semibold">{file}</span>
                <button type="button" className="shrink-0 font-bold text-muted" onClick={() => setFile("")}>
                  Remove
                </button>
              </p>
            ) : null}
            <div className="flex gap-2">
              <input
                ref={pick}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f.name);
                  e.target.value = "";
                }}
              />
              <Tip label="Add a photo or file" on>
                <button type="button" onClick={() => pick.current?.click()} className="grid size-10 shrink-0 place-items-center rounded-md border border-line" aria-label="Add media">
                  <ClipIco />
                </button>
              </Tip>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the shop"
                className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm"
                aria-label="Message the shop"
              />
              <button type="submit" className="h-10 rounded-md bg-navy px-3 text-[12px] font-bold text-card">
                Send
              </button>
            </div>
          </form>
        ) : null}
      </aside>
    </>
  );
}

function ChatBlock({
  m,
  replyOpen,
  reply,
  onReplyChange,
  onToggleReply,
  onSendReply,
  onReact,
}: {
  m: ChatLine;
  replyOpen: boolean;
  reply: string;
  onReplyChange: (v: string) => void;
  onToggleReply: () => void;
  onSendReply: () => void;
  onReact: (k: string) => void;
}) {
  return (
    <div className="flex gap-3">
      <Face name={m.who} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-4">
          <span className="font-semibold">{m.who}</span>
          <span className="mt-0.5 block">{m.text}</span>
          {m.media ? <span className="mt-1 block truncate rounded-md bg-page px-2 py-1 text-[11px] font-semibold">{m.media.name}</span> : null}
          <span className="mt-0.5 block text-[10px] text-muted">{m.at}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button type="button" onClick={onToggleReply} className="text-[11px] font-bold text-muted">
            Reply
          </button>
          <ReactBar reacts={m.reacts} onToggle={onReact} />
        </div>
        {m.replies?.length ? (
          <ul className="mt-2 space-y-2 border-l border-line pl-3">
            {m.replies.map((r) => (
              <li key={r.id} className="text-[12px] leading-4">
                <span className="font-semibold">{r.who}</span>
                <span className="mt-0.5 block">{r.text}</span>
                <span className="mt-0.5 block text-[10px] text-muted">{r.at}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {replyOpen ? (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSendReply();
            }}
          >
            <input
              value={reply}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder={`Reply to ${m.who.split(" ")[0]}`}
              className="h-8 min-w-0 flex-1 rounded-md border border-line px-2 text-[12px]"
              aria-label="Reply"
            />
            <button type="submit" className="h-8 rounded-md bg-navy px-2 text-[11px] font-bold text-card">
              Send
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

const EMOJIS = ["👍", "👎", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅", "🎉", "👀", "💪", "👏", "🙌", "💯", "😊", "😍", "🤔", "😎", "🤝", "⭐", "🚀", "😅", "😡"];

function ReactBar({ reacts, onToggle }: { reacts?: Reacts; onToggle: (k: string) => void }) {
  const [open, setOpen] = useState(false);
  const marks = Object.entries(reacts ?? {}).filter(([, who]) => who.length);
  return (
    <span className="relative inline-flex flex-wrap items-center gap-1">
      {marks.map(([mark, who]) => (
        <Tip key={mark} label={who.join(", ")} on>
          <button
            type="button"
            onClick={() => onToggle(mark)}
            className={cn("inline-flex h-6 items-center gap-0.5 rounded-full px-1.5 text-[13px] leading-none", who.includes("You") ? "bg-navy/10 ring-1 ring-navy" : "bg-page")}
          >
            {mark}
            <span className="text-[10px] font-bold tabular-nums">{who.length}</span>
          </button>
        </Tip>
      ))}
      <span className="relative">
        <Tip label="React" on>
          <button type="button" onClick={() => setOpen((v) => !v)} className="grid size-6 place-items-center rounded-full text-muted" aria-label="React">
            <SmileIco />
          </button>
        </Tip>
        {open ? (
          <span className="absolute bottom-7 left-0 z-40 grid w-[11.5rem] grid-cols-6 gap-0.5 rounded-md border border-line bg-card p-1.5 shadow-md">
            {EMOJIS.map((mark) => (
              <button
                key={mark}
                type="button"
                className="grid size-7 place-items-center rounded text-[16px] hover:bg-page"
                onClick={() => {
                  onToggle(mark);
                  setOpen(false);
                }}
              >
                {mark}
              </button>
            ))}
          </span>
        ) : null}
      </span>
    </span>
  );
}

function Face({ name }: { name: string }) {
  return <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-navy text-[10px] font-bold tracking-wide text-card">{initials(name)}</span>;
}

function ChatIco() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
      <path d="M5 6h14v9H8l-3 3V6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function BoltIco() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
      <path d="M13 3 6 14h6l-1 7 7-11h-6l1-7z" fill="currentColor" />
    </svg>
  );
}
function ClipIco() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path
        d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SmileIco() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8.5 14.5c1.2 1.5 5.8 1.5 7 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
