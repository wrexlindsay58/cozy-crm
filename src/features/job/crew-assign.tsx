import { Plus } from "lucide-react";
import { addAssign, patchAssign, removeAssign, toggleAssignScope, type JobFile } from "./store";
import { cn } from "@/lib/cn";

const CREWS = ["Crew 2 — Tasha", "Crew 1 — Evan", "Crew 3 — Marco", "Crew 4 — Dallas"];
const TRUCKS = ["Truck 4", "Truck 2", "Truck 7", "Truck 1"];

export function AssignCrew({ job }: { job: JobFile }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Assign crew</h2>
        <button type="button" className="inline-flex h-9 items-center gap-1 rounded-md bg-navy px-3 text-xs font-semibold text-card" onClick={() => addAssign(job.jobId)}>
          <Plus className="size-3.5" />
          Crew
        </button>
      </div>
      <p className="mb-3 text-[11px] text-muted">Date, window, and the scopes they own. Three scopes can be three crews.</p>
      {job.assignments.length === 0 ? <p className="text-sm text-muted">No crew on the book.</p> : null}
      <ul className="space-y-3">
        {job.assignments.map((a) => (
          <li key={a.id} className="rounded-md border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                Crew
                <select value={a.crew} onChange={(e) => patchAssign(job.jobId, a.id, { crew: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal">
                  {CREWS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                Truck
                <select value={a.truck} onChange={(e) => patchAssign(job.jobId, a.id, { truck: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal">
                  {TRUCKS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                Date
                <input type="date" value={a.day} onChange={(e) => patchAssign(job.jobId, a.id, { day: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                  Start
                  <input type="time" value={a.start} onChange={(e) => patchAssign(job.jobId, a.id, { start: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
                </label>
                <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                  End
                  <input type="time" value={a.end} onChange={(e) => patchAssign(job.jobId, a.id, { end: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
                </label>
              </div>
            </div>
            <p className="mt-3 text-[11px] font-bold tracking-wide text-muted uppercase">Scope they own</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {job.scope.map((s) => {
                const on = a.scopes.includes(s.label);
                return (
                  <button key={s.label} type="button" onClick={() => toggleAssignScope(job.jobId, a.id, s.label)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", on ? "bg-navy text-card" : "border border-line")}>
                    {s.label}
                  </button>
                );
              })}
            </div>
            <button type="button" className="mt-3 text-xs font-semibold text-alert" onClick={() => removeAssign(job.jobId, a.id)}>
              Remove crew
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
