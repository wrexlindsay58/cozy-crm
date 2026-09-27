import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { addHistory, useOps } from "@/features/ops/store";
import { sendMessage } from "@/features/thread/store";
import { actingName } from "@/features/staff/store";
import { accounts } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import type { ThreadMessage, ThreadNest } from "@/lib/file-data";
import { Initial, whoName } from "../who-mark";
import { EmojiPicker } from "./part-02";
import { useHoldReveal } from "./part-03";

export const QUICK_EMOJI = ["👍", "✅", "👀", "❗", "🎉"];

export const HOVER_MS = 1400;

export const HOLD_MS = 450;

export function TalkLine({
  msg,
  personId,
  nest,
  replies = [],
  ink = "ink",
  contact,
}: {
  msg: ThreadMessage;
  personId: string;
  nest?: ThreadNest;
  replies?: ThreadMessage[];
  ink?: "ink" | "card";
  contact?: string;
}) {
  const { leads } = useOps();
  const who =
    contact ??
    leads.find((l) => l.id === personId)?.name ??
    accounts.find((a) => a.id === personId)?.name ??
    "Customer";
  const [reply, setReply] = useState(false);
  const [draft, setDraft] = useState("");
  const light = ink === "card";

  function post() {
    if (!draft.trim()) return;
    sendMessage(personId, draft, "internal", { nest: nest ?? msg.nest, replyTo: msg.id });
    addHistory(personId, actingName(), "Reply posted.");
    setDraft("");
    setReply(false);
  }

  return (
    <div className={cn(msg.replyTo && "ml-3 border-l-2 border-line pl-2")}>
      <MsgBody msg={msg} light={light} contact={who} onReply={() => setReply((v) => !v)} replyCount={replies.length} />
      {replies.map((r) => (
        <div key={r.id} className="mt-2 ml-3 border-l-2 border-line pl-2">
          <MsgBody msg={r} light={false} contact={who} onReply={() => setReply(true)} replyCount={0} />
        </div>
      ))}
      {reply ? (
        <form
          className="mt-2 flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            post();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a reply"
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-navy"
          />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Send reply
          </button>
        </form>
      ) : null}
    </div>
  );
}

function MsgBody({
  msg,
  light,
  contact,
  onReply,
  replyCount,
}: {
  msg: ThreadMessage;
  light: boolean;
  contact: string;
  onReply: () => void;
  replyCount: number;
}) {
  const reveal = useHoldReveal();
  const name = whoName(msg, contact);
  return (
    <div className="flex items-start gap-2">
      <Initial name={name} />
      <div className="min-w-0 flex-1">
      <div
        onMouseEnter={reveal.enter}
        onMouseLeave={reveal.leave}
        onPointerDown={reveal.down}
        onPointerUp={reveal.up}
        onPointerCancel={reveal.up}
        onContextMenu={(e) => e.preventDefault()}
      >
        <p className={cn("text-[10px] font-semibold", light ? "text-card/70" : "text-muted")}>
          {name} · {msg.channel} · {msg.at}
        </p>
        <p className={cn("mt-0.5 text-sm", light ? "text-card" : "text-ink")}>{msg.text}</p>
        {reveal.on ? <EmojiPicker msg={msg} light={light} /> : null}
      </div>
      <button
        type="button"
        onClick={onReply}
        className={cn(
          "mt-1.5 inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12px] font-semibold",
          light ? "bg-card/15 text-card" : "border border-line text-navy",
        )}
      >
        <MessageSquare className="size-3.5" />
        Reply{replyCount ? ` ${replyCount}` : ""}
      </button>
      </div>
    </div>
  );
}
