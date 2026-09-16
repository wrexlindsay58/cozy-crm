import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DetailsForm } from "./details-form";
import { updateLead, type LeadDraft } from "@/features/ops/store";
import type { Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

export function LeadCard({
  lead,
  locked = false,
}: {
  lead: Lead;
  locked?: boolean;
}) {
  const [edit, setEdit] = useState(!locked);
  const line = [lead.name, lead.phone, lead.email].filter(Boolean).join(" · ");

  function save(d: LeadDraft) {
    updateLead(lead.id, d);
    if (locked) setEdit(false);
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      {locked ? (
        <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setEdit((v) => !v)}>
          <span className="min-w-0">
            <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">Lead {lead.id}</span>
            {!edit ? <span className="mt-1 block truncate text-sm">{line}</span> : null}
          </span>
          <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-muted transition-transform", edit && "rotate-180")} />
        </button>
      ) : (
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Details</h2>
      )}
      {edit ? (
        <div className={locked ? "mt-3" : ""}>
          <DetailsForm key={lead.id} initial={lead} submitLabel="Save lead" onSubmit={save} />
        </div>
      ) : null}
    </section>
  );
}
