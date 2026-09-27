import { Plus, Trash2 } from "lucide-react";
import { addEvent, patchEvent, removeEvent, setEventStatus } from "../store";
import { processFor } from "../types";
import { JobCard } from "../job-card";
import { CLOCKS, clock12, clock24 } from "../clock";
import { Tip } from "@/components/tip";
import { SHOP_CREWS } from "@/features/staff/store";
import { prepClear } from "../prep";
import { STATUSES, DAY_WHY, prettyDay } from "./part-01";

export function CrewChapterView(props: { bag: { job: any; day: any; openGate: any; who: any; products: any; start: any; end: any; why: any; setDay: any; setWho: any; crewsOnJob: any; setWhy: any; setStart: any; setEnd: any } }) {
  const { job, day, openGate, who, products, start, end, why, setDay, setWho, crewsOnJob, setWhy, setStart, setEnd } = props.bag;
  return (
    <JobCard kicker="Schedule" title="When we’re on site">
        {job.events.length === 0 ? <p className="mb-3 text-sm text-muted">No days on the book yet.</p> : null}
        <ul className="divide-y divide-line">
          {job.events.map((e: any) => {
            const scope = job.scope.find((s: any) => s.id === e.scopeId);
            return (
              <li key={e.id} className="min-w-0 py-3 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{prettyDay(e.day)}</p>
                    <p className="truncate text-[11px] text-muted">
                      {e.crew}
                      {scope?.label ? ` · ${scope.label}` : ""}
                      {e.why ? ` · ${e.why}` : ""}
                      {prepClear(job, e.day) ? "" : " · Not rolling"}
                    </p>
                  </div>
                  <Tip label="Remove day" on>
                    <button type="button" aria-label="Remove day" className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeEvent(job.jobId, e.id)}>
                      <Trash2 className="size-4" />
                    </button>
                  </Tip>
                </div>
                <div className="mt-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,9rem)]">
                  <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
                    Start
                    <select value={clock12(e.start)} onChange={(ev) => patchEvent(job.jobId, e.id, { start: clock24(ev.target.value) })} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                      {CLOCKS.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
                    End
                    <select value={clock12(e.end)} onChange={(ev) => patchEvent(job.jobId, e.id, { end: clock24(ev.target.value) })} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                      {CLOCKS.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase sm:col-span-1">
                    Status
                    <select value={e.status} onChange={(ev) => setEventStatus(job.jobId, e.id, ev.target.value as (typeof STATUSES)[number])} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                      {STATUSES.map((s) => (
                        <option key={s} value={s} disabled={s === "Dispatched" && !prepClear(job, e.day)}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <CrewChapterView2 bag={{ day, openGate, job, who, products, start, end, why, setDay, setWho, crewsOnJob, setWhy, setStart, setEnd }} />
      </JobCard>
  );
}

function CrewChapterView2(props: { bag: { day: any; openGate: any; job: any; who: any; products: any; start: any; end: any; why: any; setDay: any; setWho: any; crewsOnJob: any; setWhy: any; setStart: any; setEnd: any } }) {
  const { day, openGate, job, who, products, start, end, why, setDay, setWho, crewsOnJob, setWhy, setStart, setEnd } = props.bag;
  return (
    <form
          className="mt-3 min-w-0 space-y-2 border-t border-line pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!day || openGate) return;
            const a = job.assignments.find((x: any) => (x.kind === "sub" ? x.company || x.crew : x.crew) === who);
            const sid = a?.scopes[0] || products[0]?.id || "";
            const label = job.scope.find((s: any) => s.id === sid)?.label ?? "";
            addEvent(job.jobId, processFor(label), sid, day, clock24(start), clock24(end), who, why);
            setDay("");
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Add a day</p>
            <button type="submit" aria-label="Add day" disabled={openGate} className="grid size-8 shrink-0 place-items-center rounded-md bg-navy text-card disabled:opacity-40">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2">
            <label className="block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              Crew
              <select value={who} onChange={(e) => setWho(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {(crewsOnJob.length ? crewsOnJob : SHOP_CREWS.map((c) => c.name)).map((c: any) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              Day
              <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal" />
            </label>
            <label className="block min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase sm:col-span-2">
              Reason
              <select value={why} onChange={(e) => setWhy(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {DAY_WHY.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              Start
              <select value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {CLOCKS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-[11px] font-bold tracking-wide text-muted uppercase">
              End
              <select value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 h-10 w-full min-w-0 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal">
                {CLOCKS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
          </div>
        </form>
  );
}
