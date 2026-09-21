import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps } from "@/features/ops/store";
import { FileSections } from "@/features/record-shell/file-sections";
import { completeAssessment } from "./store";
import { PacketCard } from "./packets";
import { PropertyCard } from "./property";
import { useAssessCategories } from "./categories";
import type { Assessment as File } from "./types";

export function AssessmentWorkspace({ file }: { file: File }) {
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === file.leadId);
  const cats = useAssessCategories().filter((c) => c.on);
  return (
    <FileSections
      sections={[
        lead ? { id: "lead", label: "Lead", node: <LeadCard lead={lead} locked /> } : { id: "lead", label: "Lead", node: null },
        { id: "house", label: "House", node: <PropertyCard file={file} /> },
        ...cats.map((def) => ({
          id: def.id,
          label: def.label.replace(/ & .+$/, ""),
          node: (
            <PacketCard
              assessmentId={file.id}
              def={def}
              packet={file.packets.find((p) => p.id === def.id) ?? { id: def.id, fields: {}, photos: [], notes: "" }}
            />
          ),
        })),
        {
          id: "done",
          label: "Complete",
          node: (
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
          ),
        },
        {
          id: "book",
          label: "Book",
          node: <BookWidget leadId={file.leadId} defaultCloser={file.closer} defaultKind="Assessment" />,
        },
      ]}
    />
  );
}
export { completeAssessment };