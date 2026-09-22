import type { Lead } from "@/lib/crm-data";
import { useAdminSettings } from "@/features/admin-settings/store";
import { interestsLabel } from "./interests";

function Fact({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "" || value === false) return null;
  const text = typeof value === "boolean" ? "Yes" : String(value);
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-0.5 text-sm">{text}</p>
    </div>
  );
}

export function ContactView({ lead }: { lead: Lead }) {
  const { qualify } = useAdminSettings();
  const answers = lead.qualify ?? {};
  const second = [lead.secondaryName, lead.secondaryPhone, lead.secondaryEmail].filter(Boolean).join(" · ");
  const interests = interestsLabel(lead.interests ?? [], lead.otherInterest) || lead.product;
  const dnd = (lead.dnd ?? []).length ? (lead.dnd?.length === 3 ? "All" : lead.dnd?.join(", ")) : "";
  return (
    <div className="space-y-5">
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Fact label="Name" value={lead.name} />
        <Fact label="Phone" value={lead.phone} />
        <Fact label="Email" value={lead.email} />
        <Fact label="Second homeowner" value={second} />
        <Fact label="Address" value={lead.address} />
        <Fact label="City" value={lead.city} />
        <Fact label="Office" value={lead.office} />
        <Fact label="Setter" value={lead.setter} />
        <Fact label="Closer" value={lead.closer} />
        <Fact label="Status" value={lead.status} />
        <Fact label="Created" value={lead.created} />
        <Fact label="Next" value={lead.next} />
        <Fact label="Lead source" value={lead.source} />
        <Fact label="Referrer" value={[lead.referrerName, lead.referrerPhone].filter(Boolean).join(" · ")} />
        <Fact label="Main interests" value={interests} />
        <Fact label="Pay" value={lead.finance} />
        <Fact label="Tags" value={(lead.tags ?? []).join(", ")} />
        <Fact label="DND" value={dnd} />
        <div className="sm:col-span-2">
          <Fact label="Why they're looking" value={lead.pain} />
        </div>
        <div className="sm:col-span-2">
          <Fact label="Homeowner notes" value={lead.notes} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Qualified</p>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {qualify.map((q) => (
            <Fact key={q.id} label={q.name} value={answers[q.id]} />
          ))}
          <Fact label="Rebate eligible" value={lead.rebate === true ? "Yes" : lead.rebate === false ? "No" : ""} />
        </div>
      </div>
    </div>
  );
}