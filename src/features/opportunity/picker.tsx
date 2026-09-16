import { productsOf, useCatalog } from "@/features/catalog/store";
import { toggleProduct, type Proposal } from "./store";
import { cn } from "@/lib/cn";

export function ProductPicker({ proposal }: { proposal: Proposal }) {
  const catalog = useCatalog();
  const products = productsOf(catalog);
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Products</h2>
      <p className="mb-3 text-[11px] text-muted">On puts it on every option. Off takes it off every option. Customize each option below.</p>
      <div className="flex flex-wrap gap-1.5">
        {products.map((p) => {
          const on = proposal.products.includes(p.sku) || proposal.options.some((o) => o.lines.some((l) => l.sku === p.sku));
          return (
            <button
              key={p.sku}
              type="button"
              disabled={Boolean(proposal.accepted)}
              onClick={() => toggleProduct(proposal.oppId, p.sku)}
              className={cn(
                "h-10 rounded-md px-3 text-sm font-semibold",
                on ? "bg-navy text-card" : "border border-line bg-card hover:border-navy",
                proposal.accepted && "opacity-60",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
