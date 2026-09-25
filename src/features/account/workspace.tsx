import { useState } from "react";
import { HouseCard } from "./house-card";
import { JobRecord } from "./job-record";
import { NextCard } from "./next-card";
import { RecordsCard } from "./records-card";
import { ServiceCard } from "./service-card";
import { spawnLead, type AccountFile } from "./store";
import { VoiceCard } from "./voice-card";
import type { ShopAction } from "@/features/action/types";
import { assessmentForLead } from "@/features/assessment/store";
import { JobPnl } from "@/features/job/money";
import { useJobs } from "@/features/job/store";
import { canSeeCost } from "@/features/staff/store";
import type { JobFile } from "@/features/job/types";
import { LeadCard } from "@/features/lead/lead-card";
import { useLead } from "@/features/ops/store";
import { FileSections } from "@/features/record-shell/file-sections";
import { AgreementPanel, signedProposals } from "@/features/opportunity/agreement-panel";
import { OppSnap } from "@/features/opportunity/opp-snap";
import { PayTiles } from "@/features/opportunity/pay-tiles";
import { ProposalPanel } from "@/features/opportunity/proposal-panel";
import { useProposals } from "@/features/opportunity/store";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { cn } from "@/lib/cn";
import { opportunities, type Activity, type Appointment, type Lead } from "@/lib/crm-data";
import type { Photo } from "@/lib/file-data";

export function AccountWorkspace({
  file,
  actions,
  history,
  photos,
  appointments,
}: {
  file: AccountFile;
  actions: ShopAction[];
  history: Activity[];
  photos: Photo[];
  appointments: Appointment[];
}) {
  const lead = useLead(file.leadId);
  const jobs = Object.values(useJobs()).filter((j) => j.accountId === file.accountId);
  const opps = Object.values(useProposals()).filter((p) => p.personId === file.leadId);
  const signed = signedProposals(file.leadId, useProposals());
  return (
    <FileSections
      start="contact"
      sections={[
        { id: "contact", label: "Contact", done: true, node: <ContactFile file={file} lead={lead} /> },
        { id: "house", label: "House", node: <HouseCard lead={lead} jobs={jobs} /> },
        ...opps.flatMap((proposal) => [
          { id: `options-${proposal.oppId}`, label: "Scope", node: <OppSnap oppId={proposal.oppId} /> },
          { id: `pay-${proposal.oppId}`, label: "Payment", node: <PayTiles proposal={proposal} /> },
          { id: `proposal-${proposal.oppId}`, label: "Proposal", node: <ProposalPanel proposal={proposal} /> },
        ]),
        ...signed.map((proposal) => ({ id: `agreement-${proposal.oppId}`, label: "Agreement", node: <AgreementPanel proposal={proposal} fileOnly /> })),
        { id: "jobs", label: "Jobs", node: <JobTabs file={file} jobs={jobs} pane="job" /> },
        { id: "pnl", label: "P&L", node: <JobTabs file={file} jobs={jobs} pane="pnl" /> },
        { id: "follow", label: "Follow-up", node: <NextCard file={file} /> },
        { id: "service", label: "Service", node: <ServiceCard file={file} /> },
        { id: "reviews", label: "Reviews", node: <VoiceCard file={file} /> },
        {
          id: "records",
          label: "Records",
          node: (
            <RecordsCard
              file={file}
              jobs={jobs}
              actions={actions.filter((a) => a.personId === file.leadId || a.personId === file.accountId)}
              history={history}
              photos={photos}
              appointments={appointments.filter((a) => a.leadId === file.leadId)}
            />
          ),
        },
      ]}
    />
  );
}

function jobDay(job: JobFile) {
  return job.window.split("·")[0]?.trim() || "Job";
}

function JobTabs({ file, jobs, pane }: { file: AccountFile; jobs: JobFile[]; pane: "job" | "pnl" }) {
  const [id, setId] = useState(jobs[0]?.jobId ?? "");
  const job = jobs.find((j) => j.jobId === id);
  const child = file.childLeads.find((c) => c.id === id);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 border-b border-line">
        <div className="flex min-w-0 gap-1 overflow-x-auto">
          {jobs.map((j) => {
            const on = j.jobId === (job?.jobId ?? "");
            return (
              <button
                key={j.jobId}
                type="button"
                onClick={() => setId(j.jobId)}
                className={cn("h-11 shrink-0 border-b-2 px-3 text-sm font-semibold", on ? "border-navy text-navy" : "border-transparent text-muted")}
              >
                {jobDay(j)} · {j.stage}
              </button>
            );
          })}
          {file.childLeads.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setId(c.id)}
              className={cn("h-11 shrink-0 border-b-2 px-3 text-sm font-semibold", child?.id === c.id ? "border-navy text-navy" : "border-transparent text-muted")}
            >
              Today · Lead
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const lead = spawnLead(file.accountId, "Next project");
            if (lead) setId(lead.id);
          }}
          className="mb-2 h-9 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card"
        >
          New job
        </button>
      </div>
      {job && pane === "job" ? <JobRecord job={job} /> : null}
      {job && pane === "pnl" ? (
        <FileBlock title={`${jobDay(job)} · ${job.stage}`} hint="Contract, costs, profit, true discount, and what is still owed.">
          {canSeeCost() ? <JobPnl job={job} /> : <p className="type-body">Cost is hidden for this login.</p>}
        </FileBlock>
      ) : null}
      {child ? (
        <FileBlock title="Today · Lead" hint="This job is still a lead. It stays on this account.">
          <a href={`/leads/${child.id}`} className="type-value text-navy">
            Open lead
          </a>
        </FileBlock>
      ) : null}
      {!job && !child ? <p className="type-body">No jobs on this account yet.</p> : null}
    </div>
  );
}

function ContactFile({ file, lead }: { file: AccountFile; lead?: Lead }) {
  const assess = lead ? assessmentForLead(lead.id) : undefined;
  const opp = opportunities.find((o) => o.leadId === file.leadId);
  return (
    <div className="space-y-2">
      {lead ? <LeadCard lead={lead} locked /> : <p className="text-sm text-muted">{file.name} · {file.city}</p>}
      <FileBlock title="Earlier files" hint="The pipeline this house already went through.">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {lead ? <a href={`/leads/${lead.id}`} className="type-value text-navy">Contact</a> : null}
          {assess ? <a href={`/assessments/${assess.id}`} className="type-value text-navy">Assessment</a> : null}
          {opp ? <a href={`/opportunities/${opp.id}`} className="type-value text-navy">Opportunity</a> : null}
          {!lead && !assess && !opp ? <p className="text-sm text-muted">No earlier pipeline file.</p> : null}
        </div>
      </FileBlock>
    </div>
  );
}
