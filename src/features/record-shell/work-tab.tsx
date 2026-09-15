import { useState } from "react";
import { createTask, createTicket, useOps } from "@/features/ops/store";
import { StatusPill } from "@/components/ui-bits";

export function WorkTab({ personId, owner }: { personId: string; owner: string }) {
  const { tickets, tasks } = useOps();
  const mineT = tickets.filter((t) => t.related === personId);
  const mineK = tasks.filter((t) => t.personId === personId);
  const [kind, setKind] = useState<"ticket" | "task">("ticket");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {mineT.length === 0 && mineK.length === 0 ? <p className="text-sm text-muted">None yet.</p> : null}
        {mineT.length > 0 ? <h2 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Tickets</h2> : null}
        <ul className="space-y-2">
          {mineT.map((t) => (
            <li key={t.id} className="rounded-md border border-line p-2">
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-[11px] text-muted">
                {t.owner} · {t.age}
              </p>
              <StatusPill label={`${t.priority} · ${t.status}`} tone={t.status === "Done" ? "up" : t.priority === "High" ? "alert" : "navy"} />
            </li>
          ))}
        </ul>
        {mineK.length > 0 ? <h2 className="mt-4 mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Tasks</h2> : null}
        <ul className="space-y-2">
          {mineK.map((t) => (
            <li key={t.id} className="rounded-md border border-line p-2">
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-[11px] text-muted">
                {t.owner} · {t.due} · {t.status}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <form
        className="border-t border-line p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          if (kind === "ticket") createTicket({ personId, title, owner });
          else createTask({ personId, title, owner, due });
          setTitle("");
          setDue("");
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
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "ticket" ? "What is blocked?" : "What is due?"}
            className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
          />
          {kind === "task" ? (
            <input
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="Due"
              className="h-11 w-28 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
            />
          ) : null}
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
