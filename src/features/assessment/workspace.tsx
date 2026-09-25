import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps } from "@/features/ops/store";
import { FileSections } from "@/features/record-shell/file-sections";
import { completeAssessment } from "./store";
import { PacketCard } from "./packets";
import { PropertyCard } from "./property";
import { useAssessCategories } from "./categories";
import { AssessmentReport } from "@/features/opportunity/report";
import { ReportFeeCard } from "./fee-card";
import type { Assessment as File } from "./types";
import { useNavigate } from "@tanstack/react-router";

export function AssessmentWorkspace({ file }: { file: File }) {
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === file.leadId);
  const cats = useAssessCategories().filter((c) => c.on);
  const navigate = useNavigate();
  return (
    <FileSections
      start="house"
      advance={{
        pipeline: "Opportunity",
        onContinue: () => {
          const next = completeAssessment(file.id);
          if (next?.oppId) void navigate({ to: "/opportunities/$oppId", params: { oppId: next.oppId } });
        },
      }}
      sections={[
        lead ? { id: "contact", label: "Contact", done: true, node: <LeadCard lead={lead} locked /> } : { id: "contact", label: "Contact", node: null },
        {
          id: "house",
          label: "House",
          done: Boolean(file.property.yearBuilt || file.property.sqft),
          node: <PropertyCard file={file} />,
        },
        ...cats.map((def) => {
          const packet = file.packets.find((p) => p.id === def.id) ?? { id: def.id, fields: {}, photos: [], notes: "" };
          const filled = def.fields.filter((f) => packet.fields[f.label]).length;
          return {
            id: def.id,
            label: def.label.replace(/ & .+$/, ""),
            done: filled > 0 || packet.photos.length > 0,
            node: <PacketCard assessmentId={file.id} def={def} packet={packet} />,
          };
        }),
        {
          id: "report",
          label: "Report",
          done: file.packets.some((p) => Object.values(p.fields).some(Boolean) || p.notes || p.photos.length > 0),
          node: (
            <div className="space-y-2">
              <ReportFeeCard file={file} />
              <AssessmentReport personId={file.leadId} closer={file.closer} embedded mentionProposal={false} />
            </div>
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