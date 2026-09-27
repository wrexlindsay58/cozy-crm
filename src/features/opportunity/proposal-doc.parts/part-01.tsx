import { useCatalog } from "@/features/catalog/store";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { useOps } from "@/features/ops/store";
import { acceptOption, optionRollup, sendToSign, type Proposal } from "../store";
import { useBrand } from "@/features/brand/store";
import { picksOn, scopeLines } from "../proposal-copy";
import { PriceLines } from "../sold-summary";
import { cn } from "@/lib/cn";
import { ProposalDocView2 } from "./part-02";

export function ProposalDoc({ proposal }: { proposal: Proposal }) {
  useCatalog();
  useAssessments();
  const BRAND = useBrand();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const assess = assessmentForLead(proposal.personId);
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <ProposalDocView2 bag={{ BRAND, lead, today, proposal, assess }} />
  );
}

export function Row({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

export function ProposalDocView(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <section className="space-y-4 border-b border-line px-5 py-4 md:px-7">
        <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">Options</h3>
        {proposal.options.map((opt: any) => {
          const taken = proposal.accepted === opt.id;
          const roll = optionRollup(opt);
          const included = opt.lines.filter((l: any) => l.kind !== "discount" && !l.rebate);
          return (
            <div key={opt.id} className={cn("rounded-md border p-4", taken ? "border-navy" : "border-line")}>
              <h4 className="text-sm font-extrabold tracking-wide uppercase">{opt.name}</h4>
              <p className="mt-3 text-[11px] font-bold tracking-wide text-muted uppercase">Included</p>
              <ul className="mt-1 space-y-1 text-sm">
                {included.map((l: any) => (
                  <li key={l.sku}>
                    {l.label}
                    {picksOn(l) ? <span className="text-muted"> · {picksOn(l)}</span> : null}
                    {l.qty > 1 ? <span className="text-muted"> · {l.qty}</span> : null}
                  </li>
                ))}
              </ul>
              <PriceLines roll={roll} />
              <div className="mt-3">
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Scope</p>
                <p className="mt-1 text-sm">We will {scopeLines(opt).join("; ").toLowerCase()}.</p>
              </div>
              <button
                type="button"
                disabled={Boolean(proposal.accepted) && !taken}
                onClick={() => {
                  acceptOption(proposal.oppId, opt.id);
                  sendToSign(proposal.oppId);
                }}
                className={cn("mt-4 h-11 w-full rounded-md text-sm font-semibold", taken ? "bg-navy text-card" : "border border-navy text-navy hover:bg-navy hover:text-card")}
              >
                {taken ? "Accepted · agreement sent to sign" : "Accept and sign"}
              </button>
            </div>
          );
        })}
      </section>
  );
}
