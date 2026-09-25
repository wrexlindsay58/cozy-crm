import { Check } from "lucide-react";
import { setPrep, type JobFile } from "./store";
import { isAccepted } from "./types";
import { prepClear, prepDays, prepLines } from "./prep";
import { JobCard } from "./job-card";
import { cn } from "@/lib/cn";

function labelDay(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "No date";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function PrepChapter({ job }: { job: JobFile }) {
  const days = prepDays(job);
  const open = !isAccepted(job);
  return (
    <div className="space-y-2">
      {open ? <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">Acceptance is still open. Prep waits until the office accepts the job.</p> : null}
      {days.length === 0 ? <JobCard kicker="Prep" title="No day on the book yet" /> : null}
      {days.map((day) => {
        const lines = prepLines(job, day);
        const clear = prepClear(job, day);
        return (
          <JobCard key={day} kicker="Prep" title={labelDay(day)} done={clear} aside={clear ? "Rolling" : "Off the book"}>
            {lines.length === 0 ? <p className="text-sm text-muted">Nothing on this day needs a confirm.</p> : (
              <ul>
                {lines.map((line) => {
                  const mark = job.prep?.[day]?.[line.id];
                  const scheduled = Boolean(mark?.scheduled);
                  const confirmed = Boolean(mark?.confirmed);
                  return (
                    <li key={line.id} className="flex items-center gap-2 border-t border-line py-2 first:border-t-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{line.label}</p>
                        {mark?.by ? <p className="type-meta">{confirmed ? "Confirmed" : "Scheduled"} by {mark.by}</p> : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={open}
                          onClick={() => setPrep(job.jobId, day, line.id, { scheduled: !scheduled })}
                          className={cn("inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold disabled:opacity-40", scheduled ? "border border-line" : "bg-navy text-card")}
                        >
                          {scheduled ? <Check className="size-3.5 text-up" strokeWidth={2.5} /> : null}
                          {scheduled ? "Scheduled" : "Schedule"}
                        </button>
                        <button
                          type="button"
                          disabled={open || !scheduled}
                          onClick={() => setPrep(job.jobId, day, line.id, { confirmed: !confirmed })}
                          className={cn("inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold disabled:opacity-40", scheduled && !confirmed ? "bg-navy text-card" : "border border-line")}
                        >
                          {confirmed ? <Check className="size-3.5 text-up" strokeWidth={2.5} /> : null}
                          {confirmed ? "Confirmed" : "Confirm"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {clear ? null : <p className="mt-2 text-sm text-alert">This day stays off the book until every line is confirmed.</p>}
          </JobCard>
        );
      })}
    </div>
  );
}
