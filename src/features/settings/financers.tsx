import { setDealerFeePct, toggleFinancer, useMoneySettings } from "@/features/money-settings/store";

export function FinancersPanel() {
  const { financers, dealerFeePct } = useMoneySettings();
  return (
    <div className="space-y-3">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">GoodLeap dealer fee</h2>
        <label className="block text-sm">
          <span className="text-muted">Percent on the financed total</span>
          <input
            defaultValue={dealerFeePct}
            inputMode="numeric"
            onBlur={(e) => setDealerFeePct(Number(e.target.value) || 0)}
            className="mt-1 h-11 w-32 rounded-md border border-line px-3 text-sm"
          />
        </label>
        <p className="mt-2 text-sm text-muted">Hale $28,640 financed fee = ${Math.round(28640 * (dealerFeePct / 100)).toLocaleString()}.</p>
      </section>
      <ul className="divide-y divide-line rounded-md border border-line bg-card">
        {financers.map((f) => (
          <li key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              <b>{f.name}</b>
              <span className="text-muted"> · {f.feePct}%</span>
            </span>
            <button type="button" onClick={() => toggleFinancer(f.id)} className="h-10 rounded-md border border-line px-3 text-xs font-semibold">
              {f.active ? "On" : "Off"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
