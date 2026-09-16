import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOps, addHistory } from "@/features/ops/store";
import { SHOP_ACTOR } from "@/lib/chrome";
import { useStaff } from "@/features/staff/store";
import { sendMessage } from "@/features/thread/store";
import { BOOK_DISPOSITIONS, BOOK_TYPES, familyOf, mapStatus, type BookEvent, type BookLink, type BookStatus, type BookType } from "./types";
import { addHrs, durationHrs, labelDay, labelTime } from "./time";
import { createBook, findSlot, patchBook } from "./store";
import { hoursFor as rosterHours, type Resource } from "./roster";

const field = "mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";
const label = "block text-[11px] font-bold tracking-wide text-muted uppercase";

export function EventModal({
  resources,
  preset,
  event,
  onClose,
}: {
  resources: Resource[];
  preset?: { resourceId: string; start: string; type?: BookType };
  event?: BookEvent;
  onClose: () => void;
}) {
  const { leads } = useOps();
  const { viewAs } = useStaff();
  const setBy = viewAs === "Owner" ? SHOP_ACTOR : viewAs;
  const editing = Boolean(event);
  const clicked = resources.find((r) => r.id === (event?.resourceId || preset?.resourceId));
  const [blank, setBlank] = useState(event?.blank ?? false);
  const [type, setType] = useState<BookType>(event?.type ?? preset?.type ?? (clicked?.kind === "crew" ? "Install" : "Sales"));
  const [status, setStatus] = useState<BookStatus>(event?.status ?? "Confirmed");
  const [assigneeId, setAssigneeId] = useState(event?.assigneeId || (clicked?.kind === "closer" || clicked?.kind === "setter" ? clicked.id : ""));
  const [techId, setTechId] = useState(event?.techId || (clicked?.kind === "office" ? clicked.id : ""));
  const [crewId, setCrewId] = useState(event?.crewId || (clicked?.kind === "crew" ? clicked.id : ""));
  const [leadId, setLeadId] = useState(event?.personId ?? "");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState(event?.title ?? "");
  const [length, setLength] = useState(() => {
    if (!event) return familyOf(type) === "production" ? "All day" : "2h";
    const hrs = (new Date(event.end).getTime() - new Date(event.start).getTime()) / 36e5;
    if (hrs >= 7) return "All day";
    if (hrs === 0.5) return "30m";
    return `${hrs}h`;
  });
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [start, setStart] = useState(event?.start ?? preset?.start ?? "");
  const [links, setLinks] = useState<BookLink[]>(event?.links ?? []);
  const [linkDraft, setLinkDraft] = useState("");
  const hours = useMemo(() => rosterHours(resources), [resources]);
  const sales = resources.filter((r) => r.kind === "closer" || r.kind === "setter");
  const people = resources.filter((r) => r.kind !== "crew");
  const crews = resources.filter((r) => r.kind === "crew");
  const lead = leads.find((l) => l.id === leadId);
  const hits = query.trim()
    ? leads.filter((l) => `${l.name} ${l.city} ${l.phone} ${l.address}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  function save(e: FormEvent) {
    e.preventDefault();
    const hrs = durationHrs(length);
    const end = addHrs(start, hrs);
    const resourceId = crewId || assigneeId || techId;
    const office = resources.find((r) => r.id === resourceId)?.office ?? "PHX";
    if (editing && event) {
      patchBook(event.id, {
        type: blank ? "Open" : type,
        status,
        title: blank ? title.trim() || "Open slot" : lead?.name || title || type,
        personId: blank ? "" : lead?.id ?? "",
        href: blank ? "" : lead ? `/leads/${lead.id}` : event.href,
        resourceId,
        crewId,
        techId,
        assigneeId,
        start,
        end,
        city: lead?.city ?? event.city,
        notes: blank ? notes : notes || lead?.notes || "",
        blank,
        links,
        office,
        internal: blank || type === "Office" || !lead,
      });
      if (lead && (crewId !== event.crewId || assigneeId !== event.assigneeId || techId !== event.techId)) {
        addHistory(lead.id, setBy, `Transferred ${type} to a new resource.`);
      }
    } else {
      createBook({
        type: blank ? "Open" : type,
        title: blank ? title.trim() || "Open slot" : lead?.name || title || type,
        personId: blank ? undefined : lead?.id,
        href: lead && !blank ? `/leads/${lead.id}` : "",
        resourceId,
        crewId,
        techId,
        assigneeId,
        start,
        end,
        city: lead?.city,
        notes: notes || lead?.notes || "",
        setBy,
        internal: blank || type === "Office" || !lead,
        office,
        blank,
        links,
        status,
      });
      if (lead && !blank) addHistory(lead.id, setBy, `Scheduled ${type}: ${start.slice(0, 16)}.`);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <form onSubmit={save} className="relative z-10 flex max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-md border border-line bg-card shadow-lg">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 className="text-sm font-semibold">{editing ? "Event" : blank ? "Blank slot" : "Book"}</h2>
          <button type="button" aria-label="Close" className="grid size-9 place-items-center rounded-md hover:bg-page" onClick={onClose}>
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          <label className="flex h-10 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={blank} onChange={(e) => setBlank(e.target.checked)} className="size-4 accent-navy" />
            Blank slot — hold the time, no house yet
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Type
              <select value={blank ? "Open" : type} disabled={blank} onChange={(e) => setType(e.target.value as BookType)} className={field}>
                {BOOK_TYPES.filter((t) => t !== "Open").map((t) => (
                  <option key={t}>{t}</option>
                ))}
                <option>Open</option>
              </select>
            </label>
            <label className={label}>
              Status
              <select value={status} onChange={(e) => setStatus(mapStatus(e.target.value))} className={field}>
                {BOOK_DISPOSITIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Assign</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={label}>
              Sales
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={field}>
                <option value="">None</option>
                {sales.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Person
              <select value={techId} onChange={(e) => setTechId(e.target.value)} className={field}>
                <option value="">None</option>
                {people.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Crew
              <select value={crewId} onChange={(e) => setCrewId(e.target.value)} className={field}>
                <option value="">None</option>
                {crews.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!blank ? (
            <div>
              <label className={label}>
                Contact
                <input value={lead ? `${lead.name} · ${lead.city}` : query} onChange={(e) => { setLeadId(""); setQuery(e.target.value); }} placeholder="Search a house" className={field} />
              </label>
              {hits.length ? (
                <ul className="mt-1 overflow-hidden rounded-md border border-line">
                  {hits.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-page"
                        onClick={() => {
                          setLeadId(l.id);
                          setQuery("");
                          setNotes((n) => n || l.notes);
                          setTitle(l.name);
                        }}
                      >
                        <span className="text-sm font-semibold">{l.name}</span>
                        <span className="text-[12px] text-muted">
                          {l.address} · {l.city}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {lead ? (
                <div className="mt-2 rounded-md border border-line bg-page p-3 text-[13px]">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-muted">
                    {lead.address} · {lead.city}
                  </p>
                  <p className="text-muted">
                    {lead.phone}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold">{lead.status}</p>
                  {lead.notes ? <p className="mt-1 text-muted">{lead.notes}</p> : null}
                  <a href={`/leads/${lead.id}`} className="mt-2 inline-block text-[12px] font-semibold text-navy">
                    Open file
                  </a>
                </div>
              ) : (
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this if it isn't a house" className={`${field} mt-2`} />
              )}
            </div>
          ) : (
            <label className={label}>
              Slot name
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Open slot" className={field} />
            </label>
          )}

          <div>
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Length</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {["30m", "1h", "1.5h", "2h", "All day"].map((d) => (
                <button key={d} type="button" onClick={() => setLength(d)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", length === d ? "bg-navy text-card" : "border border-line")}>
                  {d}
                </button>
              ))}
              <button
                type="button"
                className="h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold"
                onClick={() => {
                  const hit = findSlot({ resourceId: crewId || assigneeId || techId, hrs: durationHrs(length), from: start.slice(0, 10), hours });
                  if (hit) setStart(hit.start);
                }}
              >
                Find slot
              </button>
            </div>
            {start ? (
              <p className="mt-1 text-[12px] text-muted">
                {labelDay(start)} {labelTime(start)}
              </p>
            ) : null}
          </div>

          <label className={label}>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Gate code, both home, what's on the truck." className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy" />
          </label>

          <div>
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Links</p>
            <div className="mt-1 flex gap-2">
              <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} placeholder="https://…" className={field} />
              <button
                type="button"
                className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold"
                onClick={() => {
                  const url = linkDraft.trim();
                  if (!url) return;
                  setLinks((ls) => [...ls, { id: `LK-${Date.now()}`, label: url.replace(/^https?:\/\//, "").slice(0, 32), url }]);
                  setLinkDraft("");
                }}
              >
                Add
              </button>
            </div>
            {links.length ? (
              <ul className="mt-2 space-y-1">
                {links.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 text-[13px]">
                    <a href={l.url} target="_blank" rel="noreferrer" className="truncate font-semibold text-navy">
                      {l.label}
                    </a>
                    <button type="button" className="ml-auto text-[12px] text-muted" onClick={() => setLinks((ls) => ls.filter((x) => x.id !== l.id))}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line px-4 py-3">
          {editing && event && !event.internal && event.personId ? (
            <button
              type="button"
              className="h-10 rounded-md border border-line px-3 text-sm font-semibold"
              onClick={() => {
                sendMessage(event.personId, `You're confirmed ${labelDay(event.start)} ${labelTime(event.start)}.`, "sms");
                addHistory(event.personId, "Book", `Confirmed ${event.type}.`);
                patchBook(event.id, { status: "Confirmed" });
                onClose();
              }}
            >
              Confirm
            </button>
          ) : null}
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            {editing ? "Save" : blank ? "Hold slot" : "Book"}
          </button>
          <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </form>
    </div>
  );
}
