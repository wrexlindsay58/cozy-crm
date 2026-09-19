import { useEffect, useState } from "react";
import { ActBar } from "@/components/act-bar";
import { ACTION_LABEL, type ActionKind } from "@/features/action/types";
import { createAction, useOps } from "@/features/ops/store";
import { WorkCard } from "./work-card";

export function WorkTab({
  personId,
  owner,
  draft,
  onDraftUsed,
  parentId,
}: {
  personId: string;
  owner: string;
  draft?: ActionKind | null;
  onDraftUsed?: () => void;
  parentId?: string;
}) {
  const { actions } = useOps();
  const mine = parentId
    ? actions.filter((a) => a.parentId === parentId)
    : actions.filter((a) => a.personId === personId && !a.parentId);
  const [kind, setKind] = useState<ActionKind | null>(draft ?? null);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  useEffect(() => {
    if (draft) setKind(draft);
  }, [draft]);

  function closeDraft() {
    setKind(null);
    setTitle("");
    setDue("");
    onDraftUsed?.();
  }

  const word = kind ? ACTION_LABEL[kind] : "Action";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        <div className="flex justify-end">
          <ActBar
            items={[
              {
                label: "Create",
                variant: "navy",
                menu: [
                  { label: "Ticket", onClick: () => setKind("ticket") },
                  { label: "Task", onClick: () => setKind("task") },
                  { label: "Request", onClick: () => setKind("request") },
                ],
              },
            ]}
          />
        </div>
        {kind ? (
          <form
            className="rounded-md border border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              createAction({ kind, personId, title, owner, due, parentId });
              closeDraft();
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">New {word.toLowerCase()}</p>
              <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={closeDraft}>
                Cancel
              </button>
            </div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${word} name`}
              className="h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
            />
            <input
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="Due date"
              className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
            />
            <button type="submit" className="mt-2 h-11 w-full rounded-md bg-navy text-sm font-semibold text-card">
              Save
            </button>
          </form>
        ) : null}
        {mine.length === 0 && !kind ? (
          <p className="text-sm text-muted">{parentId ? "None nested on this action." : "None on this file."}</p>
        ) : null}
        {mine.map((a) => (
          <WorkCard key={a.id} personId={personId} action={a} actions={actions} compact={Boolean(parentId)} />
        ))}
      </div>
    </div>
  );
}
