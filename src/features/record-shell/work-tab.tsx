import { useEffect, useState } from "react";
import { ActBar } from "@/components/act-bar";
import { createTask, createTicket, useOps } from "@/features/ops/store";
import { WorkCard } from "./work-card";

export function WorkTab({
  personId,
  owner,
  draft,
  onDraftUsed,
}: {
  personId: string;
  owner: string;
  draft?: "ticket" | "task" | null;
  onDraftUsed?: () => void;
}) {
  const { tickets, tasks } = useOps();
  const mineT = tickets.filter((t) => t.related === personId);
  const mineK = tasks.filter((t) => t.personId === personId && !t.ticketId);
  const [kind, setKind] = useState<"ticket" | "task" | null>(draft ?? null);
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
              if (kind === "ticket") createTicket({ personId, title, owner, due });
              else createTask({ personId, title, owner, due });
              closeDraft();
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{kind === "ticket" ? "New ticket" : "New task"}</p>
              <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={closeDraft}>
                Cancel
              </button>
            </div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "ticket" ? "Ticket name" : "Task name"}
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
        {mineT.map((t) => (
          <WorkCard key={t.id} personId={personId} kind="ticket" ticket={t} />
        ))}
        {mineK.map((t) => (
          <WorkCard key={t.id} personId={personId} kind="task" task={t} />
        ))}
      </div>
    </div>
  );
}
