import { useSalesDashboard1 } from "./useSalesDashboard1";
import { useSalesDashboard2 } from "./useSalesDashboard2";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { VSalesDashboardRoot } from "./VSalesDashboardRoot";

export function SalesDashboard({ embedded = false, filterSlot = null }: { embedded?: boolean; filterSlot?: HTMLElement | null }) {
  const bag0 = useSalesDashboard1({ embedded, filterSlot });
  const bag1 = useSalesDashboard2(bag0);
  const bag2 = useSalesDashboard3(bag1);
  const bag = bag2;
  return <VSalesDashboardRoot bag={bag} />;
}

export type SalesDashboardBag = Parameters<typeof VSalesDashboardRoot>[0]["bag"];

export * from "./bits-01";
export * from "./bits-02";
export * from "./bits-03";
export * from "./bits-04";
export * from "./useSalesDashboard1";
export * from "./useSalesDashboard2";
export * from "./useSalesDashboard3";
export * from "./VSalesDashboard01";
export * from "./VSalesDashboard02";
export * from "./VSalesDashboard03";
export * from "./VSalesDashboard04";
export * from "./VSalesDashboard05";
export * from "./VSalesDashboard06";
export * from "./VSalesDashboard07";
export * from "./VSalesDashboard08";
export * from "./VSalesDashboard09";
export * from "./VSalesDashboardRoot";
