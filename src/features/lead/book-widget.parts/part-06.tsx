import { bookAppointment } from "@/features/ops/store";
import { useAdminSettings } from "@/features/admin-settings/store";
import { useLead } from "@/features/ops/store";
import { isRequired, RunQualify } from "@/features/book/run-qualify";
import { WorkPicks } from "@/features/book/work-picks";
import type { EventKind } from "@/lib/crm-data";
import { CREWS, EVENTS, selectClass } from "./part-01";
import { Field } from "./part-02";
import { BookWidgetView } from "./part-03";

export function BookWidgetView60(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  const lead = useLead(leadId);
  const { qualify } = useAdminSettings();
  const runReady = kind !== "Sales" || (qualify ?? []).filter((q) => isRequired(q.note)).every((q) => Boolean(lead?.qualify?.[q.id]));
  return (
    <form
          className="mt-3 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!runReady) return;
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
              pipeline: pipe,
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
                {assignList.map((n: any) => (
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

          <BookWidgetView bag={{ day, setDay, hour, setHour, length, setLength }} />

          {kind === "Sales" || kind === "Assessment" ? <RunQualify leadId={leadId} /> : null}

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

          {def.scope ? <WorkPicks leadId={leadId} type={kind} onApply={(text) => setScope(text)} /> : null}

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
  );
}
