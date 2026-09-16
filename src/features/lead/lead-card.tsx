import { useState } from "react";
import { Pencil } from "lucide-react";
import { DetailsForm } from "./details-form";
import { interestsLabel, inferInterests } from "./interests";
import { updateLead, type LeadDraft } from "@/features/ops/store";
import type { Lead } from "@/lib/crm-data";

function Row({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-3 py-1.5 text-sm">
      <dt className="w-28 shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd className="min-w-0">{v}</dd>
    </div>
  );
}

export function LeadCard({
  lead,
  locked = false,
}: {
  lead: Lead;
  locked?: boolean;
}) {
  const [edit, setEdit] = useState(!locked);
  const interests = interestsLabel(lead.interests ?? inferInterests(lead.product), lead.otherInterest);

  function save(d: LeadDraft) {
    updateLead(lead.id, d);
    if (locked) setEdit(false);
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">{locked ? `Lead ${lead.id}` : "Details"}</h2>
          {locked && !edit ? (
            <button type="button" aria-label="Edit lead" className="grid size-8 place-items-center text-muted hover:text-navy" onClick={() => setEdit(true)}>
              <Pencil className="size-4" />
            </button>
          ) : null}
      </div>
      {edit ? (
        <div>
          <DetailsForm key={lead.id} initial={lead} submitLabel="Save lead" onSubmit={save} />
          {locked ? (
            <button type="button" className="mt-2 h-11 text-sm font-semibold text-muted" onClick={() => setEdit(false)}>
              Cancel
            </button>
          ) : null}
        </div>
      ) : (
        <dl>
          <Row k="Name" v={lead.name} />
          <Row k="Phone" v={lead.phone} />
          <Row k="Email" v={lead.email} />
          {lead.secondaryName ? (
            <>
              <Row k="Second" v={lead.secondaryName} />
              <Row k="Second phone" v={lead.secondaryPhone} />
              <Row k="Second email" v={lead.secondaryEmail} />
            </>
          ) : null}
          <Row k="Address" v={lead.address} />
          <Row k="City" v={lead.city} />
          <Row k="Source" v={lead.source} />
          {lead.source === "Referral" ? (
            <>
              <Row k="Referrer" v={lead.referrerName} />
              <Row k="Referrer phone" v={lead.referrerPhone} />
            </>
          ) : null}
          <Row k="Interests" v={interests} />
          <Row k="Notes" v={lead.notes} />
        </dl>
      )}
    </section>
  );
}
