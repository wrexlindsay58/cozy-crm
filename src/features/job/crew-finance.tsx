import { useState } from "react";
import { assignCrew, completeJob, setNtp, type JobFile } from "./store";
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
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Sold scope</h2>
      <ul className="space-y-2 text-sm">
        {job.scope.map((s) => (
          <li key={s.label} className="flex justify-between gap-3">
            <span>{s.label}</span>
            <span className="font-semibold tabular-nums">{money(s.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
