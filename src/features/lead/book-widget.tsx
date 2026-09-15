import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { bookAppointment, useOps } from "@/features/ops/store";
import { namesIn, useStaff } from "@/features/staff/store";
import { SHOP_ACTOR } from "@/lib/chrome";
import { stageWash } from "@/lib/lead-status";
import type { EventKind } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

const DAYS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const HOURS = ["7:00a", "7:30a", "8:00a", "11:00a", "4:00p", "5:00p", "5:30p", "6:00p", "6:30p", "7:00p"];
const LENGTHS = ["30m", "1h", "1.5h", "2h", "3h", "4h", "All day"];
const CREWS = ["Crew 1 — Phoenix", "Crew 2 — Tasha", "Crew 3 — Dallas"];

const EVENTS: {
  id: EventKind;
  assign: string[];
  crew: boolean;
  scope: boolean;
  length: string;
  hint: string;
}[] = [
  { id: "Sales", assign: ["Closer", "Owner"], crew: false, scope: false, length: "2h", hint: "Both home? Gate code? Dog?" },
  { id: "Assessment", assign: ["Closer", "Owner"], crew: false, scope: false, length: "1.5h", hint: "What are we walking? Hatch, condenser, ducts." },
  { id: "Install", assign: ["PM"], crew: true, scope: true, length: "All day", hint: "Scope on the truck. Access, dump, HOA." },
  { id: "Service", assign: ["PM", "Crew"], crew: true, scope: true, length: "1h", hint: "What's broken. Fee if it is a paid call." },
  { id: "Warranty", assign: ["PM", "Crew"], crew: true, scope: true, length: "1h", hint: "What failed and when we installed." },
  { id: "Go-back", assign: ["PM", "Crew"], crew: true, scope: true, length: "2h", hint: "What we owe them." },
  { id: "Callback", assign: ["Closer", "Setter", "Owner"], crew: false, scope: false, length: "30m", hint: "Why we're calling back." },
];

const selectClass =
  "mt-1 h-11 w-full appearance-none rounded-md border border-line bg-card px-3 pr-10 text-sm outline-none focus:border-navy";

export function BookWidget({
  leadId,
  defaultCloser,
  defaultKind = "Sales",
  formOpen = false,
}: {
  leadId: string;
  defaultCloser: string;
  defaultKind?: EventKind;
  formOpen?: boolean;
}) {
  const { viewAs } = useStaff();
  const { appointments, leads, history } = useOps();
  const lead = leads.find((l) => l.id === leadId);
  const setBy = viewAs === "Owner" ? SHOP_ACTOR : viewAs;
  const [open, setOpen] = useState(formOpen);
  useEffect(() => {
    if (formOpen) setOpen(true);
  }, [formOpen]);
  const [kind, setKind] = useState<EventKind>(defaultKind);
  const def = EVENTS.find((e) => e.id === kind) ?? EVENTS[0];
  const assignList = namesIn(...def.assign);
  const [assignee, setAssignee] = useState(defaultCloser || assignList[0] || "");
  const [crew, setCrew] = useState(CREWS[1]);
  const [day, setDay] = useState(14);
  const [hour, setHour] = useState("6:00p");
  const [length, setLength] = useState(def.length);
  const [notes, setNotes] = useState(lead?.notes ?? "");
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
    <section id="book-widget" className="rounded-md border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Schedule</h2>
        {!open ? (
          <button type="button" className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setOpen(true)}>
            Schedule
          </button>
        ) : null}
      </div>

      {open ? (
        <form
          className="mt-3 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            bookAppointment({
              leadId,
              kind,
              day,
              time: hour,
              assignee,
              setBy,
              notes,
              crew: def.crew ? crew : undefined,
              duration: length,
              scope: def.scope ? scope : undefined,
            });
            setSaved(`${kind} · Sep ${day} ${hour} · ${assignee}`);
            setOpen(false);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Event">
              <select value={kind} onChange={(e) => onKind(e.target.value as EventKind)} className={selectClass}>
                {EVENTS.map((e) => (
                  <option key={e.id}>{e.id}</option>
                ))}
              </select>
            </Field>
            <label className="block text-sm">
              <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Set by</span>
              <p className="mt-1 flex h-11 items-center rounded-md border border-line bg-page px-3 text-sm">{setBy}</p>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={def.crew ? "PM" : "Assigned"}>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={selectClass}>
                {assignList.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
            {def.crew ? (
              <Field label="Crew">
                <select value={crew} onChange={(e) => setCrew(e.target.value)} className={selectClass}>
                  {CREWS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Day">
              <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={selectClass}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    Sep {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time">
              <select value={hour} onChange={(e) => setHour(e.target.value)} className={selectClass}>
                {HOURS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
            <Field label="Length">
              <select value={length} onChange={(e) => setLength(e.target.value)} className={selectClass}>
                {LENGTHS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
          </div>

          <label className="block text-sm">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Notes for the run</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={def.hint}
              className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </label>

          {def.scope ? (
            <label className="block text-sm">
              <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Scope</span>
              <textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                rows={2}
                placeholder="What's on the truck."
                className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </label>
          ) : null}

          <p className="text-[11px] text-muted">
            Photos, notes, and history on this file go with the event. Add anything the {def.crew ? "crew" : "rep"} still needs above.
          </p>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="h-11 rounded-md bg-navy px-4 text-sm font-semibold text-card">
              Schedule
            </button>
            <button type="button" className="h-11 rounded-md border border-line px-4 text-sm font-semibold" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
          {saved ? <p className="text-sm font-medium text-up">{saved}</p> : null}
        </form>
      ) : saved ? (
        <p className="mt-2 text-sm font-medium text-up">{saved}</p>
      ) : null}

      <h3 className="mt-4 text-[11px] font-bold tracking-wide text-muted uppercase">On the book</h3>
      {mine.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing scheduled yet.</p> : null}
      <ul className="mt-2 space-y-2">
        {mine.map((a) => (
          <li key={a.id} className="rounded-md border border-line px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">
                {a.kind ?? "Sales"} · Sep {a.day} {a.time}
                {a.duration ? ` · ${a.duration}` : ""}
              </span>
              <span className={cn("h-5 rounded px-1.5 text-[10px] font-bold tracking-wide uppercase leading-5", stageWash(a.tone))}>
                {a.status}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {a.closer}
              {a.crew ? ` · ${a.crew}` : ""}
              {a.setBy ? ` · set by ${a.setBy}` : a.setter ? ` · set by ${a.setter}` : ""}
            </p>
            {a.notes ? <p className="mt-1">{a.notes}</p> : null}
            {a.scope ? <p className="mt-1 text-[11px] text-muted">{a.scope}</p> : null}
          </li>
        ))}
      </ul>
      {history?.[leadId]?.length ? (
        <p className="mt-3 text-[11px] text-muted">File history stays on History. Last: {history[leadId][0]?.what}</p>
      ) : null}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="relative block text-sm">
      <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</span>
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
    </label>
  );
}
