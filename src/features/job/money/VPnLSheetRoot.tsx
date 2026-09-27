import { usePnLSheet } from "./usePnLSheet";
import { VPnLSheet01 } from "./VPnLSheet01";
import { VPnLSheet02 } from "./VPnLSheet02";

export function VPnLSheetRoot({ bag }: { bag: ReturnType<typeof usePnLSheet> }) {
  return (
    <div>
      <VPnLSheet01 bag={bag} /><VPnLSheet02 bag={bag} /></div>
  );
}
