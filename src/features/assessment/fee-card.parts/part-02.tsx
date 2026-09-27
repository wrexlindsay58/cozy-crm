import { useState } from "react";
import { money } from "@/lib/crm-data";
import { CardCharge } from "@/features/pay/terminal";
import { REPORT_FEE } from "../figures";
import { markReportPaid } from "../store";
import type { Assessment } from "../types";
import { field } from "./part-01";

export function ReportCheckout({ file, onClose }: { file: Assessment; onClose: () => void }) {
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
