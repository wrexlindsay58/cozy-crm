import { useState } from "react";
import { createTask, createTicket, useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { TicketFile } from "./ticket-file";
import { TaskFile } from "./task-file";

export type WorkTarget = { kind: "ticket" | "task"; id?: string };

export function WorkDialog({
  personId,
  owner,
  target,
  onClose,
}: {
  personId: string;
  owner: string;
  target: WorkTarget;
  onClose: () => void;
}) {
  const { tickets, tasks } = useOps();
  const ticket = target.id ? tickets.find((t) => t.id === target.id) : null;
  const task = target.id ? tasks.find((t) => t.id === target.id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-md border border-line bg-card shadow-sm sm:rounded-md">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{target.kind === "ticket" ? "Ticket" : "Task"}</p>
          <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {ticket ? (
            <TicketFile ticket={ticket} onBack={onClose} />
          ) : task ? (
            <TaskFile task={task} onBack={onClose} />
          ) : (
            <CreateWork personId={personId} owner={owner} kind={target.kind} onCreated={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

function CreateWork({
  personId,
  owner,
  kind,
  onCreated,
}: {
  personId: string;
  owner: string;
  kind: "ticket" | "task";
  onCreated: () => void;
}) {
  const { people } = useStaff();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState(owner);

  return (
    <form
      className="grid gap-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (kind === "ticket") createTicket({ personId, title, owner: assignee, description, due });
        else createTask({ personId, title, owner: assignee, due, description });
        onCreated();
      }}
    >
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{kind === "ticket" ? "Ticket name" : "Task name"}</span>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy" />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{kind === "ticket" ? "Ticket description" : "Task description"}</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy" />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Due date</span>
        <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Sep 18" className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy" />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Assigned</span>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="h-11 rounded-md bg-navy text-sm font-semibold text-card">
        Save
      </button>
    </form>
  );
}
