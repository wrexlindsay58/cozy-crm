import { money } from "@/lib/crm-data";
import { Fact, FactGrid, FileBlock, SheetGroup } from "@/features/record-shell/file-sheet";
import { priceLabel } from "./store";
import type { MembershipFile } from "./types";

const FROM: Record<MembershipFile["startedFrom"], string> = {
  lead: "Lead",
  assessment: "Assessment",
  opportunity: "Opportunity",
  job: "Job",
  account: "Account",
};

const FUND = { membership: "On this membership", job: "Collected with the job", loan: "Included in the loan" };

export function PlanCard({ file }: { file: MembershipFile }) {
  return (
    <>
    <FileBlock title={file.planName} hint="This price stays even if the catalog changes.">
      <SheetGroup title="Term">
        <FactGrid>
          <Fact label="Years" value={`${file.years} years`} />
          <Fact label="Started from" value={FROM[file.startedFrom]} />
          <Fact label="Starts" value={file.start} />
          <Fact label="Ends" value={file.end} />
        </FactGrid>
      </SheetGroup>
      <SheetGroup title="Price">
        <FactGrid>
          <Fact label="Pay" value={file.pay === "prepaid" ? "Prepaid" : "Billed monthly"} />
          <Fact label="This term" value={priceLabel(file, money)} />
          <Fact label="Collected" value={file.pay === "prepaid" ? FUND[file.funding] : undefined} />
          <Fact label="Next bill" value={file.nextBill || (file.pay === "prepaid" ? "None" : undefined)} />
          <Fact label="After the term" value={`${money(file.continueMonthly)}/mo until they cancel`} wide />
        </FactGrid>
      </SheetGroup>
      <SheetGroup title="Coverage">
        <FactGrid>
          <Fact label="Visits" value={`${file.visitsPerYear} a year`} />
          <Fact label="Repair price" value={file.repairDiscount ? `${file.repairDiscount}% off` : "Full price"} />
        </FactGrid>
      </SheetGroup>
    </FileBlock>
    <FileBlock title="Included" hint={`${file.visitsPerYear} visits a year. A repair is not included unless that visit says so.`}>
      {file.included.length ? (
        <ul>
          {file.included.map((item) => (
            <li key={item} className="border-t border-line py-2.5 text-sm first:border-t-0 first:pt-0">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nothing listed on this plan.</p>
      )}
    </FileBlock>
    </>
  );
}
