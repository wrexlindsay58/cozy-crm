import { useState } from "react";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useAssessCategories } from "@/features/assessment/categories";

export function AssessSnap({ leadId }: { leadId: string }) {
  useAssessments();
  const file = assessmentForLead(leadId);
  const cats = useAssessCategories();
  const [open, setOpen] = useState(false);
  if (!file) return null;
  const label = (id: string) => cats.find((c) => c.id === id)?.label ?? id;
  const filled = file.packets.filter((p) => Object.keys(p.fields).length || p.notes || p.photos.length);
  const line = filled.length ? filled.map((p) => label(p.id)).join(" · ") : file.status;

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen((v) => !v)}>
        <span>
          <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">Assessment {file.id}</span>
          {!open ? <span className="mt-1 block truncate text-sm">{line}</span> : null}
        </span>
        <a href={`/assessments/${file.id}`} className="text-sm font-semibold text-navy" onClick={(e) => e.stopPropagation()}>
          Open
        </a>
      </button>
      {open ? (
        <dl className="mt-3 space-y-1">
          {file.property.sqft ? (
            <div className="flex gap-3 py-1 text-sm">
              <dt className="w-28 shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">Property</dt>
              <dd>
                {file.property.yearBuilt ? `${file.property.yearBuilt} · ` : ""}
                {file.property.sqft ? `${file.property.sqft} sq ft` : ""}
                {file.property.hoa ? ` · HOA ${file.property.hoa}` : ""}
              </dd>
            </div>
          ) : null}
          {filled.map((p) => (
            <div key={p.id} className="flex gap-3 py-1 text-sm">
              <dt className="w-28 shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{label(p.id)}</dt>
              <dd className="min-w-0">
                {Object.entries(p.fields)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k} ${v}`)
                  .join(" · ") || p.notes || `${p.photos.length} files`}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
