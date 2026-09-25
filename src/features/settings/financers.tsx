import { useState } from "react";
import { setMethodFee, setMethodPlans, toggleFinancer, useMoneySettings, type FinancePlan } from "@/features/money-settings/store";

export function FinancersPanel() {
  const { financers } = useMoneySettings();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {financers.map((f) => (
        <li key={f.id} className="px-4 py-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{f.name}</p>
              <p className="type-meta mt-0.5 capitalize">{f.kind === "ach" ? "ACH" : f.kind}</p>
            </div>
            {f.kind === "finance" ? null : (
              <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
                Fee %
                <input
                  defaultValue={f.feePct}
                  inputMode="decimal"
                  onBlur={(e) => setMethodFee(f.id, Number(e.target.value) || 0)}
                  className="mt-1 block h-10 w-20 rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal"
                />
              </label>
            )}
            <button type="button" onClick={() => toggleFinancer(f.id)} className="h-10 rounded-md border border-line px-3 text-xs font-semibold">
              {f.active ? "On" : "Off"}
            </button>
          </div>
          {f.kind === "finance" ? <PlanEditor id={f.id} plans={f.plans ?? []} /> : null}
        </li>
      ))}
    </ul>
  );
}

function PlanEditor({ id, plans }: { id: string; plans: FinancePlan[] }) {
  const [months, setMonths] = useState("120");
  const [apr, setApr] = useState("6.99");
  const [fee, setFee] = useState("12");
  return (
    <div className="mt-3">
      <ul className="space-y-2">
        {plans.map((p, i) => (
          <li key={`${p.months}-${p.apr}-${i}`} className="grid grid-cols-[5rem_5rem_5rem_auto] items-end gap-2">
            <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
              Months
              <input
                defaultValue={p.months}
                inputMode="numeric"
                onBlur={(e) => {
                  const next = plans.map((row, n) => (n === i ? { ...row, months: Number(e.target.value) || row.months } : row));
                  setMethodPlans(id, next);
                }}
                className="mt-1 block h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal"
              />
            </label>
            <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
              Rate %
              <input
                defaultValue={p.apr}
                inputMode="decimal"
                onBlur={(e) => setMethodPlans(id, plans.map((row, n) => (n === i ? { ...row, apr: Number(e.target.value) || 0 } : row)))}
                className="mt-1 block h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal"
              />
            </label>
            <label className="text-[11px] font-bold tracking-wide text-muted uppercase">
              Fee %
              <input
                defaultValue={p.feePct}
                inputMode="decimal"
                onBlur={(e) => setMethodPlans(id, plans.map((row, n) => (n === i ? { ...row, feePct: Number(e.target.value) || 0 } : row)))}
                className="mt-1 block h-10 w-full rounded-md border border-line px-2 text-sm font-semibold normal-case tracking-normal"
              />
            </label>
            <button type="button" className="h-10 text-sm font-semibold text-alert" onClick={() => setMethodPlans(id, plans.filter((_, n) => n !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setMethodPlans(id, [...plans, { months: Number(months) || 12, apr: Number(apr) || 0, feePct: Number(fee) || 0 }]);
        }}
      >
        <input value={months} onChange={(e) => setMonths(e.target.value)} inputMode="numeric" placeholder="Months" className="h-10 w-24 rounded-md border border-line px-2 text-sm" />
        <input value={apr} onChange={(e) => setApr(e.target.value)} inputMode="decimal" placeholder="Rate %" className="h-10 w-24 rounded-md border border-line px-2 text-sm" />
        <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="decimal" placeholder="Fee %" className="h-10 w-24 rounded-md border border-line px-2 text-sm" />
        <button type="submit" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add rate
        </button>
      </form>
    </div>
  );
}
