import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { canDeleteWork, canEditWork, liveStatus } from "@/lib/chrome";
import { addPhoto, kindFromFile, usePhotos } from "@/features/photos/store";
import { deleteAction, patchAction } from "@/features/ops/store";
import { ACTION_LABEL, type ShopAction } from "@/features/action/types";
import { WorkMoves } from "@/features/action/moves";
import { useStaff } from "@/features/staff/store";
import { Tip } from "@/components/tip";
import { CommentBox } from "./comment-box";

export function WorkCard({
  personId,
  action,
  actions = [],
  compact,
}: {
  personId: string;
  action: ShopAction;
  actions?: ShopAction[];
  compact?: boolean;
}) {
  const status = liveStatus(action.status, action.due);
  const edit = canEditWork(action.owner);
  const { viewAs } = useStaff();
  const allowDelete = canDeleteWork(viewAs);
  const [title, setTitle] = useState(action.title);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const files = usePhotos(personId).filter((p) => p.actionId === action.id);
  const kids = actions.filter((a) => a.parentId === action.id);
  const word = ACTION_LABEL[action.kind].toLowerCase();

  function saveTitle() {
    setEditing(false);
    const next = title.trim();
    if (!next || next === action.title) return;
    patchAction(action.id, { title: next });
  }

  function attach(file: File | undefined) {
    if (!file) return;
    const kindFile = kindFromFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      addPhoto(
        personId,
        file.name.replace(/\.[^.]+$/, ""),
        typeof reader.result === "string" ? reader.result : undefined,
        kindFile,
        file.name,
        { actionId: action.id },
      );
    };
    reader.readAsDataURL(file);
  }

  return (
    <article className="rounded-md border border-line p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-wide text-muted uppercase">{ACTION_LABEL[action.kind]}</p>
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
              {action.title}
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
        {action.owner} · {action.due || "No due"} · {status}
        {action.kind === "ticket" && action.priority === "High" ? " · High" : ""}
      </p>
      <a href={`/tickets/${action.id}`} className="mt-1 inline-block text-[12px] font-semibold text-navy">
        Open {word}
      </a>
      {kids.length > 0 ? <ChildRows parentId={action.id} actions={actions} /> : null}
      <div className="mt-2">
        <WorkMoves kind={action.kind} id={action.id} status={status} />
        {allowDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)} className="mt-1 h-8 rounded-md px-2 text-[11px] font-semibold text-stop">
            Delete
          </button>
        ) : null}
      </div>
      {confirmDelete ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span>Delete this {word}? Nested work stays on the file.</span>
          <button
            type="button"
            className="h-10 rounded-md bg-stop px-3 text-sm font-semibold text-card"
            onClick={() => deleteAction(action.id)}
          >
            Delete
          </button>
          <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={() => setConfirmDelete(false)}>
            Keep
          </button>
        </div>
      ) : null}
      {compact ? null : <CommentBox personId={personId} nest={{ kind: action.kind, id: action.id, title: action.title }} />}
    </article>
  );
}

function ChildRows({ parentId, actions }: { parentId: string; actions: ShopAction[] }) {
  const kids = actions.filter((a) => a.parentId === parentId);
  if (!kids.length) return null;
  return (
    <ul className="mt-2 space-y-1 border-l border-line pl-3">
      {kids.map((k) => (
        <li key={k.id}>
          <a href={`/tickets/${k.id}`} className="block py-1">
            <p className="text-sm font-semibold">{k.title}</p>
            <p className="text-[11px] text-muted">
              {ACTION_LABEL[k.kind]} · {k.owner} · {liveStatus(k.status, k.due)}
            </p>
          </a>
          <ChildRows parentId={k.id} actions={actions} />
        </li>
      ))}
    </ul>
  );
}
