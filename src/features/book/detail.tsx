import { sendMessage } from "@/features/thread/store";
import { addHistory } from "@/features/ops/store";
import { BOOK_STATUSES, type BookEvent } from "./types";
import { labelDay, labelTime } from "./time";
import { setBookStatus } from "./store";
import { cn } from "@/lib/cn";

export function BookDetail({ e, onClose }: { e: BookEvent; onClose: () => void }) {
  return (
    <footer className="flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-t border-line bg-card px-4 py-2 text-[13px]">
      <div className="min-w-0">
        <p className="truncate font-semibold">{e.title}</p>
        <p className="text-muted">
          {e.type} · {labelDay(e.start)} {labelTime(e.start)}–{labelTime(e.end)}
          {e.city ? ` · ${e.city}` : ""}
          {e.hold ? " · Hold" : ""}
          {!e.woSigned && e.type === "Install" ? " · WO unsigned" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {BOOK_STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => setBookStatus(e.id, s)} className={cn("h-8 rounded-md px-2 text-[11px] font-semibold", e.status === s ? "bg-navy text-card" : "border border-line")}>
            {s}
          </button>
        ))}
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        {!e.internal && e.personId ? (
          <button
            type="button"
            className="h-9 rounded-md border border-line px-3 text-xs font-semibold"
            onClick={() => {
              sendMessage(e.personId, `You're confirmed ${labelDay(e.start)} ${labelTime(e.start)}.`, "sms");
              addHistory(e.personId, "Book", `Confirmed ${e.type}.`);
              setBookStatus(e.id, "Confirmed");
            }}
          >
            Confirm
          </button>
        ) : null}
        {!e.internal && e.personId ? (
          <button
            type="button"
            className="h-9 rounded-md border border-line px-3 text-xs font-semibold"
            onClick={() => sendMessage(e.personId, `On our way for ${e.type}.`, "sms")}
          >
            Text
          </button>
        ) : null}
        {e.href ? (
          <a href={e.href} className="inline-flex h-9 items-center rounded-md bg-navy px-3 text-xs font-semibold text-card">
            Open file
          </a>
        ) : null}
        <button type="button" className="h-9 px-2 text-xs font-semibold text-muted" onClick={onClose}>
          Close
        </button>
      </div>
    </footer>
  );
}
