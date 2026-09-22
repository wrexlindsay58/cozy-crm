import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { JobWorkspace } from "@/features/job/workspace";
import { cancelJob, jobTone, setStage, STAGES, tally, useJob } from "@/features/job/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { scrollFileSection } from "@/features/record-shell/file-sections";
import { useOps } from "@/features/ops/store";
import { accounts, byId, money, opportunities } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";
import { placeLine } from "@/lib/place";
import { assessmentForLead } from "@/features/assessment/store";

export const Route = createFileRoute("/_app/projects_/$projectId")({ component: JobFilePage });

function JobFilePage() {
  const { projectId } = Route.useParams();
  const job = useJob(projectId);
  const { tickets, history, leads } = useOps();
  const [focus, setFocus] = useState<"co" | "invoice" | null>(null);
  if (!job) return <main className="p-6 text-sm text-muted">Job not found.</main>;
  const account = byId(accounts, job.accountId);
  const lead = leads.find((l) => l.id === job.leadId) ?? leads.find((l) => l.name === account?.name);
  const personId = lead?.id ?? job.personId;
  const opp = opportunities.find((o) => o.leadId === personId) ?? opportunities.find((o) => o.product === job.product);
  const assess = lead ? assessmentForLead(lead.id) : undefined;
  const t = tally(job);
  return (
    <RecordShell
      kind="job"
      personId={personId}
      title={lead?.name ?? job.name}
      subtitle={lead ? placeLine(lead.address, lead.city, lead.office) : `${job.product} · ${job.window}`}
      stage={job.stage}
      stageTone={jobTone(job)}
      onStage={(status) => setStage(job.jobId, status as (typeof STAGES)[number])}
      stageOptions={STAGES.map((s) => ({ label: s, tone: jobTone({ stage: s, holds: [] }) }))}
      moneyLabel={money(t.revenue)}
      owner={{ name: job.pm, role: "PM" }}
      followers={followersByPerson[personId] ?? followersByPerson[job.accountId] ?? [{ name: job.closer, role: "Closer" }]}
      related={
        [
          lead ? { label: `Lead ${lead.id}`, href: `/leads/${lead.id}` } : null,
          assess ? { label: `Assessment ${assess.id}`, href: `/assessments/${assess.id}` } : null,
          opp ? { label: `Opportunity ${opp.id}`, href: `/opportunities/${opp.id}` } : null,
          account ? { label: `Account ${account.id}`, href: `/accounts/${account.id}` } : null,
        ].filter(Boolean) as { label: string; href: string }[]
      }
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        {
          label: "Create",
          menu: [
            { label: "Ticket" },
            { label: "Task" },
            { label: "Request" },
            { label: "Change order", onClick: () => setFocus("co") },
            { label: "Invoice", onClick: () => setFocus("invoice") },
          ],
        },
      ]}
      history={history?.[personId] ?? history?.[job.accountId] ?? []}
      tickets={(tickets ?? []).filter((tix) => tix.related === job.jobId || tix.related === personId || tix.related === job.accountId)}
      photos={photosByPerson[personId] ?? photosByPerson[job.accountId] ?? []}
      onCancelJob={job.cancelled ? undefined : (why) => cancelJob(job.jobId, why)}
    >
      <JobWorkspace job={job} lead={lead} focus={focus} />
    </RecordShell>
  );
}
