import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  addAppt,
  addEquip,
  addHours,
  addPackage,
  addPunch,
  setAccess,
  setApptStatus,
  setEquip,
  setPackageStatus,
  toggleCheck,
  togglePunch,
  type JobAppt,
  type JobFile,
  type WorkPackage,
} from "./store";

const PKG: WorkPackage["status"][] = ["Queued", "On order", "On truck", "Done"];
const APPT: JobAppt["kind"][] = ["Install", "Rough", "Final", "Test-out", "Callback"];

export function Production({ job }: { job: JobFile }) {
  const [pkg, setPkg] = useState("");
  const [punch, setPunch] = useState("");
  const [eq, setEq] = useState("");
  const [eta, setEta] = useState("");
  const [day, setDay] = useState("");
  const [kind, setKind] = useState<JobAppt["kind"]>("Install");
  const [who, setWho] = useState(job.crew);
  const [hrs, setHrs] = useState("8");
  const [access, setAcc] = useState(job.access);

  return (
    <div className="space-y-3">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Work packages</h2>
        <p className="mb-3 text-[11px] text-muted">Attic, HVAC, ducts — each has its own crew and status. Not one blob.</p>
        <ul className="space-y-2">
          {job.packages.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 text-sm font-semibold">{p.name}</span>
              <span className="text-[11px] text-muted">{p.crew}</span>
              {PKG.map((s) => (
                <button key={s} type="button" onClick={() => setPackageStatus(job.jobId, p.id, s)} className={cn("h-8 rounded-md px-2 text-[11px] font-semibold", p.status === s ? "bg-navy text-card" : "border border-line")}>
                  {s}
                </button>
              ))}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addPackage(job.jobId, pkg);
            setPkg("");
          }}
        >
          <input value={pkg} onChange={(e) => setPkg(e.target.value)} placeholder="Add package" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Add
          </button>
        </form>
      </section>

      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Install days</h2>
        <ul className="space-y-2">
          {job.appointments.map((a) => (
            <li key={a.id} className="rounded-md border border-line p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.kind}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {a.day} · {a.window} · {a.crew}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {(["Set", "Dispatched", "Done", "No-show"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setApptStatus(job.jobId, a.id, s)} className={cn("h-8 rounded-md px-2.5 text-[11px] font-semibold", a.status === s ? "bg-navy text-card" : "border border-line")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            addAppt(job.jobId, kind, day);
            setDay("");
          }}
        >
          <select value={kind} onChange={(e) => setKind(e.target.value as JobAppt["kind"])} className="h-10 rounded-md border border-line px-2 text-sm">
            {APPT.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Sep 25" className="h-10 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Book day
          </button>
        </form>
      </section>

      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Equipment</h2>
        <ul className="space-y-2">
          {job.equipment.map((e) => (
            <li key={e.id} className="grid gap-2 sm:grid-cols-4">
              <span className="text-sm font-semibold">{e.name}</span>
              <input value={e.serial} placeholder="Serial" onChange={(ev) => setEquip(job.jobId, e.id, { serial: ev.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
              <span className="self-center text-[11px] text-muted">ETA {e.eta}</span>
              <select value={e.status} onChange={(ev) => setEquip(job.jobId, e.id, { status: ev.target.value as EquipRowStatus })} className="h-10 rounded-md border border-line px-2 text-sm">
                {["Quoted", "Ordered", "Received", "Set"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addEquip(job.jobId, eq, eta);
            setEq("");
            setEta("");
          }}
        >
          <input value={eq} onChange={(e) => setEq(e.target.value)} placeholder="Condenser, coil, cellulose…" className="h-10 min-w-40 flex-1 rounded-md border border-line px-3 text-sm" />
          <input value={eta} onChange={(e) => setEta(e.target.value)} placeholder="ETA" className="h-10 w-28 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Order
          </button>
        </form>
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
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Closeout</h2>
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
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Labor hours</h2>
          <ul className="space-y-1 text-sm">
            {job.hours.map((h) => (
              <li key={h.id} className="flex justify-between gap-2">
                <span>{h.who} · {h.day}</span>
                <span className="tabular-nums">{h.hours}h</span>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addHours(job.jobId, who, Number(hrs) || 0, day || "Today");
            }}
          >
            <input value={who} onChange={(e) => setWho(e.target.value)} className="h-10 min-w-32 flex-1 rounded-md border border-line px-3 text-sm" />
            <input value={hrs} onChange={(e) => setHrs(e.target.value)} inputMode="numeric" className="h-10 w-16 rounded-md border border-line px-2 text-sm" />
            <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold">
              Log
            </button>
          </form>
        </section>
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Access</h2>
          <textarea
            value={access}
            onChange={(e) => setAcc(e.target.value)}
            onBlur={() => setAccess(job.jobId, access)}
            rows={4}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="Gate, dogs, HOA dumpster, attic hatch…"
          />
        </section>
      </div>
    </div>
  );
}

type EquipRowStatus = "Quoted" | "Ordered" | "Received" | "Set";
