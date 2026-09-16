import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { assessmentForLead, useAssessment, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";
import { PacketList } from "@/features/assessment/packets";
import { PropertyCard } from "@/features/assessment/property";
import { cn } from "@/lib/cn";

export function AssessSnap({ leadId }: { leadId: string }) {
  useAssessments();
  const found = assessmentForLead(leadId);
  const file = useAssessment(found?.id ?? "");
  const cats = useAssessCategories();
  const [open, setOpen] = useState(false);
  if (!file) return null;
  const label = (id: string) => cats.find((c) => c.id === id)?.label ?? id;
  const filled = file.packets.filter((p) => Object.keys(p.fields).length || p.notes || p.photos.length);
  const line = filled.length ? filled.map((p) => label(p.id)).join(" · ") : file.status;

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen((v) => !v)}>
        <span className="min-w-0">
          <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">Assessment {file.id}</span>
          {!open ? <span className="mt-1 block truncate text-sm">{line}</span> : null}
        </span>
        <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          <PropertyCard file={file} />
          <PacketList file={file} />
        </div>
      ) : null}
    </section>
  );
}
