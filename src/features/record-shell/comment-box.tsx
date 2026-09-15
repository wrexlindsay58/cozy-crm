import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { addHistory } from "@/features/ops/store";
import { sendMessage, useComments } from "@/features/thread/store";
import type { ThreadNest } from "@/lib/file-data";
import { SHOP_ACTOR } from "@/lib/chrome";
import { TalkLine } from "./talk-line";

export function CommentBox({
  personId,
  nest,
}: {
  personId: string;
  nest: ThreadNest;
}) {
  const rows = useComments(personId, nest.kind, nest.id);
  const [draft, setDraft] = useState("");
  const roots = rows.filter((m) => !m.replyTo);
  const replies = rows.filter((m) => m.replyTo);

  function post() {
    if (!draft.trim()) return;
    sendMessage(personId, draft, "internal", { nest });
    addHistory(personId, SHOP_ACTOR, `Comment on ${nest.kind}.`);
    setDraft("");
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
        <MessageSquare className="size-3.5" />
        Comments{roots.length ? ` · ${roots.length}` : ""}
      </p>
      <div className="mt-2 space-y-3">
        {roots.map((m) => (
          <TalkLine key={m.id} msg={m} personId={personId} nest={nest} replies={replies.filter((r) => r.replyTo === m.id)} />
        ))}
      </div>
      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          post();
        }}
      >
        <label className="text-[11px] font-bold tracking-wide text-muted uppercase" htmlFor={`comment-${nest.kind}-${nest.id}`}>
          Write a comment
        </label>
        <div className="mt-1 flex gap-1">
          <input
            id={`comment-${nest.kind}-${nest.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment"
            className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
          />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Comment
          </button>
        </div>
      </form>
    </div>
  );
}
