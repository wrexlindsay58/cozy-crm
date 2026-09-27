import { LOAN, downloadPnl } from "./bits-01";
import { LaborCard } from "./bits-03";
import { CommissionCard } from "./bits-04";
import { Fact, SelectPick } from "./bits-07";
import { CoCard } from "./bits-08";
import { useMoneyBlock } from "./useMoneyBlock";
import { PnLSheet } from "./index";
import { Download } from "lucide-react";
import { money } from "@/lib/crm-data";
import { canSeeCost } from "@/features/staff/store";
import { addChangeOrder, sendCompletionCert, sendGoodLeapPay, receiveGoodLeapPay, setLoanStatus, signCo } from "../store";
import { isAccepted } from "../types";
import type { LoanFile } from "../types";
import { JobCard } from "../job-card";
import { Tip } from "@/components/tip";
import { sectionDone } from "../done";

export function VMoneyBlock01({ bag }: { bag: ReturnType<typeof useMoneyBlock> }) {
  const { installCos, job, t } = bag;
  return (
    <>
{canSeeCost() ? (
        <JobCard
          kicker="Money"
          title="P&L"
          done={sectionDone(job, "money")}
          actions={
            <Tip label="Download P&L" on>
              <button type="button" aria-label="Download P&L" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-navy" onClick={() => downloadPnl(job)}>
                <Download className="size-4" />
              </button>
            </Tip>
          }
        >
          <PnLSheet job={job} />
        </JobCard>
      ) : (
        <JobCard kicker="Money" title="Contract">
          <p className="text-sm text-muted">Cost hidden. Contract {money(t.revenue)}.</p>
        </JobCard>
      )}

      <LaborCard job={job} />

      <CommissionCard job={job} />

      <JobCard kicker="Finance" title="GoodLeap" aside={job.loan.status}>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[10rem] flex-1 text-[11px] font-bold tracking-wide text-muted uppercase">
            Status
            <SelectPick value={job.loan.status} onChange={(e) => setLoanStatus(job.jobId, e.target.value as LoanFile["status"])} className="mt-1">
              {LOAN.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SelectPick>
          </label>
          <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setLoanStatus(job.jobId, "NTP")}>
            NTP
          </button>
          <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => sendCompletionCert(job.jobId)}>
            Send completion cert
          </button>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <Fact k="Amount" v={money(job.loan.amount)} />
          <Fact k="Dealer fee" v={money(job.loan.dealerFee)} />
          <Fact k="Term / rate" v={`${job.loan.term} mo · ${job.loan.rate}%`} />
        </dl>
        <p className="mt-3 text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Notes</span>
          <span className="mt-0.5 block">{job.loan.notes || "—"}</span>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-line p-3">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Payment sent</p>
            <p className="mt-1 text-sm font-semibold">{job.loan.paySentAt ? `Sent ${job.loan.paySentAt}` : "Not sent"}</p>
            <p className="mt-0.5 text-[11px] text-muted">GoodLeap funding request</p>
            <button
              type="button"
              className="mt-2 h-9 rounded-md bg-navy px-3 text-xs font-semibold text-card"
              onClick={() => sendGoodLeapPay(job.jobId)}
            >
              {job.loan.paySentAt ? "Resend" : "Send to GoodLeap"}
            </button>
          </div>
          <div className="rounded-md border border-line p-3">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Payment received</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">
              {money(job.loan.fundedAmount)} / {money(job.loan.amount)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">{job.loan.payReceivedAt ? `Received ${job.loan.payReceivedAt}` : "Not funded"}</p>
            {job.loan.status !== "Funded" ? (
              <button type="button" className="mt-2 h-9 rounded-md border border-line px-3 text-xs font-semibold" onClick={() => receiveGoodLeapPay(job.jobId)}>
                Mark received
              </button>
            ) : (
              <p className="mt-2 text-[12px] font-semibold text-up">Funded</p>
            )}
          </div>
        </div>
      </JobCard>

      <CoCard
        kicker="Install agreement"
        title="Change orders"
        empty="No install change orders."
        rows={installCos}
        onAdd={() => addChangeOrder(job.jobId, "Extra duct run", 850, 220, "install")}
        locked={!isAccepted(job)}
        onSign={(id) => signCo(job.jobId, id)}
        signLabel="Sign install"
        signedLabel="Install signed"
      />
    </>
  );
}
