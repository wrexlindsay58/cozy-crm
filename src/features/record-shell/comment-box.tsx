import { useState } from "react";
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
    sendMessage(personId, draft, "internal", { nest, actionId: nest.id, actionKind: nest.kind });
    addHistory(personId, SHOP_ACTOR, `Comment on ${nest.kind}.`);
    setDraft("");
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {roots.length ? (
        <div className="mb-3 space-y-3">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Comments · {roots.length}</p>
          {roots.map((m) => (
            <TalkLine key={m.id} msg={m} personId={personId} nest={nest} replies={replies.filter((r) => r.replyTo === m.id)} />
          ))}
        </div>
      ) : null}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          post();
        }}
      >
        <label className="sr-only" htmlFor={`comment-${nest.kind}-${nest.id}`}>
          Comment
        </label>
        <input
          id={`comment-${nest.kind}-${nest.id}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Comment"
          className="h-10 min-w-0 flex-1 rounded-md border border-line bg-page px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-10 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Comment
        </button>
      </form>
    </div>
  );
}
