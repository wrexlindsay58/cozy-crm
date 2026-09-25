import { useState } from "react";
import { Pencil } from "lucide-react";
import { assessmentForLead, useAssessment, useAssessments } from "@/features/assessment/store";
import { PacketCard } from "@/features/assessment/packets";
import { PropertyCard } from "@/features/assessment/property";
import { useAssessCategories } from "@/features/assessment/categories";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function AssessSnap({ leadId }: { leadId: string }) {
  useAssessments();
  const found = assessmentForLead(leadId);
  const file = useAssessment(found?.id ?? "");
  const cats = useAssessCategories().filter((c) => c.on);
  const [edit, setEdit] = useState(false);
  if (!file) return <p className="text-sm text-muted">No assessment on this file.</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="type-section">Assessment</h2>
          <p className="type-meta mt-1">{file.status}</p>
        </div>
        <Tip label={edit ? "Done" : "Edit"} on>
          <button
            type="button"
            aria-label={edit ? "Done editing" : "Edit assessment"}
            onClick={() => setEdit((v) => !v)}
            className={cn("grid size-8 place-items-center rounded-md", edit ? "bg-navy text-card" : "text-muted hover:bg-page hover:text-navy")}
          >
            <Pencil className="size-4" />
          </button>
        </Tip>
      </div>
      <PropertyCard file={file} readOnly={!edit} />
      {cats.map((def) => {
        const packet = file.packets.find((p) => p.id === def.id) ?? { id: def.id, fields: {}, photos: [], notes: "" };
        return <PacketCard key={def.id} assessmentId={file.id} def={def} packet={packet} readOnly={!edit} />;
      })}
    </div>
  );
}