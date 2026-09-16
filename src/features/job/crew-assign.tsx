import { Plus } from "lucide-react";
import { addAssign, patchAssign, removeAssign, sendAssignWo, toggleAssignScope, type JobFile } from "./store";
import { cn } from "@/lib/cn";

const CREWS = ["Crew 2 — Tasha", "Crew 1 — Evan", "Crew 3 — Marco", "Crew 4 — Dallas"];
const TRUCKS = ["Truck 4", "Truck 2", "Truck 7", "Truck 1"];
const SUBS = ["Valley Electric", "AeroSeal Co", "Desert Comfort HVAC"];

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
      <p className="mb-3 text-[11px] text-muted">Date, window, scopes they own. Send a work order — in-house or a sub, same packet.</p>
      {job.assignments.length === 0 ? <p className="text-sm text-muted">No crew on the book.</p> : null}
      <ul className="space-y-3">
        {job.assignments.map((a) => {
          const wo = job.workOrders.find((w) => w.id === a.woId);
          return (
            <li key={a.id} className="rounded-md border border-line p-3">
              <div className="flex flex-wrap gap-1.5">
                {(["internal", "sub"] as const).map((k) => (
                  <button key={k} type="button" onClick={() => patchAssign(job.jobId, a.id, { kind: k, company: k === "sub" ? a.company || SUBS[0] : "" })} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.kind === k ? "bg-navy text-card" : "border border-line")}>
                    {k === "internal" ? "In-house" : "Sub"}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {a.kind === "internal" ? (
                  <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    Crew
                    <select value={a.crew} onChange={(e) => patchAssign(job.jobId, a.id, { crew: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal">
                      {CREWS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    Company
                    <select value={a.company} onChange={(e) => patchAssign(job.jobId, a.id, { company: e.target.value, crew: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal">
                      {SUBS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                )}
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
                    <button key={s.id} type="button" onClick={() => toggleAssignScope(job.jobId, a.id, s.label)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", on ? "bg-navy text-card" : "border border-line")}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendAssignWo(job.jobId, a.id)}>
                  {wo ? `Resend ${wo.id}` : "Send work order"}
                </button>
                <div className="flex items-center gap-3">
                  {wo ? <span className="text-[12px] text-muted">{wo.id} · {wo.status}</span> : null}
                  <button type="button" className="text-xs font-semibold text-alert" onClick={() => removeAssign(job.jobId, a.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
