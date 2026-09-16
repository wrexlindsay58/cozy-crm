import { CostingBoard } from "./costing-board";
import { CrewBlock, FinanceBlock, ScopeBlock } from "./crew-finance";
import { Documents } from "./documents";
import { Production } from "./production";
import { StageBar } from "./stage-bar";
import type { JobFile } from "./store";
import { LeadCard } from "@/features/lead/lead-card";
import { leads } from "@/lib/crm-data";

export function JobWorkspace({ job, focus }: { job: JobFile; focus?: "co" | "invoice" | null }) {
  const lead = leads.find((l) => l.name.split("—")[0].trim() === job.name.split("—")[0].trim()) ?? leads.find((l) => l.id === job.personId);
  return (
    <div className="space-y-3">
      {lead ? <LeadCard lead={lead} locked /> : null}
      <StageBar job={job} />
      <div className="grid gap-3 lg:grid-cols-2">
        <ScopeBlock job={job} />
        <CrewBlock job={job} />
      </div>
      <Production job={job} />
      <CostingBoard job={job} />
      <FinanceBlock job={job} />
      <Documents job={job} focus={focus} />
    </div>
  );
}
