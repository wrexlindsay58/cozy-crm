import { useMoneyBlock } from "./useMoneyBlock";
import { VMoneyBlockRoot } from "./VMoneyBlockRoot";
import { usePnLSheet } from "./usePnLSheet";
import { VPnLSheetRoot } from "./VPnLSheetRoot";
import type { JobFile } from "../store";

export function MoneyBlock({ job }: { job: JobFile }) {
  const bag = useMoneyBlock({ job });
  return <VMoneyBlockRoot bag={bag} />;
}

export type MoneyBlockBag = Parameters<typeof VMoneyBlockRoot>[0]["bag"];

export function PnLSheet({ job, readOnly = false }: { job: JobFile; readOnly?: boolean }) {
  const bag = usePnLSheet({ job, readOnly });
  return <VPnLSheetRoot bag={bag} />;
}

export type PnLSheetBag = Parameters<typeof VPnLSheetRoot>[0]["bag"];

export * from "./bits-01";
export * from "./bits-02";
export * from "./bits-03";
export * from "./bits-04";
export * from "./bits-05";
export * from "./bits-06";
export * from "./bits-07";
export * from "./bits-08";
export * from "./useMoneyBlock";
export * from "./VMoneyBlock01";
export * from "./VMoneyBlock02";
export * from "./VMoneyBlockRoot";
export * from "./usePnLSheet";
export * from "./VPnLSheet01";
export * from "./VPnLSheet02";
export * from "./VPnLSheetRoot";
