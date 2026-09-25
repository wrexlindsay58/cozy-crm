import { useMemo, useState } from "react";
import { useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { BOOK_TYPES, familyOf, type BookType } from "./types";
import { addHrs, durationHrs } from "./time";
import { createBook, findSlot } from "./store";
import { hoursFor as rosterHours, type Resource as R } from "./roster";

export function Compose({
  resources,
  preset,
  onClose,
}: {
  resources: R[];
  preset: { resourceId: string; start: string; type?: BookType };
  onClose: () => void;
}) {
  const { leads } = useOps();
  const { actorName: setBy } = useStaff();
  const [type, setType] = useState<BookType>(preset.type ?? (resources.find((r) => r.id === preset.resourceId)?.kind === "crew" ? "Install" : "Sales"));
  const [resourceId, setResourceId] = useState(preset.resourceId);
  const [leadId, setLeadId] = useState("");
  const [title, setTitle] = useState("");
  const [length, setLength] = useState(familyOf(type) === "production" ? "All day" : "2h");
  const [notes, setNotes] = useState("");
  const [start, setStart] = useState(preset.start);
  const lead = leads.find((l) => l.id === leadId);
  const hours = useMemo(() => rosterHours(resources), [resources]);

  return (
    <form
      className="space-y-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const hrs = durationHrs(length);
        createBook({
          type,
          title: lead?.name || title || type,
          personId: lead?.id,
          href: lead ? `/leads/${lead.id}` : "",
          resourceId,
          start,
          end: addHrs(start, hrs),
          city: lead?.city,
          notes,
          setBy,
          internal: type === "Office" || !lead,
          office: resources.find((r) => r.id === resourceId)?.office ?? "PHX",
        });
        onClose();
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
          Type
          <select value={type} onChange={(e) => setType(e.target.value as BookType)} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
            {BOOK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
          Resource
          <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
            <option value="">Unassigned</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
        House
        <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
          <option value="">Shop — no house</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} · {l.city}
            </option>
          ))}
        </select>
      </label>
      {!leadId ? (
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dump run, all-hands…" className="h-10 w-full rounded-md border border-line px-3 text-sm" />
      ) : null}
      <div className="flex flex-wrap gap-2">
        {["30m", "1h", "1.5h", "2h", "All day"].map((d) => (
          <button key={d} type="button" onClick={() => setLength(d)} className={length === d ? "h-8 rounded-md bg-navy px-2.5 text-[12px] font-semibold text-card" : "h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold"}>
            {d}
          </button>
        ))}
        <button
          type="button"
          className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold"
          onClick={() => {
            const hit = findSlot({ resourceId, hrs: durationHrs(length), from: start.slice(0, 10), hours });
            if (hit) setStart(hit.start);
          }}
        >
          Find slot
        </button>
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes for the run" className="w-full rounded-md border border-line px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Book
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
