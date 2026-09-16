import { useState } from "react";
import { ackWo, addAssign, addEvent, patchAssign, patchEvent, removeAssign, sendAssignWo, setEventStatus, signWo, toggleAssignScope, type JobFile } from "./store";
import { PROCESSES } from "./types";
import { cn } from "@/lib/cn";

const CREWS = ["Crew 2 — Tasha", "Crew 1 — Evan", "Crew 3 — Marco"];
const SUBS = ["Valley Electric", "AeroSeal Co"];

export function CrewChapter({ job }: { job: JobFile }) {
  const [open, setOpen] = useState<string | null>(job.assignments[0]?.id ?? null);
  const [process, setProcess] = useState<string>(PROCESSES[0]);
  const [scopeId, setScopeId] = useState(job.scope.find((s) => s.kind === "product")?.id ?? "");
  const [day, setDay] = useState("");
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("15:00");
  const products = job.scope.filter((s) => s.kind !== "promise");

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-line bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Crew</h2>
          <button type="button" className="h-9 rounded-md border border-line px-3 text-xs font-semibold" onClick={() => addAssign(job.jobId)}>
            Add crew
          </button>
        </div>
        <ul className="divide-y divide-line">
          {job.assignments.map((a) => {
            const wo = job.workOrders.find((w) => w.id === a.woId);
            const who = a.kind === "sub" ? a.company || a.crew : a.crew;
            const names = a.scopes.map((id) => job.scope.find((s) => s.id === id)?.label).filter(Boolean).join(" · ");
            const expanded = open === a.id;
            return (
              <li key={a.id} className="py-3">
                <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen(expanded ? null : a.id)}>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{who}</span>
                    <span className="block truncate text-[12px] text-muted">
                      {a.day || "No date"} {a.start}–{a.end} · {names || "No scope"}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{wo?.status ?? "No WO"}</span>
                </button>
                {expanded ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(["internal", "sub"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => patchAssign(job.jobId, a.id, { kind: k, company: k === "sub" ? SUBS[0] : "" })} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.kind === k ? "bg-navy text-card" : "border border-line")}>
                          {k === "internal" ? "In-house" : "Sub"}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-4">
                      <select value={a.kind === "sub" ? a.company : a.crew} onChange={(e) => patchAssign(job.jobId, a.id, a.kind === "sub" ? { company: e.target.value, crew: e.target.value } : { crew: e.target.value })} className="h-10 rounded-md border border-line px-2 text-sm">
                        {(a.kind === "sub" ? SUBS : CREWS).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <input type="date" value={a.day} onChange={(e) => patchAssign(job.jobId, a.id, { day: e.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
                      <input type="time" value={a.start} onChange={(e) => patchAssign(job.jobId, a.id, { start: e.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
                      <input type="time" value={a.end} onChange={(e) => patchAssign(job.jobId, a.id, { end: e.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {products.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleAssignScope(job.jobId, a.id, s.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.scopes.includes(s.id) ? "bg-navy text-card" : "border border-line")}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendAssignWo(job.jobId, a.id)}>
                        {wo ? "Resend WO" : "Send work order"}
                      </button>
                      {wo?.status === "Sent" ? (
                        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => ackWo(job.jobId, wo.id, who)}>
                          Acknowledge
                        </button>
                      ) : null}
                      {wo && wo.status !== "Signed" && wo.status !== "Done" ? (
                        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => signWo(job.jobId, wo.id, who)}>
                          E-sign
                        </button>
                      ) : null}
                      <button type="button" className="ml-auto text-xs font-semibold text-alert" onClick={() => removeAssign(job.jobId, a.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Days</h2>
        <ul className="divide-y divide-line">
          {job.events.map((e) => {
            const scope = job.scope.find((s) => s.id === e.scopeId);
            return (
              <li key={e.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{e.process}</p>
                  <p className="text-[12px] text-muted">
                    {scope?.label} · {e.day} · {e.start}–{e.end} · {e.crew}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <input type="time" value={e.start} onChange={(ev) => patchEvent(job.jobId, e.id, { start: ev.target.value })} className="h-8 rounded-md border border-line px-1 text-[12px]" />
                  <input type="time" value={e.end} onChange={(ev) => patchEvent(job.jobId, e.id, { end: ev.target.value })} className="h-8 rounded-md border border-line px-1 text-[12px]" />
                  {(["Set", "Dispatched", "Done", "No-show"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setEventStatus(job.jobId, e.id, s)} className={cn("h-8 rounded-md px-2 text-[11px] font-semibold", e.status === s ? "bg-navy text-card" : "border border-line")}>
                      {s}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            addEvent(job.jobId, process, scopeId, day, start, end);
            setDay("");
          }}
        >
          <select value={process} onChange={(e) => setProcess(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm">
            {PROCESSES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select value={scopeId} onChange={(e) => setScopeId(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm">
            {products.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm" />
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-10 rounded-md border border-line px-2 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Add day
          </button>
        </form>
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-2 h-10 w-36 rounded-md border border-line px-2 text-sm" aria-label="End" />
      </section>
    </div>
  );
}
