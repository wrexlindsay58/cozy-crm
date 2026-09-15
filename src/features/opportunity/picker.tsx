import { productsOf, useCatalog } from "@/features/catalog/store";
import { toggleProduct, type Proposal } from "./store";
import { cn } from "@/lib/cn";

export function ProductPicker({ proposal }: { proposal: Proposal }) {
  const catalog = useCatalog();
  const products = productsOf(catalog);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Pricebook</h2>
      <div className="flex flex-wrap gap-1.5">
        {products.map((p) => {
          const on = proposal.products.includes(p.sku);
          return (
            <button key={p.sku} type="button" disabled={Boolean(proposal.accepted)} onClick={() => toggleProduct(proposal.oppId, p.sku)} className={cn("h-10 rounded-md px-3 text-sm font-semibold", on ? "bg-navy text-card" : "border border-line bg-card hover:border-navy", proposal.accepted && "opacity-60")}>
              {p.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
