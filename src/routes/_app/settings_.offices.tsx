import { createFileRoute } from "@tanstack/react-router";
import { OfficesList } from "@/features/settings/offices-list";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/offices")({
  component: () => (
    <SettingsPage title="Offices">
      <OfficesList />
    </SettingsPage>
  ),
});
