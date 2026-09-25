import type { ReactNode, SelectHTMLAttributes } from "react";
import { useState } from "react";
import { ChevronDown, Download, Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import type { Tone } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { canSeeCost, crewOf, membersOf, namesIn, PAY_KINDS, SHOP_CREWS, useStaff } from "@/features/staff/store";
import {
  addChangeOrder,
  addCommission,
  addCostHit,
  addInvoice,
  addLaborer,
  crewsOnJob,
  payInvoice,
  patchCommission,
  patchLabor,
  removeCommission,
  removeCostHit,
  removeLabor,
  sendCompletionCert,
  sendFinalInvoice,
  sendGoodLeapPay,
  receiveGoodLeapPay,
  setInvoiceItemize,
  setInvoiceStatus,
  isPayBill,
  setLoanStatus,
  signCo,
  tally,
  type JobFile,
} from "./store";
import type { CommShare, LaborKind, LoanFile, SalesFault } from "./types";
import { PROCESSES, SALES_FAULTS, isAccepted, trueDiscount } from "./types";
import { JobCard } from "./job-card";
import { FillField, FILL_IN } from "./fill-row";
import { Tip } from "@/components/tip";
import { Float } from "@/components/float";
import { stageWash } from "@/lib/lead-status";
import { sectionDone } from "./done";
import { bomJobCost } from "./types";

const PAY = ["Draft", "Sent", "Partial", "Paid", "Past due", "NSF", "Card declined", "Void", "Refunded"] as const;
const LOAN: LoanFile["status"][] = ["None", "Received", "Docs needed", "Cancelled", "NTP", "Complete", "Funded"];

function pct(n: number, of: number) {
  if (!of) return "—";
  return `${Math.round((n / of) * 100)}%`;
}

function marginGrade(rate: number) {
  if (rate >= 0.45) return { label: "Great", note: "Well above margin", wash: "bg-up-bg text-up" };
  if (rate >= 0.35) return { label: "Good", note: "Margin is where it should be", wash: "bg-info-bg text-navy" };
  if (rate >= 0.25) return { label: "Warning", note: "Lower than it should be", wash: "bg-watch-bg text-watch" };
  return { label: "Bad", note: "This job takes a gut punch", wash: "bg-alert-bg text-alert" };
}

function downloadPnl(job: JobFile) {
  const t = tally(job);
  const lines = [
    ["P&L", job.name, job.jobId],
    ["Total Contract", String(t.revenue)],
    ["Adders", String(t.adders)],
    ["Discounts", String(t.discounts)],
    ["Total Costs", String(t.cogs)],
    ["Labor", String(t.labor)],
    ["Materials", String(t.mats)],
    ["Supplier returns", String(t.materialReturns)],
    ["Warehouse stock", String(t.warehouse)],
    ["Gross Profit", String(t.gross)],
    ["Total Commissions", String(t.commission)],
    ["True discount", String(t.trueDiscount.dollars)],
    ["True discount %", t.trueDiscount.pct.toFixed(1)],
    ["Closer rate", String(t.trueDiscount.rate)],
    ["After commission", String(t.margin)],
    ["Left to collect", String(t.collect)],
    [t.overUnder >= 0 ? "Overbilled" : "Underbilled", String(Math.abs(t.overUnder))],
  ];
  const blob = new Blob([lines.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${job.jobId}-pnl.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function JobPnl({ job }: { job: JobFile }) {
  useStaff();
  if (!canSeeCost()) return <p className="text-[15px]">Contract {money(tally(job).revenue)}. Cost is hidden for this login.</p>;
  return <PnLSheet job={job} readOnly />;
}

export function MoneyBlock({ job }: { job: JobFile }) {
  useStaff();
  const t = tally(job);
  const installCos = job.changeOrders.filter((c) => c.lane !== "finance");
  const financeCos = job.changeOrders.filter((c) => c.lane === "finance");

  return (
    <div className="space-y-2">
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
    </div>
  );
}

function InvoiceList({ job, party }: { job: JobFile; party: "customer" | "pay" }) {
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
            {i.status !== "Paid" ? (
              <button type="button" className="mt-2 text-xs font-semibold text-navy" onClick={() => payInvoice(job.jobId, i.id, job.loan.vendor)}>
                Record payment
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function LaborCard({ job }: { job: JobFile }) {
  useStaff();
  const t = tally(job);
  const rows = job.laborLines ?? [];
  const crews = [...new Set([...crewsOnJob(job), ...SHOP_CREWS.map((c) => c.name)])];
  const services = [...new Set([...PROCESSES, ...job.scope.filter((s) => s.kind === "product").map((s) => s.label)])];

  return (
    <JobCard
      kicker="Labor"
      title={`${rows.length || "No"} posted · ${money(t.labor)}`}
      actions={
        <button type="button" aria-label="Add laborer" className="grid size-8 place-items-center rounded-md bg-navy text-card" onClick={() => addLaborer(job.jobId)}>
          <Plus className="size-4" />
        </button>
      }
    >
      {rows.length ? (
        <ul className="divide-y divide-line">
          {rows.map((l) => {
            const amt = l.actual ?? (l.kind === "Piece" ? l.rate : Math.round(l.qty * l.rate));
            const crew = l.crew || crewOf(l.who) || crews[0];
            const techs = membersOf(crew);
            const whoOpts = techs.includes(l.who) ? techs : [...techs, l.who];
            return (
              <li key={l.id} className="flex min-w-0 items-end gap-2 py-2">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <FillField label="Who">
                    <select
                      value={crew}
                      onChange={(e) => patchLabor(job.jobId, l.id, { crew: e.target.value })}
                      className={FILL_IN}
                    >
                      {crews.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </FillField>
                  <FillField label="Tech">
                    <select value={l.who} onChange={(e) => patchLabor(job.jobId, l.id, { who: e.target.value, crew })} className={FILL_IN}>
                      {whoOpts.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </FillField>
                  <FillField label="Type">
                    <select value={l.kind} onChange={(e) => patchLabor(job.jobId, l.id, { kind: e.target.value as LaborKind })} className={FILL_IN}>
                      {PAY_KINDS.map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </FillField>
                  {l.kind === "Piece" ? (
                    <FillField label="Service">
                      <select value={l.service ?? ""} onChange={(e) => patchLabor(job.jobId, l.id, { service: e.target.value })} className={FILL_IN}>
                        {services.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </FillField>
                  ) : (
                    <FillField label={l.kind === "Hourly" ? "Hours" : "Days"}>
                      <input value={l.qty || ""} inputMode="decimal" onChange={(e) => patchLabor(job.jobId, l.id, { qty: Number(e.target.value) || 0 })} className={FILL_IN} />
                    </FillField>
                  )}
                  <FillField label="Rate">
                    <input value={l.rate || ""} inputMode="decimal" onChange={(e) => patchLabor(job.jobId, l.id, { rate: Number(e.target.value) || 0 })} className={FILL_IN} />
                  </FillField>
                  <FillField label="Actual">
                    <input value={l.actual ?? amt} inputMode="decimal" onChange={(e) => patchLabor(job.jobId, l.id, { actual: Number(e.target.value) || 0 })} className={FILL_IN} />
                  </FillField>
                </div>
                <button type="button" aria-label="Remove" className="mb-0 grid size-10 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeLabor(job.jobId, l.id)}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">Crew on the job shows here with their rate. Plus adds another tech.</p>
      )}
    </JobCard>
  );
}

function CommissionCard({ job }: { job: JobFile }) {
  const closers = namesIn("Closer", "Owner");
  const setters = namesIn("Setter");
  const people = [...new Set([...closers, ...setters, job.closer])];
  const td = trueDiscount(job);
  const t = tally(job);
  const canPay = t.collect === 0;
  const [triedPay, setTriedPay] = useState(false);
  const rows = job.commissions?.length
    ? job.commissions
    : [{ id: "CM-seed", who: job.closer, role: "Closer" as const, pct: td.rate, paid: false }];
  const closerN = Math.max(1, rows.filter((c) => c.role !== "Setter").length);

  return (
    <JobCard
      kicker="Commission"
      title={`${td.rate}% after true discount · ${money(t.commission)}${canPay ? "" : " · holds until collected"}`}
      actions={
        <div className="flex gap-1">
          <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addCommission(job.jobId, "Split")}>
            Split
          </button>
          <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addCommission(job.jobId, "Setter")}>
            Setter
          </button>
        </div>
      }
    >
      <p className="mb-3 text-[12px] text-muted">
        0% true discount is 20%. Every 2.5% they give away costs 1% of commission. Field extras do not hit this. Payable only when the job is collected in full.
      </p>
      {!canPay ? (
        <p className={cn("mb-3 text-[12px] font-semibold", triedPay ? "text-alert" : "text-muted")}>
          Left to collect {money(t.collect)}. Commission stays open until that’s $0.
        </p>
      ) : null}
      <ul className="space-y-2">
        {rows.map((c) => (
          <CommRow
            key={c.id}
            job={job}
            row={c}
            people={c.role === "Setter" ? (setters.length ? setters : people) : closers.length ? closers : people}
            amount={c.role === "Setter" ? Math.round(td.base * (c.pct / 100)) : Math.round((td.base * td.rate) / 100 / closerN)}
            closerRate={td.rate}
            canPay={canPay}
            onBlockedPay={() => setTriedPay(true)}
          />
        ))}
      </ul>
    </JobCard>
  );
}

function CommRow({
  job,
  row,
  people,
  amount,
  closerRate,
  canPay,
  onBlockedPay,
}: {
  job: JobFile;
  row: CommShare;
  people: string[];
  amount: number;
  closerRate: number;
  canPay: boolean;
  onBlockedPay: () => void;
}) {
  const names = people.includes(row.who) ? people : [row.who, ...people];
  const locked = row.role !== "Setter";
  return (
    <li className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem_4.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1.4fr)_7rem_5.5rem_4.5rem_auto]">
      <SelectPick value={row.who} onChange={(e) => patchCommission(job.jobId, row.id, { who: e.target.value })}>
        {names.map((n) => (
          <option key={n}>{n}</option>
        ))}
      </SelectPick>
      <SelectPick
        className="hidden sm:block"
        value={row.role}
        onChange={(e) => patchCommission(job.jobId, row.id, { role: e.target.value as CommShare["role"] })}
      >
        <option>Closer</option>
        <option>Split</option>
        <option>Setter</option>
      </SelectPick>
      <label className="relative">
        <input
          value={locked ? closerRate : row.pct || ""}
          inputMode="decimal"
          readOnly={locked}
          onChange={(e) => {
            if (locked) return;
            patchCommission(job.jobId, row.id, { pct: Number(e.target.value) || 0 });
          }}
          className={cn("h-10 w-full rounded-md border border-line pr-6 pl-2 text-sm tabular-nums", locked && "bg-page text-muted")}
        />
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[11px] text-muted">%</span>
      </label>
      <span className="text-right text-sm font-semibold tabular-nums">{money(amount)}</span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (!row.paid && !canPay) {
              onBlockedPay();
              return;
            }
            patchCommission(job.jobId, row.id, { paid: !row.paid });
          }}
          className={cn("h-8 rounded-md px-2 text-[11px] font-semibold", row.paid ? "bg-up-bg text-up" : !canPay ? "border border-line text-muted" : "border border-line text-muted")}
        >
          {row.paid ? "Paid" : canPay ? "Open" : "Hold"}
        </button>
        {job.commissions && job.commissions.length > 1 ? (
          <Tip label="Remove" on>
            <button type="button" aria-label="Remove commission" className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-alert" onClick={() => removeCommission(job.jobId, row.id)}>
              <Trash2 className="size-4" />
            </button>
          </Tip>
        ) : null}
      </span>
    </li>
  );
}

function PnLSheet({ job, readOnly = false }: { job: JobFile; readOnly?: boolean }) {
  const t = tally(job);
  const of = t.revenue;
  const products = job.scope.filter((s) => s.kind === "product");
  const adders = job.scope.filter((s) => s.kind === "adder");
  const discounts = job.scope.filter((s) => s.kind === "discount" || s.amount < 0);
  const cos = job.changeOrders.filter((c) => c.lane !== "finance" && c.status === "Approved" && c.signed);
  const productAmt = products.reduce((s, r) => s + r.amount, 0);
  const adderAmt = adders.reduce((s, r) => s + r.amount, 0);
  const discAmt = discounts.reduce((s, r) => s + Math.abs(r.amount), 0);
  const coAmt = cos.reduce((s, c) => s + c.amount, 0);
  const fee = job.loan.vendor === "GoodLeap" ? job.loan.dealerFee : 0;
  const bom = job.scope.flatMap((s) =>
    s.bom.map((b) => ({
      id: `${s.id}-${b.id}`,
      name: b.name,
      qty: b.usedQty || b.orderQty || b.estQty,
      cost: bomJobCost(b),
    })),
  );
  const shares = job.commissions?.length
    ? job.commissions
    : [{ id: "CM-seed", who: job.closer, role: "Closer" as const, pct: t.trueDiscount.rate, paid: false }];
  const closerN = Math.max(1, shares.filter((c) => c.role !== "Setter").length);
  const grade = marginGrade(of ? t.gross / of : 0);

  return (
    <div>
      <div className={cn("mb-4 flex items-center justify-between gap-3 rounded-md px-3 py-2.5", grade.wash)}>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{grade.label}</p>
          <p className="text-[11px] opacity-80">{grade.note}</p>
        </div>
        <p className="shrink-0 text-sm font-extrabold tabular-nums">{pct(t.gross, of)}</p>
      </div>
      <div className="text-sm">
        <Fold label="Total Contract" value={t.revenue} of={of}>
          <Fold label="Products" value={productAmt} of={of} nest>
            {products.map((s) => (
              <Line key={s.id} label={s.label} value={s.amount} of={of} />
            ))}
          </Fold>
          <Fold label="Adders" value={adderAmt} of={of} nest>
            {adders.length ? adders.map((s) => <Line key={s.id} label={s.label} value={s.amount} of={of} />) : <p className="py-1 text-[12px] text-muted">None.</p>}
          </Fold>
          <Fold label="Discounts" value={-discAmt} of={of} nest>
            {discounts.length ? discounts.map((s) => <Line key={s.id} label={s.label} value={-Math.abs(s.amount)} of={of} />) : <p className="py-1 text-[12px] text-muted">None.</p>}
          </Fold>
          <Fold label="Change orders" value={coAmt} of={of} nest>
            {cos.length ? cos.map((c) => <Line key={c.id} label={c.why} value={c.amount} of={of} />) : <p className="py-1 text-[12px] text-muted">None approved.</p>}
          </Fold>
        </Fold>

        <Fold label="Total Costs" value={t.cogs} of={of} tone="cost">
          <Fold label="Labor" value={t.labor} of={of} nest tone="cost">
            {t.laborRows.map((r, i) => (
              <Line key={`${r.who}-${i}`} label={`${r.who} · ${r.kind}${r.note ? ` · ${r.note}` : ""}`} value={r.amount} of={of} tone="cost" />
            ))}
          </Fold>
          <Fold label="Materials" value={t.mats} of={of} nest tone="cost">
            {bom.map((b) => (
              <Line key={b.id} label={`${b.name} · ${b.qty}`} value={b.cost} of={of} tone="cost" />
            ))}
            {t.materialReturns ? <Line label="Supplier returns" value={t.materialReturns} of={of} /> : null}
            {t.warehouse ? <Line label="Warehouse stock" value={t.warehouse} of={of} /> : null}
          </Fold>
          {fee ? <Line label="Dealer fee" value={fee} of={of} tone="cost" /> : null}
          {job.extras ? <Line label="Other" value={job.extras} of={of} tone="cost" /> : null}
          {t.trueDiscount.fieldHits ? <Line label="Field extras" value={t.trueDiscount.fieldHits} of={of} tone="cost" /> : null}
        </Fold>

        <Fold label="Gross Profit" value={t.gross} of={of} alert={t.gross < 0}>
          <Line label="Total Contract" value={t.revenue} of={of} />
          <Line label="Total Costs" value={-t.cogs} of={of} tone="cost" />
          <Line label="Gross Profit" value={t.gross} of={of} />
        </Fold>

        <Fold label="Total Commissions" value={t.commission} of={of}>
          {shares.map((c) => (
            <Line
              key={c.id}
              label={`${c.who} · ${c.role} · ${c.role === "Setter" ? c.pct : t.trueDiscount.rate}%`}
              value={c.role === "Setter" ? Math.round(t.trueDiscount.base * (c.pct / 100)) : Math.round((t.trueDiscount.base * t.trueDiscount.rate) / 100 / closerN)}
              of={of}
            />
          ))}
          <Line label="After commission" value={t.margin} of={of} alert={t.margin < 0} />
        </Fold>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-line p-3">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Left to collect</p>
          <p className={cn("mt-1 text-lg font-extrabold tabular-nums", t.collect > 0 ? "text-alert" : "text-up")}>{money(t.collect)}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            Paid {money(t.paid)}
            {t.funded ? ` · Funded ${money(t.funded)}` : ""}
            {t.refunds ? ` · Refunded ${money(t.refunds)}` : ""}
          </p>
        </div>
        <div className="rounded-md border border-line p-3">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{t.overUnder > 0 ? "Overbilled" : t.overUnder < 0 ? "Underbilled" : "Billed"}</p>
          <p className={cn("mt-1 text-lg font-extrabold tabular-nums", t.overUnder < 0 ? "text-alert" : "text-ink")}>
            {t.overUnder === 0 ? "Even" : money(Math.abs(t.overUnder))}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            Invoiced {money(t.invoiced)} of {money(t.revenue)}
          </p>
        </div>
        <div className="rounded-md border border-line p-3">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">True discount</p>
          <p className={cn("mt-1 text-lg font-extrabold tabular-nums", t.trueDiscount.dollars > 0 ? "text-alert" : "text-up")}>{t.trueDiscount.pct.toFixed(1)}%</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {money(t.trueDiscount.dollars)} · closer {t.trueDiscount.rate}%
          </p>
        </div>
      </div>

      <TrueDiscountHits job={job} readOnly={readOnly} />
    </div>
  );
}

function TrueDiscountHits({ job, readOnly = false }: { job: JobFile; readOnly?: boolean }) {
  const listed = job.scope.filter((s) => s.kind === "discount" || s.amount < 0);
  const sales = (job.costHits ?? []).filter((h) => h.kind === "sales");
  const [reason, setReason] = useState<SalesFault>(SALES_FAULTS[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Sales misses</p>
      <p className="mt-0.5 text-[12px] text-muted">Misquotes, mismeasures, missed adders, free promises. Not used qty or supplier price.</p>
      <ul className="mt-2 divide-y divide-line">
        {listed.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span>Listed discount · {s.label}</span>
            <span className="font-semibold tabular-nums text-alert">{money(Math.abs(s.amount))}</span>
          </li>
        ))}
        {sales.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span>
              {h.reason}
              {h.note ? ` · ${h.note}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold tabular-nums text-alert">{money(h.amount)}</span>
              {readOnly ? null : (
              <button type="button" aria-label="Remove" className="grid size-8 place-items-center rounded-md text-muted hover:text-alert" onClick={() => removeCostHit(job.jobId, h.id)}>
                <Trash2 className="size-4" />
              </button>
              )}
            </span>
          </li>
        ))}
        {!listed.length && !sales.length ? <li className="py-1.5 text-sm text-muted">None on this file.</li> : null}
      </ul>
      {readOnly ? null : (
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1.2fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          addCostHit(job.jobId, "sales", reason, Number(amount) || 0, note);
          setAmount("");
          setNote("");
        }}
      >
        <select value={reason} onChange={(e) => setReason(e.target.value as SalesFault)} className={FILL_IN}>
          {SALES_FAULTS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="$" className={FILL_IN} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className={FILL_IN} />
        <button type="submit" className="h-10 rounded-md bg-navy px-3 text-[12px] font-semibold text-card">
          Add
        </button>
      </form>
      )}
    </div>
  );
}

function Fold({
  label,
  value,
  of,
  nest,
  tone,
  alert,
  children,
}: {
  label: string;
  value: number;
  of: number;
  nest?: boolean;
  tone?: "cost";
  alert?: boolean;
  children?: ReactNode;
}) {
  const [on, setOn] = useState(false);
  const red = tone === "cost" || alert;
  return (
    <div>
      <button type="button" onClick={() => setOn((v) => !v)} className={cn("flex w-full min-w-0 items-center gap-2 py-1.5 text-left", nest ? "text-[13px]" : "text-sm")}>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", on && "rotate-180")} />
        <span className={cn("min-w-0 flex-1 truncate font-semibold", red && "text-alert")}>{label}</span>
        <span className={cn("w-10 shrink-0 text-right text-[11px] font-semibold", red ? "text-alert/70" : "text-muted")}>{pct(value, of)}</span>
        <span className={cn("min-w-[5.5rem] shrink-0 text-right font-extrabold tabular-nums", red ? "text-alert" : "text-ink")}>{money(value)}</span>
      </button>
      {on ? <div className="ml-6">{children}</div> : null}
    </div>
  );
}

function Line({
  label,
  value,
  of,
  tone,
  alert,
}: {
  label: string;
  value: number;
  of: number;
  tone?: "cost";
  alert?: boolean;
}) {
  const red = tone === "cost" || alert;
  return (
    <div className="flex min-w-0 items-baseline gap-2 py-1 text-[13px]">
      <span className={cn("min-w-0 flex-1 truncate", red && "text-alert")}>{label}</span>
      <span className={cn("w-10 shrink-0 text-right text-[11px] font-semibold", red ? "text-alert/70" : "text-muted")}>{pct(value, of)}</span>
      <span className={cn("min-w-[5.5rem] shrink-0 text-right font-semibold tabular-nums", red ? "text-alert" : "text-ink")}>{money(value)}</span>
    </div>
  );
}

function payTone(s: string): Tone {
  if (s === "Paid") return "up";
  if (s === "Past due" || s === "NSF" || s === "Card declined") return "alert";
  if (s === "Void" || s === "Refunded" || s === "Draft") return "muted";
  return "navy";
}

function PayPill({ value, onChange }: { value: (typeof PAY)[number]; onChange: (s: (typeof PAY)[number]) => void }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Invoice status"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", stageWash(payTone(value)))}
      >
        {value}
        <ChevronDown className="size-3" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {PAY.map((s) => (
            <button
              key={s}
              type="button"
              className={cn("block w-full min-w-44 px-3 py-2 text-left text-sm hover:bg-page", s === value && "font-semibold")}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              <span className={cn("mr-2 inline-block size-2 rounded-full", stageWash(payTone(s)))} />
              {s}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

function SelectPick({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select {...props} className="h-10 w-full appearance-none rounded-md border border-line bg-card py-0 pr-9 pl-2 text-sm outline-none focus:border-navy">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted" />
    </span>
  );
}

function CoCard({
  kicker,
  title,
  empty,
  rows,
  onAdd,
  locked,
  onSign,
  signLabel,
  signedLabel,
}: {
  kicker: string;
  title: string;
  empty: string;
  rows: JobFile["changeOrders"];
  onAdd: () => void;
  locked?: boolean;
  onSign: (id: string) => void;
  signLabel: string;
  signedLabel: string;
}) {
  return (
    <JobCard
      kicker={kicker}
      title={title}
      actions={
        <button type="button" disabled={locked} className="h-8 rounded-md border border-line px-3 text-xs font-semibold disabled:opacity-40" onClick={onAdd}>
          Add
        </button>
      }
    >
      {rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : null}
      <ul className="space-y-2 text-sm">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2">
            <span>
              {c.why} · {money(c.amount)}
            </span>
            {c.signed ? (
              <span className="text-[12px] text-up">{signedLabel}</span>
            ) : (
              <button type="button" className="text-xs font-semibold text-navy" onClick={() => onSign(c.id)}>
                {signLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </JobCard>
  );
}