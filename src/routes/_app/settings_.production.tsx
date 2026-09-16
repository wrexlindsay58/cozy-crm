import { createFileRoute } from "@tanstack/react-router";
import { ProductionProfileSettings } from "@/features/job/profile-settings";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/production")({
  component: () => (
    <SettingsPage title="Production categories">
      <ProductionProfileSettings />
    </SettingsPage>
  ),
});
