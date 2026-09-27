import { useSalesDashboard3 } from "./useSalesDashboard3";
import { createPortal } from "react-dom";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";

export function VSalesDashboard01({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { embedded, filterSlot, filters, mem, t, unbooked } = bag;
  return (
    <>
{embedded && filterSlot ? createPortal(filters, filterSlot) : null}
      {embedded ? null : (
      <PageTitle
        title="Sales"
        actions={<div className="flex w-full min-w-0 items-center gap-2">{filters}</div>}
      />
      )}

      <p className="shrink-0 border-b border-line bg-card px-4 py-2.5 text-center text-[15px] tabular-nums max-md:px-3 max-md:text-left max-md:text-[13px] max-md:leading-5">
        <span className="font-bold">{money(t.sold)} sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.close}% close</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.deals.toLocaleString()} deals</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{mem.members.toLocaleString()} memberships · {money(mem.total)}</span>
        {unbooked ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{unbooked.toLocaleString()} not booked</span>
          </>
        ) : null}
      </p>
    </>
  );
}
