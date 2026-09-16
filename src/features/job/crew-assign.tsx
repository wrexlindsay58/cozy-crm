import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { ackWo, addAssign, patchAssign, removeAssign, sendAssignWo, signWo, toggleAssignScope, type JobFile } from "./store";
import { cn } from "@/lib/cn";

const CREWS = ["Crew 2 — Tasha", "Crew 1 — Evan", "Crew 3 — Marco", "Crew 4 — Dallas"];
const TRUCKS = ["Truck 4", "Truck 2", "Truck 7", "Truck 1"];
const SUBS = ["Valley Electric", "AeroSeal Co", "Desert Comfort HVAC"];

export function AssignCrew({ job }: { job: JobFile }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Assign crew</h2>
          <p className="mt-1 text-[11px] text-muted">Sends the work order and books the install day for those scopes.</p>
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-xs font-semibold" onClick={() => addAssign(job.jobId)}>
          <Plus className="size-3.5" />
          Crew
        </button>
      </div>
      <ul className="divide-y divide-line">
        {job.assignments.map((a) => {
          const wo = job.workOrders.find((w) => w.id === a.woId);
          const who = a.kind === "sub" ? a.company || a.crew : a.crew;
          return (
            <li key={a.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap gap-1.5">
                {(["internal", "sub"] as const).map((k) => (
                  <button key={k} type="button" onClick={() => patchAssign(job.jobId, a.id, { kind: k, company: k === "sub" ? a.company || SUBS[0] : "" })} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.kind === k ? "bg-navy text-card" : "border border-line")}>
                    {k === "internal" ? "In-house" : "Sub"}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {a.kind === "internal" ? (
                  <Field label="Crew">
                    <select value={a.crew} onChange={(e) => patchAssign(job.jobId, a.id, { crew: e.target.value })} className={sel}>
                      {CREWS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <Field label="Company">
                    <select value={a.company} onChange={(e) => patchAssign(job.jobId, a.id, { company: e.target.value, crew: e.target.value })} className={sel}>
                      {SUBS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Truck">
                  <select value={a.truck} onChange={(e) => patchAssign(job.jobId, a.id, { truck: e.target.value })} className={sel}>
                    {TRUCKS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date">
                  <input type="date" value={a.day} onChange={(e) => patchAssign(job.jobId, a.id, { day: e.target.value })} className={sel} />
                </Field>
                <Field label="Start">
                  <input type="time" value={a.start} onChange={(e) => patchAssign(job.jobId, a.id, { start: e.target.value })} className={sel} />
                </Field>
                <Field label="End">
                  <input type="time" value={a.end} onChange={(e) => patchAssign(job.jobId, a.id, { end: e.target.value })} className={sel} />
                </Field>
              </div>
              <p className="mt-3 text-[11px] font-bold tracking-wide text-muted uppercase">Scopes they own</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.scope.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleAssignScope(job.jobId, a.id, s.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.scopes.includes(s.id) ? "bg-navy text-card" : "border border-line")}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendAssignWo(job.jobId, a.id)}>
                  {wo ? `Resend ${wo.id}` : "Send work order"}
                </button>
                {wo?.file ? (
                  <a href={wo.file.url} className="h-10 px-2 text-sm font-semibold text-navy underline">
                    {wo.file.name}
                  </a>
                ) : null}
                {wo && wo.status === "Sent" ? (
                  <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => ackWo(job.jobId, wo.id, who)}>
                    Acknowledge
                  </button>
                ) : null}
                {wo && (wo.status === "Sent" || wo.status === "Acked") ? (
                  <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => signWo(job.jobId, wo.id, who)}>
                    E-sign
                  </button>
                ) : null}
                {wo ? <span className="text-[12px] text-muted">{wo.status}{wo.signedBy ? ` · ${wo.signedBy}` : ""}</span> : null}
                <button type="button" className="ml-auto text-xs font-semibold text-alert" onClick={() => removeAssign(job.jobId, a.id)}>
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const sel = "mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal";
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
      {label}
      {children}
    </label>
  );
}
