import { cn } from "@/lib/cn";
import { BOOK_DISPOSITIONS, BOOK_TYPES, mapStatus, type BookType } from "../types";
import { durationHrs, labelDay, labelTime } from "../time";
import { findSlot } from "../store";
import { field, label, EventModalView3 } from "./part-01";
import { EventModalView2, EventModalView4 } from "./part-04";

export function EventModalView(props: { bag: { blank: any; setBlank: any; type: any; onType: any; status: any; setStatus: any; who: any; assigneeId: any; setAssigneeId: any; sales: any; techId: any; setTechId: any; shopPeople: any; individuals: any; crewId: any; setCrewId: any; crews: any; lead: any; query: any; setLeadId: any; setQuery: any; hits: any; pickLead: any; products: any; sow: any; job: any; title: any; setTitle: any; setLength: any; length: any; start: any; hours: any; setStart: any; editing: any; setRepeat: any; repeat: any; repeatCount: any; setRepeatCount: any; notes: any; setNotes: any; setSow: any; linkDraft: any; setLinkDraft: any; setLinks: any; links: any } }) {
  const { blank, setBlank, type, onType, status, setStatus, who, assigneeId, setAssigneeId, sales, techId, setTechId, shopPeople, individuals, crewId, setCrewId, crews, lead, query, setLeadId, setQuery, hits, pickLead, products, sow, job, title, setTitle, setLength, length, start, hours, setStart, editing, setRepeat, repeat, repeatCount, setRepeatCount, notes, setNotes, setSow, linkDraft, setLinkDraft, setLinks, links } = props.bag;
  return (
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
          <EventModalView3 bag={{ who, assigneeId, setAssigneeId, sales, techId, setTechId, shopPeople, individuals, crewId, setCrewId, crews }} />

          {!blank ? (
            <EventModalView2 bag={{ lead, query, setLeadId, setQuery, hits, pickLead, who, type, products, sow, job, title, setTitle }} />
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

          <EventModalView4 bag={{ linkDraft, setLinkDraft, setLinks, links }} />
        </div>
  );
}
