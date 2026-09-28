import { Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import type { ChatLine } from "@/features/today/feed-data";
import { shortName, Face, ClipIco } from "./part-01";
import { ReactBar } from "./part-02";

export function ChatLineView({
  m,
  small = false,
  flash = false,
  tag,
  onTag,
  replyOpen,
  reply,
  onReplyChange,
  onToggleReply,
  onSendReply,
  onReact,
}: {
  m: ChatLine;
  small?: boolean;
  flash?: boolean;
  tag?: string;
  onTag?: () => void;
  replyOpen: boolean;
  reply: string;
  onReplyChange: (v: string) => void;
  onToggleReply: () => void;
  onSendReply: () => void;
  onReact: (k: string) => void;
}) {
  return (
    <div id={`feed-line-${m.id}`} className={cn("flex gap-2.5 rounded-md", flash && "bg-info-bg")}>
      <Face name={m.who} small={small} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-4">
          <span className="font-semibold">{m.who}</span>
          {tag && onTag ? (
            <button type="button" onClick={onTag} className="mt-0.5 block max-w-full truncate text-left text-[11px] font-semibold text-navy">
              ↩ {tag}
            </button>
          ) : null}
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
        {replyOpen ? (
          <form
            className="mt-2 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSendReply();
            }}
          >
            <input
              value={reply}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder={`Reply to ${shortName(m.who)}`}
              className="composer h-8 min-w-0 flex-1 rounded-md border border-line px-2 text-sm"
              aria-label="Reply"
            />
            <button type="submit" aria-label="Send" className="composer grid h-8 w-8 shrink-0 place-items-center rounded-md bg-navy text-card lg:inline-flex lg:w-auto lg:gap-1.5 lg:px-2 lg:text-sm lg:font-bold">
              <Send className="size-4" />
              <span className="composer-label">Send</span>
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function ShopFeedView(props: { bag: { send: any; file: any; setFile: any; pick: any; draft: any; setDraft: any } }) {
  const { send, file, setFile, pick, draft, setDraft } = props.bag;
  return (
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
            <div className="flex items-center gap-2">
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
                <button type="button" onClick={() => pick.current?.click()} className="grid size-8 shrink-0 place-items-center rounded-md border border-line" aria-label="Add media">
                  <ClipIco />
                </button>
              </Tip>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the shop"
                className="composer h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm"
                aria-label="Message the shop"
              />
              <button type="submit" aria-label="Send" className="composer grid h-10 w-10 shrink-0 place-items-center rounded-md bg-navy text-card lg:inline-flex lg:w-auto lg:gap-1.5 lg:px-3 lg:text-sm lg:font-bold">
                <Send className="size-4" />
                <span className="composer-label">Send</span>
              </button>
            </div>
          </form>
  );
}
