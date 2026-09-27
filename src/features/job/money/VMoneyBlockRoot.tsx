import { useMoneyBlock } from "./useMoneyBlock";
import { VMoneyBlock01 } from "./VMoneyBlock01";
import { VMoneyBlock02 } from "./VMoneyBlock02";

export function VMoneyBlockRoot({ bag }: { bag: ReturnType<typeof useMoneyBlock> }) {
  return (
    <div className="space-y-2">
      <VMoneyBlock01 bag={bag} /><VMoneyBlock02 bag={bag} /></div>
  );
}
