import { useState } from "react";
import { money } from "@/lib/crm-data";
import { patchItem, rebatesOf, upsertItem, useCatalog } from "@/features/catalog/store";

export function RebateRows() {
  const catalog = useCatalog();
  const rows = rebatesOf(catalog);
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [when, setWhen] = useState<"pos" | "after">("after");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Rebates</h2>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.sku} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              <b>{r.label}</b>
              <span className="text-muted"> · {money(Math.abs(r.sell))}</span>
            </span>
            <select
              value={r.rebateWhen ?? "after"}
              onChange={(e) => patchItem(r.sku, { rebateWhen: e.target.value as "pos" | "after" })}
              className="h-10 rounded-md border border-line px-2 text-sm"
            >
              <option value="pos">Point of sale</option>
              <option value="after">After sale</option>
            </select>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem_10rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          const label = name.trim();
          if (!label) return;
          upsertItem({
            sku: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            label,
            sell: -Math.abs(Number(amt) || 0),
            cost: 0,
            kind: "discount",
            rebate: true,
            rebateWhen: when,
            active: true,
          });
          setName("");
          setAmt("");
          setWhen("after");
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-11 rounded-md border border-line px-3 text-sm" />
        <input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" placeholder="$" className="h-11 rounded-md border border-line px-3 text-sm" />
        <select value={when} onChange={(e) => setWhen(e.target.value as "pos" | "after")} className="h-11 rounded-md border border-line px-2 text-sm">
          <option value="pos">Point of sale</option>
          <option value="after">After sale</option>
        </select>
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add
        </button>
      </form>
    </section>
  );
}
