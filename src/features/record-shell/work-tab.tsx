import { useState } from "react";
import { createTask, createTicket, useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { StatusPill } from "@/components/ui-bits";
import { TicketFile } from "./ticket-file";

export function WorkTab({ personId, owner }: { personId: string; owner: string }) {
  const { tickets, tasks } = useOps();
  const { people } = useStaff();
  const mineT = tickets.filter((t) => t.related === personId);
  const mineK = tasks.filter((t) => t.personId === personId && !t.ticketId);
  const [kind, setKind] = useState<"ticket" | "task">("ticket");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState(owner);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = mineT.find((t) => t.id === openId);
  if (open) return <TicketFile ticket={open} onBack={() => setOpenId(null)} />;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {mineT.length === 0 && mineK.length === 0 ? <p className="text-sm text-muted">None yet.</p> : null}
        {mineT.length > 0 ? <h2 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Tickets</h2> : null}
        <ul className="space-y-2">
          {mineT.map((t) => (
            <li key={t.id}>
              <button type="button" className="w-full rounded-md border border-line p-2 text-left" onClick={() => setOpenId(t.id)}>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-[11px] text-muted">
                  {t.owner} · {t.due || t.age}
                </p>
                <StatusPill label={`${t.priority} · ${t.status}`} tone={t.status === "Done" ? "up" : t.priority === "High" ? "alert" : "navy"} />
              </button>
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
          if (kind === "ticket") createTicket({ personId, title, owner: assignee, description, due });
          else createTask({ personId, title, owner: assignee, due, description });
          setTitle("");
          setDescription("");
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
        <div className="grid gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "ticket" ? "Ticket name" : "Task name"}
            className="h-11 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
          />
          {kind === "ticket" ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ticket description"
              rows={2}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
            />
          ) : null}
          <input
            value={due}
            onChange={(e) => setDue(e.target.value)}
            placeholder={kind === "ticket" ? "Ticket due date" : "Due"}
            className="h-11 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
          />
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-11 rounded-md border border-line bg-card px-3 text-sm">
            {people.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="h-11 rounded-md bg-navy text-sm font-semibold text-card">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
