import type { Lead } from "@/lib/crm-data";
import { useAdminSettings } from "@/features/admin-settings/store";
import { Fact, FactGrid, SheetGroup } from "@/features/record-shell/file-sheet";
import { interestsLabel } from "./interests";

export function ContactView({ lead }: { lead: Lead }) {
  const { qualify } = useAdminSettings();
  const answers = lead.qualify ?? {};
  const second = [lead.secondaryName, lead.secondaryPhone, lead.secondaryEmail].filter(Boolean).join(" · ");
  const interests = interestsLabel(lead.interests ?? [], lead.otherInterest) || lead.product;
  const dnd = (lead.dnd ?? []).length ? (lead.dnd?.length === 3 ? "All" : lead.dnd?.join(", ")) : "";
  return (
    <div className="space-y-2">
      <SheetGroup title="People">
        <FactGrid>
          <Fact label="Name" value={lead.name} />
          <Fact label="Phone" value={lead.phone} />
          <Fact label="Email" value={lead.email} />
          <Fact label="Second homeowner" value={second} wide />
        </FactGrid>
      </SheetGroup>
      <SheetGroup title="Address">
        <FactGrid>
          <Fact label="Street" value={lead.address} />
          <Fact label="City" value={lead.city} />
          <Fact label="Office" value={lead.office} />
        </FactGrid>
      </SheetGroup>
      <SheetGroup title="How they came in">
        <FactGrid>
          <Fact label="Lead source" value={lead.source} />
          <Fact label="Referrer" value={[lead.referrerName, lead.referrerPhone].filter(Boolean).join(" · ")} />
          <Fact label="Setter" value={lead.setter} />
          <Fact label="Closer" value={lead.closer} />
          <Fact label="Status" value={lead.status} />
          <Fact label="Created" value={lead.created} />
          <Fact label="Next" value={lead.next} />
          <Fact label="Main interests" value={interests} />
          <Fact label="Pay" value={lead.finance} />
          <Fact label="Tags" value={(lead.tags ?? []).join(", ")} />
          <Fact label="Do not disturb" value={dnd} />
        </FactGrid>
      </SheetGroup>
      <SheetGroup title="Why they're looking">
        <FactGrid>
          <Fact label="Customer issues" value={lead.pain} wide />
          <Fact label="Homeowner notes" value={lead.notes} wide />
          {lead.formAnswers?.map((row) => (
            <Fact key={row.q} label={row.q} value={row.a} wide />
          ))}
        </FactGrid>
      </SheetGroup>
      <SheetGroup title="Qualified">
        <FactGrid>
          {qualify.map((q) => (
            <Fact key={q.id} label={q.name} value={answers[q.id]} />
          ))}
          <Fact label="Rebate eligible" value={lead.rebate === true ? "Yes" : lead.rebate === false ? "No" : ""} />
        </FactGrid>
      </SheetGroup>
    </div>
  );
}
