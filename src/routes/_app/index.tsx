import { createFileRoute } from "@tanstack/react-router";
import { SalesDashboard } from "@/components/sales-dashboard";

export const Route = createFileRoute("/_app/")({
  component: SalesDashboard,
});
