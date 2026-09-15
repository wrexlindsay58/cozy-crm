import { useEffect, useState } from "react";
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
  const [kind, setKind] = useState<"ticket" | "task">(draft ?? "ticket");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  useEffect(() => {
    if (draft) setKind(draft);
  }, [draft]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        <form
            className="rounded-md border border-dashed border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              if (kind === "ticket") createTicket({ personId, title, owner, due });
              else createTask({ personId, title, owner, due });
              setTitle("");
              setDue("");
              onDraftUsed?.();
            }}
          >
            <div className="mb-2 flex gap-1">
              {(["ticket", "task"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`h-10 rounded-md px-3 text-sm font-semibold ${kind === k ? "bg-navy text-card" : "text-muted"}`}
                >
                  {k === "ticket" ? "Ticket" : "Task"}
                </button>
              ))}
            </div>
            <input
              autoFocus={Boolean(draft)}
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
