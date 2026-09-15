import { useState } from "react";
import { addHistory } from "@/features/ops/store";
import { sendMessage, useComments } from "@/features/thread/store";
import type { ThreadNest } from "@/lib/file-data";
import { SHOP_ACTOR } from "@/lib/chrome";

export function CommentBox({
  personId,
  nest,
}: {
  personId: string;
  nest: ThreadNest;
}) {
  const rows = useComments(personId, nest.kind, nest.id);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  function post() {
    if (!draft.trim()) return;
    sendMessage(personId, draft, "internal", { nest, replyTo: replyTo ?? undefined });
    addHistory(personId, SHOP_ACTOR, `Comment on ${nest.kind}.`);
    setDraft("");
    setReplyTo(null);
  }

  const roots = rows.filter((m) => !m.replyTo);
  const replies = rows.filter((m) => m.replyTo);

  return (
    <div className="mt-2">
      {roots.map((m) => (
        <div key={m.id} className="mt-1">
          <p className="text-[12px]">
            <span className="text-muted">{m.at}</span> · {m.text}
          </p>
          {replies
            .filter((r) => r.replyTo === m.id)
            .map((r) => (
              <p key={r.id} className="ml-3 text-[12px] text-muted">
                {r.text} · {r.at}
              </p>
            ))}
          <button type="button" className="h-8 text-[11px] font-semibold text-navy" onClick={() => setReplyTo(m.id)}>
            Reply
          </button>
        </div>
      ))}
      {rows.length > 0 && roots.length === 0
        ? rows.map((m) => (
            <p key={m.id} className="mt-1 text-[12px]">
              {m.text} · {m.at}
            </p>
          ))
        : null}
      <form
        className="mt-1 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          post();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={replyTo ? "Reply" : "Comment"}
          className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          {replyTo ? "Reply" : "Send"}
        </button>
      </form>
    </div>
  );
}
