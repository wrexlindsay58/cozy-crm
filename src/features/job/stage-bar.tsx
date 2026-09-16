import { cn } from "@/lib/cn";
import { HOLDS, STAGES, setHoldNote, setStage, toggleHold, type Hold, type JobFile, type Stage } from "./store";

export function StageBar({ job }: { job: JobFile }) {
  const i = STAGES.indexOf(job.stage);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Production</h2>
      <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <ol className="flex w-max min-w-full flex-nowrap items-center px-1">
          {STAGES.map((s, idx) => {
            const on = job.stage === s;
            const past = idx < i;
            return (
              <li key={s} className="flex shrink-0 items-center">
                {idx > 0 ? <span className={cn("mx-1 h-px w-5", past || on ? "bg-navy" : "bg-line")} /> : null}
                <button
                  type="button"
                  onClick={() => setStage(job.jobId, s as Stage)}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap",
                    on ? "bg-navy text-card" : past ? "bg-navy/15 text-navy" : "border border-line text-muted",
                  )}
                >
                  {s}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-2 text-[11px] text-muted">Moves with the work. Permit, materials, crew date, hours, punch, invoice. Click to override.</p>
      <h3 className="mt-4 mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Holds</h3>
      <div className="flex flex-wrap gap-1.5">
        {HOLDS.map((h) => {
          const row = job.holds.find((x) => x.kind === h);
          return (
            <button key={h} type="button" onClick={() => toggleHold(job.jobId, h as Hold)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", row ? "bg-alert/15 text-alert" : "border border-line bg-card text-muted")}>
              {h}
            </button>
          );
        })}
      </div>
      {job.holds.length ? (
        <ul className="mt-3 space-y-2">
          {job.holds.map((h) => (
            <li key={h.kind}>
              <label className="block text-[11px] font-bold tracking-wide text-muted uppercase">
                {h.kind} · {h.at}
                <textarea
                  value={h.note}
                  onChange={(e) => setHoldNote(job.jobId, h.kind, e.target.value)}
                  rows={2}
                  placeholder="What’s blocking. Who we wait on. When it frees."
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal normal-case tracking-normal"
                />
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
