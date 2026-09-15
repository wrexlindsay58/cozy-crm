import { ProductPicker } from "./picker";
import { OptionCard } from "./option-card";
import { PayTiles } from "./pay-tiles";
import type { Proposal } from "./store";

export function OppWorkspace({ proposal }: { proposal: Proposal }) {
  return (
    <div className="space-y-3">
      <ProductPicker proposal={proposal} />
      <div className="grid gap-3 xl:grid-cols-3">
        {proposal.options.map((opt) => (
          <OptionCard key={opt.id} proposal={proposal} option={opt} />
        ))}
      </div>
      <PayTiles proposal={proposal} />
    </div>
  );
}
