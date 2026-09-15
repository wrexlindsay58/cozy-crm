import { useState } from "react";
import {
  addTaskFollower,
  addTicketFollower,
  createTask,
  patchTask,
  patchTicket,
  removeTicketFollower,
  useOps,
} from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { PhotoRail } from "./side-rails";
import { ThreadPane } from "./thread-pane";
import type { Ticket } from "@/lib/crm-data";

export function TicketFile({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const { tasks } = useOps();
  const { people } = useStaff();
  const mine = tasks.filter((k) => k.ticketId === ticket.id);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [follow, setFollow] = useState(people[0]?.name ?? "");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-3">
      <button type="button" className="h-10 self-start text-sm font-semibold text-muted" onClick={onBack}>
        Close
      </button>
      <h2 className="mt-1 text-base font-extrabold">{ticket.title}</h2>
      <p className="text-[12px] text-muted">
        {ticket.status} · {ticket.priority} · {ticket.due || "No due"}
      </p>

      <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Description
        <textarea
          defaultValue={ticket.description ?? ""}
          onBlur={(e) => patchTicket(ticket.id, { description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>
      <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Due
        <input
          defaultValue={ticket.due ?? ""}
          onBlur={(e) => patchTicket(ticket.id, { due: e.target.value })}
          className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
      </label>
      <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Assigned
        <select
          value={ticket.owner}
          onChange={(e) => patchTicket(ticket.id, { owner: e.target.value })}
          className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
        >
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
      </label>

      <p className="mt-3 text-[11px] font-bold tracking-wide text-muted uppercase">Followers</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {(ticket.followers ?? []).map((n) => (
          <button key={n} type="button" className="h-10 rounded-md border border-line px-2 text-sm" onClick={() => removeTicketFollower(ticket.id, n)}>
            {n} x
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <select value={follow} onChange={(e) => setFollow(e.target.value)} className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm">
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
        <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => addTicketFollower(ticket.id, follow)}>
          Follow
        </button>
      </div>

      <h3 className="mt-4 text-[11px] font-bold tracking-wide text-muted uppercase">Tasks</h3>
      <ul className="mt-2 space-y-2">
        {mine.map((k) => (
          <li key={k.id} className="rounded-md border border-line p-2">
            <p className="text-sm font-semibold">{k.title}</p>
            <p className="text-[11px] text-muted">
              {k.owner} · {k.due} · {k.status}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                value={k.owner}
                onChange={(e) => patchTask(k.id, { owner: e.target.value })}
                className="h-10 rounded-md border border-line bg-card px-2 text-sm"
              >
                {people.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </select>
              <button type="button" className="h-10 rounded-md border border-line px-2 text-sm font-semibold" onClick={() => patchTask(k.id, { status: k.status === "Done" ? "Open" : "Done" })}>
                {k.status === "Done" ? "Reopen" : "Done"}
              </button>
              <button
                type="button"
                className="h-10 rounded-md border border-line px-2 text-sm"
                onClick={() => addTaskFollower(k.id, follow)}
              >
                Follow
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!taskTitle.trim()) return;
          createTask({ personId: ticket.related, title: taskTitle, owner: ticket.owner, due: taskDue, ticketId: ticket.id });
          setTaskTitle("");
          setTaskDue("");
        }}
      >
        <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task name" className="h-11 rounded-md border border-line px-3 text-sm" />
        <input value={taskDue} onChange={(e) => setTaskDue(e.target.value)} placeholder="Due" className="h-11 rounded-md border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-navy text-sm font-semibold text-card">
          Add task
        </button>
      </form>

      <div className="mt-4">
        <PhotoRail personId={ticket.id} />
      </div>
      <div className="mt-4 h-64 overflow-hidden rounded-md border border-line">
        <ThreadPane personId={ticket.id} mode="internal" />
      </div>
    </div>
  );
}
