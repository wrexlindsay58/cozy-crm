import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useOps } from "@/features/ops/store";
import { useProposals } from "@/features/opportunity/store";
import { canSeeCost, useStaff } from "@/features/staff/store";
import { receivePoAmount, recordPayment, useJobs } from "@/features/job/store";
import { PaymentTerminal } from "@/features/pay/terminal";
import { buildPaper, type PaperRow } from "../model";
import { SECTIONS, METHODS, todayKey, runImmediate, PacketLine } from "./part-01";

export function ChaseForm({ row, who, onDone, onClose }: { row: PaperRow; who: string; onDone: () => void; onClose: () => void }) {
  const pay = row.run?.type === "pay";
  const [amount, setAmount] = useState(String(row.amount ?? ""));
  const [how, setHow] = useState(pay ? "Card" : who);
  const [at, setAt] = useState(todayKey());
  const [run, setRun] = useState(false);
  const owed = row.amount ?? 0;
  const entered = Number(amount);
  const partial = Number.isFinite(entered) && entered > 0 && entered < owed;
  return (
    <>
    <form
      className="w-full rounded-md border border-line bg-card px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!row.run || !Number.isFinite(entered) || entered <= 0) return;
        if (row.run.type === "pay" && how === "Card") {
          setRun(true);
          return;
        }
        if (row.run.type === "pay") recordPayment(row.run.jobId, row.run.invoiceId, entered, how, at);
        if (row.run.type === "receive-po") receivePoAmount(row.run.jobId, row.run.poId, entered, how);
        onDone();
      }}
    >
      <h3 className="type-label">{pay ? "Record payment" : "Mark received"}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="type-label">Amount</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
        </label>
        {pay ? (
          <label className="block">
            <span className="type-label">Method</span>
            <select value={how} onChange={(e) => setHow(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy">
              {METHODS.map((method) => <option key={method}>{method}</option>)}
            </select>
          </label>
        ) : (
          <label className="block">
            <span className="type-label">Who</span>
            <input value={how} onChange={(e) => setHow(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
          </label>
        )}
        <label className="block">
          <span className="type-label">Date</span>
          <input type="date" value={at} onChange={(e) => setAt(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy" />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">{partial ? (pay ? "Record partial" : "Received short") : how === "Card" ? "Run card" : pay ? "Record payment" : "Mark received"}</button>
        <button type="button" onClick={onClose} className="h-9 px-2 text-sm font-semibold text-muted">Cancel</button>
      </div>
    </form>
      {run && row.run?.type === "pay" ? (
        <PaymentTerminal
          title="Agreement payment"
          amount={entered}
          purpose={`Job ${row.run.jobId} invoice ${row.run.invoiceId}`}
          onClose={() => setRun(false)}
          onPaid={(slip) => {
            if (row.run?.type !== "pay") return;
            recordPayment(row.run.jobId, row.run.invoiceId, entered, `${slip.brand || "Card"} ····${slip.last4} · ${slip.receipt}`, at);
            onDone();
          }}
        />
      ) : null}
    </>
  );
}

export function JobPacket({ jobId }: { jobId: string }) {
  const jobs = useJobs();
  const proposals = useProposals();
  const { leads } = useOps();
  const { viewAs } = useStaff();
  const rows = buildPaper(Object.values(jobs), Object.values(proposals), leads, canSeeCost(viewAs)).filter((r) => r.jobId === jobId && !r.internal && !r.lender && !r.mismatch);
  if (!rows.length) return <p className="type-meta">No paper on this job yet.</p>;
  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const list = rows.filter((r) => r.kind === section.kind);
        return (
          <div key={section.kind}>
            <p className="type-label">{section.label}</p>
            {list.length === 0 ? <p className="type-meta mt-1">{section.empty}</p> : <ul className="mt-1 divide-y divide-line">{list.map((row) => <PacketLine key={row.id} row={row} open={false} onOpen={() => undefined} onAct={() => runImmediate(row)} />)}</ul>}
          </div>
        );
      })}
      <Link to="/paper" search={{ job: jobId }} className="inline-flex h-10 items-center text-sm font-semibold text-navy">
        Open in Paper
      </Link>
    </div>
  );
}
