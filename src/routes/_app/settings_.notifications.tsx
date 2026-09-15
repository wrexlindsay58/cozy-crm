import { createFileRoute } from "@tanstack/react-router";
import { NotifyList } from "@/features/settings/comms-skins";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/notifications")({
  component: () => (
    <SettingsPage title="Notifications">
      <NotifyList />
    </SettingsPage>
  ),
});
