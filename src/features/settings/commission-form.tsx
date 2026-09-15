import { applyCommissionPct } from "@/features/job/store";
import { setCommissionPct, useMoneySettings } from "@/features/money-settings/store";

export function CommissionForm() {
  const { commissionPct } = useMoneySettings();
  return (
    <section className="max-w-lg rounded-md border border-line bg-card p-4">
      <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Closer commission</h2>
      <label className="block text-sm">
        <span className="text-muted">Percent of sold</span>
        <input
          defaultValue={commissionPct}
          inputMode="numeric"
          onBlur={(e) => {
            const n = Number(e.target.value) || 0;
            setCommissionPct(n);
            applyCommissionPct(n);
          }}
          className="mt-1 h-11 w-32 rounded-md border border-line px-3 text-sm"
        />
      </label>
      <p className="mt-2 text-sm text-muted">Writes the commission line on open jobs. Cho sold $31,250 → ${Math.round(31250 * (commissionPct / 100)).toLocaleString()}.</p>
    </section>
  );
}
