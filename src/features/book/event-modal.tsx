import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOps, addHistory } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { sendMessage } from "@/features/thread/store";
import { useJobs } from "@/features/job/store";
import { BOOK_DISPOSITIONS, BOOK_TYPES, familyOf, mapStatus, type BookEvent, type BookLink, type BookProduct, type BookStatus, type BookType } from "./types";
import { addHrs, durationHrs, labelDay, labelTime, toIso } from "./time";
import { createBook, findSlot, patchBook } from "./store";
import { hoursFor as rosterHours, type Resource } from "./roster";

const field = "mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";
const label = "block text-[11px] font-bold tracking-wide text-muted uppercase";

type Repeat = "none" | "daily" | "weekdays" | "weekly";

function whoFor(t: BookType) {
  const fam = familyOf(t);
  if (fam === "sales") return "sales" as const;
  if (fam === "production" || t === "Materials") return "production" as const;
  return "person" as const;
}

function seriesStarts(start: string, kind: Repeat, count: number) {
  const out: string[] = [];
  const d = new Date(start);
  while (out.length < Math.max(1, count)) {
    const day = d.getDay();
    if (kind === "weekdays" && (day === 0 || day === 6)) {
      d.setDate(d.getDate() + 1);
      continue;
    }
    out.push(toIso(d));
    if (kind === "none") break;
    d.setDate(d.getDate() + (kind === "weekly" ? 7 : 1));
  }
  return out;
}

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
  const jobs = useJobs();
  const { actorName: setBy } = useStaff();
  const editing = Boolean(event);
  const clicked = resources.find((r) => r.id === (event?.resourceId || preset?.resourceId));
  const [blank, setBlank] = useState(event?.blank ?? false);
  const [type, setType] = useState<BookType>(event?.type && event.type !== "Open" ? event.type : preset?.type ?? (clicked?.kind === "crew" ? "Install" : "Sales"));
  const [status, setStatus] = useState<BookStatus>(event?.status ?? "Confirmed");
  const [assigneeId, setAssigneeId] = useState(event?.assigneeId || (clicked?.kind === "closer" || clicked?.kind === "setter" ? clicked.id : ""));
  const [techId, setTechId] = useState(event?.techId || (clicked?.role === "PM" || clicked?.role === "Owner" ? clicked.id : ""));
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
  const [products, setProducts] = useState<BookProduct[]>(event?.products ?? []);
  const [sow, setSow] = useState(event?.scope ?? "");
  const [leadSource, setLeadSource] = useState(event?.leadSource ?? "");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [repeatCount, setRepeatCount] = useState(4);
  const hours = useMemo(() => rosterHours(resources), [resources]);
  const who = whoFor(type);
  const sales = resources.filter((r) => r.kind === "closer" || r.kind === "setter" || r.role === "Owner");
  const individuals = resources.filter((r) => r.kind !== "crew" && (r.role === "PM" || r.role === "Crew" || r.role === "Owner"));
  const shopPeople = resources.filter((r) => r.kind !== "crew");
  const crews = resources.filter((r) => r.kind === "crew");
  const lead = leads.find((l) => l.id === leadId);
  const job = Object.values(jobs).find((j) => j.personId === leadId || j.leadId === leadId);
  const hits = query.trim()
    ? leads.filter((l) => `${l.name} ${l.city} ${l.phone} ${l.address}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  function pickLead(id: string) {
    const l = leads.find((x) => x.id === id);
    if (!l) return;
    setLeadId(l.id);
    setQuery("");
    setTitle(l.name);
    setLeadSource(l.source);
    setNotes((n) => n || l.notes);
    const file = Object.values(jobs).find((j) => j.personId === l.id || j.leadId === l.id);
    if (file) {
      setProducts(
        file.scope.filter((s) => s.kind === "product" || s.kind === "adder").map((s) => ({ label: s.label, notes: s.notes, qty: s.qty })),
      );
      setSow([file.soldNotes, ...file.scope.map((s) => `${s.label}: ${s.notes}`.trim())].filter(Boolean).join("\n"));
      setNotes((n) => n || file.soldNotes);
    } else if (l.product) {
      setProducts([{ label: l.product, notes: l.notes, qty: 1 }]);
      setSow("");
    }
  }

  function onType(next: BookType) {
    setType(next);
    const w = whoFor(next);
    if (w === "sales") {
      setCrewId("");
      setTechId("");
    } else if (w === "production") {
      setAssigneeId("");
    } else {
      setCrewId("");
      setAssigneeId("");
    }
  }

  function payload(at: string) {
    const hrs = durationHrs(length);
    const resourceId = who === "sales" ? assigneeId : who === "production" ? crewId || techId : techId;
    const office = resources.find((r) => r.id === resourceId)?.office ?? "PHX";
    return {
      type,
      title: blank ? title.trim() || "Open slot" : lead?.name || title || type,
      personId: blank ? undefined : lead?.id,
      href: lead && !blank ? `/leads/${lead.id}` : "",
      resourceId,
      crewId: who === "production" ? crewId : "",
      techId: who === "sales" ? "" : techId,
      assigneeId: who === "sales" ? assigneeId : "",
      start: at,
      end: addHrs(at, hrs),
      city: lead?.city,
      notes: notes || lead?.notes || "",
      setBy,
      internal: blank || who === "person" || !lead,
      office,
      blank,
      links,
      status,
      leadSource: lead?.source || leadSource,
      products: who === "production" ? products : [],
      scope: who === "production" ? sow : "",
      jobId: job?.jobId,
    };
  }

  function save(e: FormEvent) {
    e.preventDefault();
    const starts = editing || repeat === "none" ? [start] : seriesStarts(start, repeat, repeatCount);
    if (editing && event) {
      const row = payload(start);
      patchBook(event.id, {
        ...row,
        personId: row.personId ?? "",
        href: row.href || event.href,
      });
      if (lead && (crewId !== event.crewId || assigneeId !== event.assigneeId || techId !== event.techId)) {
        addHistory(lead.id, setBy, `Transferred ${type}.`);
      }
    } else {
      starts.forEach((at) => createBook(payload(at)));
      if (lead && !blank) addHistory(lead.id, setBy, `Scheduled ${type}${starts.length > 1 ? ` × ${starts.length}` : ""}.`);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 max-md:p-0">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <form onSubmit={save} className="relative z-10 flex max-h-[min(42rem,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-md border border-line bg-card shadow-lg max-md:h-full max-md:max-h-none max-md:max-w-none max-md:rounded-none">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 className="text-sm font-semibold">{editing ? "Event" : blank ? "Blank slots" : "Book"}</h2>
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
              <select value={type} onChange={(e) => onType(e.target.value as BookType)} className={field}>
                {BOOK_TYPES.filter((t) => t !== "Open").map((t) => (
                  <option key={t}>{t}</option>
                ))}
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
          <div className={cn("grid gap-3", who === "production" ? "sm:grid-cols-2" : "")}>
            {who === "sales" ? (
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
            ) : null}
            {who === "production" || who === "person" ? (
              <label className={label}>
                Person
                <select value={techId} onChange={(e) => setTechId(e.target.value)} className={field}>
                  <option value="">None</option>
                  {(who === "person" ? shopPeople : individuals).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {who === "production" ? (
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
            ) : null}
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
                      <button type="button" className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-page" onClick={() => pickLead(l.id)}>
                        <span className="text-sm font-semibold">{l.name}</span>
                        <span className="text-[12px] text-muted">
                          {l.address} · {l.city} · {l.source}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {lead ? (
                <div className="mt-2 space-y-2 rounded-md border border-line bg-page p-3 text-[13px]">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-muted">
                    {lead.address} · {lead.city}
                  </p>
                  <p className="text-muted">
                    {lead.phone}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </p>
                  {who === "sales" || type === "Assessment" ? (
                    <>
                      <p>
                        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Source </span>
                        {lead.source}
                        {lead.referrerName ? ` · ${lead.referrerName}` : ""}
                      </p>
                      <p>
                        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Status </span>
                        {lead.status}
                      </p>
                      {lead.notes ? <p className="text-muted">{lead.notes}</p> : null}
                    </>
                  ) : null}
                  {who === "production" ? (
                    <>
                      {products.length ? (
                        <ul className="space-y-1">
                          {products.map((p) => (
                            <li key={p.label}>
                              <p className="font-semibold">
                                {p.label}
                                {p.qty ? ` · ${p.qty}` : ""}
                              </p>
                              {p.notes ? <p className="text-muted">{p.notes}</p> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">No sold products on this file yet.</p>
                      )}
                      {sow ? (
                        <p className="whitespace-pre-wrap text-muted">
                          <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">SOW</span>
                          {sow}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  <a href={job ? `/projects/${job.jobId}` : `/leads/${lead.id}`} className="inline-block text-[12px] font-semibold text-navy">
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

          {!editing ? (
            <div>
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Repeat</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(
                  [
                    ["none", "Once"],
                    ["daily", "Daily"],
                    ["weekdays", "Weekdays"],
                    ["weekly", "Weekly"],
                  ] as const
                ).map(([id, name]) => (
                  <button key={id} type="button" onClick={() => setRepeat(id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", repeat === id ? "bg-navy text-card" : "border border-line")}>
                    {name}
                  </button>
                ))}
              </div>
              {repeat !== "none" ? (
                <label className={`${label} mt-2`}>
                  How many
                  <input type="number" min={2} max={20} value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value) || 2)} className={field} />
                </label>
              ) : null}
            </div>
          ) : null}

          <label className={label}>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Gate code, both home, what's on the truck." className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy" />
          </label>

          {who === "production" && !blank ? (
            <label className={label}>
              SOW
              <textarea value={sow} onChange={(e) => setSow(e.target.value)} rows={3} placeholder="What's being done on this visit." className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy" />
            </label>
          ) : null}

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
            {editing ? "Save" : repeat !== "none" ? `Create ${repeatCount}` : blank ? "Hold slot" : "Book"}
          </button>
          <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </form>
    </div>
  );
}
