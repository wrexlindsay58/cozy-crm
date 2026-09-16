import { AssignCrew } from "./crew-assign";
import { CostingBoard } from "./costing-board";
import { FinanceBlock, ScopeBlock } from "./crew-finance";
import { Documents } from "./documents";
import { Production } from "./production";
import { StageBar } from "./stage-bar";
import type { JobFile } from "./store";
import { LeadCard } from "@/features/lead/lead-card";
import { AssessSnap } from "@/features/opportunity/assess-snap";
import { BookWidget } from "@/features/lead/book-widget";
import type { Lead } from "@/lib/crm-data";

export function JobWorkspace({ job, lead, focus }: { job: JobFile; lead?: Lead; focus?: "co" | "invoice" | null }) {
  return (
    <div className="space-y-3">
      {lead ? <LeadCard lead={lead} locked /> : null}
      {lead ? <AssessSnap leadId={lead.id} /> : null}
      <StageBar job={job} />
      <ScopeBlock job={job} />
      <AssignCrew job={job} />
      <Production job={job} />
      <CostingBoard job={job} />
      <FinanceBlock job={job} />
      <Documents job={job} focus={focus} />
      <BookWidget leadId={lead?.id ?? job.leadId} defaultCloser={job.pm} defaultKind="Install" />
    </div>
  );
}
