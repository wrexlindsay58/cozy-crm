import { useState } from "react";
import {
  addEquip,
  addPunch,
  addTimePunch,
  patchPermit,
  patchPunchClock,
  patchRebate,
  patchTest,
  setAccess,
  setEquip,
  toggleCheck,
  togglePunch,
  type JobFile,
} from "./store";
import { punchHours } from "./types";
import { cn } from "@/lib/cn";

export function FieldBlock({ job }: { job: JobFile }) {
  const est = job.scope.reduce((s, r) => s + r.estHours, 0);
  const actual = job.punches.reduce((s, p) => s + punchHours(p).total, 0);
  const [who, setWho] = useState(job.crew);
  const [punch, setPunch] = useState("");
  const [eq, setEq] = useState("");
  const [access, setAcc] = useState(job.access);

  return (
    <div className="space-y-3">
      <section className="rounded-md border border-line bg-card p-4">
        <div className="mb-3 flex items-end justify-between gap-2">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Labor</h2>
          <p className="text-[12px] text-muted">
            Est {est}h · actual {actual.toFixed(1)}h
          </p>
        </div>
        <ul className="space-y-2">
          {job.punches.map((p) => {
            const h = punchHours(p);
            return (
              <li key={p.id} className="rounded-md border border-line p-3">
                <p className="text-sm font-semibold">
                  {p.who} · {p.day}
                  <span className="ml-2 text-[12px] font-normal text-muted">{h.total ? `${h.site.toFixed(1)}h on site · ${h.travel.toFixed(1)}h travel` : "Open"}</span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ["leftYard", "Leave yard"],
                      ["onSite", "On site"],
                      ["complete", "Complete"],
                      ["back", "Back"],
                    ] as const
                  ).map(([k, lab]) => (
                    <label key={k} className="text-[11px] font-bold tracking-wide text-muted uppercase">
                      {lab}
                      <input type="time" value={p[k]} onChange={(e) => patchPunchClock(job.jobId, p.id, { [k]: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTimePunch(job.jobId, who, "Today");
          }}
        >
          <input value={who} onChange={(e) => setWho(e.target.value)} className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold">
            Clock
          </button>
        </form>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Permit</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={job.permit.number} onChange={(e) => patchPermit(job.jobId, { number: e.target.value })} placeholder="Number" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input value={job.permit.city} onChange={(e) => patchPermit(job.jobId, { city: e.target.value })} placeholder="City" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input type="date" value={job.permit.inspection} onChange={(e) => patchPermit(job.jobId, { inspection: e.target.value })} className="h-10 rounded-md border border-line px-3 text-sm" />
            <select value={job.permit.result} onChange={(e) => patchPermit(job.jobId, { result: e.target.value as typeof job.permit.result })} className="h-10 rounded-md border border-line px-2 text-sm">
              {["None", "Scheduled", "Pass", "Fail"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          {job.permit.file ? <a href={job.permit.file.url} className="mt-2 inline-block text-sm font-semibold text-navy underline">{job.permit.file.name}</a> : null}
        </section>
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Rebate</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={job.rebate.utility} onChange={(e) => patchRebate(job.jobId, { utility: e.target.value })} placeholder="Utility" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input value={job.rebate.program} onChange={(e) => patchRebate(job.jobId, { program: e.target.value })} placeholder="Program" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input value={job.rebate.amount || ""} inputMode="numeric" onChange={(e) => patchRebate(job.jobId, { amount: Number(e.target.value) || 0 })} placeholder="$" className="h-10 rounded-md border border-line px-3 text-sm" />
            <select value={job.rebate.status} onChange={(e) => patchRebate(job.jobId, { status: e.target.value as typeof job.rebate.status })} className="h-10 rounded-md border border-line px-2 text-sm">
              {["None", "Reserved", "Submitted", "Approved", "Paid"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <input value={job.rebate.reservation} onChange={(e) => patchRebate(job.jobId, { reservation: e.target.value })} placeholder="Reservation #" className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
        </section>
      </div>

      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Equipment</h2>
        <ul className="space-y-2">
          {job.equipment.map((e) => (
            <li key={e.id} className="grid gap-2 sm:grid-cols-5">
              <span className="self-center text-sm font-semibold">{e.name}</span>
              <input value={e.model} placeholder="Model" onChange={(ev) => setEquip(job.jobId, e.id, { model: ev.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
              <input value={e.serial} placeholder="Serial" onChange={(ev) => setEquip(job.jobId, e.id, { serial: ev.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
              <input value={e.ahri} placeholder="AHRI" onChange={(ev) => setEquip(job.jobId, e.id, { ahri: ev.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
              <button type="button" onClick={() => setEquip(job.jobId, e.id, { oldRecovered: !e.oldRecovered })} className={cn("h-10 rounded-md px-2 text-[11px] font-semibold", e.oldRecovered ? "bg-navy text-card" : "border border-line")}>
                Old recovered
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addEquip(job.jobId, eq, "");
            setEq("");
          }}
        >
          <input value={eq} onChange={(e) => setEq(e.target.value)} placeholder="Condenser, coil…" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Add
          </button>
        </form>
      </section>

      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Test-out</h2>
        <div className="grid gap-2 sm:grid-cols-4">
          <Num label="Blower before" value={job.testOut.blowerBefore} onChange={(v) => patchTest(job.jobId, { blowerBefore: v })} />
          <Num label="Blower after" value={job.testOut.blowerAfter} onChange={(v) => patchTest(job.jobId, { blowerAfter: v })} />
          <Num label="Duct before" value={job.testOut.ductBefore} onChange={(v) => patchTest(job.jobId, { ductBefore: v })} />
          <Num label="Duct after" value={job.testOut.ductAfter} onChange={(v) => patchTest(job.jobId, { ductAfter: v })} />
        </div>
        <textarea value={job.testOut.notes} onChange={(e) => patchTest(job.jobId, { notes: e.target.value })} rows={2} placeholder="CFM, notes" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Punch</h2>
          <ul className="space-y-1">
            {job.punch.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => togglePunch(job.jobId, p.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm", p.status === "Done" ? "text-muted line-through" : "bg-page")}>
                  <span>{p.item}</span>
                  <span className="text-[11px] font-bold uppercase">{p.status}</span>
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addPunch(job.jobId, punch);
              setPunch("");
            }}
          >
            <input value={punch} onChange={(e) => setPunch(e.target.value)} placeholder="What’s left" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold">
              Add
            </button>
          </form>
        </section>
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Closeout list</h2>
          <ul className="space-y-1">
            {job.checks.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => toggleCheck(job.jobId, c.id)} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                  <span className={cn("grid size-5 place-items-center rounded-sm border", c.on ? "border-navy bg-navy text-card" : "border-line")}>{c.on ? "✓" : ""}</span>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          <textarea value={access} onChange={(e) => setAcc(e.target.value)} onBlur={() => setAccess(job.jobId, access)} rows={3} className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm" placeholder="Access" />
        </section>
      </div>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line px-3 text-sm font-semibold normal-case tracking-normal" />
    </label>
  );
}
