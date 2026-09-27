import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DISPOSITIONS, setDisposition } from "@/features/ops/store";
import type { BookEvent } from "@/features/book/types";
import { stageWash, toneForStatus } from "@/lib/lead-status";
import type { Appointment } from "@/lib/crm-data";
import { Float } from "@/components/float";
import { cn } from "@/lib/cn";
import { PIPES, pipeFromKind, pipeOfEvent, whenOf } from "./part-01";
import { BookWidgetView5 } from "./part-03";

export function BookRecord({
  mine,
  extras,
  roster,
  onRan,
}: {
  mine: Appointment[];
  extras: BookEvent[];
  roster: { id: string; name: string }[];
  onRan?: () => void;
}) {
  const known = new Set(mine.map((a) => a.id));
  const nameOf = (id: string) => roster.find((r) => r.id === id)?.name ?? "";
  const rows = [
    ...mine.map((a) => ({
      id: a.id,
      pipeline: a.pipeline || pipeFromKind(a.kind ?? "Sales"),
      heading: `${a.kind ?? "Sales"} · Sep ${a.day} ${a.time}${a.duration ? ` · ${a.duration}` : ""}`,
      appt: a as Appointment | undefined,
      statusText: a.status,
      who: [a.closer, a.crew].filter(Boolean).join(" · "),
      setBy: a.setBy || a.setter,
      notes: a.notes ?? "",
      scope: a.scope ?? "",
    })),
    ...extras
      .filter((e) => !known.has(e.id) && !known.has(e.sourceId))
      .map((e) => ({
        id: e.id,
        pipeline: pipeOfEvent(e),
        heading: `${e.type} · ${whenOf(e.start)}`,
        appt: undefined as Appointment | undefined,
        statusText: e.status,
        who: [nameOf(e.assigneeId), nameOf(e.techId), nameOf(e.crewId), nameOf(e.resourceId)].filter((v, i, all) => v && all.indexOf(v) === i).join(" · "),
        setBy: e.setBy,
        notes: e.notes,
        scope: e.scope,
      })),
  ];
  const keys = [...PIPES.filter((p) => rows.some((r) => r.pipeline === p)), ...new Set(rows.map((r) => r.pipeline).filter((p) => !PIPES.includes(p)))];
  return (
    <>
      {keys.map((key) => (
        <div key={key} className="mt-3">
          <p className="mb-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">{key}</p>
          <ul className="space-y-2">
            {rows
              .filter((r) => r.pipeline === key)
              .map((r) => (
                <li key={r.id} className="rounded-md border border-line px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.heading}</span>
                    {r.appt ? <ApptDisp appt={r.appt} onRan={onRan} /> : <span className="text-[10px] font-bold tracking-wide text-muted uppercase">{r.statusText}</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-muted">Who went · {r.who || "Unassigned"}</p>
                  {r.setBy ? <p className="text-[11px] text-muted">Set by · {r.setBy}</p> : null}
                  {r.notes ? <p className="mt-1">{r.notes}</p> : null}
                  {r.scope ? <p className="mt-1 text-[11px] text-muted">{r.scope}</p> : null}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function ApptDisp({ appt, onRan }: { appt: Appointment; onRan?: () => void }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const wash = stageWash(toneForStatus(appt.status));
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Disposition"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-[10px] font-bold tracking-wide uppercase", wash)}
      >
        {appt.status}
        <ChevronDown className="size-3" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {DISPOSITIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={cn("block w-full min-w-40 px-3 py-2 text-left text-sm hover:bg-page", d === appt.status && "font-semibold")}
              onClick={() => {
                setDisposition(appt.id, d);
                setOpen(false);
                if (d === "Ran") onRan?.();
              }}
            >
              {d}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="relative block text-sm">
      <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</span>
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
    </label>
  );
}

export function BookWidgetView2(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView3 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView3(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView4 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView4(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView5 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}
