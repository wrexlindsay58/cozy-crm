import { isBlocked } from "@/features/thread/store";
import { CallCard } from "../call-card";
import { EmailThread } from "../email-card";
import { NoteCard, PlainInternal } from "./part-01";
import { stitch, Bubble, groupInternal, NestBlock } from "./part-02";
import { ThreadPaneView } from "./part-04";

export function ThreadPaneView2(props: { bag: { showScope: any; onScope: any; scope: any; mode: any; word: any; rows: any; houseRows: any; personId: any; emptyCopy: any; contact: any; setChannel: any; setReplyRoot: any; setSubject: any; send: any; channel: any; from: any; numbers: any; emails: any; onCall: any; blockCall: any; replyRoot: any; subject: any; blockEmail: any; placeholder: any; draft: any; setDraft: any; blocked: any; files: any; setFiles: any; sendLabel: any } }) {
  const { showScope, onScope, scope, mode, word, rows, houseRows, personId, emptyCopy, contact, setChannel, setReplyRoot, setSubject, send, channel, from, numbers, emails, onCall, blockCall, replyRoot, subject, blockEmail, placeholder, draft, setDraft, blocked, files, setFiles, sendLabel } = props.bag;
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
          ? groupInternal(rows.filter((m: any) => !m.replyTo)).map((block, i) =>
              block.nest ? (
                <NestBlock
                  key={`${block.nest.kind}-${block.nest.id}-${i}`}
                  nest={block.nest}
                  items={block.items}
                  replies={rows.filter((m: any) => m.replyTo)}
                  personId={personId}
                  contact={contact}
                />
              ) : (
                block.items.map((m) => (
                  <PlainInternal key={m.id} msg={m} personId={personId} contact={contact} replies={rows.filter((r: any) => r.replyTo === m.id)} />
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
      <ThreadPaneView bag={{ send, mode, channel, setChannel, from, numbers, emails, onCall, blockCall, replyRoot, setReplyRoot, setSubject, subject, blockEmail, personId, placeholder, draft, setDraft, blocked, files, setFiles, sendLabel }} />
    </div>
  );
}
