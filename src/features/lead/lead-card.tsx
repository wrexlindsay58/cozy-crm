import { useState } from "react";
import { Pencil } from "lucide-react";
import { DetailsForm } from "./details-form";
import { ContactView } from "./contact-view";
import { updateLead, type LeadDraft } from "@/features/ops/store";
import type { Lead } from "@/lib/crm-data";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function LeadCard({
  lead,
  locked = false,
}: {
  lead: Lead;
  locked?: boolean;
}) {
  const [edit, setEdit] = useState(!locked);

  function save(d: LeadDraft) {
    updateLead(lead.id, d);
    if (locked) setEdit(false);
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Contact</h2>
          <p className="mt-0.5 text-[11px] text-muted">{lead.id}</p>
        </div>
        {locked ? (
          <Tip label={edit ? "Done" : "Edit"} on>
            <button
              type="button"
              aria-label={edit ? "Done editing" : "Edit contact"}
              onClick={() => setEdit((v) => !v)}
              className={cn("grid size-8 place-items-center rounded-md", edit ? "bg-navy text-card" : "text-muted hover:bg-page hover:text-navy")}
            >
              <Pencil className="size-4" />
            </button>
          </Tip>
        ) : null}
      </div>
      {locked && !edit ? <ContactView lead={lead} /> : <DetailsForm key={`${lead.id}-${edit}`} initial={lead} submitLabel="Save contact" onSubmit={save} />}
    </section>
  );
}