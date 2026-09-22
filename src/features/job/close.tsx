import { useState } from "react";
import { cancelJob, closeBlocks, completeJob, sendPacket, setCheckCallout, signPost, signPre, togglePacket, togglePost, togglePre, type JobFile } from "./store";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";
import { CheckLine } from "./callouts";

export function CloseBlock({ job }: { job: JobFile }) {
  const [pre, setPre] = useState("");
  const [post, setPost] = useState("");
  const [why, setWhy] = useState("");
  const blocks = closeBlocks(job);

  return (
    <div className="space-y-3">
      {job.cancelled ? (
        <JobCard kicker="Cancelled" title={job.cancelWhy || job.cancelledAt || "This job is cancelled."} done>
          <p className="text-sm text-alert">No more production on this file.</p>
        </JobCard>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        <CheckCard
          title="Pre-install"
          check={job.preCheck}
          onToggle={(id) => togglePre(job.jobId, id)}
          onCallout={(id, v) => setCheckCallout(job.jobId, "pre", id, v)}
          who={pre}
          setWho={setPre}
          onSign={() => signPre(job.jobId, pre)}
        />
        <CheckCard
          title="Post-install"
          check={job.postCheck}
          onToggle={(id) => togglePost(job.jobId, id)}
          onCallout={(id, v) => setCheckCallout(job.jobId, "post", id, v)}
          who={post}
          setWho={setPost}
          onSign={() => signPost(job.jobId, post)}
        />
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
        <button type="button" onClick={() => sendPacket(job.jobId)} className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
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

function CheckCard({
  title,
  check,
  onToggle,
  onCallout,
  who,
  setWho,
  onSign,
}: {
  title: string;
  check: JobFile["preCheck"];
  onToggle: (id: string) => void;
  onCallout: (id: string, v: string) => void;
  who: string;
  setWho: (v: string) => void;
  onSign: () => void;
}) {
  return (
    <JobCard kicker="Checklist" title={title} aside={check.signedAt ? `Signed ${check.signedBy}` : "Open"} done={Boolean(check.signedAt)}>
      <ul>
        {check.items.map((i) => (
          <CheckLine
            key={i.id}
            label={i.label}
            on={i.on}
            callout={i.callout}
            onToggle={() => onToggle(i.id)}
            onCallout={(v) => onCallout(i.id, v)}
          />
        ))}
      </ul>
      {check.signedAt ? (
        <p className="mt-3 text-sm font-semibold text-up">
          Signed {check.signedBy} · {check.signedAt}
        </p>
      ) : (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSign();
          }}
        >
          <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Homeowner name" className="h-10 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Sign
          </button>
        </form>
      )}
    </JobCard>
  );
}
