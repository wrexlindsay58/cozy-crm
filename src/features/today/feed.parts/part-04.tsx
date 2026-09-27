import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { toggleReact, countReplies, mapLine, TABS, Face } from "./part-01";
import { ChatBlock, ReactBar } from "./part-02";
import { ShopFeedView } from "./part-03";

export function ShopFeedView2(props: { bag: { open: any; onOpen: any; onClose: any; setTab: any; tab: any; chat: any; openThreads: any; setOpenThreads: any; replyTo: any; reply: any; setReply: any; setReplyTo: any; sendReply: any; setChat: any; activity: any; setActivity: any; send: any; file: any; setFile: any; pick: any; draft: any; setDraft: any } }) {
  const { open, onOpen, onClose, setTab, tab, chat, openThreads, setOpenThreads, replyTo, reply, setReply, setReplyTo, sendReply, setChat, activity, setActivity, send, file, setFile, pick, draft, setDraft } = props.bag;
  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={onOpen}
          className="absolute right-4 bottom-4 z-10 hidden h-11 rounded-md bg-navy px-4 text-[12px] font-bold text-card shadow-md md:inline-block xl:hidden"
        >
          Feed
        </button>
      ) : null}
      {open ? <button type="button" aria-label="Close feed" className="absolute inset-0 z-20 bg-ink/20 xl:hidden" onClick={onClose} /> : null}
      <aside
        className={cn(
          "min-h-0 w-[clamp(298px,calc(298px+(100vw-1280px)*0.125),418px)] shrink-0 flex-col border-line bg-card text-[12px]",
          "xl:relative xl:flex xl:border-l",
          open ? "absolute inset-y-0 right-0 z-30 flex border-l shadow-lg max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full max-md:max-w-none max-md:border-0 max-md:shadow-none" : "hidden",
        )}
      >
        <div className="flex shrink-0 items-center justify-end border-b border-line px-1 md:hidden">
          <button type="button" onClick={onClose} className="grid size-10 place-items-center text-ink" aria-label="Close feed">
            <X className="size-5" />
          </button>
        </div>
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
          <button type="button" onClick={onClose} className="hidden px-3 text-[12px] font-bold text-muted md:inline xl:hidden" aria-label="Close feed">
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          {tab === "chat" ? (
            <ul className="space-y-4">
              {chat.map((m: any) => (
                <li key={m.id}>
                  <ChatBlock
                    m={m}
                    openThread={m.id in openThreads ? openThreads[m.id] : countReplies(m) < 4}
                    onThread={(open) => setOpenThreads((cur: any) => ({ ...cur, [m.id]: open }))}
                    replyTo={replyTo}
                    reply={reply}
                    onReplyChange={setReply}
                    onToggleReply={(id) => {
                      setReplyTo(replyTo === id ? null : id);
                      setReply("");
                    }}
                    onSendReply={sendReply}
                    onReact={(id, k) => setChat((rows: any) => mapLine(rows, id, (row) => ({ ...row, reacts: toggleReact(row.reacts, k) })))}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "activity" ? (
            <ul className="space-y-4">
              {activity.map((m: any) => (
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
                      onToggle={(k) => setActivity((rows: any) => rows.map((row: any) => (row.id === m.id ? { ...row, reacts: toggleReact(row.reacts, k) } : row)))}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {tab === "chat" ? (
          <ShopFeedView bag={{ send, file, setFile, pick, draft, setDraft }} />
        ) : null}
      </aside>
    </>
  );
}
