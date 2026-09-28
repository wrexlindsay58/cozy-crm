import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightLeft, ClipboardCheck, Contact, Pencil, StickyNote, Trash2 } from "lucide-react";
import { canDeleteWork } from "@/lib/chrome";
import { useStaff } from "@/features/staff/store";
import { cn } from "@/lib/cn";
import { canTake } from "./allow";
import { useRoster } from "./roster";
import { moveBook, patchBook, removeBook } from "./store";
import { labelTime } from "./time";
import { eventCreator } from "./creator";
import { phoneWhy, resultSummary } from "./results";
import { ResultPick } from "./result-pick";
import { needsResult, type BookEvent } from "./types";

const OFFICE = { PHX: "Phoenix", DFW: "Dallas" };

export function ChipPop({
  e,
  box,
  onEdit,
  onClose,
  onEnter,
  onLeave,
}: {
  e: BookEvent;
  box: DOMRect;
  onEdit: () => void;
  onClose: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const { viewAs, actorName } = useStaff();
  const roster = useRoster();
  const [mode, setMode] = useState<"main" | "move" | "result" | "note">("main");
  const [note, setNote] = useState(e.notes);
  const mark = needsResult(e.type);
  const creator = eventCreator(e);
  const summary = resultSummary(e);
  const canDelete = canDeleteWork(viewAs) || actorName === creator || actorName === e.setBy;
  const width = mode === "result" ? 288 : 232;
  let top = box.bottom + 6;
  let left = Math.min(box.left, window.innerWidth - width - 8);
  if (top + 280 > window.innerHeight) top = Math.max(8, box.top - 280);
  left = Math.max(8, left);
  const people = roster.filter((r) => canTake(e.type, r)).slice(0, 8);

  const btn = "h-7 rounded-md border border-line bg-card px-2 text-[11px] font-semibold text-navy";
  const icon = "grid size-8 place-items-center rounded-md border border-line bg-card text-navy";

  return createPortal(
    <div
      className="fixed z-50 w-56 rounded-md border border-line bg-card p-2 text-ink shadow-sm"
      style={{ top, left, width }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <p className="text-[13px] font-semibold">{e.blank ? e.title || "Open slot" : e.title}</p>
      <p className="text-[11px] text-muted">
        {e.type} · {OFFICE[e.office]}
      </p>
      <p className="text-[11px] text-muted">
        {labelTime(e.start)} – {labelTime(e.end)}
        {e.city ? ` · ${e.city}` : ""}
      </p>
      {creator ? <p className="text-[11px] text-muted">Created by {creator}</p> : null}
      {e.visit === "phone" ? <p className="text-[11px] text-muted">Phone consult · {phoneWhy(e.visitWhy, e.visitNote)}</p> : null}
      {e.notes ? <p className="mt-1 text-[11px]">{e.notes}</p> : null}
      {summary ? <p className="mt-1 text-[11px] font-semibold text-navy">{summary}</p> : mark ? <p className="mt-1 text-[11px] font-semibold text-alert">Needs a result</p> : null}

      {mode === "move" ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {people.map((r) => (
            <button key={r.id} type="button" className={btn} onClick={() => { moveBook(e.id, e.start, e.end, r.id); onClose(); }}>
              {r.name.split("—")[0].trim().split(" ")[0]}
            </button>
          ))}
        </div>
      ) : null}
      {mode === "result" ? <ResultPick e={e} onClose={onClose} /> : null}
      {mode === "note" ? (
        <form
          className="mt-2 flex gap-1"
          onSubmit={(ev) => {
            ev.preventDefault();
            patchBook(e.id, { notes: note.trim() });
            onClose();
          }}
        >
          <input value={note} onChange={(ev) => setNote(ev.target.value)} className="h-7 min-w-0 flex-1 rounded-md border border-line px-2 text-[12px] outline-none" placeholder="Note" />
          <button type="submit" className={btn}>Save</button>
        </form>
      ) : null}
      {mode === "main" ? (
        <div className="mt-2 flex flex-wrap gap-1">
          <button type="button" aria-label="Transfer" title="Transfer" className={icon} onClick={() => setMode("move")}><ArrowRightLeft className="size-3.5" /></button>
          {mark ? <button type="button" aria-label="Result" title="Result" className={icon} onClick={() => setMode("result")}><ClipboardCheck className="size-3.5" /></button> : null}
          <button type="button" aria-label="Add a note" title="Add a note" className={icon} onClick={() => setMode("note")}><StickyNote className="size-3.5" /></button>
          <button type="button" aria-label="Edit" title="Edit" className={icon} onClick={() => { onEdit(); onClose(); }}><Pencil className="size-3.5" /></button>
          {e.href ? <a href={e.href} aria-label="Pipeline" title="Pipeline" className={icon}><Contact className="size-3.5" /></a> : null}
          {canDelete ? <button type="button" aria-label="Delete" title="Delete" className={cn(icon, "text-alert")} onClick={() => { removeBook(e.id); onClose(); }}><Trash2 className="size-3.5" /></button> : null}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}