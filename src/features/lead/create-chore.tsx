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
  const [due, setDue] = useState("");
  if (!kind) return null;
  return (
    <section className="rounded-md border border-navy bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{kind === "ticket" ? "New ticket" : "New task"}</h2>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (kind === "ticket") createTicket({ personId, title, owner });
          else createTask({ personId, title, owner, due });
          setTitle("");
          onDone();
        }}
      >
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "ticket" ? "What is blocked?" : "What is due?"} className="h-11 rounded-md border border-line px-3 text-base md:text-sm outline-none focus:border-navy" />
        {kind === "task" ? (
          <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Due, Sep 15 5:00p" className="h-11 rounded-md border border-line px-3 text-base md:text-sm outline-none focus:border-navy" />
        ) : null}
        <button type="submit" className="h-11 rounded-md bg-navy text-sm font-semibold text-card">Save {kind}</button>
      </form>
    </section>
  );
}
