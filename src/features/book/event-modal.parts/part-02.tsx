import type { FormEvent } from "react";
import { X } from "lucide-react";
import { addHistory } from "@/features/ops/store";
import { sendMessage } from "@/features/thread/store";
import type { BookEvent, BookType } from "../types";
import { familyOf } from "../types";
import { eventCreator } from "../creator";
import { addHrs, durationHrs, labelDay, labelTime } from "../time";
import { createBook, patchBook } from "../store";
import type { Resource } from "../roster";
import { whoFor, seriesStarts, useEventModal } from "./part-01";
import { EventModalView } from "./part-03";
import { isRequired, RunQualify } from "../run-qualify";
import { WorkPicks } from "../work-picks";
import { useAdminSettings } from "@/features/admin-settings/store";

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
  const { leads, setLeadId, setQuery, setTitle, setLeadSource, setNotes, jobs, setProducts, setSow, setType, setCrewId, setTechId, setAssigneeId, length, who, assigneeId, crewId, techId, type, blank, title, lead, notes, setBy, links, status, leadSource, products, sow, job, editing, repeat, start, repeatCount, setBlank, setStatus, sales, shopPeople, individuals, crews, query, hits, setLength, hours, setStart, setRepeat, setRepeatCount, linkDraft, setLinkDraft, setLinks, visit, setVisit, visitWhy, setVisitWhy, visitNote, setVisitNote } = useEventModal(resources, preset, event, onClose);
  const { qualify } = useAdminSettings();


  function pickLead(id: string) {
    const l = leads.find((x) => x.id === id);
    if (!l) return;
    setLeadId(l.id);
    setQuery("");
    setTitle(l.name);
    setLeadSource(l.source);
    setNotes((n: any) => n || l.notes);
    const file = Object.values(jobs).find((j) => j.personId === l.id || j.leadId === l.id);
    if (file) {
      setProducts(
        file.scope.filter((s) => s.kind === "product" || s.kind === "adder").map((s) => ({ label: s.label, notes: s.notes, qty: s.qty })),
      );
      setSow([file.soldNotes, ...file.scope.map((s) => `${s.label}: ${s.notes}`.trim())].filter(Boolean).join("\n"));
      setNotes((n: any) => n || file.soldNotes);
    } else if (l.product) {
      setProducts([{ label: l.product, notes: l.notes, qty: 1 }]);
      setSow("");
    }
  }

  function onType(next: BookType) {
    setType(next);
    if (next === "Block") setLength((n: string) => (n === "All day" ? "1h" : n));
    if (next === "Time-off") setLength("All day");
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
      setBy: familyOf(type) === "sales" && lead?.setter ? lead.setter : editing && event ? event.setBy : setBy,
      internal: blank || who === "person" || !lead,
      office,
      blank,
      links,
      status,
      leadSource: lead?.source || leadSource,
      products: who === "production" ? products : [],
      scope: who === "production" ? sow : "",
      jobId: job?.jobId,
      visit: (type === "Sales" || type === "Callback" ? visit : "") as "" | "in-person" | "phone",
      visitWhy: visit === "phone" ? visitWhy : "",
      visitNote: visit === "phone" && visitWhy === "other" ? visitNote.trim() : "",
    };
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (type === "Sales" && lead) {
      const missing = (qualify ?? []).some((q) => isRequired(q.note) && !lead.qualify?.[q.id]);
      if (missing) return;
    }
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
          <button type="button" aria-label="Close" className="grid size-9 place-items-center rounded-md hover:bg-page" onClick={onClose}><X className="size-4" /></button>
        </header>
        <EventModalView bag={{ blank, setBlank, type, onType, status, setStatus, who, assigneeId, setAssigneeId, sales, techId, setTechId, shopPeople, individuals, crewId, setCrewId, crews, lead, query, setLeadId, setQuery, hits, pickLead, products, sow, job, title, setTitle, setLength, length, start, hours, setStart, editing, setRepeat, repeat, repeatCount, setRepeatCount, notes, setNotes, setSow, setProducts, linkDraft, setLinkDraft, setLinks, links, creator: eventCreator({ type, personId: lead?.id ?? event?.personId ?? "", setBy: familyOf(type) === "sales" && lead?.setter ? lead.setter : editing && event ? event.setBy : setBy }), visit, setVisit, visitWhy, setVisitWhy, visitNote, setVisitNote }} />
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line px-4 py-3">
          {editing && event && !event.internal && event.personId ? (
            <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => { sendMessage(event.personId, `You're confirmed ${labelDay(event.start)} ${labelTime(event.start)}.`, "sms"); addHistory(event.personId, "Book", `Confirmed ${event.type}.`); patchBook(event.id, { status: "Confirmed" }); onClose(); }}>Confirm</button>
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
