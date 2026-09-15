import { money } from "@/lib/crm-data";
import { acceptOption, optionTotal, setQty, toggleLine, type OptCard, type Proposal } from "./store";
import { cn } from "@/lib/cn";

export function OptionCard({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const accepted = proposal.accepted === option.id;
  const locked = Boolean(proposal.accepted);
  const total = optionTotal(option);
  return (
    <article className={cn("flex flex-col rounded-md border p-4", accepted ? "border-navy bg-navy text-card" : "border-line bg-card")}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold tracking-wide uppercase">{option.name}</h3>
        <p className="text-lg font-extrabold tabular-nums">{money(total)}</p>
      </div>
      <ul className="space-y-2">
        {option.lines.map((l) => (
          <li key={l.sku} className="flex items-center gap-2 text-sm">
            <button type="button" disabled={locked} onClick={() => toggleLine(proposal.oppId, option.id, l.sku)} className={cn("grid size-9 shrink-0 place-items-center rounded border text-xs font-bold", l.on ? (accepted ? "border-card bg-card text-navy" : "border-navy bg-navy text-card") : "border-line")} aria-pressed={l.on}>
              {l.on ? "On" : "Off"}
            </button>
            <span className="min-w-0 flex-1">
              {l.label}
              {l.adder ? <span className={accepted ? "text-card/70" : "text-muted"}> · adder</span> : null}
            </span>
            <input type="number" min={1} max={9} disabled={locked} value={l.qty} onChange={(e) => setQty(proposal.oppId, option.id, l.sku, Number(e.target.value))} className={cn("h-9 w-12 rounded border px-1 text-center text-sm tabular-nums", accepted ? "border-card/40 bg-navy text-card" : "border-line bg-card")} />
            <span className="w-16 text-right tabular-nums">{money(l.on ? l.unit * l.qty : 0)}</span>
          </li>
        ))}
      </ul>
      <button type="button" disabled={locked} onClick={() => acceptOption(proposal.oppId, option.id)} className={cn("mt-4 h-11 rounded-md text-sm font-semibold", accepted ? "bg-card text-navy" : "border border-line hover:border-navy")}>
        {accepted ? "Accepted / job scope" : "Accept this option"}
      </button>
    </article>
  );
}
