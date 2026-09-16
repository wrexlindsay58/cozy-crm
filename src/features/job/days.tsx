import { useState } from "react";
import { addEvent, setEventStatus, type JobFile } from "./store";
import { PROCESSES } from "./types";
import { cn } from "@/lib/cn";

export function InstallDays({ job }: { job: JobFile }) {
  const [process, setProcess] = useState<string>(PROCESSES[0]);
  const [scopeId, setScopeId] = useState(job.scope[0]?.id ?? "");
  const [day, setDay] = useState("");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Install days</h2>
      <ul className="space-y-2">
        {job.events.map((e) => {
          const scope = job.scope.find((s) => s.id === e.scopeId);
          return (
            <li key={e.id} className="rounded-md border border-line p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{e.process}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {scope?.label ?? "Scope"} · {e.day} · {e.window} · {e.crew}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {(["Set", "Dispatched", "Done", "No-show"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setEventStatus(job.jobId, e.id, s)} className={cn("h-8 rounded-md px-2.5 text-[11px] font-semibold", e.status === s ? "bg-navy text-card" : "border border-line")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          addEvent(job.jobId, process, scopeId, day);
          setDay("");
        }}
      >
        <select value={process} onChange={(e) => setProcess(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm">
          {PROCESSES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select value={scopeId} onChange={(e) => setScopeId(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm">
          {job.scope.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm" />
        <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Book day
        </button>
      </form>
    </section>
  );
}
