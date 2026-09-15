import { cn } from "@/lib/cn";
import { HOLDS, STAGES, setStage, toggleHold, type Hold, type JobFile, type Stage } from "./store";

export function StageBar({ job }: { job: JobFile }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Stage</h2>
      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button key={s} type="button" onClick={() => setStage(job.jobId, s as Stage)} className={cn("h-9 rounded-md px-3 text-sm font-semibold", job.stage === s ? "bg-navy text-card" : "border border-line bg-card")}>
            {s}
          </button>
        ))}
      </div>
      <h3 className="mt-4 mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Holds</h3>
      <div className="flex flex-wrap gap-1.5">
        {HOLDS.map((h) => {
          const on = job.holds.includes(h as Hold);
          return (
            <button key={h} type="button" onClick={() => toggleHold(job.jobId, h as Hold)} className={cn("h-9 rounded-md px-3 text-sm font-semibold", on ? "bg-alert/15 text-alert" : "border border-line bg-card text-muted")}>
              {h}
            </button>
          );
        })}
      </div>
    </section>
  );
}
