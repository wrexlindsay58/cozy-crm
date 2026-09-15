import { useState } from "react";
import { setDealerFeePct } from "@/features/money-settings/store";

export function CompanyForm() {
  const [name, setName] = useState("Cozy Home Performance");
  const [fiscal, setFiscal] = useState("January");
  const [fee, setFee] = useState("5");
  const [saved, setSaved] = useState("");

  return (
    <form
      className="max-w-lg space-y-3 rounded-md border border-line bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setDealerFeePct(Number(fee) || 0);
        setSaved("Saved on this device. Not Odin.");
      }}
    >
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Company</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Fiscal start</span>
        <select value={fiscal} onChange={(e) => setFiscal(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line px-2 text-sm">
          {["January", "July", "October"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">GoodLeap dealer fee %</span>
        <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="numeric" className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
        Save
      </button>
      {saved ? <p className="text-sm text-up">{saved}</p> : null}
    </form>
  );
}
