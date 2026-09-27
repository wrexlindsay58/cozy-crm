import { TrueDiscountHits } from "./bits-06";
import { usePnLSheet } from "./usePnLSheet";
import { money } from "@/lib/crm-data";

export function VPnLSheet02({ bag }: { bag: ReturnType<typeof usePnLSheet> }) {
  const { held, job, readOnly } = bag;
  return (
    <>
{held ? (
        <div className="mt-2 rounded-md border border-line p-3">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Collected with this job, not job revenue</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums">{money(held.termPrice)}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {held.funding === "loan" ? "Included in the loan." : "Collected on the job agreement."} Not in the contract, not in left to collect, and not in the commission.
            {held.planFee ? ` Fee on the plan ${money(held.planFee)} stays on the membership.` : ""}
          </p>
        </div>
      ) : null}

      <TrueDiscountHits job={job} readOnly={readOnly} />
    </>
  );
}
