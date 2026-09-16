import { JobFlow } from "./flow";
import { StageBar } from "./stage-bar";
import type { JobFile } from "./store";
import { LeadCard } from "@/features/lead/lead-card";
import { AssessSnap } from "@/features/opportunity/assess-snap";
import type { Lead } from "@/lib/crm-data";

export function JobWorkspace({ job, lead }: { job: JobFile; lead?: Lead; focus?: "co" | "invoice" | null }) {
  return (
    <div className="space-y-3">
      {lead ? <LeadCard lead={lead} locked /> : null}
      {lead ? <AssessSnap leadId={lead.id} /> : null}
      <StageBar job={job} />
      <JobFlow job={job} />
    </div>
  );
}
