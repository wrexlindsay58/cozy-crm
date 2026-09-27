import { PayPill } from "./bits-07";
import { useState } from "react";
import { money } from "@/lib/crm-data";
import { payInvoice, recordPayment, setInvoiceItemize, setInvoiceStatus, isPayBill } from "../store";
import type { JobFile } from "../store";
import { PaymentTerminal } from "@/features/pay/terminal";

export function InvoiceList({ job, party }: { job: JobFile; party: "customer" | "pay" }) {
  const [chargeId, setChargeId] = useState<string | null>(null);
  const rows = job.invoices.filter((i) => (party === "pay" ? isPayBill(i) : !isPayBill(i)));
  if (!rows.length) return <p className="text-sm text-muted">{party === "pay" ? "None yet. Commission and piece rate post here." : "No customer invoices."}</p>;
  return (
    <ul className="space-y-2">
      {rows.map((i) => {
        const lines = i.lines ?? [];
        const showPrice = Boolean(i.itemize);
        return (
          <li key={i.id} className="rounded-md border border-line p-3 text-sm">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">
                {i.kind}
                {i.who ? ` · ${i.who}` : ""}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <PayPill value={i.status} onChange={(s) => setInvoiceStatus(job.jobId, i.id, s)} />
                <span className="tabular-nums text-[13px] font-semibold">
                  {money(i.paid)} / {money(i.amount)}
                </span>
              </div>
            </div>
            {party === "customer" ? (
              <button
                type="button"
                onClick={() => setInvoiceItemize(job.jobId, i.id, !showPrice)}
                className="mt-2 text-[12px] font-semibold text-navy"
              >
                {showPrice ? "Hide itemized pricing" : "Show itemized pricing"}
              </button>
            ) : null}
            {lines.length ? (
              <ul className="mt-2 divide-y divide-line">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-baseline justify-between gap-2 py-1 text-[13px]">
                    <span className="min-w-0 truncate">{l.label}</span>
                    {showPrice ? <span className="shrink-0 tabular-nums">{money(l.amount)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {i.status !== "Paid" && party === "customer" ? (
              <button type="button" className="mt-2 text-xs font-semibold text-navy" onClick={() => setChargeId(i.id)}>
                Run card
              </button>
            ) : i.status !== "Paid" ? (
              <button type="button" className="mt-2 text-xs font-semibold text-navy" onClick={() => payInvoice(job.jobId, i.id, job.loan.vendor)}>
                Record payment
              </button>
            ) : null}
            {chargeId === i.id ? (
              <PaymentTerminal
                title={`${i.kind} on the agreement`}
                amount={Math.max(0, i.amount - i.paid)}
                purpose={`Job ${job.jobId} ${i.kind} ${i.id}`}
                onClose={() => setChargeId(null)}
                onPaid={(slip) => {
                  recordPayment(job.jobId, i.id, Math.max(0, i.amount - i.paid), `${slip.brand || "Card"} ····${slip.last4} · ${slip.receipt}`, "Now");
                  setChargeId(null);
                }}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
