import { SelectField } from "./bits-01";
import { useMemo, useState } from "react";
import { ACTION_LABEL } from "@/features/action/types";
import type { ActionKind, ShopAction } from "@/features/action/types";
import { createAction, useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { accounts, projects } from "@/lib/crm-data";

export function CreateCard({
  kind,
  owner,
  people,
  leads,
  nestUnder,
  onDone,
  onCancel,
}: {
  kind: ActionKind;
  owner: string;
  people: string[];
  leads: ReturnType<typeof useOps>["leads"];
  nestUnder?: ShopAction;
  onDone: (row: ShopAction | undefined) => void;
  onCancel: () => void;
}) {
  const houses = useMemo(() => {
    const live = leads.filter((l) => l.status !== "Dropped" && l.status !== "Merged");
    return [
      ...live.map((l) => ({ id: l.id, label: `${l.name} · Lead · ${l.city}` })),
      ...projects.map((p) => ({ id: p.id, label: `${p.name} · Job` })),
      ...accounts.map((a) => ({ id: a.id, label: `${a.name} · Account` })),
    ];
  }, [leads]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState(owner);
  const [personId, setPersonId] = useState(nestUnder?.personId ?? houses[0]?.id ?? "");
  const [nest, setNest] = useState(Boolean(nestUnder));
  const { ticketCats } = useStaff();
  const [category, setCategory] = useState(nestUnder?.category ?? ticketCats[0] ?? "");
  const word = nestUnder ? (kind === "task" ? "Subtask" : kind === "request" ? "Subrequest" : ACTION_LABEL[kind]) : ACTION_LABEL[kind];

  return (
    <form
      className="shrink-0 border-b border-line bg-page px-3 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !personId) return;
        const row = createAction({
          kind,
          personId: nest && nestUnder ? nestUnder.personId : personId,
          title,
          owner: assignee,
          description,
          due,
          category,
          parentId: nest && nestUnder ? nestUnder.id : undefined,
        });
        onDone(row);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-bold tracking-wide text-muted uppercase">New {word.toLowerCase()}</p>
        <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`${word} name`}
        className="mt-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What needs to happen."
        rows={2}
        className="mt-2 w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-navy"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input
          value={due}
          onChange={(e) => setDue(e.target.value)}
          placeholder="Due date"
          className="h-11 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
        />
        <SelectField value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          {people.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </SelectField>
      </div>
      <SelectField value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2" aria-label="Category">
        <option value="">No category</option>
        {ticketCats.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </SelectField>
      {nest && nestUnder ? (
        <p className="mt-2 truncate text-[12px] text-muted">
          Nested on {ACTION_LABEL[nestUnder.kind]} · {nestUnder.title}
        </p>
      ) : (
        <SelectField value={personId} onChange={(e) => setPersonId(e.target.value)} className="mt-2">
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </SelectField>
      )}
      {nestUnder ? (
        <label className="mt-2 flex min-h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={nest} onChange={(e) => setNest(e.target.checked)} className="size-4 shrink-0" />
          <span className="min-w-0 truncate">Nest under {nestUnder.title}</span>
        </label>
      ) : null}
      <button type="submit" className="mt-2 h-11 w-full rounded-md bg-navy text-sm font-semibold text-card">
        Save {word.toLowerCase()}
      </button>
    </form>
  );
}
