import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createAction } from "@/features/ops/store";
import { useLead } from "@/features/ops/store";
import { actingName, canOverrideFee, feeApprover } from "@/features/staff/store";
import { money } from "@/lib/crm-data";
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
  const [brand, setBrand] = useState("Visa");
  const [last4, setLast4] = useState("");
  const [name, setName] = useState(file.name);
  const [checkNo, setCheckNo] = useState("");
  const [error, setError] = useState("");
  const digits = last4.replace(/\D/g, "").slice(0, 4);
  const ready = method === "Cash" || (method === "Check" && checkNo.trim().length > 0) || (method === "Card" && digits.length === 4 && name.trim().length > 1);

  function charge() {
    if (!ready) {
      setError(method === "Card" ? "Enter the name and the last four from the terminal slip." : "Enter the check number.");
      return;
    }
    const receipt = `RC-${file.id.replace(/\D/g, "")}-${Date.now().toString().slice(-4)}`;
    markReportPaid(file.id, {
      method,
      brand: method === "Card" ? brand : "",
      last4: method === "Card" ? digits : method === "Check" ? checkNo.trim() : "",
      receipt,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4" role="dialog" aria-label="Charge the report">
      <form
        className="w-full max-w-md border border-line bg-card p-5 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          charge();
        }}
      >
        <p className="text-[11px] font-bold tracking-[0.14em] text-navy uppercase">Payment</p>
        <h3 className="mt-1 text-lg font-semibold">Home performance report</h3>
        <p className="mt-1 text-2xl font-semibold text-navy">{money(REPORT_FEE)}</p>
        <p className="mt-1 text-sm text-muted">{file.name}. This comes off the job if they buy. The full card number is not stored.</p>
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
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="text-[13px] font-semibold">Name on card</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${field}`} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-[13px] font-semibold">Card</span>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className={`mt-1 ${field}`}>
                  <option>Visa</option>
                  <option>Mastercard</option>
                  <option>Amex</option>
                  <option>Discover</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-[13px] font-semibold">Last four</span>
                <input value={digits} onChange={(e) => setLast4(e.target.value)} inputMode="numeric" placeholder="From the slip" className={`mt-1 ${field} ${error && digits.length < 4 ? "border-alert" : ""}`} />
              </label>
            </div>
            <p className="text-[12px] text-muted">Run the card on the terminal, then enter the last four from the slip.</p>
          </div>
        ) : null}
        {method === "Check" ? (
          <label className="mt-4 block text-sm">
            <span className="text-[13px] font-semibold">Check number</span>
            <input value={checkNo} onChange={(e) => setCheckNo(e.target.value)} className={`mt-1 ${field} ${error && !checkNo.trim() ? "border-alert" : ""}`} />
          </label>
        ) : null}
        {method === "Cash" ? <p className="mt-4 text-sm text-muted">Cash is counted in the drawer against this receipt.</p> : null}
        {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="h-10 px-3 text-sm font-semibold text-muted" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="h-10 rounded-md bg-navy px-4 text-sm font-semibold text-card">
            Charge {money(REPORT_FEE)}
          </button>
        </div>
      </form>
    </div>
  );
}
