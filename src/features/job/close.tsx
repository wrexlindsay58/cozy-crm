import { useState } from "react";
import { cancelJob, closeBlocks, completeJob, sendPacket, setCheckCallout, togglePacket, togglePost, togglePre, type JobFile } from "./store";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { CheckLine } from "./callouts";
import { CheckSign } from "./check-sign";
import { JobPacket } from "@/features/paper/paper-page";
import { signedProposals } from "@/features/opportunity/agreement-panel";
import { useProposals } from "@/features/opportunity/store";
import { sendMessage } from "@/features/thread/store";

export function CloseBlock({ job }: { job: JobFile }) {
  const [why, setWhy] = useState("");
  const blocks = closeBlocks(job);
  const proposal = signedProposals(job.leadId, useProposals())[0];

  return (
    <div className="space-y-2">
      {job.cancelled ? (
        <JobCard kicker="Cancelled" title={job.cancelWhy || job.cancelledAt || "This job is cancelled."} done>
          <p className="text-sm text-alert">No more production on this file.</p>
        </JobCard>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        <CheckCard title="Pre-install acknowledgement" job={job} kind="pre" />
        <CheckCard title="Post-install acknowledgement" job={job} kind="post" />
      </div>
      <JobCard kicker="Closeout" title="Closing packet" done={job.packet.sent}>
        <ul className="space-y-1">
          {job.packet.parts.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => togglePacket(job.jobId, p.id)} className="flex h-10 w-full items-center gap-2 text-left text-sm">
                <span className={cn("grid size-5 place-items-center rounded-sm border", p.on ? "border-navy bg-navy text-card" : "border-line")}>{p.on ? "✓" : ""}</span>
                {p.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-4">
          <JobPacket jobId={job.jobId} />
        </div>
        <button
          type="button"
          onClick={() => {
            sendPacket(job.jobId);
            const file = proposal?.agreements?.find((a) => a.status === "Signed" && a.fileUrl) ?? proposal?.agreement;
            if (file?.fileUrl) {
              sendMessage(job.personId, `Closing packet for ${job.product}. The signed agreement is attached. Print it or save it as a PDF.`, "email", {
                subject: "Closing packet",
                files: [{ name: file.fileName ?? "agreement.html", kind: "file", src: file.fileUrl }],
              });
            }
          }}
          className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
        >
          {job.packet.sent ? `Sent ${job.packet.sentAt}` : "Send closing packet"}
        </button>
      </JobCard>
      {job.stage !== "Closed" && !job.cancelled ? (
        <JobCard kicker="Complete" title={blocks.length ? blocks.join(" · ") : "Ready to close"}>
          <button type="button" disabled={blocks.length > 0} onClick={() => completeJob(job.jobId)} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">
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

function CheckCard({ title, job, kind }: { title: string; job: JobFile; kind: "pre" | "post" }) {
  const check = kind === "pre" ? job.preCheck : job.postCheck;
  return (
    <JobCard kicker="Checklist" title={title} aside={check.signedAt ? `Signed ${check.signedBy}` : "Open"} done={Boolean(check.signedAt)}>
      <ul>
        {check.items.map((i) => (
          <CheckLine
            key={i.id}
            label={i.label}
            on={i.on}
            callout={i.callout}
            onToggle={() => (kind === "pre" ? togglePre(job.jobId, i.id) : togglePost(job.jobId, i.id))}
            onCallout={(v) => setCheckCallout(job.jobId, kind, i.id, v)}
          />
        ))}
      </ul>
      <CheckSign job={job} kind={kind} />
    </JobCard>
  );
}
