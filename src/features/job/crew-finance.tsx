import { useState } from "react";
import { assignCrew, completeJob, patchScope, setNtp, setSoldNotes, type JobFile } from "./store";
import { money } from "@/lib/crm-data";

const CREWS = ["Crew 2 — Tasha", "Crew 1 — Evan", "Crew 3 — Marco"];
const TRUCKS = ["Truck 4", "Truck 2", "Truck 7"];
const NTPS = ["Not ready", "Ready", "Submitted", "Issued"] as const;

export function CrewBlock({ job }: { job: JobFile }) {
  const [crew, setCrew] = useState(job.crew);
  const [truck, setTruck] = useState(job.truck);
  const [window, setWindow] = useState(job.window);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Crew + window</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
          Crew
          <select value={crew} onChange={(e) => setCrew(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal">
            {CREWS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
          Truck
          <select value={truck} onChange={(e) => setTruck(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal">
            {TRUCKS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
          Window
          <input value={window} onChange={(e) => setWindow(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal" />
        </label>
      </div>
      <button type="button" onClick={() => assignCrew(job.jobId, crew, truck, window)} className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
        Assign
      </button>
    </section>
  );
}

export function FinanceBlock({ job }: { job: JobFile }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Finance + NTP</h2>
      <p className="text-sm">
        {job.financeVendor} · {job.financeStatus}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {NTPS.map((n) => (
          <button key={n} type="button" onClick={() => setNtp(job.jobId, n)} className={job.ntp === n ? "h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card" : "h-9 rounded-md border border-line px-3 text-sm font-semibold"}>
            {n}
          </button>
        ))}
      </div>
      {job.stage !== "Closed" ? (
        <button type="button" onClick={() => completeJob(job.jobId)} className="mt-4 h-10 rounded-md border border-line px-3 text-sm font-semibold">
          Complete job{job.warranty ? " · open warranty" : ""}
        </button>
      ) : (
        <p className="mt-4 text-sm font-semibold text-up">Closed{job.warranty ? " · warranty open" : ""}</p>
      )}
    </section>
  );
}

export function ScopeBlock({ job }: { job: JobFile }) {
  const total = job.scope.reduce((s, r) => s + r.amount, 0);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Sold scope</h2>
        <p className="text-sm font-extrabold tabular-nums">{money(total)}</p>
      </div>
      <label className="mb-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Job notes
        <textarea
          value={job.soldNotes}
          onChange={(e) => setSoldNotes(job.jobId, e.target.value)}
          rows={2}
          placeholder="What was sold. Access. Anything the crew has to know."
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal normal-case tracking-normal"
        />
      </label>
      <ul className="space-y-3">
        {job.scope.map((s) => (
          <li key={s.id} className="rounded-md border border-line p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{s.label}</p>
              <span className="text-[12px] tabular-nums text-muted">{money(s.amount)}</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                Qty
                <input
                  value={s.qty || ""}
                  inputMode="numeric"
                  onChange={(e) => patchScope(job.jobId, s.id, { qty: Number(e.target.value) || 0 })}
                  className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal"
                />
              </label>
              <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                Sq ft
                <input
                  value={s.sqft || ""}
                  inputMode="numeric"
                  onChange={(e) => patchScope(job.jobId, s.id, { sqft: Number(e.target.value) || 0 })}
                  className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal"
                />
              </label>
            </div>
            <label className="mt-2 block text-[11px] font-bold tracking-wide text-muted uppercase">
              Scope notes
              <textarea
                value={s.notes}
                onChange={(e) => patchScope(job.jobId, s.id, { notes: e.target.value })}
                rows={2}
                placeholder="Depth, brand, access, what they walk into."
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal normal-case tracking-normal"
              />
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
