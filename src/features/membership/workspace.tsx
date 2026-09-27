import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { FileSections, type FileSection } from "@/features/record-shell/file-sections";
import type { Lead } from "@/lib/crm-data";
import { PlanCard } from "./plan-card";
import { RenewCard } from "./renew-card";
import { ChangesCard } from "./changes";
import { MembershipAgreements } from "./agreements";
import { MembershipMoney } from "./money";
import { MembershipVisits, openVisitRepairs, visitsDone } from "./visits";
import { billOpen } from "./store";
import type { MembershipFile } from "./types";

export function membershipSections(file: MembershipFile, lead?: Lead): FileSection[] {
  return [
    {
      id: "contact",
      label: "Contact",
      done: Boolean(lead?.name && lead.phone && lead.address),
      node: lead ? <LeadCard lead={lead} locked /> : <p className="text-sm text-muted">No contact on this house yet.</p>,
    },
    {
      id: "plan",
      label: "Plan",
      done: file.status !== "Offered",
      node: (
        <div className="space-y-4">
          <PlanCard file={file} />
          <RenewCard file={file} />
          <ChangesCard file={file} />
        </div>
      ),
    },
    {
      id: "agreement",
      label: "Agreement",
      done: file.agreement?.status === "Signed",
      node: <MembershipAgreements file={file} />,
    },
    {
      id: "visits",
      label: "Visits",
      done: visitsDone(file),
      node: <MembershipVisits file={file} />,
    },
    {
      id: "money",
      label: "Money",
      done: !billOpen(file) && !(file.ledger ?? []).some((row) => row.status === "Held") && openVisitRepairs(file).length === 0,
      node: <MembershipMoney file={file} />,
    },
    {
      id: "book",
      label: "Book",
      node: lead ? <BookWidget leadId={lead.id} defaultCloser={file.owner} defaultKind="Service" pipeline="Membership" /> : <p className="text-sm text-muted">No contact to put on the book.</p>,
    },
  ];
}

export function MembershipWorkspace({ file, lead }: { file: MembershipFile; lead?: Lead }) {
  return <FileSections start="plan" sections={membershipSections(file, lead)} />;
}
