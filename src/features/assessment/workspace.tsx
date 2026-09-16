import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps } from "@/features/ops/store";
import { completeAssessment } from "./store";
import { PacketList } from "./packets";
import { PropertyCard } from "./property";
import type { Assessment as File } from "./types";

export function AssessmentWorkspace({ file }: { file: File }) {
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === file.leadId);
  return (
    <div className="space-y-3">
      {lead ? <LeadCard lead={lead} locked /> : null}

      <PropertyCard file={file} />
      <PacketList file={file} />
      <BookWidget leadId={file.leadId} defaultCloser={file.closer} defaultKind="Assessment" />

      <section className="rounded-md border border-line bg-card p-4">
        {file.status === "Open" ? (
          <button
            type="button"
            onClick={() => completeAssessment(file.id)}
            className="h-11 w-full rounded-md bg-navy px-3 text-sm font-semibold text-card sm:w-auto"
          >
            Complete assessment
          </button>
        ) : (
          <p className="text-sm font-semibold text-up">Complete · Opportunity {file.oppId}</p>
        )}
      </section>
    </div>
  );
}
export { completeAssessment };
