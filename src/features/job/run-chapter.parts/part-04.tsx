import { addTimePunch, patchPunchClock } from "../store";
import { punchHours } from "../types";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { labelDay } from "./part-01";

export function RunChapterView(props: { bag: { closed: any; est: any; actual: any; job: any; accepted: any; day: any; crew: any; setCrew: any; crews: any } }) {
  const { closed, est, actual, job, accepted, day, crew, setCrew, crews } = props.bag;
  return (
    <JobCard kicker="Time" title="Shop to shop" done={closed} aside={`Est ${est}h · actual ${actual.toFixed(1)}h`}>
        <ul className="space-y-3">
          {job.punches.map((p: any) => {
            const h = punchHours(p);
            return (
              <li key={p.id}>
                <p className="text-sm font-semibold">
                  {p.who} · {labelDay(p.day)}
                  <span className="ml-2 text-[12px] font-normal text-muted">
                    {h.total ? `${h.site.toFixed(1)}h on site · ${h.travel.toFixed(1)}h travel · ${h.total.toFixed(1)}h total` : "Open"}
                  </span>
                </p>
                <div className="mt-2">
                  <FillRow min="7rem">
                    {(
                      [
                        ["leftYard", "Leave shop"],
                        ["onSite", "On site"],
                        ["complete", "Leave site"],
                        ["back", "Back at shop"],
                      ] as const
                    ).map(([k, lab]) => (
                      <FillField key={k} label={lab}>
                        <input type="time" disabled={!accepted} value={p[k]} onChange={(e) => patchPunchClock(job.jobId, p.id, { [k]: e.target.value })} className={FILL_IN} />
                      </FillField>
                    ))}
                  </FillRow>
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!accepted || !day) return;
            addTimePunch(job.jobId, crew, day);
          }}
        >
          <select value={crew} disabled={!accepted} onChange={(e) => setCrew(e.target.value)} className={cn(FILL_IN, "min-w-0 flex-1")}>
            {crews.length ? crews.map((name: any) => <option key={name}>{name}</option>) : <option value="">Assign a crew first</option>}
          </select>
          <p className="type-meta shrink-0">{day ? labelDay(day) : "No day on this crew"}</p>
          <button type="submit" disabled={!crew || !day || !accepted} className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
            Clock
          </button>
        </form>
      </JobCard>
  );
}
