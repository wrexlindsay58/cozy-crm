import { createFileRoute } from "@tanstack/react-router";
import { CommissionForm } from "@/features/settings/commission-form";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/commission")({
  component: () => (
    <SettingsPage title="Commission">
      <CommissionForm />
    </SettingsPage>
  ),
});
