import { pct } from "./bits-01";
import { Fold } from "./bits-06";
import { Line } from "./bits-07";
import { usePnLSheet } from "./usePnLSheet";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

export function VPnLSheet01({ bag }: { bag: ReturnType<typeof usePnLSheet> }) {
  const { adderAmt, adders, bom, closerN, coAmt, cos, discAmt, discounts, fee, grade, job, of, productAmt, products, shares, t } = bag;
  return (
    <>
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
    </>
  );
}
