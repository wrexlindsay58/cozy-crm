import { useState } from "react";
import { Check } from "lucide-react";
import { cancelJob, completeJob, sendPacket, signCloseout, togglePacket, type JobFile } from "./store";
import { actingName } from "@/features/staff/store";
import { closeReview, packetLines, packetOn } from "./closeout";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { JobPacket } from "@/features/paper/paper-page";

export function CloseBlock({ job }: { job: JobFile }) {
  const [why, setWhy] = useState("");
  const review = closeReview(job);
  const blocked = review.filter((row) => row.block && !row.ok);
  const lines = packetLines(job);
  const signed = Boolean(job.packet.signedBy);

  return (
    <div className="space-y-2">
      {job.cancelled ? (
        <JobCard kicker="Cancelled" title={job.cancelWhy || job.cancelledAt || "This job is cancelled."} done>
          <p className="text-sm text-alert">No more work on this file.</p>
        </JobCard>
      ) : null}
      <JobCard kicker="Review" title={blocked.length ? "Not ready" : "Ready for the office"} done={blocked.length === 0}>
        <ul className="divide-y divide-line">
          {review.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-3 py-2">
              <span className="text-sm font-semibold">{row.label}</span>
              <span className="flex items-center justify-end gap-1.5 text-right text-sm text-navy">
                {row.ok ? <Check className="size-3.5 shrink-0 text-up" strokeWidth={2.5} /> : <span className="size-1.5 shrink-0 rounded-full bg-alert" />}
                {row.detail}
              </span>
            </li>
          ))}
        </ul>
      </JobCard>
      <JobCard kicker="Packet" title="What the customer gets" done={job.packet.sent} aside={signed ? `Signed off by ${job.packet.signedBy}` : "Needs a sign-off"}>
        <ul className="divide-y divide-line">
          {lines.map((line) => {
            const on = packetOn(job, line.id);
            return (
              <li key={line.id}>
                <button type="button" onClick={() => togglePacket(job.jobId, line.id)} className="flex w-full items-center gap-3 py-2 text-left">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-sm border", on ? "border-navy bg-navy text-card" : "border-line")}>{on ? <Check className="size-3.5" strokeWidth={2.5} /> : null}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{line.label}</span>
                    <span className="type-meta">{line.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted">Work orders and purchase orders stay in the office. They are not in this packet.</p>
        <div className="mt-4 border-t border-line pt-4">
          <JobPacket jobId={job.jobId} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={blocked.length > 0 || signed} onClick={() => signCloseout(job.jobId)} className="h-10 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
            {signed ? `Signed off by ${job.packet.signedBy}` : `Sign off · ${actingName()}`}
          </button>
          <button type="button" disabled={!signed || blocked.length > 0 || Boolean(job.packet.sent)} onClick={() => sendPacket(job.jobId)} className={cn("h-10 rounded-md px-3 text-sm font-semibold disabled:opacity-40", job.packet.sent ? "border border-line text-muted" : "bg-navy text-card")}>
            {job.packet.sent ? `Sent ${job.packet.sentAt}` : "Send packet"}
          </button>
        </div>
      </JobCard>
      {job.stage !== "Closed" && !job.cancelled ? (
        <JobCard kicker="Complete" title={blocked.length ? blocked.map((row) => row.label).join(" · ") : "Ready to close"}>
          <button type="button" disabled={blocked.length > 0 || !job.packet.sent} onClick={() => completeJob(job.jobId)} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">
            Complete job{job.warranty ? " · open warranty" : ""}
          </button>
        </JobCard>
      ) : job.cancelled ? null : (
        <JobCard kicker="Complete" title={`Closed${job.warranty ? " · warranty open" : ""}`} done />
      )}
      {!job.cancelled && job.stage !== "Closed" ? (
        <JobCard kicker="Cancel job" title="Kills this job. No close. No warranty.">
          <form
            className="flex min-w-0 flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              cancelJob(job.jobId, why);
            }}
          >
            <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why (optional)" className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md border border-alert px-3 text-sm font-semibold text-alert">
              Cancel job
            </button>
          </form>
        </JobCard>
      ) : null}
    </div>
  );
}
