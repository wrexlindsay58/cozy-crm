import { useState } from "react";
import { createTask, createTicket } from "@/features/ops/store";

export function CreateChore({
  personId,
  owner,
  kind,
  onDone,
}: {
  personId: string;
  owner: string;
  kind: "ticket" | "task" | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  if (!kind) return null;
  return (
    <section className="rounded-md border border-navy bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{kind === "ticket" ? "New ticket" : "New task"}</h2>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (kind === "ticket") createTicket({ personId, title, owner, description, due });
          else createTask({ personId, title, owner, due, description });
          setTitle("");
          setDescription("");
          setDue("");
          onDone();
        }}
      >
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "ticket" ? "Ticket name" : "Task name"} className="h-11 rounded-md border border-line px-3 text-base md:text-sm outline-none focus:border-navy" />
        {kind === "ticket" ? (
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ticket description" rows={3} className="rounded-md border border-line px-3 py-2 text-base md:text-sm outline-none focus:border-navy" />
        ) : null}
        <input value={due} onChange={(e) => setDue(e.target.value)} placeholder={kind === "ticket" ? "Ticket due date" : "Due"} className="h-11 rounded-md border border-line px-3 text-base md:text-sm outline-none focus:border-navy" />
        <button type="submit" className="h-11 rounded-md bg-navy text-sm font-semibold text-card">
          Save {kind}
        </button>
      </form>
    </section>
  );
}
