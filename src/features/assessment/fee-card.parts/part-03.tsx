import { canOverrideFee, feeApprover } from "@/features/staff/store";
import { money } from "@/lib/crm-data";
import { REPORT_FEE } from "../figures";
import { setReportIntent } from "../store";
import { ReportCheckout } from "./part-02";

export function ReportFeeCardView(props: { bag: { access: any; file: any; navigate: any; send: any; setPay: any; pay: any; reason: any; setReason: any; miss: any; waive: any; asked: any; sent: any } }) {
  const { access, file, navigate, send, setPay, pay, reason, setReason, miss, waive, asked, sent } = props.bag;
  return (
    <section className="rounded-md border border-line bg-card px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-section">Report</h2>
          <p className="mt-1 text-sm text-muted">
            {access.free
              ? "Free. They are the homeowner, both decision makers are here, and this is a qualified assessment."
              : access.unlocked
                ? file.reportPaid
                  ? `${money(REPORT_FEE)} paid${file.reportCharge ? ` · ${file.reportCharge.method}${file.reportCharge.last4 ? ` ····${file.reportCharge.last4}` : ""} · ${file.reportCharge.receipt}` : ""}. Credit it on the job if they buy.`
                  : `Fee waived by ${file.reportWaivedBy}.`
                : `${money(REPORT_FEE)} before this report goes to the customer.`}
          </p>
        </div>
        {!access.unlocked ? <p className="text-sm font-semibold text-navy">{money(REPORT_FEE)}</p> : null}
      </div>
      {!access.free ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {access.missing.map((item: any) => (
            <li key={item} className="rounded-md bg-alert-bg px-2 py-1 text-[12px] font-semibold text-alert">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex items-center gap-3">
        <p className="text-sm font-semibold">Qualified assessment?</p>
        <div className="ml-auto flex gap-1">
          {(
            [
              ["Yes", "Yes"],
              ["No", "No"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setReportIntent(file.id, value)}
              className={file.intent === value ? "h-9 rounded-md border border-navy bg-info-bg px-3 text-sm font-semibold text-navy" : "h-9 rounded-md border border-line px-3 text-sm font-semibold text-muted"}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
          onClick={() => navigate({ to: "/report/$assessmentId", params: { assessmentId: file.id }, search: { mode: "present" } })}
        >
          Present
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={send}>
          Send report
        </button>
        {!access.unlocked && !file.reportPaid ? (
          <button type="button" className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => setPay(true)}>
            Charge {money(REPORT_FEE)}
          </button>
        ) : null}
      </div>
      {pay ? <ReportCheckout file={file} onClose={() => setPay(false)} /> : null}
      {!access.free && !file.reportPaid && !file.reportWaivedBy ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={canOverrideFee() ? "Why the fee is waived" : "Why you are asking to waive it"}
            className={`h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none ${miss && !reason.trim() ? "border-alert" : "border-line"}`}
          />
          <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={waive}>
            {canOverrideFee() ? "Waive" : "Request waive"}
          </button>
        </div>
      ) : null}
      {miss && !access.unlocked ? <p className="mt-2 text-sm text-alert">Collect {money(REPORT_FEE)}, or waive it, before the report is sent.</p> : null}
      {asked ? <p className="mt-2 text-sm text-muted">Asked {feeApprover()} to waive it.</p> : null}
      {sent ? <p className="mt-2 text-sm text-muted">Report sent.</p> : null}
    </section>
  );
}
