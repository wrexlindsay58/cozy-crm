import { JobFlow } from "./flow";
import { StageBar } from "./stage-bar";
import type { JobFile } from "./store";
import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { AssessSnap } from "@/features/opportunity/assess-snap";
import { FileSections } from "@/features/record-shell/file-sections";
import { PriorStages } from "@/features/record-shell/prior-stages";
import type { Lead } from "@/lib/crm-data";

export function JobWorkspace({ job, lead }: { job: JobFile; lead?: Lead; focus?: "co" | "invoice" | null }) {
  return (
    <FileSections
      sections={[
        { id: "lead", label: "Lead", node: lead ? <LeadCard lead={lead} locked /> : null },
        { id: "assess", label: "Assessment", node: lead ? <AssessSnap leadId={lead.id} /> : null },
        { id: "stage", label: "Stage", node: <StageBar job={job} /> },
        { id: "job", label: "Job", node: <JobFlow job={job} /> },
        {
          id: "book",
          label: "Book",
          node: lead ? <BookWidget leadId={lead.id} defaultCloser={job.closer} defaultKind="Install" /> : null,
        },
        { id: "pipeline", label: "Pipeline", node: lead ? <PriorStages leadId={lead.id} current="job" /> : null },
      ]}
    />
  );
}