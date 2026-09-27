import { InvoiceList } from "./bits-02";
import { CoCard } from "./bits-08";
import { useMoneyBlock } from "./useMoneyBlock";
import { money } from "@/lib/crm-data";
import { addChangeOrder, addInvoice, sendFinalInvoice, signCo } from "../store";
import { isAccepted } from "../types";
import { JobCard } from "../job-card";

export function VMoneyBlock02({ bag }: { bag: ReturnType<typeof useMoneyBlock> }) {
  const { financeCos, job, t } = bag;
  return (
    <>
<CoCard
        kicker="GoodLeap agreement"
        title="Change orders"
        empty="No GoodLeap change orders."
        rows={financeCos}
        onAdd={() => addChangeOrder(job.jobId, "Finance revision", 850, 0, "finance")}
        locked={!isAccepted(job)}
        onSign={(id) => signCo(job.jobId, id)}
        signLabel="Sign GoodLeap"
        signedLabel="GoodLeap signed"
      />

      <JobCard
        kicker="Invoices"
        title={`${money(t.collect)} left to collect`}
        actions={
          <div className="flex gap-1">
            <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addInvoice(job.jobId, "Progress", 4000)}>
              Invoice
            </button>
            <button type="button" className="h-8 rounded-md bg-navy px-2 text-xs font-semibold text-card" onClick={() => sendFinalInvoice(job.jobId)}>
              Final
            </button>
          </div>
        }
      >
        <InvoiceList job={job} party="customer" />
      </JobCard>
      <JobCard kicker="Pay invoices" title="Commissions and piece rate">
        <InvoiceList job={job} party="pay" />
      </JobCard>
    </>
  );
}
