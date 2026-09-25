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
    <section className="rounded-md border border-line bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="type-section">Contact</h2>
          <p className="type-meta mt-1">{lead.name}</p>
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
      <div className="px-4 py-3">
      {locked && !edit ? <ContactView lead={lead} /> : <DetailsForm key={`${lead.id}-${edit}`} initial={lead} submitLabel="Save contact" onSubmit={save} />}
      </div>
    </section>
  );
}