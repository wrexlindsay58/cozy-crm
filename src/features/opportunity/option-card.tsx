import { useState } from "react";
import { Plus, X } from "lucide-react";
import { money } from "@/lib/crm-data";
import { productsOf, useCatalog } from "@/features/catalog/store";
import { Float } from "@/components/float";
import { acceptOption, addLine, optionTotal, removeLine, removeOption, renameOption, setQty, type OptCard, type Proposal } from "./store";
import { cn } from "@/lib/cn";

export function OptionCard({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const accepted = proposal.accepted === option.id;
  const locked = Boolean(proposal.accepted);
  const total = optionTotal(option);
  const catalog = useCatalog();
  const extra = productsOf(catalog).filter((p) => !option.lines.some((l) => l.sku === p.sku));
  const [addOpen, setAddOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  return (
    <article className={cn("flex flex-col rounded-md border p-4", accepted ? "border-navy bg-navy text-card" : "border-line bg-card")}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <input
          value={option.name}
          disabled={locked}
          onChange={(e) => renameOption(proposal.oppId, option.id, e.target.value)}
          className={cn("min-w-0 flex-1 bg-transparent text-sm font-bold tracking-wide uppercase outline-none", accepted ? "text-card" : "")}
        />
        <p className="text-lg font-extrabold tabular-nums">{money(total)}</p>
        {!locked && proposal.options.length > 1 ? (
          <button type="button" aria-label="Remove option" className="grid size-8 place-items-center text-muted hover:text-alert" onClick={() => removeOption(proposal.oppId, option.id)}>
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <ul className="space-y-2">
        {option.lines.map((l) => (
          <li key={l.sku} className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1">
              {l.label}
              {l.adder ? <span className={accepted ? "text-card/70" : "text-muted"}> · adder</span> : null}
            </span>
            <input
              type="number"
              min={1}
              max={9}
              disabled={locked}
              value={l.qty}
              onChange={(e) => setQty(proposal.oppId, option.id, l.sku, Number(e.target.value))}
              className={cn("h-9 w-12 rounded border px-1 text-center text-sm tabular-nums", accepted ? "border-card/40 bg-navy text-card" : "border-line bg-card")}
            />
            <span className="w-16 text-right tabular-nums">{money(l.unit * l.qty)}</span>
            {!locked ? (
              <button type="button" aria-label={`Take off ${l.label}`} className="grid size-8 place-items-center text-muted hover:text-alert" onClick={() => removeLine(proposal.oppId, option.id, l.sku)}>
                <X className="size-3.5" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {!locked ? (
        <div className="mt-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={(e) => {
              setAnchor(e.currentTarget.getBoundingClientRect());
              setAddOpen((v) => !v);
            }}
          >
            <Plus className="size-4" />
            Add product
          </button>
          {addOpen && anchor ? (
            <Float anchor={anchor} prefer="bottom" onClose={() => setAddOpen(false)}>
              {extra.length === 0 ? <p className="px-3 py-2 text-sm text-muted">All products are on this option.</p> : null}
              {extra.map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  className="flex h-10 w-full min-w-48 items-center justify-between gap-3 px-3 text-sm hover:bg-page"
                  onClick={() => {
                    addLine(proposal.oppId, option.id, p.sku);
                    setAddOpen(false);
                  }}
                >
                  <span>{p.label}</span>
                  <span className="tabular-nums text-muted">{money(p.sell)}</span>
                </button>
              ))}
            </Float>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        disabled={locked}
        onClick={() => acceptOption(proposal.oppId, option.id)}
        className={cn("mt-4 h-11 rounded-md text-sm font-semibold", accepted ? "bg-card text-navy" : "border border-line hover:border-navy")}
      >
        {accepted ? "Accepted / job scope" : "Accept this option"}
      </button>
    </article>
  );
}
