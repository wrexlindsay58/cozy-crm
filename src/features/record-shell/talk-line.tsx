import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { addHistory } from "@/features/ops/store";
import { sendMessage, toggleReaction } from "@/features/thread/store";
import { SHOP_ACTOR } from "@/lib/chrome";
import { cn } from "@/lib/cn";
import type { ThreadMessage, ThreadNest } from "@/lib/file-data";
import { Tip } from "@/components/tip";

export const QUICK_EMOJI = ["👍", "✅", "👀", "❗", "🎉"];
const HOVER_MS = 1400;
const HOLD_MS = 450;

export function TalkLine({
  msg,
  personId,
  nest,
  replies = [],
  ink = "ink",
}: {
  msg: ThreadMessage;
  personId: string;
  nest?: ThreadNest;
  replies?: ThreadMessage[];
  ink?: "ink" | "card";
}) {
  const [reply, setReply] = useState(false);
  const [draft, setDraft] = useState("");
  const light = ink === "card";

  function post() {
    if (!draft.trim()) return;
    sendMessage(personId, draft, "internal", { nest: nest ?? msg.nest, replyTo: msg.id });
    addHistory(personId, SHOP_ACTOR, "Reply posted.");
    setDraft("");
    setReply(false);
  }

  return (
    <div className={cn(msg.replyTo && "ml-3 border-l-2 border-line pl-2")}>
      <MsgBody msg={msg} light={light} onReply={() => setReply((v) => !v)} replyCount={replies.length} />
      {replies.map((r) => (
        <div key={r.id} className="mt-2 ml-3 border-l-2 border-line pl-2">
          <MsgBody msg={r} light={false} onReply={() => setReply(true)} replyCount={0} />
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
  onReply,
  replyCount,
}: {
  msg: ThreadMessage;
  light: boolean;
  onReply: () => void;
  replyCount: number;
}) {
  const reveal = useHoldReveal();
  return (
    <div>
      <div
        onMouseEnter={reveal.enter}
        onMouseLeave={reveal.leave}
        onPointerDown={reveal.down}
        onPointerUp={reveal.up}
        onPointerCancel={reveal.up}
        onContextMenu={(e) => e.preventDefault()}
      >
        <p className={cn("text-sm", light ? "text-card" : "text-ink")}>{msg.text}</p>
        <p className={cn("mt-0.5 text-[10px]", light ? "text-card/70" : "text-muted")}>{msg.at}</p>
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
  );
}

function EmojiPicker({ msg, light }: { msg: ThreadMessage; light: boolean }) {
  const grouped = QUICK_EMOJI.map((emoji) => {
    const people = (msg.reactions ?? []).filter((r) => r.emoji === emoji);
    return { emoji, people, mine: people.some((p) => p.by === SHOP_ACTOR) };
  });
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {grouped.map(({ emoji, people, mine }) => (
        <Tip key={emoji} label={people.length ? people.map((p) => p.by.split(" ")[0]).join(", ") : emoji === "👍" ? "Thumbs up" : "React"} on side="bottom">
          <button
            type="button"
            aria-label={emoji === "👍" ? "Thumbs up" : `React ${emoji}`}
            onClick={() => toggleReaction(msg.id, emoji)}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-md px-1.5 text-sm",
              mine ? "bg-navy text-card" : light ? "bg-card/15 text-card" : "border border-line bg-card",
            )}
          >
            {emoji}
            {people.length > 0 ? <span className="text-[11px] font-semibold">{people.length}</span> : null}
          </button>
        </Tip>
      ))}
    </div>
  );
}

function useHoldReveal() {
  const [on, setOn] = useState(false);
  const hover = useRef<number>(0);
  const hold = useRef<number>(0);

  function clear() {
    window.clearTimeout(hover.current);
    window.clearTimeout(hold.current);
  }

  return {
    on,
    enter() {
      clear();
      hover.current = window.setTimeout(() => setOn(true), HOVER_MS);
    },
    leave() {
      clear();
      hover.current = window.setTimeout(() => setOn(false), 200);
    },
    down() {
      clear();
      hold.current = window.setTimeout(() => setOn(true), HOLD_MS);
    },
    up() {
      window.clearTimeout(hold.current);
    },
  };
}
