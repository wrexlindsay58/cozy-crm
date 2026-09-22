import { useState } from "react";
import { Pencil } from "lucide-react";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { lineAmount, optionTotal, useProposal, type OptCard, type Proposal } from "./store";
import { OptionCard } from "./option-card";
import { PayOnOption } from "./pay-on-option";

function OptionRead({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const accepted = proposal.accepted === option.id;
  return (
    <article className={cn("rounded-md border bg-card p-4", accepted ? "border-navy bg-info-bg/40 ring-1 ring-navy" : "border-line")}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {option.name}
          {accepted ? <span className="ml-2 text-[11px] font-bold tracking-wide text-navy uppercase">Sold</span> : null}
        </h3>
        <p className="text-lg font-extrabold tabular-nums">{money(optionTotal(option))}</p>
      </div>
      <ul className="space-y-1.5">
        {option.lines.map((l) => (
          <li key={l.sku} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {l.label}
              {l.qty !== 1 ? ` · ${l.qty}` : ""}
            </span>
            <span className="shrink-0 tabular-nums text-muted">{l.kind === "discount" && l.pct ? `−${l.pct}%` : money(lineAmount(l))}</span>
          </li>
        ))}
      </ul>
      <PayOnOption proposal={proposal} option={option} />
    </article>
  );
}

export function OppSnap({ oppId }: { oppId: string }) {
  const proposal = useProposal(oppId);
  const [edit, setEdit] = useState(false);
  if (!proposal) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Opportunity</h2>
          <p className="mt-0.5 text-[11px] text-muted">{proposal.oppId}</p>
        </div>
        <Tip label={edit ? "Done" : "Edit"} on>
          <button
            type="button"
            aria-label={edit ? "Done editing" : "Edit opportunity"}
            onClick={() => setEdit((v) => !v)}
            className={cn("grid size-8 place-items-center rounded-md", edit ? "bg-navy text-card" : "text-muted hover:bg-page hover:text-navy")}
          >
            <Pencil className="size-4" />
          </button>
        </Tip>
      </div>
      {edit
        ? proposal.options.map((opt) => <OptionCard key={opt.id} proposal={proposal} option={opt} />)
        : proposal.options.map((opt) => <OptionRead key={opt.id} proposal={proposal} option={opt} />)}
    </div>
  );
}