import { Trash2 } from "lucide-react";
import { addAssign, patchAssign, removeAssign, sendAssignWo } from "../store";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { CLOCKS, clock12, clock24 } from "../clock";
import { Tip } from "@/components/tip";
import { SHOP_CREWS, vehicleLabel } from "@/features/staff/store";
import { SUBS, InstallPick, VehicleFields } from "./part-01";
import { CrewChapterView } from "./part-02";

export function CrewChapterView3(props: { bag: { openGate: any; job: any; open: any; setOpen: any; products: any; day: any; start: any; end: any; why: any; setDay: any; setWho: any; crewsOnJob: any; setWhy: any; setStart: any; setEnd: any; who: any } }) {
  const { openGate, job, open, setOpen, products, day, start, end, why, setDay, setWho, crewsOnJob, setWhy, setStart, setEnd, who } = props.bag;
  return (
    <div className="min-w-0 space-y-2">
      {openGate ? <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">Acceptance is still open. No crew goes on this job until the office accepts it.</p> : null}
      <JobCard
        kicker="Crews"
        title={`${job.assignments.length} assigned · ${job.events.length} days on the book`}
        done={job.assignments.length > 0 && job.assignments.every((a: any) => Boolean(a.woId))}
        actions={
          <button type="button" disabled={openGate} className="h-8 rounded-md border border-line px-3 text-xs font-semibold disabled:opacity-40" onClick={() => addAssign(job.jobId)}>
            Add crew
          </button>
        }
      >
        <ul className="space-y-4">
          {job.assignments.map((a: any) => {
            const wo = job.workOrders.find((w: any) => w.id === a.woId);
            const who = a.kind === "sub" ? a.company || a.crew : a.crew;
            const names = a.scopes.map((id: any) => job.scope.find((s: any) => s.id === id)?.label).filter(Boolean).join(" · ");
            const expanded = open === a.id;
            const status = wo?.status ?? "Draft";
            return (
              <li key={a.id} className="min-w-0 rounded-md border border-line p-3">
                <div className="flex min-w-0 items-start gap-2">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(expanded ? null : a.id)}>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">{a.kind === "sub" ? "Sub" : "In-house"}</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">{who}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">
                      {a.day || "No date"} {clock12(a.start)}–{clock12(a.end)}
                      {a.vehicleKind || a.truck ? ` · ${a.truck || vehicleLabel(a.vehicleKind || "Box Truck", a.vehicleNo || "", a.trailerNo)}` : ""}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">{names || "No install"}</span>
                  </button>
                  <span className="flex shrink-0 items-center gap-1 pt-0.5">
                    <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{status}</span>
                    <Tip label="Remove" on>
                      <button type="button" aria-label="Remove crew" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeAssign(job.jobId, a.id)}>
                        <Trash2 className="size-4" />
                      </button>
                    </Tip>
                  </span>
                </div>
                {expanded ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(["internal", "sub"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => patchAssign(job.jobId, a.id, { kind: k, company: k === "sub" ? SUBS[0] : "" })} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", a.kind === k ? "bg-navy text-card" : "border border-line")}>
                          {k === "internal" ? "In-house" : "Sub"}
                        </button>
                      ))}
                    </div>
                    <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <select value={a.kind === "sub" ? a.company : a.crew} onChange={(e) => patchAssign(job.jobId, a.id, a.kind === "sub" ? { company: e.target.value, crew: e.target.value } : { crew: e.target.value })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm">
                        {(a.kind === "sub" ? SUBS : SHOP_CREWS.map((c) => c.name)).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <input type="date" value={a.day} onChange={(e) => patchAssign(job.jobId, a.id, { day: e.target.value })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm" />
                      <select value={clock12(a.start)} onChange={(e) => patchAssign(job.jobId, a.id, { start: clock24(e.target.value) })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm">
                        {CLOCKS.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                      <select value={clock12(a.end)} onChange={(e) => patchAssign(job.jobId, a.id, { end: clock24(e.target.value) })} className="h-10 min-w-0 rounded-md border border-line px-2 text-sm">
                        {CLOCKS.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    {a.kind === "internal" ? <VehicleFields jobId={job.jobId} assignId={a.id} kind={a.vehicleKind || "Box Truck"} number={a.vehicleNo || ""} trailer={a.trailerNo || ""} /> : null}
                    <InstallPick job={job} assignId={a.id} selected={a.scopes} products={products} />
                    <div className="flex min-w-0 items-center gap-2">
                      <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => sendAssignWo(job.jobId, a.id)}>
                        {status === "Draft" ? "Send work order" : "Resend WO"}
                      </button>
                      <span className="ml-auto shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{status}</span>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </JobCard>

      <CrewChapterView bag={{ job, day, openGate, who, products, start, end, why, setDay, setWho, crewsOnJob, setWhy, setStart, setEnd }} />
    </div>
  );
}
