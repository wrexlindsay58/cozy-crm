import { patch } from "./events-02";
import { customerLines } from "./seed";
import { jobs } from "./core";
import { paid } from "./events";
import { addHistory } from "@/features/ops/store";
import { contractTotal, type JobInvoice, type LoanFile, type PayStatus } from "../types";

export function addInvoice(jobId: string, kind: JobInvoice["kind"], amount: number) {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    const row: JobInvoice = {
      id: `INV-${30 + j.invoices.length}`,
      kind,
      amount,
      paid: 0,
      status: "Sent",
      file: { name: `INV.pdf`, url: "#" },
      payments: [],
      party: "customer",
      itemize: false,
      lines: customerLines(j),
    };
    addHistory(j.personId, j.pm, `${kind} invoice sent ${amount}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}

export function setInvoiceItemize(jobId: string, invoiceId: string, itemize: boolean) {
  patch(jobId, (j) => ({ ...j, invoices: j.invoices.map((i) => (i.id === invoiceId ? { ...i, itemize } : i)) }), { nudge: false });
}

export function setInvoiceStatus(jobId: string, invoiceId: string, status: PayStatus) {
  patch(jobId, (j) => ({ ...j, invoices: j.invoices.map((i) => (i.id === invoiceId ? { ...i, status } : i)) }));
}

export function payInvoice(jobId: string, invoiceId: string, how = "Card") {
  const invoice = jobs[jobId]?.invoices.find((i) => i.id === invoiceId);
  recordPayment(jobId, invoiceId, Math.max(0, (invoice?.amount ?? 0) - (invoice?.paid ?? 0)), how, "Now");
}

export function recordPayment(jobId: string, invoiceId: string, amount: number, how: string, at: string) {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Invoice ${invoiceId} ${how} ${amount}.`);
    return {
      ...j,
      invoices: j.invoices.map((i) => {
        if (i.id !== invoiceId) return i;
        const paid = Math.min(i.amount, i.paid + amount);
        const status = paid >= i.amount ? "Paid" : "Partial";
        return { ...i, paid, status, payments: [...i.payments, { id: `PY-${Date.now()}`, amount, at, how, status: "Paid" as const }] };
      }),
    };
  });
}

export function patchLoan(jobId: string, row: Partial<LoanFile>) {
  patch(jobId, (j) => {
    const loan = { ...j.loan, ...row };
    if (loan.status === "Funded" && loan.fundedAmount <= 0) loan.fundedAmount = loan.amount;
    addHistory(j.personId, j.pm, `GoodLeap ${loan.status}.`);
    return { ...j, loan };
  });
}

export function sendFinalInvoice(jobId: string) {
  patch(jobId, (j) => {
    const due = Math.max(0, contractTotal(j) - paid(j));
    if (due <= 0) return j;
    const row: JobInvoice = {
      id: `INV-${30 + j.invoices.length}`,
      kind: "Final",
      amount: due,
      paid: 0,
      status: "Sent",
      file: { name: "final-invoice.pdf", url: "#" },
      payments: [],
      party: "customer",
      itemize: false,
      lines: customerLines(j),
    };
    addHistory(j.personId, j.pm, `Final invoice sent ${due}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}

export function allInvoices() {
  return Object.values(jobs).flatMap((j) => j.invoices.map((i) => ({ ...i, jobId: j.jobId, name: j.name, personId: j.personId })));
}

export function allPos() {
  return Object.values(jobs).flatMap((j) => j.pos.map((p) => ({ ...p, jobId: j.jobId, name: j.name, personId: j.personId })));
}
