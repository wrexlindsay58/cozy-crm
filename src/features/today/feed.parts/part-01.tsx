import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { seedActivity, seedChat, type ChatLine, type FeedTab, type Reacts } from "@/features/today/feed-data";
import { ShopFeedView2 } from "./part-04";

function initials(name: string) {
  const parts = name.replace(/—/g, " ").split(/\s+/).filter(Boolean);
  if (/^crew/i.test(name)) return ((parts[1]?.[0] ?? "C") + (parts[2]?.[0] ?? "")).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function toggleReact(reacts: Reacts | undefined, mark: string, who = "You"): Reacts {
  const next: Reacts = { ...(reacts ?? {}) };
  const row = next[mark] ?? [];
  next[mark] = row.includes(who) ? row.filter((n) => n !== who) : [...row, who];
  if (!next[mark].length) delete next[mark];
  return next;
}

export function countReplies(line: ChatLine): number {
  return (line.replies ?? []).reduce((n, row) => n + 1 + countReplies(row), 0);
}

function holds(line: ChatLine, id: string): boolean {
  if (line.id === id) return true;
  return (line.replies ?? []).some((row) => holds(row, id));
}

function rootId(rows: ChatLine[], id: string) {
  return rows.find((row) => holds(row, id))?.id ?? null;
}

type FlatReply = { line: ChatLine; parent: ChatLine };

export function flatten(root: ChatLine): FlatReply[] {
  const out: FlatReply[] = [];
  const walk = (parent: ChatLine) => {
    for (const child of parent.replies ?? []) {
      out.push({ line: child, parent });
      walk(child);
    }
  };
  walk(root);
  return out;
}

export function shortName(name: string) {
  if (name.includes("—")) return name.split("—").pop()?.trim().split(/\s+/)[0] || name;
  return name.split(/\s+/)[0] || name;
}

export function tagLabel(parent: ChatLine, roster: ChatLine[]) {
  const name = shortName(parent.who);
  const clash = roster.some((row) => row.id !== parent.id && shortName(row.who) === name);
  if (!clash) return name;
  const bit = parent.text.replace(/\s+/g, " ").trim();
  const cut = bit.length > 22 ? `${bit.slice(0, 22).trimEnd()}…` : bit;
  return `${name} · ${cut}`;
}

export function mapLine(rows: ChatLine[], id: string, fn: (line: ChatLine) => ChatLine): ChatLine[] {
  return rows.map((row) => {
    if (row.id === id) return fn(row);
    if (!row.replies?.length) return row;
    return { ...row, replies: mapLine(row.replies, id, fn) };
  });
}

export const TABS: { id: FeedTab; label: string; icon: ReactNode }[] = [
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
  const [openThreads, setOpenThreads] = useState<Record<string, boolean>>({});
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
    const root = rootId(chat, id);
    setChat((rows) => mapLine(rows, id, (m) => ({ ...m, replies: [...(m.replies ?? []), line] })));
    if (root) setOpenThreads((cur) => ({ ...cur, [root]: true }));
    setReply("");
    setReplyTo(null);
  }

  return (
    <ShopFeedView2 bag={{ open, onOpen, onClose, setTab, tab, chat, openThreads, setOpenThreads, replyTo, reply, setReply, setReplyTo, sendReply, setChat, activity, setActivity, send, file, setFile, pick, draft, setDraft }} />
  );
}

export const EMOJIS = ["👍", "👎", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅", "🎉", "👀", "💪", "👏", "🙌", "💯", "😊", "😍", "🤔", "😎", "🤝", "⭐", "🚀", "😅", "😡"];

export function Face({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span className={cn("mt-0.5 grid shrink-0 place-items-center rounded-full bg-navy font-bold tracking-wide text-card", small ? "size-6 text-[9px]" : "size-8 text-[10px]")}>
      {initials(name)}
    </span>
  );
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

export function ClipIco() {
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
