import { useState } from "react";
import { addProfile, patchProfile, toggleProfile, useProdProfiles } from "./profiles";

export function ProductionProfileSettings() {
  const rows = useProdProfiles();
  const [name, setName] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">What a scope needs on the job. Attic doesn’t get serials. HVAC does. Solar needs a design and utility. Ducts need a layout before you order WinSupply.</p>
      {rows.map((p) => (
        <section key={p.id} className="rounded-md border border-line bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">{p.label}</h2>
              <p className="text-[12px] text-muted">{p.supplier || "No supplier"} · {p.process}</p>
            </div>
            <button type="button" onClick={() => toggleProfile(p.id)} className="h-9 rounded-md border border-line px-3 text-[11px] font-semibold">
              {p.on ? "On" : "Off"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(
              [
                ["needsPlan", "Plan"],
                ["planCustomerApproval", "Customer signs plan"],
                ["needsUtility", "Utility"],
                ["needsPermit", "Permit"],
                ["needsSerial", "Serials"],
                ["needsTestOut", "QC numbers"],
              ] as const
            ).map(([k, lab]) => (
              <button key={k} type="button" onClick={() => patchProfile(p.id, { [k]: !p[k] })} className={p[k] ? "h-8 rounded-md bg-navy px-2.5 text-[12px] font-semibold text-card" : "h-8 rounded-md border border-line px-2.5 text-[12px] font-semibold"}>
                {lab}
              </button>
            ))}
          </div>
          <input value={p.supplier} onChange={(e) => patchProfile(p.id, { supplier: e.target.value })} placeholder="Supplier" className="mt-3 h-10 w-full rounded-md border border-line px-3 text-sm" />
        </section>
      ))}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addProfile(name);
          setName("");
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="h-11 flex-1 rounded-md border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add
        </button>
      </form>
    </div>
  );
}
