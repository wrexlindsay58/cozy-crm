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
  const [open, setOpen] = useState(!locked);
  const interests = interestsLabel(lead.interests ?? inferInterests(lead.product), lead.otherInterest);
  const line = [lead.name, lead.phone, lead.city || lead.address].filter(Boolean).join(" · ");

  function save(d: LeadDraft) {
    updateLead(lead.id, d);
    if (locked) {
      setEdit(false);
      setOpen(false);
    }
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => locked && !edit && setOpen((v) => !v)} disabled={!locked || edit}>
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">{locked ? `Lead ${lead.id}` : "Details"}</h2>
          {locked && !open && !edit ? <p className="mt-1 truncate text-sm">{line}</p> : null}
        </button>
        {locked && !edit ? (
          <button
            type="button"
            aria-label="Edit lead"
            className="grid size-8 shrink-0 place-items-center text-muted hover:text-navy"
            onClick={() => {
              setEdit(true);
              setOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </button>
        ) : null}
      </div>
      {edit ? (
        <div className="mt-3">
          <DetailsForm key={lead.id} initial={lead} submitLabel="Save lead" onSubmit={save} />
          {locked ? (
            <button
              type="button"
              className="mt-2 h-11 text-sm font-semibold text-muted"
              onClick={() => {
                setEdit(false);
                setOpen(false);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      ) : open ? (
        <dl className="mt-3">
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
      ) : null}
    </section>
  );
}
