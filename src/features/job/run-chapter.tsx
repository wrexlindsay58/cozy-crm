import { useState } from "react";
import { addTimePunch, patchPunchClock, patchTest, setEquip, togglePunch, addPunch, type JobFile } from "./store";
import { punchHours } from "./types";
import { profileById } from "./profiles";
import { cn } from "@/lib/cn";

export function RunChapter({ job }: { job: JobFile }) {
  const est = job.scope.reduce((s, r) => s + r.estHours, 0);
  const actual = job.punches.reduce((s, p) => s + punchHours(p).total, 0);
  const [who, setWho] = useState(job.crew);
  const [item, setItem] = useState("");
  const needsSerial = job.scope.some((s) => profileById(s.categoryId)?.needsSerial);
  const needsTest = job.scope.some((s) => profileById(s.categoryId)?.needsTestOut);

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-line bg-card p-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Time</h2>
          <p className="text-[12px] text-muted">
            Est {est}h · actual {actual.toFixed(1)}h
          </p>
        </div>
        <ul className="space-y-3">
          {job.punches.map((p) => {
            const h = punchHours(p);
            return (
              <li key={p.id}>
                <p className="text-sm font-semibold">
                  {p.who} · {p.day}
                  <span className="ml-2 text-[12px] font-normal text-muted">{h.total ? `${h.site.toFixed(1)}h site · ${h.travel.toFixed(1)}h travel` : "Open"}</span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ["leftYard", "Yard"],
                      ["onSite", "On site"],
                      ["complete", "Done"],
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

      {needsSerial ? (
        <section className="rounded-md border border-line bg-card p-5">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Serials</h2>
          <ul className="space-y-2">
            {job.equipment.map((e) => (
              <li key={e.id} className="grid gap-2 sm:grid-cols-3">
                <span className="self-center text-sm font-semibold">{e.name}</span>
                <input value={e.serial} placeholder="Serial" onChange={(ev) => setEquip(job.jobId, e.id, { serial: ev.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
                <input value={e.ahri} placeholder="AHRI" onChange={(ev) => setEquip(job.jobId, e.id, { ahri: ev.target.value })} className="h-10 rounded-md border border-line px-2 text-sm" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {needsTest ? (
        <section className="rounded-md border border-line bg-card p-5">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">QC numbers</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            <input value={job.testOut.blowerBefore} onChange={(e) => patchTest(job.jobId, { blowerBefore: e.target.value })} placeholder="Blower before" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input value={job.testOut.blowerAfter} onChange={(e) => patchTest(job.jobId, { blowerAfter: e.target.value })} placeholder="Blower after" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input value={job.testOut.ductBefore} onChange={(e) => patchTest(job.jobId, { ductBefore: e.target.value })} placeholder="Duct before" className="h-10 rounded-md border border-line px-3 text-sm" />
            <input value={job.testOut.ductAfter} onChange={(e) => patchTest(job.jobId, { ductAfter: e.target.value })} placeholder="Duct after" className="h-10 rounded-md border border-line px-3 text-sm" />
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Punch</h2>
        <ul>
          {job.punch.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => togglePunch(job.jobId, p.id)} className={cn("flex w-full items-center justify-between py-2 text-left text-sm", p.status === "Done" && "text-muted line-through")}>
                {p.item}
                <span className="text-[11px] font-bold uppercase">{p.status}</span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addPunch(job.jobId, item);
            setItem("");
          }}
        >
          <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="What’s left" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold">
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
