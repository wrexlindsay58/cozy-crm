import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings/page";
import { TerritoriesList } from "@/features/settings/territories";

export const Route = createFileRoute("/_app/settings_/territories")({
  component: () => (
    <SettingsPage title="Territories">
      <TerritoriesList />
    </SettingsPage>
  ),
});
