import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import type { ChatLine, Reacts } from "@/features/today/feed-data";
import { flatten, tagLabel, EMOJIS } from "./part-01";
import { ChatLineView } from "./part-03";

export function ChatBlock({
  m,
  openThread,
  onThread,
  replyTo,
  reply,
  onReplyChange,
  onToggleReply,
  onSendReply,
  onReact,
}: {
  m: ChatLine;
  openThread: boolean;
  onThread: (open: boolean) => void;
  replyTo: string | null;
  reply: string;
  onReplyChange: (v: string) => void;
  onToggleReply: (id: string) => void;
  onSendReply: (id: string) => void;
  onReact: (id: string, k: string) => void;
}) {
  const [flash, setFlash] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const flat = flatten(m);
  const roster = [m, ...flat.flatMap((row) => [row.line, row.parent])];
  const long = flat.length >= 4;

  function jump(id: string) {
    document.getElementById(`feed-line-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setFlash(id);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), 1400);
  }

  return (
    <div>
      <ChatLineView
        m={m}
        flash={flash === m.id}
        replyOpen={replyTo === m.id}
        reply={reply}
        onReplyChange={onReplyChange}
        onToggleReply={() => onToggleReply(m.id)}
        onSendReply={() => onSendReply(m.id)}
        onReact={(k) => onReact(m.id, k)}
      />
      {flat.length ? (
        long && !openThread ? (
          <button type="button" onClick={() => onThread(true)} className="mt-2 ml-10 text-[11px] font-bold text-navy">
            {flat.length} replies
          </button>
        ) : (
          <div className="mt-2 border-l border-line pl-2.5">
            <ul className="space-y-2.5">
              {flat.map(({ line, parent }) => (
                <li key={line.id}>
                  <ChatLineView
                    m={line}
                    small
                    flash={flash === line.id}
                    tag={parent.id === m.id ? undefined : tagLabel(parent, roster)}
                    onTag={parent.id === m.id ? undefined : () => jump(parent.id)}
                    replyOpen={replyTo === line.id}
                    reply={reply}
                    onReplyChange={onReplyChange}
                    onToggleReply={() => onToggleReply(line.id)}
                    onSendReply={() => onSendReply(line.id)}
                    onReact={(k) => onReact(line.id, k)}
                  />
                </li>
              ))}
            </ul>
            {long ? (
              <button type="button" onClick={() => onThread(false)} className="mt-2 text-[11px] font-bold text-muted">
                Hide
              </button>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}

export function ReactBar({ reacts, onToggle }: { reacts?: Reacts; onToggle: (k: string) => void }) {
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
