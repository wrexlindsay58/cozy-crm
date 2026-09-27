import type { AccountFile } from "../store";
import { assessmentForLead } from "@/features/assessment/store";
import { LeadCard } from "@/features/lead/lead-card";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { opportunities, type Lead } from "@/lib/crm-data";

export function ContactFile({ file, lead }: { file: AccountFile; lead?: Lead }) {
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
