import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { JobWorkspace } from "@/features/job/workspace";
import { tally, useJob } from "@/features/job/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { useOps } from "@/features/ops/store";
import { accounts, byId, money, opportunities } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";

export const Route = createFileRoute("/_app/projects_/$projectId")({ component: JobFilePage });

function JobFilePage() {
  const { projectId } = Route.useParams();
  const job = useJob(projectId);
  const { tickets, history } = useOps();
  const [focus, setFocus] = useState<"co" | "invoice" | null>(null);
  if (!job) return <main className="p-6 text-sm text-muted">Job not found.</main>;
  const account = byId(accounts, job.personId);
  const opp = opportunities.find((o) => job.name.includes(o.name.split(" ")[0]));
  const t = tally(job);
  return (
    <RecordShell kind="job" personId={job.personId} title={job.name} subtitle={`${job.product} · ${job.window}`} stage={job.holds.length ? `${job.stage} · hold ${job.holds.join(", ")}` : job.stage} moneyLabel={money(t.revenue)} owner={{ name: job.pm, role: "PM" }} followers={followersByPerson[job.personId] ?? [{ name: job.closer, role: "Closer" }]} related={[account ? { label: `Account ${account.id}`, href: `/accounts/${account.id}` } : null, opp ? { label: `Opportunity ${opp.id}`, href: `/opportunities/${opp.id}` } : null].filter(Boolean) as { label: string; href: string }[]} acts={[{ label: "Call" }, { label: "Text", opens: "thread" }, { label: "Change order", onClick: () => setFocus("co") }, { label: "Invoice", onClick: () => setFocus("invoice") }]} history={history?.[job.personId] ?? []} tickets={(tickets ?? []).filter((tix) => tix.related === job.jobId || tix.related === job.personId)} photos={photosByPerson[job.personId] ?? []}>
      <JobWorkspace job={job} focus={focus} />
    </RecordShell>
  );
}
