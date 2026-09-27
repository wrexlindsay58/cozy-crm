import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useOps } from "@/features/ops/store";
import { namesIn, useStaff } from "@/features/staff/store";
import { useBook } from "@/features/book/store";
import { useRoster } from "@/features/book/roster";
import type { BookEvent } from "@/features/book/types";
import type { EventKind } from "@/lib/crm-data";
import { BookRecord, BookWidgetView2 } from "./part-02";

export const DAYS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

export const HOURS = ["7:00a", "7:30a", "8:00a", "11:00a", "4:00p", "5:00p", "5:30p", "6:00p", "6:30p", "7:00p"];

export const LENGTHS = ["30m", "1h", "1.5h", "2h", "3h", "4h", "All day"];

export const CREWS = ["Crew 1 — Phoenix", "Crew 2 — Tasha", "Crew 3 — Dallas"];

export const EVENTS: {
  id: EventKind;
  assign: string[];
  crew: boolean;
  scope: boolean;
  length: string;
  hint: string;
}[] = [
  { id: "Sales", assign: ["Closer", "Owner"], crew: false, scope: false, length: "2h", hint: "Both home? Gate code? Dog?" },
  { id: "Assessment", assign: ["Closer", "Owner"], crew: false, scope: false, length: "1.5h", hint: "What are we assessing? Hatch, condenser, ducts." },
  { id: "Site survey", assign: ["PM", "Crew"], crew: true, scope: true, length: "1.5h", hint: "Size, type, placement. Room measurements. Registers." },
  { id: "Install", assign: ["PM"], crew: true, scope: true, length: "All day", hint: "Scope on the truck. Access, dump, HOA." },
  { id: "Service", assign: ["PM", "Crew"], crew: true, scope: true, length: "1h", hint: "What's broken. Fee if it is a paid call." },
  { id: "Warranty", assign: ["PM", "Crew"], crew: true, scope: true, length: "1h", hint: "What failed and when we installed." },
  { id: "Go-back", assign: ["PM", "Crew"], crew: true, scope: true, length: "2h", hint: "What we owe them." },
  { id: "Callback", assign: ["Closer", "Setter", "Owner"], crew: false, scope: false, length: "30m", hint: "Why we're calling back." },
];

export const PIPES = ["Lead", "Assessment", "Opportunity", "Job", "Account", "Membership", "Actions"];

export function pipeFromKind(kind: string) {
  if (kind === "Assessment") return "Assessment";
  if (kind === "Site survey" || kind === "Install" || kind === "Go-back") return "Job";
  if (kind === "Service" || kind === "Warranty") return "Account";
  if (kind === "Membership") return "Membership";
  return "Lead";
}

export function pipeOfEvent(e: BookEvent) {
  if (e.source === "visit" || e.type === "Membership") return "Membership";
  if (e.source === "job" || e.type === "Install" || e.type === "Pre-install" || e.type === "Test-out" || e.type === "Punch") return "Job";
  if (e.type === "Assessment") return "Assessment";
  if (e.type === "Service" || e.type === "Warranty" || e.type === "Go-back") return "Account";
  return "Lead";
}

export function whenOf(iso: string) {
  const day = iso.slice(0, 10);
  const [hRaw, mRaw] = iso.slice(11, 16).split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (!day || Number.isNaN(h)) return iso;
  const dt = new Date(`${day}T12:00:00`);
  const label = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const hr = h % 12 || 12;
  const min = m ? `:${String(m).padStart(2, "0")}` : "";
  return `${label} ${hr}${min}${h < 12 ? "a" : "p"}`;
}

export const selectClass =
  "mt-1 h-11 w-full appearance-none rounded-md border border-line bg-card px-3 pr-10 text-sm outline-none focus:border-navy";

export function BookWidget({
  leadId,
  defaultCloser,
  defaultKind = "Sales",
  pipeline,
  flush,
  actionTitle,
  onRan,
}: {
  leadId: string;
  defaultCloser: string;
  defaultKind?: EventKind;
  pipeline?: string;
  flush?: boolean;
  actionTitle?: string;
  onRan?: () => void;
}) {
  const { actorName: setBy } = useStaff();
  const { appointments, leads, history } = useOps();
  const book = useBook();
  const roster = useRoster();
  const lead = leads.find((l) => l.id === leadId);
  const pipe = pipeline || pipeFromKind(defaultKind);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<EventKind>(defaultKind);
  const def = EVENTS.find((e) => e.id === kind) ?? EVENTS[0];
  const assignList = namesIn(...def.assign);
  const [assignee, setAssignee] = useState(defaultCloser || assignList[0] || "");
  const [crew, setCrew] = useState(CREWS[1]);
  const [day, setDay] = useState(14);
  const [hour, setHour] = useState("6:00p");
  const [length, setLength] = useState(def.length);
  const [notes, setNotes] = useState(actionTitle ? [actionTitle, lead?.notes].filter(Boolean).join(". ") : (lead?.notes ?? ""));
  const [scope, setScope] = useState(lead?.product ?? "");
  const [saved, setSaved] = useState("");
  const mine = useMemo(
    () => appointments.filter((a) => a.leadId === leadId),
    [appointments, leadId],
  );

  function onKind(next: EventKind) {
    const d = EVENTS.find((e) => e.id === next) ?? EVENTS[0];
    setKind(next);
    setLength(d.length);
    const names = namesIn(...d.assign);
    if (!names.includes(assignee)) setAssignee(names[0] || defaultCloser);
  }

  return (
    <section id="book-widget" className={flush ? "" : "rounded-md border border-line bg-card p-4"}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">On the book</h2>
          {actionTitle ? <p className="mt-0.5 truncate text-[12px] text-muted">For {actionTitle}.</p> : null}
        </div>
        {!open ? (
          <button type="button" aria-label="Add event" className="grid size-10 place-items-center rounded-md bg-navy text-card" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
          </button>
        ) : null}
      </div>

      {open ? (
        <BookWidgetView2 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
      ) : saved ? (
        <p className="mt-2 text-sm font-medium text-up">{saved}</p>
      ) : null}

      <h3 className="sr-only">Events</h3>
      {mine.length === 0 && book.every((e) => e.personId !== leadId) ? <p className="mt-2 text-sm text-muted">Nothing scheduled yet.</p> : null}
      <BookRecord mine={mine} extras={book.filter((e) => e.personId === leadId)} roster={roster} onRan={onRan} />
      {history?.[leadId]?.length ? (
        <p className="mt-3 text-[11px] text-muted">File history stays on History. Last: {history[leadId][0]?.what}</p>
      ) : null}
    </section>
  );
}
