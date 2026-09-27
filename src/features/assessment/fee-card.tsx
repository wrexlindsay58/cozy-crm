import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createAction } from "@/features/ops/store";
import { useLead } from "@/features/ops/store";
import { actingName, canOverrideFee, feeApprover } from "@/features/staff/store";
import { money } from "@/lib/crm-data";
import { CardCharge } from "@/features/pay/terminal";
import { REPORT_FEE, reportAccess } from "./figures";
import { markReportPaid, sendAssessmentReport, setReportIntent, waiveReportFee } from "./store";
import type { Assessment } from "./types";

const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export function useReportAccess(file: Assessment) {
  const lead = useLead(file.leadId);
  return reportAccess({
    occupancy: file.property.occupancy,
    bothHome: file.property.bothHome,
    intent: file.intent,
    homeownerAnswer: lead?.qualify?.["Q-3"],
    ownersAnswer: lead?.qualify?.["Q-2"],
    paid: file.reportPaid,
    waivedBy: file.reportWaivedBy,
  });
}

export function ReportFeeCard({ file }: { file: Assessment }) {
  const access = useReportAccess(file);
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [asked, setAsked] = useState(false);
  const [sent, setSent] = useState(false);
  const [miss, setMiss] = useState(false);
  const [pay, setPay] = useState(false);

  function send() {
    const ok = sendAssessmentReport(file.id, window.location.origin, access.unlocked);
    setSent(ok);
    setMiss(!ok);
  }

  function waive() {
    if (!reason.trim()) {
      setMiss(true);
      return;
    }
    if (canOverrideFee()) {
      waiveReportFee(file.id, reason, actingName());
      setMiss(false);
      return;
    }
    createAction({
      kind: "request",
      personId: file.leadId,
      title: `Waive the ${money(REPORT_FEE)} report fee`,
      owner: feeApprover(),
      description: reason.trim(),
      category: "Fee",
    });
    setAsked(true);
    setMiss(false);
  }

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
          {access.missing.map((item) => (
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

function ReportCheckout({ file, onClose }: { file: Assessment; onClose: () => void }) {
  const [method, setMethod] = useState<"Card" | "Cash" | "Check">("Card");
  const [checkNo, setCheckNo] = useState("");
  const [error, setError] = useState("");

  function paid(method: "Card" | "Cash" | "Check", last4: string, brand: string, receipt: string) {
    markReportPaid(file.id, { method, brand, last4, receipt });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-navy/40 p-4" role="dialog" aria-label="Charge the report">
      <div className="w-full max-w-md border border-line bg-card p-5 shadow-card">
        <p className="text-[11px] font-bold tracking-[0.14em] text-navy uppercase">Payment</p>
        <h3 className="mt-1 text-lg font-semibold">Home performance report</h3>
        <p className="mt-1 text-2xl font-semibold text-navy">{money(REPORT_FEE)}</p>
        <p className="mt-1 text-sm text-muted">{file.name}. This comes off the job if they buy.</p>
        <div className="mt-4 flex gap-1">
          {(["Card", "Cash", "Check"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMethod(item)}
              className={method === item ? "h-9 flex-1 rounded-md border border-navy bg-info-bg text-sm font-semibold text-navy" : "h-9 flex-1 rounded-md border border-line text-sm font-semibold text-muted"}
            >
              {item}
            </button>
          ))}
        </div>
        {method === "Card" ? (
          <div className="mt-4">
            <CardCharge
              amount={REPORT_FEE}
              purpose={`Home performance report ${file.id}`}
              onCancel={onClose}
              onPaid={(slip) => paid("Card", slip.last4 || "", slip.brand || "Card", slip.receipt || "")}
            />
          </div>
        ) : null}
        {method === "Check" ? (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!checkNo.trim()) {
                setError("Enter the check number.");
                return;
              }
              paid("Check", checkNo.trim(), "", `RC-${file.id.replace(/\D/g, "")}-${Date.now().toString().slice(-4)}`);
            }}
          >
            <label className="block text-sm">
              <span className="text-[13px] font-semibold">Check number</span>
              <input value={checkNo} onChange={(e) => setCheckNo(e.target.value)} className={`mt-1 ${field} ${error && !checkNo.trim() ? "border-alert" : ""}`} />
            </label>
            {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="h-10 px-3 text-sm font-semibold text-muted" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="h-10 rounded-md bg-navy px-4 text-sm font-semibold text-card">
                Take check
              </button>
            </div>
          </form>
        ) : null}
        {method === "Cash" ? (
          <div className="mt-4">
            <p className="text-sm text-muted">Cash is counted in the drawer against this receipt.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="h-10 px-3 text-sm font-semibold text-muted" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="h-10 rounded-md bg-navy px-4 text-sm font-semibold text-card"
                onClick={() => paid("Cash", "", "", `RC-${file.id.replace(/\D/g, "")}-${Date.now().toString().slice(-4)}`)}
              >
                Take cash
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
