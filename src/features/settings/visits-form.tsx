import { useState } from "react";
import { money } from "@/lib/crm-data";

export function VisitsForm() {
  const [serviceFee, setServiceFee] = useState("189");
  const [serviceCost, setServiceCost] = useState("75");
  const [warrantyCost, setWarrantyCost] = useState("180");
  const [plan, setPlan] = useState("29");

  return (
    <section className="max-w-lg space-y-3 rounded-md border border-line bg-card p-4">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Defaults on the account file</h2>
      <Field label="Service fee" value={serviceFee} onChange={setServiceFee} />
      <Field label="Service cost" value={serviceCost} onChange={setServiceCost} />
      <Field label="Warranty visit cost" value={warrantyCost} onChange={setWarrantyCost} />
      <Field label="Comfort plan / month" value={plan} onChange={setPlan} />
      <p className="text-sm text-muted">
        Service books at {money(Number(serviceFee) || 0)} fee / {money(Number(serviceCost) || 0)} cost. Membership{" "}
        {money(Number(plan) || 0)} / mo.
      </p>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="numeric" className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
    </label>
  );
}
