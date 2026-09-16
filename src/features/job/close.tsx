import { useState } from "react";
import { closeBlocks, completeJob, sendPacket, signPost, signPre, togglePacket, togglePost, togglePre, type JobFile } from "./store";
import { cn } from "@/lib/cn";

export function CloseBlock({ job }: { job: JobFile }) {
  const [pre, setPre] = useState("");
  const [post, setPost] = useState("");
  const blocks = closeBlocks(job);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <CheckCard
          title="Pre-install"
          check={job.preCheck}
          onToggle={(id) => togglePre(job.jobId, id)}
          who={pre}
          setWho={setPre}
          onSign={() => signPre(job.jobId, pre)}
        />
        <CheckCard
          title="Post-install"
          check={job.postCheck}
          onToggle={(id) => togglePost(job.jobId, id)}
          who={post}
          setWho={setPost}
          onSign={() => signPost(job.jobId, post)}
        />
      </div>
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Closing packet</h2>
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
      </section>
      {job.stage !== "Closed" ? (
        <div className="rounded-md border border-line bg-card p-4">
          {blocks.length ? <p className="mb-3 text-sm text-alert">{blocks.join(" · ")}</p> : <p className="mb-3 text-sm text-muted">Ready to close.</p>}
          <button type="button" disabled={blocks.length > 0} onClick={() => completeJob(job.jobId)} className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40">
            Complete job{job.warranty ? " · open warranty" : ""}
          </button>
        </div>
      ) : (
        <p className="rounded-md border border-line bg-card p-4 text-sm font-semibold text-up">Closed{job.warranty ? " · warranty open" : ""}</p>
      )}
    </div>
  );
}

function CheckCard({
  title,
  check,
  onToggle,
  who,
  setWho,
  onSign,
}: {
  title: string;
  check: JobFile["preCheck"];
  onToggle: (id: string) => void;
  who: string;
  setWho: (v: string) => void;
  onSign: () => void;
}) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">{title}</h2>
      <ul className="space-y-1">
        {check.items.map((i) => (
          <li key={i.id}>
            <button type="button" onClick={() => onToggle(i.id)} className="flex h-10 w-full items-center gap-2 text-left text-sm">
              <span className={cn("grid size-5 place-items-center rounded-sm border", i.on ? "border-navy bg-navy text-card" : "border-line")}>{i.on ? "✓" : ""}</span>
              {i.label}
            </button>
          </li>
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
    </section>
  );
}
