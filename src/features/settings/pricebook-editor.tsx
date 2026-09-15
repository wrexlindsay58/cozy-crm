import { useState } from "react";
import { money } from "@/lib/crm-data";
import { addRule, buildOption, optionTotal, patchItem, productsOf, removeRule, upsertItem, useCatalog } from "@/features/catalog/store";

export function PricebookEditor() {
  const catalog = useCatalog();
  const products = productsOf(catalog);
  const [picked, setPicked] = useState<string[]>(["hvac"]);
  const preview = buildOption(picked, catalog);
  const [label, setLabel] = useState("");
  const [sku, setSku] = useState("");
  return (
    <div className="space-y-3">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Catalog</h2>
        <ul className="space-y-2 text-sm">
          {catalog.items.map((item) => (
            <li key={item.sku} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
              <span className="font-semibold">{item.label} <span className="text-muted">· {item.sku}</span></span>
              <span className="tabular-nums">{money(item.sell)}</span>
              <button type="button" onClick={() => patchItem(item.sku, { active: !item.active })} className="h-9 rounded-md border border-line px-2 text-xs font-semibold">{item.active ? "On" : "Off"}</button>
            </li>
          ))}
        </ul>
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); upsertItem({ sku, label, sell: 0, cost: 0, kind: "product", active: true }); setLabel(""); setSku(""); }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="h-11 rounded-md border border-line px-3 text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="sku" className="h-11 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add SKU</button>
        </form>
      </section>
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Rules</h2>
        <ul className="mb-3 space-y-2 text-sm">
          {catalog.rules.map((r) => (
            <li key={r.id} className="flex justify-between">When {r.whenSku} offer {r.offerSku} <button type="button" onClick={() => removeRule(r.id)} className="text-xs font-semibold">Remove</button></li>
          ))}
        </ul>
        <button type="button" onClick={() => addRule("hvac", "windows", false)} className="h-9 rounded-md border border-line px-3 text-xs font-semibold">Add HVAC → windows</button>
      </section>
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Preview</h2>
        <div className="mb-2 flex flex-wrap gap-1">{products.map((p) => <button key={p.sku} type="button" onClick={() => setPicked((cur) => cur.includes(p.sku) ? cur.filter((s) => s !== p.sku) : [...cur, p.sku])} className={picked.includes(p.sku) ? "h-9 rounded-md bg-navy px-2 text-xs font-semibold text-card" : "h-9 rounded-md border border-line px-2 text-xs font-semibold"}>{p.label}</button>)}</div>
        <p className="text-sm font-extrabold">Total {money(optionTotal(preview))}</p>
      </section>
    </div>
  );
}
