import { createFileRoute } from "@tanstack/react-router";
import { FinancersPanel } from "@/features/settings/financers";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/financers")({
  component: () => (
    <SettingsPage title="Financers">
      <FinancersPanel />
    </SettingsPage>
  ),
});
