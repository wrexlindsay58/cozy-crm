import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { canEditWork, liveStatus, WORK_STATUSES, type WorkStatus } from "@/lib/chrome";
import { addPhoto, kindFromFile, usePhotos } from "@/features/photos/store";
import { deleteTask, deleteTicket, patchTask, patchTicket, setWorkStatus } from "@/features/ops/store";
import type { Task } from "@/features/ops/store";
import type { Ticket } from "@/lib/crm-data";
import { Tip } from "@/components/tip";
import { CommentBox } from "./comment-box";
import { cn } from "@/lib/cn";

export function WorkCard({
  personId,
  kind,
  ticket,
  task,
}: {
  personId: string;
  kind: "ticket" | "task";
  ticket?: Ticket;
  task?: Task;
}) {
  const row = (ticket ?? task)!;
  const status = liveStatus(row.status, row.due);
  const edit = canEditWork(row.owner);
  const [title, setTitle] = useState(row.title);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const files = usePhotos(row.id);

  function saveTitle() {
    setEditing(false);
    const next = title.trim();
    if (!next || next === row.title) return;
    if (kind === "ticket") patchTicket(row.id, { title: next });
    else patchTask(row.id, { title: next });
  }

  function move(next: WorkStatus | "Delete") {
    if (next === "Delete") {
      setConfirmDelete(true);
      return;
    }
    setWorkStatus(kind, row.id, next);
  }

  function attach(file: File | undefined) {
    if (!file) return;
    const kindFile = kindFromFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      addPhoto(row.id, file.name.replace(/\.[^.]+$/, ""), typeof reader.result === "string" ? reader.result : undefined, kindFile, file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <article className="rounded-md border border-line p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {editing && edit ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              className="h-9 w-full rounded-md border border-line px-2 text-sm font-semibold outline-none focus:border-navy"
            />
          ) : (
            <button type="button" className="text-left text-sm font-semibold" onClick={() => edit && setEditing(true)}>
              {row.title}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" className="sr-only" accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => attach(e.target.files?.[0])} />
        <Tip label="Attach" on side="bottom">
          <button type="button" aria-label="Attach" className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-navy" onClick={() => fileRef.current?.click()}>
            <Paperclip className="size-4" />
          </button>
        </Tip>
      </div>
      {files.length > 0 ? (
        <p className="mt-1 text-[11px] text-muted">{files.map((f) => f.name || f.caption).join(" · ")}</p>
      ) : null}
      <p className="mt-0.5 text-[11px] text-muted">
        {row.owner} · {row.due || "No due"} · {status}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {WORK_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => move(s)}
            className={cn(
              "h-8 rounded-md px-2 text-[11px] font-semibold",
              status === s ? "bg-navy text-card" : "border border-line text-muted",
            )}
          >
            {s}
          </button>
        ))}
        <button type="button" onClick={() => move("Delete")} className="h-8 rounded-md px-2 text-[11px] font-semibold text-stop">
          Delete
        </button>
      </div>
      {confirmDelete ? (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span>Delete this {kind}?</span>
          <button
            type="button"
            className="h-10 rounded-md bg-stop px-3 text-sm font-semibold text-card"
            onClick={() => (kind === "ticket" ? deleteTicket(row.id) : deleteTask(row.id))}
          >
            Delete
          </button>
          <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={() => setConfirmDelete(false)}>
            Keep
          </button>
        </div>
      ) : null}
      <CommentBox personId={personId} nest={{ kind, id: row.id, title: row.title }} />
    </article>
  );
}
